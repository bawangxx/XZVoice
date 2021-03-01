const pkg = require("../../package.json");

const mainConfig = {
    softName: "AI配音专家",
    softVersion: pkg.version,
    userFolder: "xzvoice", // 用户文件夹名
    proName: "voice", //项目名称
    company: "吾爱破解",
    nshPath: "src/daili/nsh/installer.nsh", //自定义nsis脚本路径
};

module.exports = mainConfig;
