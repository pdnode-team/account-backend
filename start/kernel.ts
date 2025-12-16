/*
|--------------------------------------------------------------------------
| HTTP kernel file
|--------------------------------------------------------------------------
|
| The HTTP kernel file is used to register the middleware with the server
| or the router.
|
*/

import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'
import { readFile } from 'fs'

/**
 * The error handler is used to convert an exception
 * to an HTTP response.
 */
server.errorHandler(() => import('#exceptions/handler'))
interface PdnodeConfig{
  banned: {
    username: Array<string>,
    nickname: Array<string>
  }
}
export let config: PdnodeConfig


readFile("pdnode.config.json", "utf8", (err, data) => {
  if(err){
    console.log("Read Config File Failed: " + err)
  }
  try {
      config = JSON.parse(data);
    } catch (parseError) {
      throw  console.error("Paese Config File Failed, Error: ", parseError);
    }
})

/**
 * The server middleware stack runs middleware on all the HTTP
 * requests, even if there is no route registered for
 * the request URL.
 */
server.use([
  () => import('#middleware/container_bindings_middleware'),
  () => import('#middleware/force_json_response_middleware'),
  () => import('@adonisjs/cors/cors_middleware'),
])

/**
 * The router middleware stack runs middleware on all the HTTP
 * requests with a registered route.
 */
router.use([() => import('@adonisjs/core/bodyparser_middleware'), () => import('@adonisjs/auth/initialize_auth_middleware'), () => import('@adonisjs/session/session_middleware')])

/**
 * Named middleware collection must be explicitly assigned to
 * the routes or the routes group.
 */
export const middleware = router.named({
  auth: () => import('#middleware/auth_middleware')
})
