import {test} from '@japa/runner'
import Registration from "#models/registration";
import {assert} from "@japa/assert";

const BASE_URL = '/api/v1/registrations'

test.group('store', () => {
  const validPayload = {
    studentId: 1,
    groupId: 1
  };
  const invalidPayload = {
    studentId: 1,
    groupId: -1
  }
  test('shouldFailOnInvalidBody', async ({client}) => {
    const response = await client.post(BASE_URL).form(invalidPayload);
    response.assertUnprocessableEntity();
  });
  test('shouldPassOnValidBody', async ({client}) => {
    const expectedResult = {
      id: 1,
      studentId: 1,
      groupId: 1
    };
    Registration.create = async () => Promise.resolve(expectedResult as InstanceType<any>);
    const response = await client.post(BASE_URL).form(validPayload);
    response.assertCreated();
    response.assertBodyContains(expectedResult);
  });
});
test.group('destroy', () => {
  test('shouldFailIfInvalidId', async ({client}) => {
    const id = 1;
    Registration.findByOrFail = async () => Promise.reject();
    const response = await client.delete(`${BASE_URL}/${id}`);
    assert(response.response.statusCode !== 204); //no error handling in controllers
  });
  test('shouldReturn204IfValidId', async ({client}) => {
    const id = 1;
    const mockRegistration = {
      id,
      delete: async () => Promise.resolve()
    };
    Registration.findByOrFail = async () => Promise.resolve(mockRegistration);
    const response = await client.delete(`${BASE_URL}/${id}`);
    response.assertNoContent();
  });
})
