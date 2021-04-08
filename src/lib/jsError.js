// 【当前模块功能：监控 js 代码报错、监控 promise 报错，监听资源加载错误】

/**
 * === js 总共有7种错误 ===
 * 【Error 普通报错】: 主要是供开发者自定义抛出错误
 * throw new Error('abc')
 * 
 *【SyntaxError 语法报错】常见的有：命名错误、缺少括号、JSON.parse 解析错误
 * var 1a
 * console.log('aaa'
 * JSON.parse('abc')
 * 
 *【ReferenceError 引用报错】: 引用了不存在的变量
 * console.log(b)
 * 
 *【TypeError 类型报错】：参数不是预期的类型
 * new 123
 * [1, 2].split(',')
 * 
 *【RangeError 超出有效范围报错】: 数组长度为负数、堆栈超出最大值
 * new Array(-1)
 * 
 *【URIError URI相关的函数报错】：常见的函数有 encodeURI、decodeURI、encodeURIComponent、decodeURIComponent、escape、unescape
 * decodeURI('%2')
 *
 *【EvalError eval 解析报错】：此种报错已经不会在 es5之后出现了，日常开发也不会遇到了
 *
 * === 错误对象常用属性 ===
 * name: 错误的类型，如 Error、TypeError 等
 * message: 错误的描述信息
 * stack：描述执行堆栈信息的字符串
 *
 */
import tracker from './tracker'
import {isError} from '../utils'

// 格式化 error 的 stack 信息
function getStack(error) {
  if (!error) return '' // 如果是 JSON.parse 解析错误，error 为 null
  return error.stack.split('\n').slice(1).map(item => item.replace(/\s+at\s+/g, '')).join(' <- ')
}

/**
  * 思路：
  * - 【全局报错】全局未被捕获的错误会被 window 的 error 事件捕获到，可以通过 window.addEventListener('error') 或者 window.onerror 监听
  * - 【资源报错】资源请求错误时，能被 window 的 error 事件在捕获阶段捕获到，不能在冒泡阶段捕获到，所以通过 window.addEventListener('error', fn, true) 监听
  * - 【promise报错】未被捕获的 promise 错误会被 window 的 unhandledrejection 事件捕获
 */

export function injectJsError() {
  /**
   * 采用 window.addEventListener，不采用 window.onerror。
   * - 因为 onerror 是事件监听器，后面的声明会覆盖前面的，而 addEventListener 是事件处理器，它可以绑定多个事件
   * - window.onerror 是在冒泡阶段捕获事件，而资源加载失败之后执行资源的 onerror 事件后不会再冒泡，所以应该用 addEventListener 在捕获阶段监听资源加载错误的事件
   * 
   * js 报错时，会触发监听的 error 事件，传入回调的 event 对象是一个 ErrorEvent 实例，只需要关注它以下几个属性，filename、lineno、colno 用于 sourcemap 映射
   * - message: 描述发生的错误
   * - filename: 发生错误的文件
   * - lineno: 发生错误的行数
   * - colno: 发生错误的列数
   * 
   */
  window.addEventListener('error', function(event) {
    if (event.target && (event.target.href || event.target.src)) {
      const data = {
        kind: 'stability',
        type: 'resourceError',
        filename: event.target.href || event.target.src, // 文件地址
        tagName: event.target.tagName // 标签名
      }

      tracker(data)
    } else {
      const {message, filename, lineno, colno, error} = event
      const data = {
        kind: 'stability',
        type: 'jsError',
        message, // 报错信息
        filename, // 文件名
        position: `${lineno || 0}:${colno || 0}`, // 报错位置
        stack: getStack(error) // 报错栈信息
      }

      tracker(data)
    }
  }, true) // 这里需要设为 true，才能在捕获阶段捕获到资源错误

  /**
   * 有两种情况会触发 promise 变成 rejected 状态：
   * - promise 内部主动调用 reject 方法
   * - promise 内部发生错误触发 promise 变成 reject 状态
   * 
   * 当有 promise 变成 rejected 状态而没有被 catch 时，触发 unhandledrejection 事件，并传入 PromiseRejectionEvent 事件对象
   * PromiseRejectionEvent 事件对象主要关注两个属性：
   * - promise：变成 rejected 状态的 promise 对象
   * - reason：promise 变成 rejected 状态的原因，它的值可能是 <主动调用 reject 方法传递的参数> 或者 <promise 内部报错时抛出的错误对象>
   */
  window.addEventListener('unhandledrejection', function (event) {
    const {promise, reason} = event

    let message = ''
    if (typeof reason === 'string') message = reason
    else if (isError(reason)) message = reason.message

    let filename = ''
    let position = ''
    let stack = ''
    if (isError(reason)) {
      stack = getStack(reason)
      const path = reason.stack && reason.stack.split('\n')[1]
      if (path) {
        const [_, file, lineno, colno] = path.match(/\s+at\s+(.+):(\d+):(\d)/)
        filename = file
        position = `${lineno || 0}:${colno || 0}`
      }
    }

    const data = {
      kind: 'stability',
      type: 'promiseError',
      message: message,
      filename,
      position,
      stack
    }

    tracker(data)
  })
}