const { Sequelize, DataTypes, Model } = require("sequelize");
const jsonfile = require("jsonfile");
// import path from "path";
import { Sequelize, DataTypes, Model } from "sequelize"


// 获取主播列表模型
async function getVoicerModel(){
	// 链接数据库
	const sequelize = new Sequelize({
		dialect: "sqlite",
		storage: "./voicer.db",
		logging: false
	});
	// 初始化表模型
	const Voicer = sequelize.define(
		"Voicer",
		{
			// 主播名称（示例：小云）
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			// 主播别名（示例：xiaoyun）
			alias: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			// 主播类型（示例：标准女声）
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			// 适用场景（示例：通用场景）
			scene: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			// 这是其他模型参数
		}
	);
	// 同步表模型
	await Voicer.sync();
	console.log("同步表模型完毕！");
	return Voicer;
}



// 插入数据
async function insertVoicer(model) {
	const file = "./voicer.json";
	const data = jsonfile.readFileSync(file);
	data.forEach( async element => {
		// console.log(element)
		await model.create(element);
	});
	
	console.log("插入数据完毕！");
}

// 查询所有
async function selectAall(model) {
	const data = await model.findAll();
	console.log('-------------------------');
	console.log(JSON.stringify(data, null, 2));
	console.log('-------------------------');
}

//查询特定属性
async function selectForProperty() {
	console.log("-----------------------");
	const voicerlist = await Voicer.findAll({
		attributes: ["name", "alias"],
	});
	console.log(JSON.stringify(voicerlist, null, 2));
	console.log("-----------------------");
}

// 条件查询
async function whereQuery(model) {
	const dataList = await model.findAll({
		where: {
			type: "标准女声",
		},
	});
	console.log(JSON.stringify(dataList,null,2));
}

// 分页查询
async function pageQuery(model){
    const page = 2; //第几页
    const pageNum = 2; //每页数量
    const dataList = await model.findAll({ 
		where: {
			type: "标准女声",
		},
		offset: (page-1) * pageNum,
		limit: pageNum
	});
    console.log(JSON.stringify(dataList,null,2));
}

// 删除表
async function deleteTable(model){
	await model.drop();
	console.log("用户表已删除!");
}

(async () => {
	
	const voicer = await getVoicerModel();
	pageQuery(voicer); // 分页查询
	// whereQuery(voicer); // 条件查询
	// selectAall(voicer); // 查询所有
	// insertVoicer(voicer); // 插入数据
	// deleteTable(voicer); //删除表
	
})();
