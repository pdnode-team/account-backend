/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import AuthController from "#controllers/auth_controller";
import router from "@adonisjs/core/services/router";
import { sendEmailCodeThrottle, registerThrottle, loginThrottle } from '#start/limiter'
import UsersController from "#controllers/users_controller";
import SessionsController from "#controllers/sessions_controller";
import MeController from "#controllers/me_controller";
import { middleware } from '#start/kernel'



router.get("/", async () => {
  return {
    msg: "Pdnode Account System running..",
  };
});


// Guest
router.group(() => {
  router.post("/sessions", [SessionsController, "store"]).use(loginThrottle)
  router.post("/users", [UsersController, "store"]).use(registerThrottle)
})

// Guest & User
router.group(() => {
  router.post("/email/send", [AuthController, "sendEmailCode"]).use(sendEmailCodeThrottle);
})

// User
router.group(() => {
  router.get("/", [MeController, "show"])
  router.put("/email", [MeController, "updateEmail"])
  router.put("/password", [MeController, "updatePassword"])
  router.put("/username", [MeController, "updateUsername"])
}).use(middleware.auth()).prefix("/me")


// Admin
