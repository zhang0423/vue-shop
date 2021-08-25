<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="dialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 权限列表信息 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['buttonline', i1 === 0 ? 'tapline' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeTag(scope.row, item1.id)">{{
                  item1.authName
                }}</el-tag
                ><i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'tapline', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeTag(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    ><i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18"
                    ><el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      closable
                      :key="item3.id"
                      @close="removeTag(scope.row, item3.id)"
                    >
                      {{ item3.authName }}</el-tag
                    ></el-col
                  >
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="编号" width="50px">
        </el-table-column>
        <el-table-column label="角色名称" prop="roleName"> </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="success"
              icon="el-icon-edit"
              size="mini"
              @click="queryEditRoles(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="remove(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="givePermissions(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色弹框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="dialogVisible"
      width="50%"
      @close="cleareolesFrom"
    >
      <!-- 文本域 -->
      <el-form
        :model="rolesForm"
        :rules="rolesFormRules"
        ref="rolesFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="rolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="rolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editcleareolesFrom"
    >
      <!-- 文本域 -->
      <el-form
        :model="editRolesForm"
        :rules="rolesFormRules"
        ref="editRolesFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限 -->
    <el-dialog
      title="提示"
      :visible.sync="permissionsDialogVisible"
      width="50%"
      @close="downDialong"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        default-expand-all
        :default-checked-keys="keyList"
        node-key="id"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="permissionsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotrights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      /* 所有角色列表数据 */
      rolesList: [],
      dialogVisible: false,
      editDialogVisible: false,
      permissionsDialogVisible: false,
      /* 所有权限的数据 */
      rightsList: [],
      /* 默认被打开的选项 */
      keyList: [],
      /* 即将分配权限的Id */
      roleId: "",
      treeProps: {
        label: "authName",
        children: "children",
      },
      rolesForm: {
        roleName: "",
        roleDesc: "",
      },
      editRolesForm: {},
      rolesFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 3, max: 7, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
        roleDesc: [
          { required: false, message: "请输入角色描述", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    /* 获取所有角色列表数据 */
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！");
      }
      this.rolesList = res.data;
    },
    /* 清空表单内容 */
    cleareolesFrom() {
      this.$refs.rolesFormRef.resetFields();
    },
    editcleareolesFrom() {
      this.$refs.editRolesFormRef.resetFields();
    },
    /* 添加角色 */
    addRoles() {
      this.$refs.rolesFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.post("roles", this.rolesForm);
        if (res.meta.status !== 201) {
          return this.$message.error("添加角色失败！");
        }
        this.$message.success("添加角色成功！");
        this.dialogVisible = false;
        this.getRolesList();
      });
    },
    /* 查询编辑角色信息 */
    async queryEditRoles(id) {
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色信息失败！");
      }
      this.editRolesForm = res.data;
      this.editDialogVisible = true;
    },
    /* 修改角色信息 */
    editRoles() {
      this.$refs.editRolesFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.put(
          "roles/" + this.editRolesForm.roleId,
          {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc,
          }
        );
        console.log(this.editRolesForm.id);
        if (res.meta.status !== 200) {
          return this.$message.error("修改角色失败！");
        }
        this.editDialogVisible = false;
        this.getRolesList();
        this.$message.success("修改角色成功！");
      });
    },
    /* 删除角色 */
    async remove(id) {
      /* 弹框提问用户是否删除 */
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
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
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色失败！");
      }
      this.$message.success("删除角色成功！");
      this.getRolesList();
    },
    /* 删除tag标签 */
    async removeTag(role, rightId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除！");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败！");
      }
      role.children = res.data;
    },
    /* 分配权限 */
    async givePermissions(role) {
      this.roleId = role.id;
      /* 获取所有权限的数据 */
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败！");
      }
      this.rightsList = res.data;
      this.getKeys(role, this.keyList);
      this.permissionsDialogVisible = true;
    },
    /* 通过递归函数获取所有角色下的三级权限的id并保存到 keyList数组中*/
    getKeys(node, arr) {
      /* 如果当前节点不包含子级，那么就是三级节点 */
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => this.getKeys(item, arr));
    },
    /* 分配权限对话框关闭事件 */
    downDialong() {
      this.keyList = [];
    },
    /* 为角色添加权限 */
    async allotrights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      const idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败！");
      }
      this.$message.success("分配权限成功！");
      this.getRolesList();
      this.permissionsDialogVisible = false;
    },
  },
  created() {
    this.getRolesList();
  },
};
</script>
<style lang="less" scoped>
.el-tag {
  margin: 10px;
}
.tapline {
  border-top: 1px solid #eee;
}
.buttonline {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
.el-card {
  margin-top: 20px;
}
.el-table {
  margin-top: 15px;
}
</style>