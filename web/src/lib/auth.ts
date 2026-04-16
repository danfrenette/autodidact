import { betterAuth } from "better-auth";
import { pgPool } from "./db.server";
import { tanstackStartCookies } from "better-auth/tanstack-start";

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  database: pgPool,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: githubClientId!,
      clientSecret: githubClientSecret!,
    },
    google: {
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
    },
  },
  plugins: [tanstackStartCookies()],
});
