import tracker from './tracker'

/**
 * 思路：借助 performance 对象统计的性能数据进行计算和上报
 */
export function timing () {
  window.addEventListener('load', function () {
    setTimeout(() => {
      const {
        redirectStart,
        redirectEnd,
        fetchStart,
        domainLookupStart,
        domainLookupEnd,
        connectStart,
        secureConnectionStart,
        connectEnd,
        requestStart,
        responseStart,
        responseEnd,
        unloadEventStart,
        unloadEventEnd,
        domLoading,
        domInteractive,
        domContentLoadedEventStart,
        domContentLoadedEventEnd,
        loadEventStart,
        loadEventEnd
      } = performance.timing
    
      // 目前缺少：fmp
      // 待定：resload
      const fp = performance.getEntriesByName('first-paint')[0]
      const fcp = performance.getEntriesByName('first-contentful-paint')[0]
      const data = {
        kind: 'experience',
        type: 'timing',
        redirect: redirectEnd - redirectStart, // 重定向时间
        appCache: domainLookupStart - fetchStart, // 获取缓存的时间
        dns: domainLookupEnd - domainLookupStart, // 【insight】 获取dns解析时间
        tcp: connectEnd - connectStart, // tcp 连接耗时
        sslready: secureConnectionStart > 0 ? connectEnd - secureConnectionStart : 0, // 【insight】ssl 安全连接耗时
        ttfb: responseStart - requestStart, // 【insight】接收到首字节的耗时
        firstbyte: responseStart - domainLookupStart, // 【insight】
        trans: responseEnd - responseStart, // 【insight】内容请求耗时
        fpt: responseEnd - fetchStart, // 【insight】First Paint Time，请求开始到浏览器首次解析第一批HTML文档字节的时间差
        unload: unloadEventEnd - unloadEventStart, // 前一个页面卸载耗时
        domanalysis: domInteractive - domLoading, // 【insight】 dom解析耗时
        tti: domInteractive - fetchStart, // 【insight】Time to Interactive 首次可交互时间
        dcl: domContentLoadedEventEnd - domContentLoadedEventStart, // DomContentLoad 事件耗时
        domReady: domContentLoadedEventEnd - fetchStart, // 【insight】html加载完成时间
        fp: fp ? fp.startTime : 0, // 浏览器绘制非默认背景的第一帧的时间
        fcp: fcp ? fcp.startTime : 0, // 【insight】浏览器绘制文本、图片、非空白的canvas 或 SVG 的第一帧的时间
        resload: loadEventStart - domContentLoadedEventEnd, // 【insight】未知
        loaded: loadEventStart - fetchStart, // 【insight】资源完全加载完成的时间
        loadEvent: loadEventEnd - loadEventStart, // load 事件处理耗时
        loadPage: loadEventEnd - fetchStart // 页面完全加载完成耗时
      }

      tracker(data)

    }, 2000)
  }, false)
}