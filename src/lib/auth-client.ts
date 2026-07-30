import { createAuthClient } from "better-auth/react";

/** Same-origin client — leave baseURL unset so local + production both work. */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
