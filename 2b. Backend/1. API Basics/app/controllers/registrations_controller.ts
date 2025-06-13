import type {HttpContext} from '@adonisjs/core/http'
import Registration from '#models/registration'
import {createRegistrationValidator} from '#validators/create_registration'

export default class RegistrationsController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    return Registration.all()
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createRegistrationValidator)
    const registration = await Registration.create(payload)
    return response.created(registration)
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return await Registration.findOrFail(params.id)
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const registration = await Registration.findOrFail(params.id)
    await registration.delete()
    return response.noContent()
  }
}
