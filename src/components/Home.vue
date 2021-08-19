<template>
  <div><el-button type="danger" @click="exit">退出</el-button></div>
</template>

<script>
export default {
  data() {
    return {};
  },
  computed: {},
  methods: {
    exit() {
      window.sessionStorage.clear();
      this.$router.push("/login");
      this.$message.success("退出成功");
    },
  },
  created() {},
  mounted() {},
};
</script>
<style lang="less" scoped>
</style>