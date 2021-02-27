<template>
    <div class="content">
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>自定义Key</span>
            </div>
            <el-form :model="ruleForm" status-icon ref="ruleForm" label-width="150px" class="demo-ruleForm">
                <el-form-item label="AccessKey ID" prop="accessKeyId">
                    <el-input spellcheck="false" v-model="ruleForm.accessKeyId" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="AccessKey Secret" prop="accessKeySecret">
                    <el-input spellcheck="false" v-model="ruleForm.accessKeySecret" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="Appkey" prop="appkey">
                    <el-input spellcheck="false" v-model="ruleForm.appkey"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm()">保存</el-button>
                    <el-button @click="resetForm('ruleForm')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script>
const Store = require("electron-store");
const store = new Store();

export default {
    data() {
        return {
            ruleForm: {
                accessKeyId: "",
                accessKeySecret: "",
                appkey: "",
            },
        };
    },
    mounted() {
        const keyObj = store.get("set.key");
        if (keyObj) {
            this.ruleForm = keyObj;
        }
    },
    methods: {
        submitForm() {
            const keyObj = this.ruleForm;
            if (keyObj.accessKeyId.trim() != "" && keyObj.accessKeySecret.trim() != "" && keyObj.appkey.trim() != "") {
                store.set("set.key", this.ruleForm);
                this.$message({ message: "保存成功！", type: "success" });
            } else {
                store.delete("set.key");
                this.$message.error("保存失败！");
            }
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
            store.delete("set.key");
        },
    },
};
</script>

<style lang="less" scoped>
.el-input {
    width: 300px;
}
</style>
