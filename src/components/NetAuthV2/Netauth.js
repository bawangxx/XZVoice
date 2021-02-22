// 说明：ts文件编译成js尽量用commonjs标准，否则各种报错
const got = require("got");
const XRegExp = require("xregexp");
const { machineIdSync } = require("node-machine-id");
const MD5 = require("crypto-js/md5");
// import * as fse from 'fs-extra'; // * as 解决错误：Module '' has no default export.
const fse = require("fs-extra");
const jsonfile = require("jsonfile");
const path = require("path"); // 解决错误：can only be default-imported using the 'esModuleInterop' flag
const os = require("os");
const AES = require("crypto-js/aes");
import Daili from '@/daili/config';

// 安装模块：
// npm i -D bignumber.js bytes got xregexp node-machine-id semver jsonfile crypto-js request request-progress

const G_PREFIX_URL = Daili.baseURL; //服务器地址，根据.env获取，示例：http://localhost:1337
const G_SOFT_NAME = Daili.softName; //软件名称
const G_USER_PATH = Daili.userFolder; // 用户目录

const api = {
	checkUpdate: "apiv2/update", //软件更新
	activate: "apiv2/activate", //软件激活
	trial: "apiv2/trial", //软件试用
	unbind: "apiv2/unbind" //软件解绑
};
const client = got.extend({
	prefixUrl: G_PREFIX_URL,
	timeout: 5000
});

class NetAuth {
	static isValid = false; //是否验证成功
	static ipDetail = {
		//客户IP信息
		ip: "",
		address: ""
	};
	static machineId = ""; //机器码
	static isLog = true; //是否打印日志
	static acTime = null; //激活成功时候的时间（心跳包）

	// 网络验证初始化
	static async init() {
		this.isValid = false;
		this.getMachineId();
		await this.getIpAddressSync();
		this.log(`网络验证初始化完毕！机器码：${this.machineId}`);
	}
	// 打印日志
	static log(msg) {
		if (this.isLog) {
			console.log("NetAuth：" + msg);
		}
	}

	// 获取机器码
	static getMachineId() {
		const mid = machineIdSync(true);
		this.machineId =
			"MS" +
			MD5(mid)
				.toString()
				.toUpperCase();
	}

	// 获取IP地址--ip138(异步)
	static getIpAddress() {
		got("https://2021.ip138.com/")
			.then((res) => {
				const patt = XRegExp(`<p align="center">[\\s]*您的iP地址是：\\[<a .*?>(?<ip>.*?)</a>\\] 来自：(?<address>.*?)[\\s]*</p>`, "s");
				const match = XRegExp.exec(res.body, patt);
				if (match) {
					this.ipDetail.ip = match.ip;
					this.ipDetail.address = match.address;
					this.log("ip地址获取成功(异步)：" + this.ipDetail.ip + " " + this.ipDetail.address);
				}
			})
			.catch((err) => {
				this.log("ip地址获取失败(异步)：" + err);
			});
	}
	// 获取IP地址--ip138(同步)
	static async getIpAddressSync() {
		try {
			let res = await got("https://2021.ip138.com/",{timeout: 2000});
			const patt = XRegExp(`<p align="center">[\\s]*您的iP地址是：\\[<a .*?>(?<ip>.*?)</a>\\] 来自：(?<address>.*?)[\\s]*</p>`, "s");
			const match = XRegExp.exec(res.body, patt);
			if (match) {
				this.ipDetail.ip = match.ip;
				this.ipDetail.address = match.address;
				this.log("ip地址获取成功(同步)：" + this.ipDetail.ip + " " + this.ipDetail.address);
			}
		} catch (error) {
			this.log("ip地址获取失败(同步)：" + error);
		}
	}

	// 网络请求封装
	static postRequest(apiURL, jsonParams, callback, finish) {
		client
			.post(apiURL, {
				json: jsonParams,
			})
			.then((res) => {
				if (res.statusCode == 200) {
					callback(1, res.body);
				} else {
					callback(2, res.body);
				}
			})
			.catch((err) => {
				this.log(err);
				callback(3, "网络请求出错");
			})
			.finally(() => {
				if (finish != undefined) {
					finish();
				}
			});
	}

	// =============== 软件解绑 ===============
	static unbind(cid, callback, finish) {
		const jsonParams = {
			cid: cid,
		};
		NetAuth.postRequest(api.unbind, jsonParams, callback, finish);
	}

	// =============== 软件试用 ===============
	static trial(callback, finish) {
		const mid = AES.encrypt(this.machineId, "1129").toString();
		const jsonParams = {
			mid: mid,
			ip: this.ipDetail.ip,
			address: this.ipDetail.address,
			softName: G_SOFT_NAME,
		};
		NetAuth.postRequest(api.trial, jsonParams, callback, finish);
	}

	// =============== 软件激活 ===============
	static activate(cid, callback, finish) {
		const jsonParams = {
			cid: cid,
			mid: this.machineId,
			ip: this.ipDetail.ip,
			address: this.ipDetail.address,
			softName: G_SOFT_NAME,
		};
		NetAuth.postRequest(api.activate, jsonParams, callback, finish);
	}

	// =============== 软件更新 ===============
	static checkUpdate(callback, finish) {
		client
			.post(api.checkUpdate, {
				json: {
					name: G_SOFT_NAME,
				},
			})
			.then((res) => {
				if (res.statusCode == 200) {
					callback(1, res.body);
				} else {
					callback(2, res.body);
				}
			})
			.catch((err) => {
				callback(3, "网络请求错误：" + err);
			})
			.finally(() => {
				if (finish != undefined) {
					finish();
				}
			});
	}

	// 读取本地激活码
	static readLocalCardID() {
		const configPath = path.join(os.homedir(), G_USER_PATH, "netauth.json");
		return this.readJson(configPath, "card", "");
	}
	// 保存激活码到本地
	static saveCardToLocal(card) {
		const configPath = path.join(os.homedir(), G_USER_PATH, "netauth.json");
		this.saveJson(configPath, "card", card);
	}

	// 保存json到文件
	static saveJson(path, section, value) {
		/**
		 * @description:保存对象或数组到json文件
		 * @param {path} json文件路径
		 * @param {section} 节点名称
		 * @param {value} 要保存的数组或者对象
		 */

		let obj = {};
		if (fse.existsSync(path)) {
			obj = jsonfile.readFileSync(path);
		}
		fse.ensureFileSync(path);
		obj[section] = value;
		jsonfile.writeFileSync(path, obj, { spaces: 2, EOL: "\r\n" });
	}

	// 读取Json文件
	static readJson(path, section, defaultValue) {
		if (fse.existsSync(path)) {
			const obj = jsonfile.readFileSync(path);
			if (obj[section]) {
				return obj[section];
			}
		}
		return defaultValue;
	}
}

export default NetAuth;
