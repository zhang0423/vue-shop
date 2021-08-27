<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加商品 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="openaddCate()"
            >添加商品分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 商品列表 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="序号"
        border
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            style="color: lightgreen"
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i style="color: red" class="el-icon-error" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="sorting" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operation" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="openeditCate(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="deletCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[5, 8, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加商品对话框 -->
    <el-dialog
      @close="downCate"
      title="提示"
      :visible.sync="addDialogVisible"
      width="50%"
    >
      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <el-cascader
            v-model="selectkeys"
            :options="parentList"
            :props="cascaderProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑商品对话框 -->
    <el-dialog
      title="修改分类名称"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="downEditfrom"
    >
      <el-form
        :model="editForm"
        :rules="addRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        { label: "是否有效", type: "template", template: "isok" },
        { label: "排序", type: "template", template: "sorting" },
        { label: "操作", type: "template", template: "operation" },
      ],
      addForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      editForm: {},
      addRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true,
        expandTrigger: "hover",
      },
      parentList: [],
      selectkeys: [],
      total: 0,
      cateList: [],
      addDialogVisible: false,
      editDialogVisible: false,
    };
  },
  methods: {
    // 获取商品管理页面数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品数据失败！");
      }
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    /* 监听pagesize改变事件 */
    handleSizeChange(newsize) {
      this.querInfo.pagesize = newsize;
      this.getCateList();
    },
    /* 监听页码值改变事件 */
    handleCurrentChange(newpage) {
      this.querInfo.pagenum = newpage;
      this.getCateList();
    },
    /* 打开添加商品分类 */
    openaddCate() {
      this.getparentList();
      this.addDialogVisible = true;
    },
    /* 获取父级分类的数据列表 */
    async getparentList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据列表失败！");
      }
      this.parentList = res.data;
    },
    /* 打开编辑商品分类 */
    async openeditCate(id) {
      const { data: res } = await this.$http.get("categories/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品名称失败！");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    /* 编辑商品分类 */
    editCate() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }

        const { data: res } = await this.$http.put(
          "categories/" + this.editForm.cat_id,
          {
            cat_name: this.editForm.cat_name,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改商品分类失败！");
        }
        this.$message.success("修改商品分类成功！");
        this.getCateList();
        this.editDialogVisible = false;
      });
    },
    downEditfrom() {
      this.$refs.editFormRef.resetFields();
    },
    /* 删除商品分类 */
    async deletCate(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除！");
      }
      const { data: res } = await this.$http.delete("categories/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除商品分类失败！");
      }
      this.$message.success("删除商品分类成功！");
      this.getCateList();
    },
    /* 选项处理函数 */
    handleChange() {
      if (this.selectkeys.length > 0) {
        this.addForm.cat_pid = this.selectkeys[this.selectkeys.length - 1];
        this.addForm.cat_level = this.selectkeys.length;
        return;
      } else {
        this.addForm.cat_pid = 0;
        this.addForm.cat_level = 0;
      }
    },
    /* 添加商品分类 */
    addCate() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.post("categories", this.addForm);
        if (res.meta.status !== 201) {
          return this.$message.error("添加商品分类失败！");
        }
        this.$message.success("减价商品分类成功！");
        this.getCateList();
        this.addDialogVisible = false;
      });
    },
    downCate() {
      this.$refs.addFormRef.resetFields();
      this.selectkeys = [];
      this.addForm.cat_pid = 0;
      this.addForm.cat_level = 0;
    },
  },
  created() {
    this.getCateList();
  },
};
</script>
<style lang="less" scoped>
.el-card {
  margin-top: 20px;
}
.el-pagination {
  margin-top: 20px;
}
.el-button {
  margin-bottom: 15px;
}
.el-cascader {
  width: 50%;
}
</style>