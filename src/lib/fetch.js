import tracker from './tracker'
import { isURLSearchParams } from '../utils'

export function injectFetch() {
  const oldFetch = window.fetch

  window.fetch = function (input, init) {

    const isInputUrl = typeof input === 'string'
    const hasInit = typeof init !== 'undefined'

    const method = hasInit && init.method
      ? init.method
      : !isInputUrl
        ? input.method
        : 'GET'
    const url = isInputUrl ? input : input.url

    const data = {
      kind: 'stability',
      type: 'fetch',
      method,
      url,
      params: ''
    }

    // 获取请求参数
    function getInputParams () {
      if (isInputUrl) {
        data.params = ''
        return
      }

      const cloneInput = input.clone()
      const contentType = (cloneInput.headers.get('content-type') || '').toLowerCase()
      const textTypes = ['text/plain', 'application/json', 'application/x-www-form-urlencoded']
      if (textTypes.some(type => contentType.indexOf(type) !== -1)) {
        cloneInput.text().then(text => {
          data.params = text
        })
      } else {
        data.params = ''
      }
    }

    if (hasInit) {
      if (typeof init.body === 'string') data.params = init.body
      else if (isURLSearchParams(init.body)) data.params = init.body.toString()
      else if (typeof init.body === 'undefined') getInputParams()
      else data.params = ''
    } else getInputParams()
      
    const startTime = +new Date()

    return oldFetch.apply(window, [input, init])
      .then((response) => {
        const copyRes = response.clone()
        const {status, statusText} = copyRes
        const isSuccess = (status >= 200 && status < 300) || status === 304
        if (!isSuccess) {
          copyRes.text().then(res => {
            const trackerData = Object.assign({}, data, {
              status: `${status}-${statusText}`,
              response: res,
              duration: +new Date() - startTime
            })
            tracker(trackerData)
          })
        }

        // 透传数据
        return response
      })
      .catch((err) => {
        const trackerData = Object.assign({}, data, {
          status: `0 - `,
          response: err.message || '',
          duration: +new Date() - startTime
        })
        tracker(trackerData)

        // 透传数据
        throw err
      })
  }
}