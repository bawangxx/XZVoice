const Daili = require("./src/daili/config");
const nshPath = Daili.nshPath;
const appName = Daili.softName;
const proName = Daili.proName;


const ext = process.platform == 'darwin' ? '' : '.exe';
module.exports = {
	pluginOptions: {
		electronBuilder: {
			nodeIntegration: true, //开启渲染进程使用node模块
			externals: ["sequelize","keyv"],
			experimentalNativeDepCheck: true,
			builderOptions: {// elctronbuilder设置
				publish: ['github'],
				appId: `com.xzsoft.${proName}`,
                productName: `${appName}`,
                asar: true, // 是否使用asar打包
				extraResources: [
					{ from: "./src/appsrc", to: "./", }, //相当于打包之后应用目录下的resource目录 
					// { from: "./node_modules/ffmpeg-static/ffmpeg.exe", to: "./", }
					{ from: `./node_modules/ffmpeg-static/ffmpeg${ext}`, to: "./", }
				],
				appx: {
					identityName: "117159ADCB705.AI",
					publisher: "CN=F28873AD-2D3D-4AE9-9EA0-2A4DBFE7D41B",
					publisherDisplayName: "小智软件",
					applicationId: `com.xzsoft.${proName}`,
					languages: "zh-CN"
				},
				win: {
					target: [
						{
							target: "nsis", //nsis  appx
							arch: ["x64"], // "ia32" x64
						},
					],
				},
				nsis: {
					include: nshPath, //自定义nsis脚本
					oneClick: false, // 是否一键安装
					perMachine: true, //安装是否总是针对所有用户
					allowElevation: true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
					allowToChangeInstallationDirectory: true, // 允许修改安装目录
					createDesktopShortcut: true, // 创建桌面图标
					createStartMenuShortcut: true, // 创建开始菜单图标
					shortcutName: `${appName}`, //将用于所有快捷方式的名称。默认为应用程序名称
					uninstallDisplayName: `${appName}`, //卸载程序在控制面板中显示名称。
					artifactName: `${appName}-Windows版.exe`
				},
				mac: {
					target: "dmg",
					identity: null //构建的时候是否签名，解决未签名的警告
				},
				dmg: {
					title: `${appName}`, //生成DMG的标题，将在挂载时显示(卷名)
					artifactName: `${appName}-Mac版.dmg`, //工程文件名
				}
			},
		},
	},
};
