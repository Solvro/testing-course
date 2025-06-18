import { test } from '@japa/runner'

test.group('Course', () => {
  test('Get all courses', async ({ assert, client }) => {
    const response = await client.get('/api/v1/course-groups')
    assert.isArray(response.body(), 'Response should return an list of course groups.')
    assert.equal(response.status(), 200, 'Response should return a 200 status code.')
  })
  test('Create a course', async ({ assert, client }) => {
    const response = await client.post('/api/v1/course-groups').json({
      name: 'Backend Development 101',
      description: 'Elo zelo',
      capacity: 0,
    })
    assert.equal(
      response.status(),
      201,
      'Response should return a 201 status code for successful creation.'
    )
    assert.equal(response.status(), 201, 'Response should return a 200 status code.')
  })
  test('Course invalid/missing inputs.', async ({ assert, client }) => {
    const response = await client.post('/api/v1/course-groups')
    assert.exists(response.body().errors, 'Response should contain validation errors.')
    assert.equal(response.status(), 422, 'Response should return a 422 status code.')
  })

  test('Get a course by ID', async ({ assert, client }) => {
    const courseId = 1
    const response = await client.get(`/api/v1/course-groups/${courseId}`)
    assert.equal(response.status(), 200, 'Response should return a 200 status code.')
    assert.exists(response.body(), 'Response should contain the course data.')
  })

  test('Get a course with non existing ID', async ({ assert, client }) => {
    const courseId = -1
    const response = await client.get(`/api/v1/course-groups/${courseId}`)
    assert.equal(response.status(), 404, 'Response should return a 404 status code.')
    assert.equal(response.body().message, 'Row not found')
  })

  test('Delete a course by ID', async ({ assert, client }) => {
    const fakeCourse = await client.post('/api/v1/course-groups').json({
      name: 'Backend Development 101',
      description: 'Elo zelo',
      capacity: 0,
    })
    const courseId = fakeCourse.body().id

    const response = await client.delete(`/api/v1/course-groups/${courseId}`)
    assert.equal(response.status(), 204, 'Response should return a 204 status code.')
  })

  test('Delete a course with non existing ID', async ({ assert, client }) => {
    const courseId = -1
    const response = await client.delete(`/api/v1/course-groups/${courseId}`)
    assert.equal(response.status(), 404, 'Response should return a 404 status code.')
    assert.equal(response.body().message, 'Row not found')
  })
})
