<template>
	<el-container class="my-container">
		<!-- 上部区域 -->
		<el-main>
			<el-input
				@contextmenu.prevent.native="rightClickHandle($event)"
				type="textarea"
				placeholder="请输入内容"
				v-model="convertText"
				maxlength="3000"
				spellcheck="false"
				resize="none"
				show-word-limit
			>
			</el-input>
		</el-main>
		<!-- 下部区域 -->
		<el-footer height="200px">
			<el-container>
				<!-- 左侧区域 -->
				<el-main>
					<el-row>
						<span>语音类型：</span>
						<el-button @click="selectVoicer" plain size="small">{{ voicer.name }} / {{ voicer.type }}</el-button>
						<span style="margin-left:40px;">背景音乐：</span>
						<el-button @click="selectBgMusic" plain size="small">{{ music.name }}</el-button>
					</el-row>
					<el-row>
						<el-col :span="8">
							<span>音量：</span>
							<el-slider style="display:inline-block;width:calc(100% - 68px);vertical-align: middle;" v-model="volume"></el-slider>
						</el-col>
						<el-col :span="8">
							<span>语速：</span>
							<el-slider style="display:inline-block;width:calc(100% - 68px);vertical-align: middle;" v-model="speed"></el-slider>
						</el-col>
						<el-col :span="8">
							<span>背景音量：</span>
							<el-slider style="display:inline-block;width:calc(100% - 100px);vertical-align: middle;" v-model="volume_bg"></el-slider>
						</el-col>
					</el-row>
					<el-row>
						<span>输出格式：</span>
						<el-radio v-model="format" label="mp3">MP3</el-radio>
						<el-radio v-model="format" label="wav">WAV</el-radio>
						<!-- <el-radio v-model="format" label="pcm">PCM</el-radio> -->
					</el-row>
					<el-row class="my-outpath">
						<span>保存目录：</span>
						<el-input placeholder="请输入内容" v-model="saveFolder" :disabled="true" style="display:inline-block;width:calc(100% - 300px);vertical-align: middle;"> </el-input>
						<el-button @click="updateFolder" type="text" style="margin-left:10px;font-size:16px;">更改目录</el-button>
						<el-button @click="openFolder" type="text" style="margin-left:10px;font-size:16px;">打开目录</el-button>
					</el-row>
				</el-main>
				<!-- 右侧区域 -->
				<el-aside width="170px" class="right-buttons">
					<div class="right-buttons-box">
						<el-button @click="trialListen" :disabled="isDisabled" class="right-buttons-listen" :icon="isPlay ? 'el-icon-video-pause' : 'el-icon-video-play'">试听一下</el-button>
						<el-button @click="startConvert" :loading="showLoading" class="right-buttons-convert" icon="el-icon-refresh" type="primary">开始转换</el-button>
					</div>
				</el-aside>
			</el-container>
		</el-footer>
		<SelectVoicer ref="selectVoicerRef" @voicer-change="voicerChange" />
		<SelectMusic ref="selectMusicRef" @music-change="musicChange" />
		
	</el-container>
</template>

<script>
import ospath from "ospath";
import path from "path";
import { shell } from "electron";
import Utils from "@/utils/utils";
import AlibabaAPI from "./api/alibaba";
const fse = require("fs-extra");
import SelectVoicer from "./SelectVoicer";
import SelectMusic from "./SelectMusic";
import { Howl } from "howler";
import datauri from "datauri";
// ========== 右键菜单 ==========
import { remote, clipboard } from "electron";
const { Menu, MenuItem } = remote;
// got下载音频
const stream = require("stream");
const { promisify } = require("util");
const fs = require("fs");
const got = require("got");
const pipeline = promisify(stream.pipeline);
import shelljs from "shelljs";
import dayjs from 'dayjs';


