const toString = Object.prototype.toString

export function isFormData(obj) {
  return toString.call(obj) === '[object FormData]'
}

export function isBlob(obj) {
  return toString.call(obj) === '[object Blob]'
}

export function isArrayBuffer(obj) {
  return toString.call(obj) === '[object ArrayBuffer]'
}

export function isURLSearchParams(obj) {
  return toString.call(obj) === '[object URLSearchParams]'
}

// 判断一个对象是否是 Error
function isError(o) {
  return Object.prototype.toString.call(o) === '[object Error]'
}