<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 权限列表信息 -->
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index" label="编号" width="50px">
        </el-table-column>
        <el-table-column label="权限名称" prop="authName"> </el-table-column>
        <el-table-column label="路径" prop="path"> </el-table-column>
        <el-table-column label="权限等级" prop="level">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">等级一</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'"
              >等级二</el-tag
            >
            <el-tag type="warning" v-else>等级三</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      /* 权限列表 */
      rightsList: [],
    };
  },
  computed: {},
  methods: {
    /* 获取权限列表数据 */
    async getRightsList() {
      const { data: res } = await this.$http.get("rights/list");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败！");
      }
      this.rightsList = res.data;
      //console.log(this.rightsList);
    },
  },
  /* 生命周期函数 */
  created() {
    /* 全局调用该方法 */
    this.getRightsList();
  },
  mounted() {},
};
</script>
<style lang="less" scoped>
.box-card {
  margin-top: 20px;
}
</style>