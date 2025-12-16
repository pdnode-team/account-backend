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
import { sendEmailCodeThrottle } from '#start/limiter'
import UsersController from "#controllers/users_controller";

router.get("/", async () => {
  return {
    msg: "Pdnode Account System running..",
  };
});

router.post("/email/send", [AuthController, "sendEmailCode"]).use(sendEmailCodeThrottle);
router.post("/register", [UsersController, "store"])