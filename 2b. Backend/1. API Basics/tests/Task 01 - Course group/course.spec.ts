import { test } from '@japa/runner'

const BASE_URL = '/api/v1/course-groups'

test.group('Course', () => {
  test('store: should create a new course group with valid data', async ({ client, assert }) => {
    const payload = {
      name: 'Test Group',
      capacity: 20,
    }

    const response = await client.post(BASE_URL).json(payload)

    response.assertCreated()
    response.assertBodyContains({
      name: payload.name,
      capacity: payload.capacity,
    })
    assert.exists(response.body().id)
  })

  test('store: should fail with no name in payload', async ({ client }) => {
    const payload = {
      name: '',
      capacity: 5,
    }

    const response = await client.post(BASE_URL).json(payload)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'name' }] })
  })

  test('store: should fail with negative capacity', async ({ client }) => {
    const payload = {
      name: 'Invalid Group',
      capacity: -5,
    }

    const response = await client.post(BASE_URL).json(payload)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'capacity' }] })
  })

  test('store: should fail with non-numeric capacity', async ({ client }) => {
    const payload = {
      name: 'Invalid Group',
      capacity: 'not-a-number',
    }

    const response = await client.post(BASE_URL).json(payload)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'capacity' }] })
  })

  test('destroy: should delete a course group', async ({ client }) => {
    const createResponse = await client.post(BASE_URL).json({
      name: 'To Delete',
      capacity: 10,
    })
    const id = createResponse.body().id

    const response = await client.delete(`${BASE_URL}/${id}`)

    response.assertNoContent()

    const getResponse = await client.get(`${BASE_URL}/${id}`)
    getResponse.assertStatus(404)
  })

  test('destroy: should return 404 for non-existent group', async ({ client }) => {
    const response = await client.delete(`${BASE_URL}/999999`)
    response.assertStatus(404)
  })
})
