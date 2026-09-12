import { createRequestHandler } from "react-router";

import { isStagingUrl } from "../app/lib/environment";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request) {
    const response = await requestHandler(request);

    if (!isStagingUrl(request.url)) return response;

    const headers = new Headers(response.headers);
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

    const protectedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });

    if (!headers.get("Content-Type")?.includes("text/html")) {
      return protectedResponse;
    }

    return new HTMLRewriter()
      .on("head", {
        element(element) {
          element.append(
            '<meta name="robots" content="noindex, nofollow, noarchive">',
            { html: true },
          );
        },
      })
      .transform(protectedResponse);
  },
} satisfies ExportedHandler<Env>;
