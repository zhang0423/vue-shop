<template>
  <el-container style="height: 100%">
    <!-- 头部 -->
    <el-header>
      <el-button type="danger" @click="exit">退出</el-button>
    </el-header>
    <!-- 主体内容 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside
        :width="isCollapse ? '64px' : '200px'"
        style="background-color: rgb(238, 241, 246)"
      >
        <div class="togger-button" @click="toggerCollapse">|||</div>
        <el-menu
          active-text-color="409bff"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <el-submenu
            :index="item.id + ''"
            v-for="item in menulist"
            :key="item.id"
          >
            <template slot="title">
              <i :class="iconsObj[item.id]"> </i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"> </i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    const item = {};
    return {
      tableData: Array(20).fill(item),
      menulist: [],
      iconsObj: {
        125: "iconfont el-icon-user-solid",
        103: "iconfont el-icon-setting",
        101: "iconfont el-icon-s-goods",
        102: "iconfont el-icon-s-claim",
        145: "iconfont el-icon-s-platform",
      },
      isCollapse: false,
      activePath: "",
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  computed: {},
  methods: {
    exit() {
      window.sessionStorage.clear();
      this.$router.push("/login");
      this.$message.success("退出成功");
    },
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
    },
    toggerCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    },
  },
  mounted() {},
};
</script>
<style lang="less" scoped>
.el-header {
  background-color: #b3c0d1;
  line-height: 60px;
}

.el-aside {
  color: #333;
}
.iconfont {
  margin-right: 10px;
}
.togger-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  color: #fff;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>