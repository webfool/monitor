/**
 * 思路：
 * 上报数据的方法有以下几种：
 * - 有同源限制
 *  - xhr
 * - 无同源限制
 *  - jsonp
 *  - img
 *  - navigator.sendBeacon
 * 
 * 在页面 unload 前上报，可能会出现页面跳转后请求还未真正发起，造成请求被取消，解决方案有：
 * - 使用同步 xhr 上传
 * - 使用 img 的方式：因为大部分浏览器都会等待图片加载完成
 * - 通过 while 循环强制等待
 * - 传递给下一个页面，由下一个页面负责上传
 * - navigator.sendBeacon 异步上传
 * 
 * 通过同步xhr、img、while 循环都会导致页面被阻塞，影响体验；而传给下一个页面进行上传又对下一个页面有要求。sendBeacon 支持跨域且只会在空闲的时候进行上传
 * 所以最佳的方案是通过 navigator.sendBeacon 进行异步上传。
 * 如果浏览器不支持 sendBeacon，那么使用 img 的方式既能满足跨域，也不需要在插入 dom，同时也能在 unload 前阻塞防止请求被取消。
 * 如果最后拼接的 url 太长，再考虑使用 xhr 的方式
 * 
 * 如果采用 img，最佳方案是使用 1x1的 gif 图，因为上传一般不需要关注返回信息，所以返回的数据越小越好。而 gif 的最小合法体积比其它类型的图片低，为43字节。
 */
export default function tracker(data) {
  const formatData = encodeURIComponent(JSON.stringify(data))
  const url = 'http://localhost:4000/account/tracker'
  const queryString = `data=${formatData}`
  const urlWithData = `${url}?${queryString}`

  if (navigator.sendBeacon) { // 通过 sendBeacon 发送
    console.log('use in beacon ->', data)
    // sendBeacon 使用的是 http post 方法，通过 blob 的方式发送 json 数据
    const headers = {
      type: 'application/json'
    }
    const blob = new Blob([JSON.stringify({data})], headers)
    const ok = navigator.sendBeacon(url, blob)
    console.log('beacon ok ->', ok)
  } else if (urlWithData.length < 2000) { // 通过 img 的方式发送
    console.log('use in img', data)
    const img = new Image()
    img.src = urlWithData
  } else { // 通过 xhr 的方式发送
    console.log('use xhr ->', data)
  }
}