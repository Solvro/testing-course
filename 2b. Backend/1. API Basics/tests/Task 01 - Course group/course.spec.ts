import { test } from '@japa/runner'

const PREFIX = '/api/v1'

test.group('API Basics', () => {
  test('GET /course-groups returns all groups', async ({ client, assert }) => {
    const response = await client
      .get(`${PREFIX}/course-groups`)

    assert.isArray(response.body())
  })

  test('POST /course-groups creates a new group', async ({ client, assert }) => {
    const tg_body = {
      name: 'test',
      capacity: 5
    }
    
    const response = await client
      .post(`${PREFIX}/course-groups`)
      .json(tg_body)

    assert.equal(response.body().name, tg_body.name)
    assert.equal(response.body().capacity, tg_body.capacity)
    assert.exists(response.body().id)
  })

  test('POST /course-groups fails with invalid data', async ({ client, assert }) => {
    const invalid_body = {
      name: '',
      capacity: -1
    }

    const response = await client
      .post(`${PREFIX}/course-groups`)
      .json(invalid_body)

    assert.equal(response.status(), 422)
    assert.exists(response.body().errors)
  })

  test('GET /course-groups/:id returns a single group', async ({ client, assert }) => {
    const tg_body = {
      name: 'test',
      capacity: 5
    }

    const tg_create = await client
      .post(`${PREFIX}/course-groups`)
      .json(tg_body)

    const tg_id = tg_create.body().id
    const response = await client
      .get(`${PREFIX}/course-groups/${tg_id}`)

    assert.equal(response.body().id, tg_id)
    assert.equal(response.body().name, tg_body.name)
  })

  test('GET /course-groups/:id fails with non-existent ID', async ({ client, assert }) => {
    const non_existent_id = 9999

    const response = await client
      .get(`${PREFIX}/course-groups/${non_existent_id}`)

    assert.equal(response.status(), 404)
  })

  test('DELETE /course-groups/:id deletes a group', async ({ client, assert }) => {
    const tg_body = {
      name: 'test',
      capacity: 5
    }

    const tg_create = await client
      .post(`${PREFIX}/course-groups`)
      .json(tg_body)

    const tg_id = tg_create.body().id
    const response = await client
      .delete(`${PREFIX}/course-groups/${tg_id}`)

    const tg_get = await client
      .get(`${PREFIX}/course-groups/${tg_id}`)

    assert.equal(response.status(), 204)
    assert.equal(tg_get.status(), 404)
  })

  test('DELETE /course-groups/:id fails with non-existent ID', async ({ client, assert }) => {
    const non_existent_id = 9999

    const response = await client
      .delete(`${PREFIX}/course-groups/${non_existent_id}`)

    assert.equal(response.status(), 404)
  })
})