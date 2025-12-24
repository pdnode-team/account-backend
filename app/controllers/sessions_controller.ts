import type { HttpContext } from '@adonisjs/core/http'
import { createSessionValidator } from '#validators/session'
import User from '#models/user'

export default class SessionsController {
    /**
     * Display a list of resource
     */
  

    // async index({}: HttpContext) {}
  
    /**
     * Handle form submission for the create action
     */
    async store({ request, response }: HttpContext) {
      const data = request.all()
      const payload = await createSessionValidator.validate(data)
      const email = payload.email?.toLowerCase()
      const username = payload.username?.toLowerCase()
      const password = payload.password

      if (email && username) {
        return response.badRequest({ message: "Either email or username must be provided.", status: "e_missing_identifier" })
      }else if (email && username) {
        return response.badRequest({ message: "Provide either email or username, not both.", status: "e_multiple_identifiers" })
      }

      const user = await User.verifyCredentials((email ?? username)!, password)

      const token = await User.accessTokens.create(user, ["*"],{expiresIn: payload.rememberMe ? "7 days" : "2 hours"})
        

      return response.ok({ message: "Session created", status: "s_session_created", token })

    }
  
    /**
     * Show individual record
     */
    // async show({ params }: HttpContext) {}
  
    /**
     * Delete record
     */
    // async destroy({ params }: HttpContext) {}
}