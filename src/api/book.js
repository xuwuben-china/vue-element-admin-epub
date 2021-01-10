import request from '../utils/request'

export const createBook = (data) => {
  return request({
    url: '/book/create',
    method: 'post',
    data
  })
}
export const getBook = (fileName) => {
  console.log(fileName)
  return request({
    url: '/book/getBook',
    method: 'get',
    params: {
      fileName
    }
  })
}

export const updataBook = (data) => {
  return request({
    url: '/book/update',
    method: 'post',
    data
  })
}

export const getCategory = () => {
  return request({
    url: '/book/getCategory',
    method: 'get'
  })
}
export const getBookList = (params) => {
  return request({
    url: 'book/getList',
    method: 'get',
    params
  })
}
export const delleteBook = (fileName) => {
  return request({
    url: 'book/deleteBook/' + fileName,
    method: 'delete'
  })
}
