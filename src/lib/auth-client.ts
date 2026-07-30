import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

/** Same-origin client — leave baseURL unset so local + production both work. */
export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
