import { faker } from '@faker-js/faker';

export const MOCKS = Array.from({ length: 10 }, () => ({
  value: faker.string.uuid(),
  label: faker.food.fruit(),
}));
export const API_URL = `https://kurs-z-testowania.deno.dev/projects`;
