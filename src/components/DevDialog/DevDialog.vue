<template>
	<el-dialog title="请输入开发者密码：" :visible.sync="dialogVisible" :close-on-click-modal="false">
		<el-input placeholder="请输入密码" v-model="input" show-password></el-input>
		<div slot="footer" class="dialog-footer">
			<el-button @click="dialogVisible = false">取 消</el-button>
			<el-button type="primary" @click="confirmClick">确 定</el-button>
		</div>
	</el-dialog>
</template>

<script>
import {remote} from 'electron';



export default {
	
	data() {
		return {
			dialogVisible: false,
			input: "",
		};
    },
    methods: {
        // 显示对话框
        show(){
            this.dialogVisible = true;
        },

        // 点击确定
        confirmClick(){
            if(this.input == '1129'){
                remote.getCurrentWebContents().openDevTools(); //打开开发者工具
            }
            this.input = '';
            this.dialogVisible = false;
        }
    },
};
</script>
