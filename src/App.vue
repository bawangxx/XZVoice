<template>
	<el-container>
		<!-- 左侧导航 -->
		<el-aside width="160px">
			<img @click="logoClick" @mouseout="logoClickClear" src="./assets/logo.png" alt="" />
			<el-menu
				:default-active="defaultActive"
				class="el-menu-vertical-demo"
				background-color="#313743"
				text-color="#fff"
				active-text-color="#ffd04b"
				router
				@select="menuSelectAct"
			>
				<el-menu-item :index="item.index" v-for="item in menueList" :key="item.id">
					<i :class="item.icon"></i>
					<span slot="title">{{ item.title }}</span>
				</el-menu-item>
			</el-menu>
		</el-aside>
		<el-container>
			<!-- 头部 -->
			<el-header height="50px">
				<h3>{{softName}} v{{ currentVersion }}</h3>
			</el-header>
			<!-- 主体 -->
			<el-main>
				<router-view></router-view>
			</el-main>
		</el-container>
		<!-- 开发者对话框 -->
		<DevDialog ref="devDialogRef"></DevDialog>
	</el-container>
</template>

<script>
const { shell } = require("electron");
import Utils from "@/utils/utils"
import DevDialog from "@/components/DevDialog/DevDialog";
import Daili from '@/daili/config';

export default {
	components: {
		DevDialog
	},
	data() {
		return {
			menueList: [
				{ id: "1", title: "语音合成", icon: "el-icon-menu", index: "/" },
				{ id: "2", title: "高级设置", icon: "el-icon-setting", index: "/settings" },
				// { id: "3", title: "注册激活", icon: "el-icon-document", index: "#register" },
				{ id: "4", title: "下载地址", icon: "el-icon-info", index: "#buy" },
				// { id: "5", title: "使用帮助", icon: "el-icon-help", index: "/help" },
				// { id: "6", title: "在线升级", icon: "el-icon-info", index: "#update" },
			],
			defaultActive: "/",
			updialogVisible: false, //软件更新对话框
      downURL: "", //软件下载地址
      softName: Daili.softName,//软件名称
			currentVersion: Daili.softVersion, //软件当前版本
			isShowClose: true, //是否显示更新对话框关闭按钮
			isShowCancel: true, //是否显示更新对话框取消按钮
			upTip: "", //软件更新提示
			logoClickCount: 0, //logo被点击次数
		};
	},
	methods: {
		// 点击logo显示开发者对话框
		logoClick(){
			this.logoClickCount++;
			if(this.logoClickCount > 10){
				this.$refs.devDialogRef.show();
			}
		},
		// logo点击次数清零
		logoClickClear(){
			this.logoClickCount = 0;
		},
		
		// 菜单被选中激活时调用
		menuSelectAct(index) {
			switch (index) {
				case "#update":
					this.$refs.updateDialogRef.showDialog(null);
					break;
				case "#buy":
					shell.openExternal("https://github.com/bawangxx/XZVoice");
					break;
				case "#shopCollect":
					this.$router.push('/');
					setTimeout(() => {
						this.$store.state.shopCollect = !this.$store.state.shopCollect;
					}, 100);
					break;
				default:
					break;
			}
		},


	},

	mounted() {
		// 创建用户目录
		Utils.createUserFolder();
		
		
		
	},
};
</script>

<style lang="less" scoped>
.el-container {
	height: 100%;
}

.el-header {
	text-align: center;
	// background-color: rgb(54, 61, 64);
	background-color: rgb(49, 55, 67);
	h3 {
		margin: 0 auto; //水平居中
		position: relative; //相对布局
		top: 50%;
		transform: translateY(-50%); //向上移动自身50%
		color: white;
	}
}

.el-aside {
	position: relative;
	background-color: rgb(49, 55, 67);
	img {
		position: absolute;
		width: 80px;
		height: 80px;
		left: 50%;
		top: 20px;
		transform: translateX(-50%);
	}
}

.el-main {
	// background-color: rgb(233, 237, 241);
	background-color: white;
	padding: 10px;
}

.el-footer {
	background-color: rgb(186, 228, 203);
}

.el-menu {
	border-right: none;
	top: 120px;
}

.el-menu-item {
	font-size: 18px;
}
</style>
