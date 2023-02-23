const kitx = require("kitx");
const got = require("got");
import Utils from "@/utils/utils";
const path = require("path");
// const request = require("request");
const fs = require("fs");
const stream = require("stream");
const { promisify } = require("util");
const pipeline = promisify(stream.pipeline);
const fse = require('fs-extra');
const Store = require("electron-store");
const store = new Store();

class AlibabaAPI {

	static AccessKeyId = '';
	static AccessKeySecret = '';
	static appkey = '';

	// key设置
	static setAliKey(){
		const keyObj = store.get("set.key");
		if(keyObj){ 
			console.log('---------使用自定义key----------')
			this.AccessKeyId = keyObj.accessKeyId;
			this.AccessKeySecret = keyObj.accessKeySecret;
			this.appkey = keyObj.appkey;
		}else{ 
			console.log('---------使用内部key----------')
			this.AccessKeyId = 'AccessKey Secret：AccessKeyId';
			this.AccessKeySecret = '0ieqYoPptO2E8jGmCM24wahZgPN8Mb：AccessKeySecret';
			this.appkey = 'zqo1YtmNarW42EvW：appkey';
			
		}
	}

	// 获取时间戳
	static timestamp() {
		const date = new Date();
		const YYYY = date.getUTCFullYear();
		const MM = kitx.pad2(date.getUTCMonth() + 1);
		const DD = kitx.pad2(date.getUTCDate());
		const HH = kitx.pad2(date.getUTCHours());
		const mm = kitx.pad2(date.getUTCMinutes());
		const ss = kitx.pad2(date.getUTCSeconds());
		// 删除掉毫秒部分
		return `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}Z`;
	}

