import {injectJsError} from './lib/jsError'
import {injectXHR} from './lib/xhr'
import {injectFetch} from './lib/fetch'
import {timing} from './lib/timing'
import {injectPv} from './lib/pv'
import { injectWhiteScreen } from './lib/whitescreen'

injectJsError()
injectXHR()
injectFetch()
timing()
injectPv()
injectWhiteScreen()