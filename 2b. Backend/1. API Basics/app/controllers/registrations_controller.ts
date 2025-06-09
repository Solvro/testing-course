import type { HttpContext } from '@adonisjs/core/http'
import Registration from '#models/registration'
import { createRegistrationValidator } from '#validators/create_registration'

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
    const reg = await Registration.create(payload)
    return response.created(reg)
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    const reg = await Registration.find(params.id)
    if (!reg) return response.notFound({ error: 'NOT_FOUND' })
    return reg
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const reg = await Registration.find(params.id)
    if (!reg) return response.notFound({ error: 'NOT_FOUND' })
    await reg.delete()
    return response.noContent()
  }
}
