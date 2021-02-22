const {app} = require("electron").remote;

const fse = require("fs-extra");
const jsonfile = require("jsonfile");
const path = require("path");
const os = require("os");
import Daili from '@/daili/config';

class Utils {
	// 用户目录
	static userFolder = path.join(os.homedir(), Daili.userFolder);
	static createUserFolder() {
		if (fse.existsSync(this.userFolder) == false) {
			fse.ensureDirSync(this.userFolder);
		}
	}

	static getFFmpegPath() {
		const isBuild = process.env.NODE_ENV === "production"; //是否为生产环境
		let ffmpegPath;
		const ext = process.platform == 'darwin' ? '' : '.exe';
		if (isBuild) {
			ffmpegPath = path.join(process.cwd(), "resources", `ffmpeg${ext}`);
			if(process.platform == 'darwin'){
				ffmpegPath = path.join(path.parse(app.getAppPath()).dir, `ffmpeg${ext}`);
			}
		} else {
			ffmpegPath = path.join(
				process.cwd(),
				"node_modules",
				"ffmpeg-static",
				`ffmpeg${ext}`
			);
		}
		return ffmpegPath;
	}

	// 自动获取生产或开发环境下的资源目录
	static getSrcPath() {
		const isBuild = process.env.NODE_ENV === "production"; //是否为生产环境
		let resPath = path.join(process.cwd(), "resources"); //打包后应用根目录下resources目录
		const srcPath = path.join(process.cwd(), "src", "appsrc"); //项目资源目录，里面存放拷贝到打包后应用根目录的文件
		if(process.platform == 'darwin'){
			// resPath = path.join(process.cwd(),"Contents", "Resources");
			resPath = path.parse(app.getAppPath()).dir;
		}
		return isBuild ? resPath : srcPath;
	}

	// 获取十位时间戳（精确到秒）
	static getTimestamp10() {
		return Math.round(new Date().getTime() / 1000);
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

export default Utils;
