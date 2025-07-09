import { setupServer } from "msw/node";
import { handlers } from "@/tests/mocks/handlers.ts";

export const server = setupServer(...handlers);
