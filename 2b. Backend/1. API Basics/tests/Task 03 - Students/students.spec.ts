import { test } from '@japa/runner'
import Student from '#models/student'

test.group('Students | Endpoint tests', (group) => {
  group.each.teardown(async () => {
    await Student.truncate(true)
  })

  test('creates a student with valid data', async ({ client, assert }) => {
    const res = await client.post('/api/v1/students').json({
      name: 'Jan',
      surname: 'Kowalski',
      email: 'jan@pwr.edu.pl',
      indexNumber: 's12345',
    })

    res.assertStatus(201)
    res.assertBodyContains({
      name: 'Jan',
      surname: 'Kowalski',
      email: 'jan@pwr.edu.pl',
      indexNumber: 's12345',
    })

    const saved = await Student.findOrFail(res.body().id)
    assert.equal(saved.email, 'jan@pwr.edu.pl')
  })

  test('fails to create student with invalid email', async ({ client, assert }) => {
    const res = await client.post('/api/v1/students').json({
      name: 'Jan',
      surname: 'Kowalski',
      email: 'niepoprawny-email',
      indexNumber: 's12345',
    })

    res.assertStatus(422)
    assert.exists(res.body().errors)
  })

  test('fails to create student with short indexNumber', async ({ client, assert }) => {
    const res = await client.post('/api/v1/students').json({
      name: 'Jan',
      surname: 'Kowalski',
      email: 'jan@pwr.edu.pl',
      indexNumber: 's',
    })

    res.assertStatus(422)
    assert.exists(res.body().errors)
  })

  test('returns all students', async ({ client, assert }) => {
    await Student.create({
      name: 'Anna',
      surname: 'Nowak',
      email: 'anna@pwr.edu.pl',
      indexNumber: 's54321',
    })

    const res = await client.get('/api/v1/students')
    res.assertStatus(200)
    assert.isArray(res.body())
    assert.lengthOf(res.body(), 1)
  })

  test('shows individual student', async ({ client, assert }) => {
    const student = await Student.create({
      name: 'Kuba',
      surname: 'Wiśniewski',
      email: 'kuba@pwr.edu.pl',
      indexNumber: 's99999',
    })

    const res = await client.get(`/api/v1/students/${student.id}`)
    res.assertStatus(200)
    assert.equal(res.body().email, 'kuba@pwr.edu.pl')
  })

  test('deletes student', async ({ client, assert }) => {
    const student = await Student.create({
      name: 'Marek',
      surname: 'Testowy',
      email: 'marek@pwr.edu.pl',
      indexNumber: 's00001',
    })

    const res = await client.delete(`/api/v1/students/${student.id}`)
    res.assertStatus(204)

    const found = await Student.find(student.id)
    assert.isNull(found)
  })
})
