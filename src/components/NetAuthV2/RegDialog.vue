<template>
	<div>
		<el-dialog title="注册激活" :visible.sync="dialogFormVisible" center :close-on-click-modal="false" top="30vh">
			<el-form :model="activateFormModel" :rules="activateFormRules" ref="activateForm">
				<el-form-item label="卡号：" label-width="70px" prop="cid" spellcheck="false">
					<el-row :gutter="15">
						<el-col :span="22">
							<el-input @contextmenu.prevent.native="rightClickHandle($event)" class="card-input" v-model="activateFormModel.cid" autocomplete="off"></el-input>
						</el-col>
					</el-row>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-popover placement="top" width="160" v-model="popoverVisible">
					<p>解绑会扣除卡号时间，确定要解绑吗？<br/>扣时规则：(解绑次数 x 2)小时，首次解绑不扣时！</p>
					
					<div style="text-align: right; margin: 0">
						<el-button size="mini" type="text" @click="popoverVisible = false">取消</el-button>
						<el-button type="primary" size="mini" @click="unBind">确定</el-button>
					</div>
					<el-button style="margin-right:10px" slot="reference" type="warning" plain :loading="unbindBtnLoding">解 绑</el-button>
				</el-popover>
				<el-button @click="trialSubmit" type="primary" plain :loading="trialBtnLoding">试 用</el-button>
				<el-button @click="activateSubmit" type="primary" :loading="activBtnLoding">激 活 </el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>

import NetAuth from './Netauth.js'
// ========== 右键菜单 ==========
import { remote, clipboard } from "electron";
const { Menu, MenuItem } = remote;
const path = require('path');
const os = require('os');
// ========== dayjs时间模块相关 ==========
import dayjs from "dayjs";
require('dayjs/locale/zh-cn');
dayjs.locale('zh-cn') // 全局使用
import duration from "dayjs/plugin/duration";
dayjs.extend(duration)

export default {
	name: "my-reg-dialog",
	props: {
		isShow: Boolean,
	},
	data() {
		return {
			dialogFormVisible: false,
			activateFormModel: {
				cid: "",
			},
			activateFormRules: {
				cid: [{ required: true, message: "请输入卡号", trigger: "submit" }],
			},
			trialBtnLoding: false,
			activBtnLoding: false,
			popoverVisible:false,//解绑提示框是否显示
			unbindBtnLoding:false,//解绑按钮动画
			// ========== 右键菜单-1 ==========
			menu: new Menu(),
			autoLoginLock: false, //自动激活锁定
			isAutoLogin: false, //显示时是否自动激活
		};
	},
	mounted() {
		this.$nextTick(function() {
			this.addRightMenu();
		});
	},
	updated() {
		if(!this.autoLoginLock && this.isAutoLogin){
			this.activateSubmit()
			this.autoLoginLock = true;
			this.isAutoLogin = false;
		}
	},
	methods: {
		// ============== 显示/隐藏对话框 ==============
		showDialog(isShow) {
			this.dialogFormVisible = isShow;
			this.activateFormModel.cid = NetAuth.readLocalCardID();
		},

		// ============== 自动激活 ==============
		autoActivate(){
			this.isAutoLogin = true;
		},
		
		// ============== 粘贴 ==============
		pasteBtnClick() {
			this.activateFormModel.cid = clipboard.readText();
		},
		// ============== 激活 ==============
		async activateSubmit() {
			
			// 表单验证
			let isVlid = false;
			this.$refs['activateForm'].validate((valid) => (isVlid = valid));
			if (!isVlid) return;

			this.activBtnLoding = true;

			if(NetAuth.ipDetail.ip == ""){
                await NetAuth.getIpAddressSync();
            }
            if(NetAuth.machineId == ""){
                NetAuth.getMachineId()
            }
			console.log('机器码：'+NetAuth.machineId + '  IP地址：' + NetAuth.ipDetail.ip + ' ' + NetAuth.ipDetail.address);
            // 激活网络请求
            NetAuth.activate(this.activateFormModel.cid.trim(),(status,res)=>{
                if (status == 1) {
					const data = JSON.parse(res);
					NetAuth.isValid = true;
                    NetAuth.acTime = dayjs();
                    document.title = "状态：已激活 | 剩余时间：" + data.remaining_time;
					this.$message.success("激活成功！剩余时间：" + data.remaining_time);
					this.dialogFormVisible = false;
					NetAuth.saveCardToLocal(this.activateFormModel.cid.trim());
				}else{
					NetAuth.isValid = false;
					this.$message.error(res);
				}
            },()=>{
                this.activBtnLoding = false;
            })
		},

		// ============== 试用 ==============
		async trialSubmit() {
			
			this.trialBtnLoding = true;
			if(NetAuth.ipDetail.ip == ""){
                await NetAuth.getIpAddressSync();
            }
            if(NetAuth.machineId == ""){
                NetAuth.getMachineId()
            }
            NetAuth.trial((status,res)=>{
                if (status == 1) {
					const data = JSON.parse(res);
					NetAuth.acTime = dayjs();
                    NetAuth.isValid = true;
                    document.title = `状态：已激活 | 剩余时间：${data.remaining_time}`;
                    this.$message.success(`激活成功!剩余时间：${data.remaining_time}`);
                    this.dialogFormVisible = false;
				}else{
                    NetAuth.isValid = false;
					this.$message.error(res);
				}
            },()=>{
                this.trialBtnLoding = false;
            })
		},

		// 解绑
		unBind() {
			
			this.popoverVisible = false;
			if(this.activateFormModel.cid == '') return this.$message.error('请输入卡号！');
			this.unbindBtnLoding = true;
            NetAuth.unbind(this.activateFormModel.cid,(status,res)=>{
                if (status == 1) {
					const data = JSON.parse(res);
                    this.$message.success(`解绑成功!剩余时间：${data.remaining_time}`);
				}else{
					this.$message.error(res);
				}
            },()=>{
                this.unbindBtnLoding =false
            })
		},
		// ========== 添加右键菜单-2 ==========
		addRightMenu() {
            
            const pasteItem = new MenuItem({label: "粘贴", click:()=>{ this.activateFormModel.cid = this.activateFormModel.cid + clipboard.readText() } });
            const copyItem = new MenuItem({label: "复制", click:()=>{ clipboard.writeText(this.activateFormModel.cid) } });
            const clearItem = new MenuItem({label: "清空", click:()=>{ this.activateFormModel.cid = "" } });
            this.menu.append(pasteItem);
            this.menu.append(new MenuItem({ type: "separator" })); //分割线
            this.menu.append(copyItem);
            this.menu.append(new MenuItem({ type: "separator" }));
            this.menu.append(clearItem);

        },
        // ========== 添加右键菜单-3 ==========
		rightClickHandle() {
			this.menu.popup({ window: remote.getCurrentWindow() });
		},
	},
};
</script>

<style lang="less" scoped></style>
