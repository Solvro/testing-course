import { factory, primaryKey } from "@mswjs/data";
import { faker } from "@faker-js/faker";
export const db = factory({
  project: {
    value: primaryKey(faker.number.int),
    label: faker.food.dish,
  },
});
