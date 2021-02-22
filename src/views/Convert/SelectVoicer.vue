<template>
	<div class="my-container">
		<!-- 对话框层 -->
		<el-dialog title="主播类型" @close="closeDialog" :visible.sync="dialogVisible" width="600px" :close-on-click-modal="false" :close-on-press-escape="false">
			<!-- 标签页层 -->
			<el-tabs v-model="activeName" @tab-click="tabchange">
				<el-tab-pane v-for="(item, index) in paneData" :key="index" :label="item.title" :name="item.id">
					<!-- {{ item.title }} -->
					<!-- 表格层 -->
					<el-table :data="tableData" style="width: 100%" :show-header="false">
						<el-table-column label="主播名" prop="name"> </el-table-column>
						<el-table-column label="声音类型" prop="type"> </el-table-column>
						<el-table-column align="right">
							<template slot-scope="scope">
								<el-button type="primary" size="mini" @click="triallisten(scope.$index, scope.row)" plain>试听</el-button>
								<el-button type="primary" size="mini" @click="usebtnClick(scope.$index, scope.row)">使用</el-button>
							</template>
						</el-table-column>
					</el-table>
					<!-- 分页 -->
					<br />
					<el-pagination  :current-page="page" @current-change="pageChange" :page-size="pageNum" style="text-align:center;" background layout="prev, pager, next" :total="total"> </el-pagination>
				</el-tab-pane>
			</el-tabs>
		</el-dialog>
	</div>
</template>
<script>
// import jsonfile from "jsonfile";
import path from "path";
import DBTools from "./api/dbtools";
import { Model, Op } from "sequelize";
import { Howl } from "howler";
import datauri from "datauri"

export default {
	mounted() {
		// 初始化主播列表数据
		this.voicerModel = DBTools.getVoicerModel();
		this.voicerModel.sync();
	},
	data() {
		return {
			dialogVisible: false,
			activeName: "1",
			paneData: [
				{ id: "1", title: "全部" },
				{ id: "2", title: "女声主播" },
				{ id: "3", title: "男声主播" },
				{ id: "4", title: "童声主播" },
			],
			tableData: [],
			voicerModel: Model,
			page: 1, // 当前页数
			pageNum: 6, // 每页数量
			tabLabel: "全部", //标签页名称
			total: 1, //总条目数
			sound: new Howl({ src: ["1.mp3"] }), // 播放器
		};
	},
	methods: {
		showDialog() {
			this.dialogVisible = true;
			this.refreshData();
		},
		// ========== 刷新数据 ==========
		refreshData() {
			let conditions = {};
			if (this.tabLabel == "全部") {
				conditions = {};
			} else if (this.tabLabel == "女声主播") {
				conditions = { type: { [Op.like]: "%女声" } };
			} else if (this.tabLabel == "男声主播") {
				conditions = { type: { [Op.like]: "%男声" } };
			} else if (this.tabLabel == "童声主播") {
				conditions = { scene: { [Op.substring]: "童" } };
			}

			this.voicerModel
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
			const mp3File = path.join(__static, "voicer", `${row.alias}.mp3`);
			datauri(mp3File).then(res=>{
				this.sound.stop();
				this.sound = new Howl({ src: [res] });
				this.sound.play();
			}).catch(err=>{
				console.log(err);
			}).finally(()=>{
					
			})
		},
		// ========== 使用 ==========
		usebtnClick(index, row) {
			// console.log(index, row.alias);
			this.$emit("voicer-change", row);
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
// .el-dialog__body {
// 	padding: 2px 20px;
// 	color: #606266;
// 	font-size: 14px;
// 	word-break: break-all;
// }

.my-container /deep/ .el-dialog__body {
	padding-top: 0;
}
</style>
