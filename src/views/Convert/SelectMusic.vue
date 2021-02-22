<template>
	<div class="my-container">
		<!-- 对话框层 -->
		<el-dialog title="背景音乐选择" @close="closeDialog" :visible.sync="dialogVisible" width="600px" :close-on-click-modal="false" :close-on-press-escape="false">
			<!-- 标签页层 -->
			<el-tabs v-model="activeName" @tab-click="tabchange">
				<el-tab-pane v-for="(item, index) in paneData" :key="index" :label="item.title" :name="item.id" style="height:369px;">
					<!-- {{ item.title }} -->
					<!-- 表格层 -->
					<el-table :data="tableData" style="width: 100%" :show-header="false">
						<el-table-column label="音乐名称" prop="name"> </el-table-column>
						<!-- <el-table-column label="声音类型" prop="type"> </el-table-column> -->
						<el-table-column align="right">
							<template slot-scope="scope">
								<el-button type="primary" size="mini" @click="triallisten(scope.$index, scope.row)" plain>试听</el-button>
								<el-button type="primary" size="mini" @click="usebtnClick(scope.$index, scope.row)">使用</el-button>
							</template>
						</el-table-column>
					</el-table>
					<!-- 分页 -->
					<br />
					<el-pagination :current-page="page" @current-change="pageChange" :page-size="pageNum" style="text-align:center;" background layout="prev, pager, next" :total="total">
					</el-pagination>
				</el-tab-pane>
				<!-- 自定义tab -->
				<el-tab-pane key="zdy" label="自定义" name="自定义" style="height:369px;">
					<div class="my-selectmusic">
						<span>文件路径：</span>
						<el-input placeholder="请选择自定义背景音乐文件路径" v-model="bgMusicPath" :disabled="true" style="display:inline-block;width:calc(100% - 180px);vertical-align: middle;">
						</el-input>
						<el-button @click="selectBgMusicPath" type="text" style="margin-left:10px;font-size:14px;">选择文件</el-button>
					</div>
					<div style="margin-top:30px;">
						<el-radio v-model="useBgMusic" label="true">使用自定义背景音乐</el-radio>
						<el-radio v-model="useBgMusic" label="false">不使用背景音乐</el-radio>
					</div>
					<el-button @click="confirmBtnClick" style="margin:123px 240px" type="primary">确定</el-button>
				</el-tab-pane>
			</el-tabs>
		</el-dialog>
	</div>
</template>
<script>
// import jsonfile from "jsonfile";
import path from "path";
import DBTools from "./api/dbtools";
import { Model } from "sequelize";
import { Howl } from "howler";
// import datauri from "datauri"
import { remote } from "electron";

export default {
	mounted() {
		// 初始化主播列表数据
		this.musicModel = DBTools.getMusicModel();
		this.musicModel.sync();
	},
	data() {
		return {
			dialogVisible: false,
			activeName: "1",
			paneData: [
				{ id: "1", title: "全部" },
				{ id: "2", title: "彩铃配音" },
				{ id: "3", title: "广告促销" },
				{ id: "4", title: "节日祝福" },
				{ id: "5", title: "抒情唯美" },
			],
			tableData: [],
			musicModel: Model,
			page: 1, // 当前页数
			pageNum: 6, // 每页数量
			tabLabel: "全部", //标签页名称
			total: 1, //总条目数
			sound: new Howl({ src: ["1.mp3"] }), // 播放器
			bgMusicPath: "", //背景音乐文件路径
			useBgMusic: "true", //是否使用背景音乐
		};
	},
	methods: {
		showDialog() {
			this.dialogVisible = true;
			this.refreshData();
		},
		// ========== 点击确定按钮 ==========
		confirmBtnClick() {
			const isUseBgMusic = JSON.parse(this.useBgMusic);
			// console.log(`文件路径：${this.bgMusicPath} 是否使用背景音乐：${isUseBgMusic}`);
			if (this.bgMusicPath == "" && isUseBgMusic) {
				this.$alert("请选择背景音乐的文件路径！", "提示：", { confirmButtonText: "知道啦" });
				return;
			}
			// const option = {
			// 	online: null,
			// 	custom: {
			// 		name: isUseBgMusic ? path.parse(this.bgMusicPath).base : "无背景音乐",
			// 		path: this.bgMusicPath
			// 	}
			// };
			const music = { name: isUseBgMusic ? path.parse(this.bgMusicPath).base : "无背景音乐", url: null, path: this.bgMusicPath, isOnline: false, isUseBgm: isUseBgMusic };
			this.$emit("music-change", music);
			this.dialogVisible = false;
		},
		// ========== 选择自定义背景音乐文件 ==========
		selectBgMusicPath() {
			const pathArr = remote.dialog.showOpenDialogSync({
				properties: ["openFile"],
				filters: [{ name: "音频文件", extensions: ["wav", "mp3"] }],
			});
			if (pathArr == undefined) return;
			if (pathArr.length > 0) {
				this.bgMusicPath = pathArr[0];
			}
		},
		// ========== 刷新数据 ==========
		refreshData() {
			const conditions = { category: this.tabLabel };

			this.musicModel
				.findAndCountAll({
					where: conditions,
					offset: (this.page - 1) * this.pageNum,
					limit: this.pageNum,
				})
				.then((res) => {
					// console.log(res);
					this.tableData = res.rows;
					this.total = res.count;
				});
		},
		// ========== 页码改变 ==========
		pageChange(page) {
			console.log(`第${page}页`);
			this.page = page;
			this.refreshData();
		},
		// ========== 切换标签页 ==========
		tabchange(tab, event) {
			console.log(tab.label, event);
			this.tabLabel = tab.label;
			this.page = 1;
			this.refreshData();
		},
		// ========== 试听 ==========
		triallisten(index, row) {
			console.log(index, row);
			const res = `http://xxx.xxx.com/${row.name}.wav`;// http://xxx.xxx.com 是你在七牛云空间cname的域名
			this.sound.stop();
			this.sound = new Howl({ src: [res] });
			this.sound.play();
		},
		// ========== 使用 ==========
		usebtnClick(index, row) {
			// http://xxx.xxx.com 是你在七牛云空间cname的域名
			const music = { name: row.name, url: `http://xxx.xxx.com/${row.name}.wav`, path: null, isOnline: true, isUseBgm: true };
			this.$emit("music-change", music);
			this.dialogVisible = false;
		},
		// ========== 关闭对话框回调 ==========
		closeDialog() {
			this.sound.stop();
		},
	},
};
</script>

<style lang="less" scoped>
.my-container /deep/ .el-dialog__body {
	padding-top: 0;
}

.my-selectmusic {
	padding-top: 20px;
}
.my-selectmusic /deep/ .el-input__inner {
	height: 28px;
}
</style>
