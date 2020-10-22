import {injectJsError} from './lib/jsError'
import {injectXHR} from './lib/xhr'
import {injectFetch} from './lib/fetch'
import {timing} from './lib/timing'

injectJsError()
injectXHR()
injectFetch()
timing()