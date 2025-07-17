import { factory, primaryKey } from "@mswjs/data";

export const db = factory({
    project: {
        value: primaryKey(String),
        label: String
    }
});