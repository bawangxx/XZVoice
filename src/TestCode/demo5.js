const { Sequelize, DataTypes, Model } = require("sequelize");
const jsonfile = require("jsonfile");
// import path from "path";
// import { Sequelize, DataTypes, Model } from "sequelize"


// 获取音乐列表模型
async function getMusicModel(){
	// 链接数据库
	const sequelize = new Sequelize({
		dialect: "sqlite",
		storage: "./music.db",
		logging: false
	});
	// 初始化表模型
	const Music = sequelize.define(
		"Music",
		{
			// 音乐名称（示例：元旦）
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			// 音乐类别（示例：彩铃配音）
			category: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
	);
	// 同步表模型
	await Music.sync();
	console.log("同步表模型完毕！");
	return Music;
}


// 插入数据
async function insertMusic(model) {
	const file = "./music.json";
	const data = jsonfile.readFileSync(file);
	data.forEach( async element => {
		// console.log(element)
		await model.create(element);
	});
	
	console.log("插入数据完毕！");
}


(async () => {
	
	const music = await getMusicModel();
	// pageQuery(voicer); // 分页查询
	// whereQuery(voicer); // 条件查询
	// selectAall(voicer); // 查询所有
	insertMusic(music); // 插入数据
	// deleteTable(voicer); //删除表
	
})();
