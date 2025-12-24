/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'
import type { HttpContext } from '@adonisjs/core/http';

export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(30).every('1 minute')
})

export const sendEmailCodeThrottle = limiter.define("api:sendEmailCode", (ctx: HttpContext) => {
  return limiter
    .allowRequests(3)
    .every('1 minute')
    .usingKey(`ip_${ctx.request.ip()}`)

})

export const registerThrottle = limiter.define("api:register", (ctx: HttpContext) => {
  return limiter
    .allowRequests(10)
    .every("1 minute")
    .blockFor("15 minutes")
    .usingKey(`ip_${ctx.request.ip()}`)
})

export const loginThrottle = limiter.define("api:login", (ctx: HttpContext) => {
  return limiter
    .allowRequests(15)
    .every("1 minute")
    .blockFor("15 minutes")
    .usingKey(`ip_${ctx.request.ip()}`)
})