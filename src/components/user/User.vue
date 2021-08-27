<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="success" @click="dialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户信息 -->
      <el-table :data="userList" stripe>
        <el-table-column type="index" label="编号" width="50px">
        </el-table-column>
        <el-table-column label="姓名" prop="username"> </el-table-column>
        <el-table-column label="邮箱" prop="email"> </el-table-column>
        <el-table-column label="电话" prop="mobile"> </el-table-column>
        <el-table-column label="角色" prop="role_name"> </el-table-column>
        <!-- 作用域插槽 -->
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改用户信息 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除用户信息 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserId(scope.row.id)"
            ></el-button>
            <!-- 分配用户信息 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户信息"
      :visible.sync="dialogVisible"
      width="50%"
      @close="addDialogVisible"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addFrom"
        :rules="addFromRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addFrom.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addFrom.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addFrom.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="edit1DialogVisible"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="editFrom"
        :rules="addFromRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editFrom.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editFrom.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="roleDialogVisible"
      width="50%"
      @close="downRoles"
    >
      <div>
        <p>当前的用户:{{ userinfo.username }}</p>
        <p>当前的角色:{{ userinfo.role_name }}</p>
        <p>
          分配新角色
          <el-select v-model="selectRolesId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sevaRolesinfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    /* 验证邮箱的表单验证 */
    var checkEmail = (rule, value, cb) => {
      /* 邮箱的正则表达式 */
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的邮箱！"));
    };
    /* 验证手机的表单验证 */
    var checkMobile = (rule, value, cb) => {
      /* 手机的正则表达式 */
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的手机号！"));
    };
    return {
      queryInfo: {
        query: "",
        /* 当前页数 */
        pagenum: 1,
        /* 当前每页显示多少条数据 */
        pagesize: 2,
      },
      userList: [],
      total: 0,
      dialogVisible: false,
      editDialogVisible: false,
      roleDialogVisible: false,
      selectRolesId: "",
      /* 所有角色的数据 */
      rolesList: [],
      /* 查询到的用户信息 */
      editFrom: {},
      /* 需要被分配权限的用户信息 */
      userinfo: {},
      /* 添加用户的表单数据 */
      addFrom: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      /* 添加表单验证规则 */
      addFromRules: {
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
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
    };
  },
  computed: {},
  created() {
    this.getUserList();
  },
  methods: {
    /* 获取用户信息 */
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户信息失败！");
      }
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    /* 监听pagesize改变事件 */
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize;
      this.getUserList();
    },
    /* 监听页码值改变事件 */
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage;
      this.getUserList();
    },
    /* 用户状态 */
    async userStateChange(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );

      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败！");
      }
      this.$message.success("更新用户状态成功！");
    },
    /* 监听添加对话框的关闭事件 */
    addDialogVisible() {
      this.$refs.addFormRef.resetFields();
    },
    /* 监听修改对话框的关闭事件 */
    edit1DialogVisible() {
      this.$refs.editFormRef.resetFields();
    },
    /* 点击按钮添加新用户 */
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        /* 发起添加用户的网络请求 */
        const { data: res } = await this.$http.post("users", this.addFrom);
        if (res.meta.status !== 201) {
          this.$message.error("添加用户信息失败！");
        }
        this.$message.success("添加用户信息成功");
        this.dialogVisible = false;
        /* 更新用户列表 */
        this.getUserList();
      });
    },
    /* 用户编辑对话框 */
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户信息失败！");
      }
      this.editFrom = res.data;
      this.editDialogVisible = true;
    },
    /* 点击修改信息并提交 */
    editUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        /* 发起修改用户信息请求 */
        const { data: res } = await this.$http.put(
          "users/" + this.editFrom.id,
          {
            email: this.editFrom.email,
            mobile: this.editFrom.mobile,
          }
        );
        if (res.meta.status !== 200) {
          this.$message.error("修改用户信息失败！");
        }
        this.editDialogVisible = false;
        this.getUserList();
        this.$message.success("修改用户信息成功！");
      });
    },
    /* 根据用户Id删除 */
    async removeUserId(id) {
      /* 弹框提问用户是否删除 */
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败！");
      }
      this.$message.success("删除用户成功！");
      this.getUserList();
    },
    /* 显示分配权限对话框 */
    async setRole(userinfo) {
      this.userinfo = userinfo;
      /* 获取所有的角色列表 */
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！");
      }
      this.rolesList = res.data;
      this.roleDialogVisible = true;
    },
    /* 点击确定按钮更新用户角色 */
    async sevaRolesinfo() {
      if (!this.selectRolesId) {
        return this.$message.error("请选择要分配的角色！");
      }
      const { data: res } = await this.$http.put(
        `users/${this.userinfo.id}/role`,
        { rid: this.selectRolesId }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("更新角色失败！");
      }
      this.$message.success("更新角色成功！");
      this.getUserList();
      this.roleDialogVisible = false;
    },
    downRoles() {
      this.selectRolesId = "";
      this.userinfo = {};
    },
  },
};
</script>
<style lang="less" scoped>
.el-breadcrumb {
  margin-bottom: 20px;
  font-size: 12px;
}
.el-card {
  box-shadow: 0 0 1px rgb(0, 0, 0, 0.15) !important;
}
.el-table {
  margin-top: 15px;
  border: 1px solid #999;
}
.el-pagination {
  margin-top: 15px;
}
</style>