import CourseGroup from '#models/course_group'
import Registration from '#models/registration'
import Student from '#models/student'
import { test } from '@japa/runner'

const REGISTRATIONS_API_PATH = '/api/v1/registrations'

test.group('RegistrationsController', (group) => {
  let student1: Student
  let student2: Student
  let group1: CourseGroup

  group.setup(async () => {
    await Registration.truncate()
    await Student.truncate()
    await CourseGroup.truncate()

    student1 = await Student.create({
      name: 'Alice',
      surname: 'Smith',
      email: 'alice@example.com',
      indexNumber: '2025001',
    })

    student2 = await Student.create({
      name: 'Bob',
      surname: 'Brown',
      email: 'bob@example.com',
      indexNumber: '2025002',
    })

    group1 = await CourseGroup.create({
      name: 'Physics Course',
      capacity: 30,
    })
  })

  group.each.setup(async () => {
    await Registration.truncate()
  })

  // GET
  test('should return all registrations', async ({ client }) => {
    await Registration.create({ studentId: student1.id, groupId: group1.id })
    await Registration.create({ studentId: student2.id, groupId: group1.id })

    const response = await client.get(REGISTRATIONS_API_PATH)

    response.assertStatus(200)
    response.assertBodyContains([{ studentId: student1.id }, { studentId: student2.id }])
  })

  // POST
  test('should fail to create registration without studentId', async ({ client }) => {
    const response = await client.post(REGISTRATIONS_API_PATH).json({
      groupId: 1,
    })
    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'studentId' }] })
  })

  test('should fail to create registration with invalid groupId', async ({ client }) => {
    const response = await client.post(REGISTRATIONS_API_PATH).json({
      studentId: 1,
      groupId: 'invalid',
    })
    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'groupId' }] })
  })

  test('should create a new registration', async ({ client }) => {
    const response = await client.post(REGISTRATIONS_API_PATH).json({
      studentId: student1.id,
      groupId: group1.id,
    })

    response.assertStatus(201)
    response.assertBodyContains({ studentId: student1.id, groupId: group1.id })

    const registration = await Registration.findByOrFail('studentId', student1.id)
    response.assertBodyContains({ id: registration.id })
  })

  // GET :id
  test('should return a single registration', async ({ client }) => {
    const registration = await Registration.create({
      studentId: student2.id,
      groupId: group1.id,
    })

    const response = await client.get(`${REGISTRATIONS_API_PATH}/${registration.id}`)

    response.assertStatus(200)
    response.assertBodyContains({
      id: registration.id,
      studentId: student2.id,
      groupId: group1.id,
    })
  })

  test('should return 404 when registration not found', async ({ client }) => {
    const response = await client.get(`${REGISTRATIONS_API_PATH}/999999`)
    response.assertStatus(404)
  })

  // DELETE :id
  test('should delete a registration', async ({ client, assert }) => {
    const registration = await Registration.create({
      studentId: student1.id,
      groupId: group1.id,
    })

    const response = await client.delete(`${REGISTRATIONS_API_PATH}/${registration.id}`)

    response.assertStatus(204)

    const deleted = await Registration.find(registration.id)
    assert.isNull(deleted)
  })

  test('should return 404 when deleting a non-existent registration', async ({ client }) => {
    const response = await client.delete(`${REGISTRATIONS_API_PATH}/999999`)
    response.assertStatus(404)
  })
})
