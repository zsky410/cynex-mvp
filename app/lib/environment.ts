const STAGING_HOSTS = new Set(["staging.cynex.site"]);

export function isStagingUrl(url: string) {
  const hostname = new URL(url).hostname;

  return (
    STAGING_HOSTS.has(hostname) ||
    hostname.startsWith("cynex-mvp-staging.")
  );
}
