<template>
  <el-form ref="postForm" :model="postForm" :rules="rules">
    <sticky :class-name="'sub-navbar'">
      <el-button v-if="!isEdit" @click="showGuide"> 显示帮助 </el-button>
      <el-button v-loading="loading" type="success" @click="submitForm">
        {{ isEdit ? "编辑电子书" : "新增电子书" }}
      </el-button>
    </sticky>
    <div class="detail-container">
      <el-row>
        <el-col :span="24">
          <warning />
        </el-col>
        <el-col :span="24">
          <ebook-upload
            :file-list="fileList"
            :disable="isEdit"
            @onSuccess="onUploadSuccess"
            @onRemove="onUploadRemove"
            @onError="onUploadError"
          />
        </el-col>
        <el-col :span="24">
          <el-form-item prop="title">
            <md-input v-model="postForm.title" :maxlength="100" name="name">
              书名
            </md-input>
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="author" label="作者：" :label-width="labelWidth">
                <el-input
                  v-model="postForm.author"
                  placeholder="作者"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="publisher" label="出版社：" :label-width="labelWidth">
                <el-input
                  v-model="postForm.publisher"
                  placeholder="出版社"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="language" label="语言：" :label-width="labelWidth">
                <el-input
                  v-model="postForm.language"
                  placeholder="语言"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="rootFile" label="根文件：" :label-width="labelWidth">
                <el-input
                  v-model="postForm.rootFile"
                  placeholder="根文件"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="filePath" label="文件路径：" :label-width="labelWidth">
                <el-input
                  v-model="postForm.filePath"
                  placeholder="文件路径"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="unzipPath" label="解压路径：" :label-width="labelWidth">
                <el-input
                  v-model="postForm.unzipPath"
                  placeholder="解压路径"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="coverPath" label="封面路径：" :label-width="labelWidth">
                <el-input
                  v-model="postForm.coverPath"
                  placeholder="封面路径"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="originalName" label="文件名称：" :label-width="labelWidth">
                <el-input
                  v-model="postForm.originalName"
                  placeholder="文件名称"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item prop="cover" label="封面：" :label-width="labelWidth">
                <a v-if="postForm.cover" :href="postForm.cover" target="_blank">
                  <img :src="postForm.cover" class="preview-img">
                </a>
                <span v-else>无</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="目录：" :label-width="labelWidth">
                <div v-if="contents && contents.length > 0" class="contents-wrapper">
                  <el-tree :data="contents" :props="defaultProps" @node-click="onContentClick" />
                </div>
                <span v-else>无</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </el-form>
</template>

<script>
import sticky from '@/components/Sticky'
import Warning from './warning'
import EbookUpload from '@/components/EbookUpload'
import MdInput from '@/components/MDinput'
import { createBook, getBook, updataBook } from '@/api/book'
const fields = {
  title: '书名',
  author: '作者',
  publisher: '出版社',
  language: '语言'
}

export default {
  components: {
    sticky,
    Warning,
    EbookUpload,
    MdInput
  },
  props: {
    isEdit: {
      type: Boolean
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value.length === 0) {
        callback(new Error(fields[rule.field] + '必须填写'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      labelWidth: '120px',
      postForm: {},
      fileList: [],
      contents: [],
      defaultProps: {
        children: 'navPoint',
        label: 'text'
      },
      rules: {
        title: [{ validator: validateRequire }],
        author: [{ validator: validateRequire }],
        language: [{ validator: validateRequire }],
        publisher: [{ validator: validateRequire }]
      }
    }
  },
  created() {
    if (this.isEdit) {
      const fileName = this.$route.params.fileName
      this.getBookData(fileName)
    }
  },
  methods: {
    getBookData(fileName) {
      getBook(fileName).then(res => {
        this.setData(res.data)
      })
    },
    setData(data) {
      const {
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        url,
        originalName,
        contents,
        fileName,
        coverPath,
        filePath,
        unzipPath
      } = data
      this.postForm = {
        ...this.postForm,
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        url,
        originalName,
        fileName,
        coverPath,
        filePath,
        unzipPath,
        contents
      }
      this.contents = contents
      this.fileList = [
        {
          name: originalName || fileName,
          url
        }
      ]
    },
    setDefault() {
      this.fileList = []
      this.contents = []
      this.$refs.postForm.resetFields()
    },
    onUploadSuccess(data) {
      this.setData(data)
    },
    onContentClick(data) {
      const { src } = data
      window.open(src)
    },
    onUploadRemove() {
      this.setDefault()
    },
    onUploadError() {},
    submitForm() {
      const onSuccess = (res) => {
        const { msg } = res
        this.$notify({
          title: '操作成功',
          message: msg,
          type: 'success',
          duration: 2000
        })
        this.loading = false
      }
      if (!this.postForm.cover) {
        this.$message({
          message: '请先上传电子书'
        })
        return
      }
      if (!this.loading) {
        this.loading = true
        this.$refs.postForm.validate((valid, fields) => {
          if (valid) {
            const book = { ...this.postForm }
            if (!this.isEdit) {
              console.log(book)
              createBook(book).then(res => {
                onSuccess(res)
                this.setDefault()
              }).catch(err => {
                this.loading = false
              })
            } else {
              updataBook(book).then(res => {
                onSuccess(res)
              }).catch(err => {
                this.loading = false
              })
            }
          } else {
            const msg = fields[Object.keys(fields)[0]][0].message
            this.$message({
              message: msg,
              type: 'error'
            })
            this.loading = false
          }
        })
      }
    },
    showGuide() {
      console.log('show guide...')
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-container {
  padding: 40px 50px 20px;

  .preview-img {
    width: 200px;
    height: 270px;
  }
}
</style>