export default {
	components: {
		SelectVoicer,
		SelectMusic,
	},
	mounted() {
		this.$nextTick(function() {
			// 添加右键菜单
			this.addRightMenu();
			// 读取用户保存目录
			this.saveFolder = Utils.readJson(path.join(Utils.userFolder, "config.json"), "saveFolder", path.join(ospath.desktop(), "语音"));
		});
	},
	data() {
		return {
			voicer: { name: "小云", alias: "Xiaoyun", type: "标准女声", scene: "通用场景" },
			music: { name: "选择背景音乐", url: null, path: null, isOnline: null, isUseBgm: false },
			convertText: "",
			volume: 50, //音量
			speed: 50, //语速
			volume_bg: 50, //背景音量
			format: "mp3", //输出格式
			saveFolder: path.join(ospath.desktop(), "语音"), //保存目录
			audioSaveFile: "", //临时生成的语音文件
			outputAudioFile: "", //转换完毕生成的音频文件
			showLoading: false, //转换按钮动画
			sound: new Howl({ src: ["1.mp3"] }), // 试听播放器
			isPlay: false, //是否正在播放
			// ========== 右键菜单-1 ==========
			menu: new Menu(),
		};
	},
	computed: {
		// 通过此判断试听按钮是否要处于禁止状态
		isDisabled() {
			return this.outputAudioFile == "" || this.showLoading == true ? true : false;
		},
	},
	methods: {
		// ============ 选择背景音乐 ============
		async selectBgMusic() {
			this.sound.stop();
			this.isPlay = false;
			this.$refs.selectMusicRef.showDialog();
		},
		// =============== 背景音乐-使用 ==============
		musicChange(music) {
			this.music = music;
		},
		// =============== 发音人-使用 ==============
		voicerChange(voicer) {
			this.voicer = voicer;
			// console.log(voicer.alias, voicer.type);
		},
		// ============ 选择发音人 ============
		selectVoicer() {
			this.sound.stop();
			this.isPlay = false;
			this.$refs.selectVoicerRef.showDialog();
		},
		// ============ 试听一下 ============
		trialListen() {
			this.isPlay = !this.isPlay;
			// console.log(this.isPlay);
			if (this.isPlay) {
				datauri(this.outputAudioFile)
					.then((res) => {
						this.sound = new Howl({
							src: [res],
							onend: () => {
								this.isPlay = false;
							},
						});
						this.sound.play();
					})
					.catch((err) => {
						console.log(err);
					});
			} else {
				this.sound.stop();
			}
		},
		
		// ============ 开始转换 ============
		startConvert() {
			// console.log(`音量：${this.volume} 语速：${this.speed} 背景音量：${this.volume_bg} 输出格式：${this.format} 保存目录：${this.saveFolder}`);
			// console.log(`转换内容：${this.convertText}`);
			
			this.startConvert_sub();
		},

		async startConvert_sub(){
			
			this.sound.stop();
			this.isPlay = false;
			if (this.convertText.trim() == "") {
				this.$alert("内容不能为空！", "提示：", { confirmButtonText: "确定" });
				return;
			}
			this.showLoading = true;

			const bgmPath = await this.getBgmFilePath();
			await this.startConvert_getVoice();
			fse.ensureDirSync(this.saveFolder);
			const subText = this.convertText.trim().slice(0, 3); //从开始截取3个字符，数字、字母、中文都算一个字符
			const timestamp = Utils.getTimestamp10();
			this.outputAudioFile = path.join(this.saveFolder, `${subText}${timestamp}.${this.format}`);
			fse.removeSync(this.outputAudioFile);
			if(bgmPath != null){
				// const ffmpegPath = path.join(Utils.getSrcPath(),'ffmpeg.exe');
				const ffmpegPath = Utils.getFFmpegPath();
				const audio1 = this.audioSaveFile; //语音文件
				const audio2 = bgmPath; //背景音乐
				// console.log(`FFmpeg：${ffmpegPath} 背景音乐：${audio2} 语音文件：${audio1} 输出音频：${this.outputAudioFile}`);
				const cmd = `"${ffmpegPath}" -i "${audio1}" -i "${audio2}" -filter_complex "[0:a]aformat=sample_fmts=fltp:channel_layouts=stereo,volume=1.0[a0]; [1:a]aformat=sample_fmts=fltp:channel_layouts=stereo,aloop=loop=-1:size=2e+09,volume=${this.volume_bg/100}[a1]; [a0][a1]amerge=inputs=2[aout]" -map "[aout]" -ac 2 -y "${this.outputAudioFile}"`;
				// console.log(`命令：${cmd}`);
				shelljs.exec(cmd, { async: true, silent: false }, (code,stdout, stderr) => {
					// console.log("Exit code:", code);
					if(code == 0){
						this.$notify({ title: "转换成功", message: "文字转语音完毕！", type: "success" });
					}else{
						console.log(code,stdout, stderr)
						this.$notify({ title: "转换失败", message: "文字转语音完毕！", type: "error" });
					}
					this.showLoading = false;	
				});
			}else{
				fse.moveSync(this.audioSaveFile,this.outputAudioFile);
				this.$notify({ title: "转换成功", message: "文字转语音完毕！", type: "success" });
				this.showLoading = false;	
			}
		},

		// 获取背景音乐文件路径，包含本地和在线
		async getBgmFilePath() {
			if (this.music.isUseBgm == false) return null;
			if (this.music.isOnline == false) {
				//本地音乐
				if (fse.existsSync(this.music.path) == false) return null;
				return this.music.path;
			} else {
				//在线音乐
				const bgmCachePath = path.join(Utils.userFolder, "music", `${this.music.name}.wav`);
				if (fse.existsSync(bgmCachePath) == true) return bgmCachePath;
				try {
					console.log(`正在下载音频：${this.music.url}`);
					fse.ensureFileSync(bgmCachePath);
					await pipeline(got.stream(this.music.url), fs.createWriteStream(bgmCachePath));
					return bgmCachePath;
				} catch (error) {
					console.log(`下载音频失败：${error} 删除创建的音频文件！`);
					fse.removeSync(bgmCachePath);
					return null;
				}
			}
		},
		async startConvert_getVoice() {
			const token = await AlibabaAPI.getToken();
			const audioTemp = path.join(Utils.userFolder,'tmp');
			fse.ensureDirSync(audioTemp);
			this.audioSaveFile = path.join(audioTemp, `tmp.${this.format}`);
			fse.removeSync(this.audioSaveFile);
			const speech_rate = this.speed * 10 - 500;
			const params = {
				token: token,
				longText: this.convertText.trim(),
				audioSaveFile: this.audioSaveFile,
				format: this.format,
				sampleRate: 16000,
				volume: this.volume, //音量
				speech_rate: speech_rate, //语速
				voice: this.voicer.alias, //发音人
			};
			try {
				await AlibabaAPI.processGETRequest_longText(params);
			} catch (error) {
				this.$message.error("转换出错！-1" + error);
			}
		},
		// ============ 更改目录 ============
		updateFolder() {
			console.log(Utils.userFolder);
			const pathArr = remote.dialog.showOpenDialogSync({
				properties: ["openFile", "openDirectory"],
			});
			if (pathArr == undefined) return;
			if (pathArr.length > 0) {
				this.saveFolder = pathArr[0];
				Utils.saveJson(path.join(Utils.userFolder, "config.json"), "saveFolder", this.saveFolder);
			}
		},
		// ============ 打开目录 ============
		openFolder() {
			// const audioSaveFile = path.join(this.saveFolder, `${this.voicer.alias}.${this.format}`);
			// fse.ensureFileSync(audioSaveFile);
			shell.showItemInFolder(this.outputAudioFile);
		},
		// ========== 添加右键菜单-2 ==========
		addRightMenu() {
			const pasteItem = new MenuItem({
				label: "粘贴",
				click: () => {
					this.convertText = this.convertText + clipboard.readText();
				},
			});
			const copyItem = new MenuItem({
				label: "复制",
				click: () => {
					clipboard.writeText(this.convertText);
				},
			});
			const clearItem = new MenuItem({
				label: "清空",
				click: () => {
					this.convertText = "";
				},
			});
			this.menu.append(pasteItem);
			this.menu.append(new MenuItem({ type: "separator" })); //分割线
			this.menu.append(copyItem);
			this.menu.append(new MenuItem({ type: "separator" }));
			this.menu.append(clearItem);
		},
		// ========== 添加右键菜单-3 ==========
		rightClickHandle() {
			this.menu.popup({ window: remote.getCurrentWindow() });
		},
	},
};
</script>

<style lang="less" scoped>
//scoped穿透修改第三方组件样式 参考：https://www.cnblogs.com/wenxuehai/p/11611960.html
.my-container /deep/ .el-textarea {
	height: 100%;
	.el-textarea__inner {
		//文本框内层
		height: 100%;
	}
}

.my-container /deep/ .el-main {
	padding: 5px;
}

.my-container /deep/ .el-footer {
	padding: 5px;
}

.my-container /deep/ .el-container {
	height: 100%;
}

.my-outpath /deep/ .el-input__inner {
	height: 28px;
}

.el-row {
	margin-top: 10px;
}

// ========= 右侧按钮 =========
.right-buttons {
	.right-buttons-box {
		width: 150px;
		height: 110px;
		margin: 0px auto; //水平居中
		margin-right: 0px; //按钮靠右
		position: relative;
		top: 50%;
		transform: translateY(-50%);
		display: block;
		// 试听一下
		.right-buttons-listen {
			width: 140px;
			height: 45px;
			margin: 0px auto;
			font-size: 18px;
		}
		// 开始转换
		.right-buttons-convert {
			width: 140px;
			height: 45px;
			margin: 0px auto;
			margin-top: 20px;
			font-size: 18px;
		}
	}
}
</style>
