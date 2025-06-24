import { test } from '@japa/runner'

const COURSE_GROUPS_PATH = '/api/v1/course-groups'

test.group('Course', () => {
  test('gets all course groups', async ({ assert, client }) => {
    const res = await client.get(COURSE_GROUPS_PATH)
    res.assertOk()
    const body = await res.body()
    assert.isArray(body)
    assert.lengthOf(body, 1)
  })

  test('gets course group by id', async ({ assert, client }) => {
    const res = await client.get(`${COURSE_GROUPS_PATH}/1`)
    res.assertOk()
    const body = await res.body()
    assert.isNotArray(body)
  })

  test('returns 404 for non-existent course group', async ({ client }) => {
    const res = await client.get(`${COURSE_GROUPS_PATH}/69`)
    res.assertNotFound()
  })

  test('creates and deletes a new course group', async ({ assert, client }) => {
    const newData = {
      name: 'INF202',
      capacity: 20,
    }
    const resCreate = await client.post(COURSE_GROUPS_PATH).json(newData)
    resCreate.assertCreated()
    const body = await resCreate.body()
    assert.isObject(body)
    assert.equal(body.name, newData.name)
    const resDelete = await client.delete(`${COURSE_GROUPS_PATH}/${body.id}`)
    resDelete.assertNoContent()
    const resGet = await client.get(`${COURSE_GROUPS_PATH}/${body.id}`)
    resGet.assertNotFound()
  })

  test('does not delete non-existent course group', async ({ client }) => {
    const res = await client.delete(`${COURSE_GROUPS_PATH}/69`)
    res.assertNotFound
  })

  test('validates course group creation', async ({ client }) => {
    const invalidRes = await client.post(COURSE_GROUPS_PATH).json({
      name: '',
      capacity: -5,
    })
    invalidRes.assertUnprocessableEntity()
  })
})
