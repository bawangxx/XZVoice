import Vue from 'vue'
import VueRouter from 'vue-router'

// 导入自定义组件
import Convert from "@/views/Convert";
import Settings from "@/views/Settings";
import Help from "@/views/Help"

Vue.use(VueRouter)

const routes = [
	//文字转语音转换
	{ path: "/", name: "Convert", component: Convert }, 
	//高级设置
	{ path: "/settings", name: "Settings", component: Settings, },
	//使用帮助
	{ path: "/help", name: "Help", component: Help },
];

const router = new VueRouter({
  routes
})

export default router
