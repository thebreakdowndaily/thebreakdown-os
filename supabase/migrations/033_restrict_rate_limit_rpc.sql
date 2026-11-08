-- Restrict the write-capable rate-limit RPC to the trusted server-side service role.
-- The application calls this function only from PostgresRateLimitStore using getServiceClient().
-- Do not expose arbitrary bucket/window/max parameters to public or signed-in clients.

REVOKE ALL ON FUNCTION public.increment_rate_limit(text, integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_rate_limit(text, integer, integer) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_rate_limit(text, integer, integer) TO service_role;