	// url编码
	static encode(str) {
		const result = encodeURIComponent(str);

		return result
			.replace(/!/g, "%21")
			.replace(/'/g, "%27")
			.replace(/\(/g, "%28")
			.replace(/\)/g, "%29")
			.replace(/\*/g, "%2A");
	}

	// 获取Token
	static async getToken() {
		const token = store.get('token',null);
		const appkey = store.get('appkey','');
		if (token && this.appkey == appkey) {
			const nowTime = Math.round(new Date().getTime() / 1000); //十位时间戳（精确到秒）
			if (nowTime < token.ExpireTime) {
				console.log('---------本地返回token----------')
				return token.Id;
			}
		}
		const Timestamp = this.encode(this.timestamp());
		const SignatureNonce = kitx.makeNonce();
		//规范化的请求字符串
		const query_string = `AccessKeyId=${this.AccessKeyId}&Action=CreateToken&Format=JSON&RegionId=cn-shanghai&SignatureMethod=HMAC-SHA1&SignatureNonce=${SignatureNonce}&SignatureVersion=1.0&Timestamp=${Timestamp}&Version=2019-02-28`;

		//构造待签名字符串
		const stringToSign = `GET&${this.encode("/")}&${this.encode(query_string)}`;

		//计算签名
		const key = this.AccessKeySecret + "&";
		const signature = kitx.sha1(stringToSign, key, "base64");
		const Signature = this.encode(signature);

		//调用服务
		const full_url = `http://nls-meta.cn-shanghai.aliyuncs.com/?Signature=${Signature}&${query_string}`;
		const res = await got(full_url);
		if (res.statusCode == 200) {
			const data = JSON.parse(res.body);
			store.set('token',data.Token);
			store.set('appkey',this.appkey);
			console.log('---------网络获取token----------')
			return data.Token.Id;
		}
		return null;
	}

	// 按字数切分文本
	static splitLongText_back(text, size) {
		//先按标点符号切分
		let texts = text.split(/[、，。；？！,!\\?\s]/);
		let textPart = "";
		let result = [];
		let len = 0;
		//再按size merge,避免标点符号切分出来的太短
		for (let i = 0; i < texts.length; i++) {
			if (textPart.length + texts[i].length + 1 > size) {
				result.push(textPart.toString());
				textPart = "";
			}
			textPart = textPart + texts[i];
			len += texts[i].length;
			if (len < text.length) {
				textPart = textPart + text.charAt(len);
				len += 1;
			}
		}

		if (textPart.length > 0) {
			result.push(textPart.toString());
		}
		return result;
	}

	// 截取指定长度字符串，中文按2个长度计算
	static getSubString(str, len) {  
		let strlen = 0;  
		let s = "";  
		for (let i = 0; i < str.length; i++) {  
			if (str.charCodeAt(i) > 128) {  
				strlen += 2;  
			} else {  
				strlen++;  
			}  
			s += str.charAt(i);  
			if (strlen >= len) {  
				return s;  
			}  
		}  
		return s;  
	} 

	// 根据指定长度均分文本
	static meanLongText(longText,size){
		let strlen = 0;  
		for (let i = 0; i < longText.length; i++) {  
			if (longText.charCodeAt(i) > 128) {  
				strlen += 2;  
			} else {  
				strlen++;  
			}   
		} 

		const zhengShu = parseInt(strlen/size);
		const yushu = strlen % size
		let resArr = [];
		for (let index = 0; index < zhengShu; index++) {
			const subStr = this.getSubString(longText,size);
			resArr.push(subStr);
			longText = longText.replace(subStr,'')
		}
		const subStr = this.getSubString(longText,yushu);
		if(subStr != '') resArr.push(subStr);
		return resArr;
	}

	// 按字数切分文本
	static splitLongText(text, size) {
		//先按标点符号切分
		let texts = text.split(/[、，。；？！,!\\?\s]/);
		let textPart = "";
		let result = [];
		let len = 0;
		//再按size merge,避免标点符号切分出来的太短
		for (let i = 0; i < texts.length; i++) {
			if (textPart.length + texts[i].length + 1 > size) {
				if(textPart != ""){
					result.push(textPart.toString());
				}
				textPart = "";
			}
			textPart = textPart + texts[i];
			len += texts[i].length;
			if (len < text.length) {
				textPart = textPart + text.charAt(len);
				len += 1;
			}
		}
		
		if (textPart.length > 0) {
			result.push(textPart.toString());
		}

		if(textPart.length > 0 && textPart.length > size){
			let result = [];
			result = result.concat(this.meanLongText(textPart,size));
			return result;
		}
		
		return result;
	}

	// 循环转换长文本
	static async processGETRequest_longText(params) {
		const { token, longText, audioSaveFile, format, sampleRate, volume, speech_rate, voice } = params;
		let url = "https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts";
		/**
		 * 设置URL请求参数。
		 */
		url = url + "?appkey=" + this.appkey;
		url = url + "&token=" + token;
		// url = url + '&text=' + text;
		url = url + "&format=" + format;
		url = url + "&sample_rate=" + sampleRate;
		// voice 发音人，可选，默认是xiaoyun。
		url = url + "&voice=" + voice;
		// volume 音量，范围是0~100，可选，默认50。
		url = url + "&volume=" + volume;
		// speech_rate 语速，范围是-500~500，可选，默认是0。
		url = url + "&speech_rate=" + speech_rate;
		// pitch_rate 语调，范围是-500~500，可选，默认是0。
		// url = url + "&pitch_rate=" + 0;

		let textArr = this.splitLongText(longText, 150);
		fse.removeSync(audioSaveFile);
        
        for (let index = 0; index < textArr.length; index++) {
			const text = textArr[index];
            const textUrlEncode = encodeURIComponent(text).replace(/[!'()*]/g, function(c) {
                return "%" + c.charCodeAt(0).toString(16);
            });
            const rqURL = url + "&text=" + textUrlEncode;
            await pipeline(got.stream(rqURL), fs.createWriteStream(audioSaveFile,{ 'flags': 'a' }));
        }
	}

}

export default AlibabaAPI;
