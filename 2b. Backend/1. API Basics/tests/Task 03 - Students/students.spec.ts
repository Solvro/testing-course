import Student from '#models/student'
import { test } from '@japa/runner'

test.group('Students', (group) => {
  const myStudent = {
    name: 'Kamil',
    surname: 'Ramocki',
    email: '279443@student.pwr.edu.pl',
    indexNumber: '279443',
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
    await Student.create(myStudent)

    const response = await client.get('/api/v1/students')

    response.assertStatus(200)
    response.assertBodyContains([myStudent])
  })

  test('should create a new student', async ({ client }) => {
    const response = await client.post('/api/v1/students').json(myStudent)

    response.assertStatus(201)
    response.assertBodyContains(myStudent)
  })

  test('should not allow duplicate index', async ({ client }) => {
    await Student.create(myStudent)

    const response = await client.post('/api/v1/students').json({
      name: 'Piotr',
      surname: 'Hirkyj',
      email: '279443@student.pwr.edu.pl',
      indexNumber: '279443',
    })

    response.assertStatus(500)
    response.assertTextIncludes('UNIQUE constraint failed')
  })

  test('should delete a student', async ({ client }) => {
    const student = await Student.create(myStudent)

    const response = await client.delete(`/api/v1/students/${student.id}`)

    response.assertStatus(204)
  })

  test('should return a single student by id', async ({ client }) => {
    const student = await Student.create(myStudent)

    const response = await client.get(`/api/v1/students/${student.id}`)

    response.assertStatus(200)
    response.assertBodyContains({
      id: student.id,
      ...myStudent,
    })
  })

  test('should return 404 when student is not found', async ({ client }) => {
    const response = await client.get('/api/v1/students/999')

    response.assertStatus(404)
  })

  test('should return 404 when deleting non-existent student', async ({ client }) => {
    const response = await client.delete('/api/v1/students/999')

    response.assertStatus(404)
  })
})
