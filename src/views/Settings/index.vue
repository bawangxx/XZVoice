<template>
    <div class="content">
        <el-form label-position="right" label-width="150px" :model="formModel" ref="formRef">
            <el-form-item label="AccessKey ID">
                <el-input v-model="formModel.AccessKeyId"></el-input>
            </el-form-item>
            <el-form-item label="AccessKey Secret">
                <el-input v-model="formModel.AccessKeySecret"></el-input>
            </el-form-item>
            <el-form-item label="Appkey">
                <el-input v-model="formModel.appkey"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="saveForm('formRef')">保存</el-button>
                <el-button @click="resetForm('formRef')">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            formModel: {
                AccessKeyId: "",
                AccessKeySecret: "",
                appkey: "",
            },
        };
    },

    methods: {
        saveForm(formName) {
            console.log(this.formModel);
        },
        resetForm(formName) {
            console.log(formName)
            this.$refs[formName].resetFields();
        },
    },
};
</script>

<style lang="less" scoped>
.el-input {
    width: 300px;
}
</style>
