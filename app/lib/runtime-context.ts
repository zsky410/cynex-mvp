import { createContext } from "react-router";

export type RuntimeEnv = Env & {
  APP_ENV: string;
  APP_ORIGIN: string;
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
};

export const runtimeEnvContext = createContext<RuntimeEnv>();
