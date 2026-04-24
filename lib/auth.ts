import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { pool } from "./db";

export const auth = betterAuth({
    database: pool,
    user: { 
        modelName: "users",
        additionalFields: {
            active: {
                type: "boolean",
            },
        },
    },
    session: { 
        modelName: "sessions",
    },
    account: { modelName: "accounts" },
    verification: { modelName: "verifications" },

    emailAndPassword: {
        enabled: true,
    },

    plugins: [
        bearer(),
    ],

    secret: process.env.BETTER_AUTH_SECRET,

    // ✅ Production / serverless settings
    baseURL: process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
    trustedOrigins: [
        "http://localhost:3000",
        "https://basicnextapp.vercel.app",
        "https://deguzman-basicnextapp.vercel.app",
    ],
});

export type Auth = typeof auth;
export const authOptions = auth.options;
export type AuthOptions = typeof auth.options;