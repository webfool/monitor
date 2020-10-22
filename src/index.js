import {injectJsError} from './lib/jsError'
import {injectXHR} from './lib/xhr'
import {injectFetch} from './lib/fetch'
import {timing} from './lib/timing'
import {injectPv} from './lib/pv'

injectJsError()
injectXHR()
injectFetch()
timing()
injectPv()