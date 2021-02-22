"use strict";

import path from "path";
import { app, protocol, BrowserWindow, Menu } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
// import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
const isDevelopment = process.env.NODE_ENV !== "production";

let win;

// ============ 限制软件多开代码--start ====================
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	app.quit();
} else {
	app.on("second-instance", (event, commandLine, workingDirectory) => {
		// 当运行第二个实例时,将会聚焦到myWindow这个窗口
		if (win) {
			if (win.isMinimized()) win.restore();
			win.focus();
		}
	});
	// ============ 限制软件多开代码--end ====================

	protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { secure: true, standard: true } }]);

	async function createWindow() {
		win = new BrowserWindow({
			width: 1024,
			height: 768,
			webPreferences: {
				title: "文字转语音大师",
				enableRemoteModule: true, //开启远程模块，未来可能删除(添加右键菜单会有警告)
				// nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
				nodeIntegration: true,
				webSecurity: false, //使其可以播放音频
			},
			icon: path.join(__static, "icon.png"),
			
		});

		if (process.env.WEBPACK_DEV_SERVER_URL) {
			await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
			if (!process.env.IS_TEST) win.webContents.openDevTools();
		} else {
			//正式环境设置
			Menu.setApplicationMenu(null); // 移除顶部菜单
			createProtocol("app");
			win.loadURL("app://./index.html");
		}
	}

	app.on("window-all-closed", () => {
		app.quit();
	});

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});

	app.on("ready", async () => {
		// if (isDevelopment && !process.env.IS_TEST) {
		// 	// Install Vue Devtools
		// 	try {
		// 		await installExtension(VUEJS_DEVTOOLS);
		// 	} catch (e) {
		// 		console.error("Vue Devtools failed to install:", e.toString());
		// 	}
		// }
		console.log(app.getAppPath());
		createWindow();
	});

	if (isDevelopment) {
		if (process.platform === "win32") {
			process.on("message", (data) => {
				if (data === "graceful-exit") {
					app.quit();
				}
			});
		} else {
			process.on("SIGTERM", () => {
				app.quit();
			});
		}
	}
}
