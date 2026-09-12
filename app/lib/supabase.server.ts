import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import type { RouterContextProvider } from "react-router";

import type { Database } from "../types/database";
import { runtimeEnvContext } from "./runtime-context";

export function createSupabase(
  request: Request,
  context: Readonly<RouterContextProvider>,
) {
  const env = context.get(runtimeEnvContext);
  const headers = new Headers({ "Cache-Control": "private, no-store" });

  const supabase = createServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "").map(
            ({ name, value }) => ({ name, value: value ?? "" }),
          );
        },
        setAll(cookies) {
          for (const { name, value, options } of cookies) {
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options),
            );
          }
        },
      },
    },
  );

  return { supabase, headers };
}
