import Student from '#models/student'
import { test } from '@japa/runner'

test.group('Students', (group) => {
  const sampleStudentData = {
    name: 'Bob',
    surname: 'B',
    email: 'bob.b@pwr.pl',
    indexNumber: '111111',
  }

  group.each.setup(async () => {
    await Student.truncate()
  })

  group.each.teardown(async () => {
    await Student.truncate()
  })

  test('should return an empty list of students', async ({ client }) => {
    const response = await client.get('/api/v1/students')

    response.assertStatus(200)
  })

  test('should return a list of students', async ({ client }) => {
    await Student.create(sampleStudentData)

    const response = await client.get('/api/v1/students')

    response.assertStatus(200)
    response.assertBodyContains([sampleStudentData])
  })

  test('should create a new student', async ({ client }) => {
    const response = await client.post('/api/v1/students').json(sampleStudentData)

    response.assertStatus(201)
    response.assertBodyContains(sampleStudentData)
  })

  test('should not allow duplicate index', async ({ client }) => {
    await Student.create(sampleStudentData)

    const response = await client.post('/api/v1/students').json({
      name: 'Dan',
      surname: 'Danny',
      email: 'dan.d@pwr.pl',
      indexNumber: '111111',
    })

    response.assertStatus(500)
    response.assertTextIncludes('UNIQUE constraint failed')
  })

  test('should delete a student', async ({ client }) => {
    const student = await Student.create(sampleStudentData)

    const response = await client.delete(`/api/v1/students/${student.id}`)

    response.assertStatus(204)
  })
})
