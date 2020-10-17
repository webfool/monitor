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