/**
 * 上报 pv
 * 思路：切换页面时，即路由切换时进行上报。所以监听路由切换事件即可
 * 
 * 【hash 路由】：在 hashchange 事件进行上报
 * 【history 路由】：
 * - popState 会触发事件回调，所以监听 popState 事件进行上报
 * - pushState 和 replaceState 不会触发事件，所以需要重写 pushState 和 replaceState 方法
 */
import tracker from './tracker'

export function injectPv() {

  function bindEvent(type, fn) {
    return function (...args) {
      const value = fn.apply(window.history, args)
      const e = new Event(type)
      window.dispatchEvent(e)
      return value
    }
  }

  window.history.pushState = bindEvent('pushState', window.history.pushState)
  window.history.replaceState = bindEvent('replaceState', window.history.replaceState)

  const PV_EVENTS = ['hashchange', 'popState', 'pushState', 'replaceState']
  PV_EVENTS.forEach(eventName => {
    window.addEventListener(eventName, function() {
      const path = eventName === 'hashchange' ? location.hash.slice(1) : location.pathname
      tracker({
        kind: 'business',
        type: 'pv',
        path
      })
    }, false)

  })

}