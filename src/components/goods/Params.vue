<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告条区域 -->
      <el-alert
        title="注意:只允许为第三级分类设置相关参数信息"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类:</span>
          <el-cascader
            v-model="paramsKeys"
            :options="paramsForm"
            :props="props"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tap页签区域 -->
      <el-tabs v-model="activeTabName" @tab-click="handleTabClick">
        <!-- 添加动态参数 -->
        <el-tab-pane label="动态参数" name="many" :disabled="iskeys">
          <el-button type="primary" size="mini" @click="dialogVisible = true"
            >添加动态参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTable" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 添加tag标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showdialogVisible(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态参数 -->
        <el-tab-pane label="静态参数" name="only" :disabled="iskeys">
          <el-button type="primary" size="mini" @click="dialogVisible = true"
            >添加静态参数</el-button
          >
          <!-- 静态参数表格 -->
          <el-table :data="onlyTable" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 添加tag标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column label="属性名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showdialogVisible(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="dialogVisible"
      width="50%"
      @close="overDialog"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改对话框 -->
    <el-dialog
      :title="'编辑' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="overDialog2"
    >
      <el-form
        :model="editForm"
        :rules="addFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      paramsForm: [],
      props: {
        expandTrigger: "hover",
        children: "children",
        value: "cat_id",
        label: "cat_name",
      },
      /* 级联选择框绑定到的数组 */
      paramsKeys: [],
      /* 默认打开那个tab页面 */
      activeTabName: "many",
      manyTable: [],
      onlyTable: [],
      dialogVisible: false,
      editDialogVisible: false,
      addForm: {
        attr_name: "",
      },
      editForm: {},
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
    };
  },

  methods: {
    /* 获取整个页面的信息 */
    async getParamsList() {
      const { data: res } = await this.$http.get("categories/");
      if (res.meta.status !== 200) {
        return this.$message.error("获取数据失败");
      }
      this.paramsForm = res.data;
    },
    /* 级联选择框变化的时候触发的方法 */
    handleChange() {
      this.canshuList();
    },
    /* tab页面点击的处理函数 */
    handleTabClick() {
      this.canshuList();
    },
    /* 获取参数函数 */
    async canshuList() {
      if (this.paramsKeys.length !== 3) {
        this.paramsKeys = [];
        this.manyTable = [];
        this.onlyTable = [];
        return;
      }
      /* 根据所选分类的ID，和所选的面板，获取对应的数据 */
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeTabName },
        }
      );
      if (res.meta.status !== 200) {
        this.$message.error("获取参数列表失败！");
      }
      res.data.forEach((item) => {
        //   通过三元表达式判断attr_vals是否为空
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];

        // 控制文本框的显示与隐藏
        item.inputVisible = false;
        // 文本框的输入值
        item.inputValue = "";
      });
      if (this.activeTabName === "many") {
        this.manyTable = res.data;
      } else {
        this.onlyTable = res.data;
      }
    },
    overDialog() {
      this.$refs.addFormRef.resetFields();
    },
    overDialog2() {
      this.$refs.editFormRef.resetFields();
    },
    /* 添加参数 */
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeTabName,
          }
        );
        if (res.meta.status !== 201) {
          this.$message.error("添加参数失败！");
        }
        this.$message.success("添加参数成功！");
        this.canshuList();
        this.dialogVisible = false;
      });
    },
    /* 打开编辑对话框 */
    async showdialogVisible(id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          params: { attr_sel: this.activeTabName },
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取信息失败!");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    /* 编辑商品参数 */
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeTabName }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改参数失败！");
        }
        this.$message.success("修改参数成功！");
        this.canshuList();
        this.editDialogVisible = false;
      });
    },
    /* 删除商品参数 */
    async removeParams(id) {
      const confir = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confir !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除参数失败");
      }
      this.$message.success("删除参数成功");
      this.canshuList();
    },
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改参数项失败");
      }
      return this.$message.success("修改参数项成功");
    },
    async saveAttr(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改参数项失败");
      }
      return this.$message.success("修改参数项成功");
    },
    showInput(row) {
      row.inputVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleClose(i, row) {
      row.attr_vals.splice(i, 1);
      this.saveAttr(row);
    },
  },
  created() {
    this.getParamsList();
  },
  computed: {
    iskeys() {
      if (this.paramsKeys.length !== 3) {
        return true;
      } else {
        false;
      }
    },
    cateId() {
      if (this.paramsKeys.length == 3) {
        return this.paramsKeys[2];
      }
      return null;
    },
    /* 添加动态和静态参数对话框 */
    titleText() {
      if (this.activeTabName === "many") {
        return "动态参数";
      } else {
        return "静态参数";
      }
    },
  },
};
</script>
<style lang="less" scoped>
.el-card {
  margin-top: 20px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>