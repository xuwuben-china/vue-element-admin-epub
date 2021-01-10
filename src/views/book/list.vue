<template>
  <div>
    <div class="app-container">
      <div class="filter-container">
        <el-input
          v-model="listQuery.title"
          placeholder="书名"
          style="width: 200px"
          class="filter-item"
          clearable
          @keyup.enter.native="handleFilter"
          @clear="handleFilter"
          @blur="handleFilter"
        />
        <el-input
          v-model="listQuery.author"
          placeholder="作者"
          style="width: 200px"
          class="filter-item"
          clearable
          @keyup.enter.native="handleFilter"
          @clear="handleFilter"
          @blur="handleFilter"
        />
        <el-select
          v-model="listQuery.categor"
          placeholder="分类"
          clearable
          class="filter-item"
          @change="handleFilter"
        >
          <el-option
            v-for="item in categoryList"
            :key="item.value"
            :label="item.label + '(' + item.num + ')'"
            :value="item.value"
          />
        </el-select>
        <el-button
          v-waves
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          style="margin-left: 10px"
          @click="handleFilter"
        >
          查询
        </el-button>
        <el-button
          class="filter-item"
          type="primary"
          icon="el-icon-edit"
          style="margin-left: 10px"
          @click="handleCreate"
        >
          查询
        </el-button>
        <el-checkbox
          v-model="showCover"
          class="filter-item"
          style="margin-left: 5px"
          @change="changeShowCover"
        >
          显示封面
        </el-checkbox>
      </div>
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%"
        :default-sort="defaultSort"
        @sort-change="sortChange"
      >
        <el-table-column
          label="ID"
          prop="id"
          sortable="custom"
          align="center"
          width="80"
        />
        <el-table-column label="书名" width="150" align="center">
          <template slot-scope="{ row: { titleWrapper } }">
            <span v-html="titleWrapper" />
          </template>
        </el-table-column>
        <el-table-column label="作者" width="150" align="center">
          <template slot-scope="{ row: { authorWrapper } }">
            <span v-html="authorWrapper" />
          </template>
        </el-table-column>
        <el-table-column
          label="出版社"
          prop="publisher"
          width="150"
          align="center"
        />
        <el-table-column
          label="分类"
          prop="categoryText"
          width="100"
          align="center"
        />
        <el-table-column label="语言" prop="language" align="center" />
        <el-table-column
          v-if="showCover"
          label="封面"
          width="150"
          align="center"
        >
          <template slot-scope="{ row: { cover } }">
            <a :href="cover" target="_blank">
              <img :src="cover" style="width: 120px; height: 180px">
            </a>
          </template>
        </el-table-column>
        <el-table-column
          label="文件名"
          prop="fileName"
          width="100"
          align="center"
        />
        <el-table-column
          label="文件路径"
          prop="filePath"
          width="100"
          align="center"
        >
          <template slot-scope="{ row: { filePath } }">
            <span>{{ filePath | valueFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="封面路径"
          prop="coverPath"
          width="100"
          align="center"
        >
          <template slot-scope="{ row: { coverPath } }">
            <span>{{ coverPath | valueFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="解压路径"
          prop="unzipPath"
          width="100"
          align="center"
        >
          <template slot-scope="{ row: { unzipPath } }">
            <span>{{ unzipPath | valueFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="上传人"
          prop="createUser"
          width="100"
          align="center"
        >
          <template slot-scope="{ row: { createUser } }">
            <span>{{ createUser | valueFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="上传时间"
          prop="createDt"
          width="100"
          align="center"
        >
          <template slot-scope="{ row: { createDt } }">
            <span>{{ createDt | timeFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(row)"
            />
            <el-button
              type="text"
              icon="el-icon-delete"
              style="color: #f56c6c"
              @click="handleDelete(row)"
            />
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.pageSize"
        @pagination="refresh"
      />
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves/waves'
import { parseTime } from '@/utils'
import { getCategory, getBookList, delleteBook } from '@/api/book'

export default {
  components: {
    Pagination
  },
  directives: {
    waves
  },
  filters: {
    valueFilter(val) {
      return val || '无'
    },
    timeFilter(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}') : '无'
    }
  },
  data() {
    return {
      tableKey: 0,
      listQuery: {},
      showCover: false,
      categoryList: [],
      defaultSort: {},
      list: [],
      total: 20,
      listLoading: true
    }
  },
  created() {
    this.parseQuery()
  },
  mounted() {
    this.getCategory()
    this.getBookList()
  },
  beforeRouteUpdate(to, from, next) {
    if (to.path === from.path) {
      const newQuery = Object.assign({}, to.query)
      const oldQuery = Object.assign({}, from.query)
      if (JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
        this.getBookList()
      }
    }
    next()
  },
  methods: {
    parseQuery() {
      const query = Object.assign({}, this.$route.query)
      let sort = '+id'
      const listQuery = {
        page: 1,
        pageSize: 20,
        sort
      }
      if (query) {
        query.page && (query.page = +query.page)
        query.pageSize && (query.pageSize = +query.pageSize)
        query.sort && (sort = query.sort)
        query.categor && (query.categor = +query.categor)
      }
      const sortSymbol = sort[0]
      const sortColumn = sort.slice(1, sort.length)
      this.defaultSort = {
        prop: sortColumn,
        order: sortSymbol === '+' ? 'ascending' : 'descending'
      }
      this.listQuery = { ...listQuery, ...query }
      console.log(this.listQuery)
    },
    getCategory() {
      getCategory(this.listQuery).then((res) => {
        this.categoryList = res.data
        console.log(this.categoryList)
      })
    },
    getBookList() {
      getBookList(this.listQuery)
        .then((res) => {
          const { list, total } = res.data
          this.list = list
          this.total = total
          this.listLoading = false
          this.list.forEach((book) => {
            book.titleWrapper = this.wapperKeyword('title', book.title)
            book.authorWrapper = this.wapperKeyword('author', book.author)
          })
        })
        .catch((err) => {
          this.listLoading = false
        })
    },
    wapperKeyword(key, val) {
      const highLight = (v) => {
        return `<span style='color:#1890ff'>${v}</span>`
      }
      if (!this.listQuery[key]) {
        return val
      } else {
        return val.replace(new RegExp(this.listQuery[key], 'ig'), (v) =>
          highLight(v)
        )
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.refresh()
    },
    handleCreate() {
      this.$router.push('/book/create')
    },
    handleUpdate(row) {
      this.$router.push('/book/edit/' + row.fileName)
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除改电子书，是否删除？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        delleteBook(row.fileName).then((res) => {
          console.log(res)
          this.$notify({
            title: '成功',
            message: res.msg || '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getBookList()
        })
      })
    },
    changeShowCover(value) {
      this.showCover = value
    },
    sortChange(data) {
      const { prop, order } = data
      this.sortBy(prop, order)
      this.handleFilter()
    },
    sortBy(prop, order) {
      if (order === 'ascending') {
        this.listQuery.sort = `+${prop}`
      } else {
        this.listQuery.sort = `-${prop}`
      }
    },
    refresh(data) {
      this.$router.push({
        path: '/book/list',
        query: this.listQuery
      })
    }
  }
}
</script>

<style>
</style>
