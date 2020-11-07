/**
 * 【白屏思路】
 * 触发时机：js 报错或者资源加载错误时，通过监听 error 事件即可
 * 判断白屏：
 * - 多次轮训
 * - 判断当前页面是否白屏
 * ｜文本内容为空
 * ｜图片不显示或者加载失败
 * ｜canvas 不显示或者内容为空
 */
import tracker from './tracker'

const LOAD_SUCCESS_KEY = 'data-monitor-isLoadFailed'
export function injectWhiteScreen(options = {maxTimes: 4, duration: 2000}) {
  const {maxTimes, duration} = options

  let isChecking = false
  let times = 0
  function checkIsWhiteScreen() {
    console.log('checkIsWhiteScreen')
    times++
    const isTextEmpty = !(document.body.innerText || '').trim()
    const isImgEmpty = checkImgEmpty()
    const isCanvasEmpty = checkCanvasEmpty()
  
    if (isTextEmpty && isImgEmpty && isCanvasEmpty) {
      if (times === maxTimes) {
        times = 0
        tracker({
          kind: 'stability',
          type: 'whiteScreen'
        })
      } else {
        setTimeout(checkIsWhiteScreen, duration)
      }
    } else {
      times = 0
      isChecking = false
      console.log('no whiteScreen')
    }
  }

  function isDomVisible(dom) {
    const domCss = window.getComputedStyle(dom, null)
    return domCss.getPropertyValue('display') !== 'none' && domCss.getPropertyValue('width') !== '0px' && domCss.getPropertyValue('height') !== '0px'
  }

  // 每一个图片要么不显示，要么加载失败，则认为图片为空
  function checkImgEmpty() {
    const imgs = document.getElementsByTagName('img')
    
    for(let i = 0; i < imgs.length; i++) {
      const img = imgs[i]

      if(
        isDomVisible(img) &&
        img.getAttribute('src') &&
        img.getAttribute(LOAD_SUCCESS_KEY) === null
      ) return false
    }
    return true
  }

  // 每一个 canvas 满足要么不显示，要么内容为空，则认为 canvas 为空
  function checkCanvasEmpty() {
    const allCanvas = document.getElementsByTagName('canvas')

    for(let i = 0; i < allCanvas.length; i++) {
      const emptyCanvas = document.createElement('canvas')
      emptyCanvas.width = allCanvas[i].width
      emptyCanvas.height = allCanvas[i].height

      if (
        isDomVisible(allCanvas[i]) && allCanvas[i].toDataURL() !== emptyCanvas.toDataURL()
      ) return false
    }

    return true
  }


  window.addEventListener('error', function(e) {
    if (e.target && e.target.tagName === 'IMG' && e.target.src) {
      e.target.setAttribute(LOAD_SUCCESS_KEY, true)
    }

    if (isChecking) return

    isChecking = true
    setTimeout(checkIsWhiteScreen, 0)
  }, true)
}