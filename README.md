## Electron + vue + ElementUI + js开发的文字转语音软件

[![screen](https://raw.githubusercontent.com/bawangxx/xz_voice/main/images/screen.png)](https://github.com/bawangxx/xz_voice)


## 使用帮助:

采用阿里云语音合成引擎
官网地址：https://ai.aliyun.com/nls/tts

## 一、设置应用秘钥

### 1.找到路径：src\views\Convert\api\alibaba.js

### 2.修改代码：
```sh
this.AccessKeyId = '设置成你在阿里云申请的：AccessKeyId';
this.AccessKeySecret = '设置成你在阿里云申请的：AccessKeySecret';
this.appkey = '设置成你在阿里云申请的：appkey';
```


## 二、设置在线音乐
### 1.找到路径：src\views\Convert\SelectMusic.vue
### 2.搜索代码：http://xxx.xxx.com/  修改为：你在七牛云空间cname的域名
### 3.将背景音乐包上传到七牛云的空间，设置为公开
### 4.背景音乐包下载地址：https://bawangxx.lanzous.com/b0c34tv9e 密码:9r9y


## 三、软件打包
执行：
```sh
npm i
npm run electron:build
```





