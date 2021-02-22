import { Sequelize, DataTypes } from "sequelize";
import path from "path";
import Utils from '@/utils/utils'
const sqlite3 = require("sqlite3").verbose();

// const isBuild = process.env.NODE_ENV === 'production'; //是否为生产环境
// const resPath = path.join(process.cwd(),'resources');//打包后应用根目录下resources目录
// const srcPath = path.join(process.cwd(),'src','appsrc'); //项目资源目录，里面存放拷贝到打包后应用根目录的文件

// const voicerDbPath = isBuild ? path.join(resPath,'voicer.db') : path.join(srcPath,'voicer.db'); 
// const musicDbPath = isBuild ? path.join(resPath,'music.db') : path.join(srcPath,'music.db'); 

const voicerDbPath = path.join(Utils.getSrcPath(),'voicer.db'); 
const musicDbPath = path.join(Utils.getSrcPath(),'music.db'); 

class DBTools {
	// 获取主播列表模型
	static getVoicerModel() {
		// 链接数据库
		const sequelize = new Sequelize({
			dialectModule: sqlite3, //electron必须这样配置，否则报错
			dialect: "sqlite",
			storage: voicerDbPath,
			logging: false,
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
		// Voicer.sync();
		// console.log("同步表模型完毕！");
		return Voicer;
	}

	// 获取音乐列表模型
	static getMusicModel() {
		// 链接数据库
		const sequelize = new Sequelize({
			dialectModule: sqlite3, //electron必须这样配置，否则报错
			dialect: "sqlite",
			storage: musicDbPath,
			logging: false,
		});
		// 初始化表模型
		const Music = sequelize.define("Music", {
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
		});
		// 同步表模型
		// await Music.sync();
		// console.log("同步表模型完毕！");
		return Music;
	}

	// 查询所有
	static async selectAall(model) {
		const data = await model.findAll();
		console.log("-------------------------");
		console.log(JSON.stringify(data, null, 2));
		console.log("-------------------------");
	}
}

export default DBTools;
