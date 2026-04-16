import { betterAuth } from "better-auth";
import { pgPool } from "./db.server";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export const auth = betterAuth({
  database: pgPool,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()],
});
