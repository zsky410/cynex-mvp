import { isStagingUrl } from "../lib/environment";

import type { Route } from "./+types/robots.txt";

export function loader({ request }: Route.LoaderArgs) {
  const body = isStagingUrl(request.url)
    ? "User-agent: *\nDisallow: /\n"
    : "User-agent: *\nAllow: /\n";

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
