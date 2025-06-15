import type {HttpContext} from '@adonisjs/core/http'
import Student from '#models/student'
import {createStudentValidator} from '#validators/create_student'

export default class StudentsController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    return Student.all()
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createStudentValidator)
    const student = await Student.create(payload)
    return response.created(student)
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return await Student.findOrFail(params.id)
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const student = await Student.findOrFail(params.id)
    await student.delete()
    return response.noContent()
  }
}
