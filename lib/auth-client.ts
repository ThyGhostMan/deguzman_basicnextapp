// lib/auth-client.ts
import { createAuthClient } from "better-auth/react"; // <--- This sub-path is built into 'better-auth'
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { AuthOptions } from "./auth";

export const authClient = createAuthClient({
    // Prefer window.location.origin to avoid CORS when using multiple Vercel domains (e.g. preview vs production)
    baseURL: typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    plugins: [
        inferAdditionalFields<AuthOptions>()
    ],
    fetchOptions: {
        auth: {
            type: "Bearer",
            token: () => {
                if (typeof window !== "undefined") {
                    return sessionStorage.getItem("better-auth-token") || undefined;
                }
                return undefined;
            }
        },
        plugins: [
            {
                id: "auth-token-storage",
                name: "auth-token-storage",
                hooks: {
                    onResponse: async (context: { response: Response }) => {
                         const token = context.response.headers.get("set-auth-token");
                         if (token) {
                             sessionStorage.setItem("better-auth-token", token);
                         }
                    }
                }
            }
        ]
    }
});

export const { useSession, signIn, signUp, signOut, getSession } = authClient;
