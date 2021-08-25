<template>
  <div class="login">
    <!-- 登录框 -->
    <div class="box">
      <el-form
        label-width="70px"
        class="demo-ruleForm"
        :model="from"
        :rules="rules"
        ref="fromRef"
      >
        <el-form-item label="用户名" class="user" prop="username">
          <el-input
            prefix-icon="el-icon-user-solid"
            v-model="from.username"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            prefix-icon="el-icon-view"
            v-model="from.password"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      from: {
        username: "",
        password: "",
      },
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 5,
            max: 13,
            message: "长度在 5 到 13 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 13,
            message: "长度在 6 到 13 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {},
  methods: {
    reset() {
      this.$refs.fromRef.resetFields();
    },
    login() {
      this.$refs.fromRef.validate(async (vald) => {
        if (!vald) return;
        const { data: res } = await this.$http.post("login", this.from);
        if (res.meta.status !== 200) return this.$message.error("登陆失败");
        this.$message.success("登陆成功");
        window.sessionStorage.setItem("token", res.data.token);
        this.$router.push("/home");
      });
    },
  },
  created() {},
  mounted() {},
};
</script>
<style lang="less" scoped>
.login {
  height: 100%;
  position: relative;
  background-color: darkgrey;
}
.box {
  width: 400px;
  height: 250px;
  background-color: #fff;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.demo-ruleForm {
  padding: 30px;
}
</style>