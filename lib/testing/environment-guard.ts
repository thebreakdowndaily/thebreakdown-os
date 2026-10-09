export function assertStagingEnvironment(): void {
  const isProdHost = (url: string | undefined) => {
    if (!url) return false;
    return url.includes('mskyhaunnlwtwvsqcmav') || url.includes('db.mskyhaunnlwtwvsqcmav.supabase.co');
  };

  const stagingDbUrl = process.env.STAGING_DATABASE_URL;
  const stagingSbUrl = process.env.STAGING_SUPABASE_URL;

  if (!stagingDbUrl) {
    throw new Error('assertStagingEnvironment: STAGING_DATABASE_URL is explicitly required but missing.');
  }
  if (!stagingSbUrl) {
    throw new Error('assertStagingEnvironment: STAGING_SUPABASE_URL is explicitly required but missing.');
  }
  if (isProdHost(stagingDbUrl)) {
    throw new Error('assertStagingEnvironment: STAGING_DATABASE_URL points to a known production host.');
  }
  if (isProdHost(stagingSbUrl)) {
    throw new Error('assertStagingEnvironment: STAGING_SUPABASE_URL points to a known production host.');
  }
}
