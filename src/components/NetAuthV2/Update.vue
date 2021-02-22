<template>
	<div>
		<el-dialog title="在线升级" :visible.sync="centerDialogVisible" width="500px" :close-on-click-modal="false" :close-on-press-escape="false" center>
			<!-- 检测版本 -->
			<div v-show="showCheckUpdate" style="text-align: center; font-size: 20px">
				<p>{{ checkUpdateTip }}</p>
				<br />
				<el-button type="primary" @click="centerDialogVisible = false" plain>关 闭</el-button>
			</div>
			<!-- 有新版本 -->
			<div v-show="showNewVersion">
				<p>
					版本&#8194; (<span style="color: blue">{{ config.version }}</span
					>) 已发布， 建议您立即升级以获得更好的体验!
				</p>
				<p>更新日志:</p>
				<p v-html="config.update_log"></p>
				<br />
				<div style="text-align: center">
					<!-- 已下载 -->
					<div v-show="showInstallBtn">
						<!-- 进度条 -->
						<p v-show="showProgress">
                            <el-progress :stroke-width="12" :percentage="percent" :status="percent == 100 ? 'success' : null"></el-progress>
						</p>
						<br />
						<el-button type="primary" @click="installNow" :disabled="disabledInstallBtn">开始安装</el-button>
					</div>
					<!-- 未下载 -->
					<div v-show="showUpdateBtns">
						<el-button @click="centerDialogVisible = false">以后再说</el-button>
						<el-button type="primary" @click="updateNow">立即升级</el-button>
					</div>
				</div>
			</div>

			<!-- 已经是最新版 -->
			<div v-show="showLatestVersion" style="text-align: center; font-size: 20px">
				<p style="color:green;">当前已经是最新版本</p>
				<br />
				<el-button type="primary" @click="centerDialogVisible = false" plain>关 闭</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import NetAuth from "./Netauth";
import semver from "semver";
import request from "request";
import progress from "request-progress";
import fs from "fs";
import BigNumber from "bignumber.js";
import fse from "fs-extra";
import os from "os";
import path from "path";
import { shell } from "electron";
import { remote } from "electron";
import Daili from '@/daili/config';

export default {
	data() {
		return {
			centerDialogVisible: false,
			showNewVersion: false, //有新版本
			showLatestVersion: false, //已经是最新版
			showUpdateBtns: true, //立即升级 以后再说
			showInstallBtn: false, //开始安装
			disabledInstallBtn: true, //开始安装
			showProgress: true, //进度条
			showCheckUpdate: false, //检测新版本
			currentVersion: Daili.softVersion, //软件当前版本
			percent: 0, //进度条进度
			// proStatus:, //进度条状态
			configPath: path.join(os.homedir(), Daili.userFolder), //软件配置目录
			insFileName: "", //安装文件名
			checkUpdateTip: "正在检测新版本,请稍后...",
			config: {
				name: "", //软件名称
				version: "1.0.1", //版本号
				update_log: `
                <p>1、[新增]支持接收苹果设备的镜像投屏</p>
                <p>2、[修复]部分视频快进/快退不准确的问题2</p>
                <p>3、[优化]播放错误显示具体错误原因1</p>
                `, //更新日志
				require_update: false, //是否强制更新
				down_url: "", //软件下载地址
				win_url: "", //win版更新链接
				mac_url: "", //Mac版更新链接
			},
		};
	},
	mounted() {
		// 设置不同平台安装文件名
		if (process.platform == "win32") {
			this.insFileName = "up.exe";
		} else {
			this.insFileName = "up.dmg";
		}
	},
	methods: {
		showDialog(config) {
			if(this.percent == 0){
				this.dialogInit();
				if (config) {
					this.centerDialogVisible = false;
					this.showCheckUpdate = false;
					this.config = config;
					this.compareVersion();
				}else{
					this.centerDialogVisible = true;
					this.showCheckUpdate = true;
					this.checkUpdate();
				}
			}else{
				this.centerDialogVisible = true;
			}
			
		},
		// 弹框初始化
		dialogInit() {
            this.showNewVersion = false; //有新版本
            this.showLatestVersion = false; //已经是最新版
            this.showUpdateBtns = true; //立即升级 以后再说
            this.showInstallBtn = false; //开始安装
            this.disabledInstallBtn = true; //开始安装
            this.showProgress = true; //进度条
            this.showCheckUpdate = false; //检测新版本
            this.percent = 0; //进度条进度
            this.proStatus = ""; //进度条状态
		},
		// 获取更新信息
		checkUpdate() {
			this.checkUpdateTip = "正在检测新版本,请稍后...";
			NetAuth.checkUpdate((status, res) => {
				if (status == 1) {
					const config = JSON.parse(res);
					// console.log(config);
					this.config = config;
					this.showCheckUpdate = false;
					this.compareVersion();
				} else {
					console.log(res);
					this.checkUpdateTip = "升级失败,请稍后重试！";
				}
			});
		},

		// 比较版本
		compareVersion() {
			if (semver.gt(this.config.version, this.currentVersion)) {
				console.log('--------- 有新版本 ---------')
				this.showLatestVersion = false;
				this.showNewVersion = true;
				this.centerDialogVisible = true;
			} else {
				console.log('--------- 无新版本 ---------')
				this.showLatestVersion = true;
				this.showNewVersion = false;
			}
		},

		// 立即升级
		updateNow() {
			this.showUpdateBtns = false;
			this.showInstallBtn = true;
			const insFilePath = path.join(this.configPath, this.insFileName);
			fse.ensureDirSync(this.configPath);
			let percent, downURL;
			if (process.platform == "win32") {
				downURL = this.config.win_url;
			} else {
				downURL = this.config.mac_url;
			}
			console.log(downURL);
			progress(request(downURL))
				.on("progress", (state) => {
					percent = new BigNumber((state.size.transferred / state.size.total) * 100);
					this.percent = Number(percent.toFixed(0));
				})
				.on("error", (err) => {
					// eslint-disable-next-line
					console.log("============ 下载出错 ===========" + err);
				})
				.on("end", () => {
					console.log("============ 下载完毕 ===========");
					this.percent = 100;
					this.disabledInstallBtn = false;
					this.proStatus = "success";
				})
				.pipe(fs.createWriteStream(insFilePath));
		},
		// 开始安装
		installNow() {
			const insFilePath = path.join(this.configPath, this.insFileName);
			const win = remote.getCurrentWindow();
			shell.openPath(insFilePath).finally(() => {
				win.close();
			});
		},
	},
};
</script>
