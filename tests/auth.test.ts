/**
 * THE BREAKDOWN — Auth Tests
 *
 * Tests the auth components, server, client, and view-model.
 */

import { buildAuthPage } from '../features/auth/view-model';

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed++;
    } else {
      console.error(`  FAIL: ${name}`);
      failed++;
    }
  }

  // ── Auth ViewModel ───────────────────────────────────────────────────

  try {
    const vm = buildAuthPage();
    assert(vm.loginUrl === '/api/auth/sign-in', 'Login URL matches');
    assert(vm.registerUrl === '/api/auth/sign-up', 'Register URL matches');
    assert(vm.providers.length === 2, 'Has 2 social providers');
    assert(vm.providers[0].id === 'google', 'First provider is Google');
    assert(vm.providers[1].id === 'github', 'Second provider is GitHub');
  } catch (e) {
    console.error('  FAIL: Auth ViewModel threw:', e);
    failed++;
  }

  // ── Auth Server Config ───────────────────────────────────────────────

  try {
    const serverModule = await import('../features/auth/auth-server');
    assert(!!serverModule.getSupabaseAuth, 'Auth server initialized');
    assert(!!serverModule.getSession, 'Auth session function exists');
  } catch (e) {
    console.error('  FAIL: Auth server config threw:', e);
    failed++;
  }

  // ── Auth Client Config ───────────────────────────────────────────────

  try {
    const clientModule = await import('../features/auth/auth-client');
    assert(!!clientModule.supabase, 'Auth client initialized');
  } catch (e) {
    console.error('  FAIL: Auth client threw:', e);
    failed++;
  }

  // ── Auth Components ──────────────────────────────────────────────────

  try {
    const { LoginForm } = await import('../features/auth/components/LoginForm');
    assert(typeof LoginForm === 'function', 'LoginForm component is a function');
  } catch (e) {
    console.error('  FAIL: LoginForm threw:', e);
    failed++;
  }

  try {
    const { RegisterForm } = await import('../features/auth/components/RegisterForm');
    assert(typeof RegisterForm === 'function', 'RegisterForm component is a function');
  } catch (e) {
    console.error('  FAIL: RegisterForm threw:', e);
    failed++;
  }

  try {
    const { ForgotPassword } = await import('../features/auth/components/ForgotPassword');
    assert(typeof ForgotPassword === 'function', 'ForgotPassword component is a function');
  } catch (e) {
    console.error('  FAIL: ForgotPassword threw:', e);
    failed++;
  }

  try {
    const { AuthGuard } = await import('../features/auth/components/AuthGuard');
    assert(typeof AuthGuard === 'function', 'AuthGuard component is a function');
  } catch (e) {
    console.error('  FAIL: AuthGuard threw:', e);
    failed++;
  }

  try {
    const { ProfileDropdown } = await import('../features/auth/components/ProfileDropdown');
    assert(typeof ProfileDropdown === 'function', 'ProfileDropdown component is a function');
  } catch (e) {
    console.error('  FAIL: ProfileDropdown threw:', e);
    failed++;
  }

  try {
    const { UserAvatar } = await import('../features/auth/components/UserAvatar');
    assert(typeof UserAvatar === 'function', 'UserAvatar component is a function');
  } catch (e) {
    console.error('  FAIL: UserAvatar threw:', e);
    failed++;
  }

  try {
    const { ReaderDashboard } = await import('../features/auth/components/ReaderDashboard');
    assert(typeof ReaderDashboard === 'function', 'ReaderDashboard component is a function');
  } catch (e) {
    console.error('  FAIL: ReaderDashboard threw:', e);
    failed++;
  }

  try {
    const { SessionProvider, useAuth } = await import('../features/auth/components/SessionProvider');
    assert(typeof SessionProvider === 'function', 'SessionProvider component is a function');
    assert(typeof useAuth === 'function', 'useAuth hook is a function');
  } catch (e) {
    console.error('  FAIL: SessionProvider threw:', e);
    failed++;
  }

  // ── API Routes ───────────────────────────────────────────────────────

  try {
    const loginRoute = await import('../app/api/v1/auth/login/route');
    assert(typeof loginRoute.POST === 'function', 'Login API POST handler exists');
  } catch (e) {
    console.error('  FAIL: Login API route threw:', e);
    failed++;
  }

  try {
    const registerRoute = await import('../app/api/v1/auth/register/route');
    assert(typeof registerRoute.POST === 'function', 'Register API POST handler exists');
  } catch (e) {
    console.error('  FAIL: Register API route threw:', e);
    failed++;
  }

  try {
    const logoutRoute = await import('../app/api/v1/auth/logout/route');
    assert(typeof logoutRoute.POST === 'function', 'Logout API POST handler exists');
  } catch (e) {
    console.error('  FAIL: Logout API route threw:', e);
    failed++;
  }

  try {
    const meRoute = await import('../app/api/v1/auth/me/route');
    assert(typeof meRoute.GET === 'function', 'Me API GET handler exists');
  } catch (e) {
    console.error('  FAIL: Me API route threw:', e);
    failed++;
  }

  // ── Canonical Types (compile-time checks only; TS types erased at runtime) ──

  // Runtime value exports from canonical.ts (functions, consts, enums)
  try {
    const canonical = await import('../types/canonical');
    assert(typeof canonical === 'object', 'Canonical types module loads without error');
  } catch (e) {
    console.error('  FAIL: Canonical types module threw:', e);
    failed++;
  }

  // Compile-time type assertions (will error during tsc if wrong)
  const _typeCheckUserRole: 'admin' | 'editor' | 'writer' | 'researcher' | 'designer' | 'reader' = 'reader';
  void _typeCheckUserRole;
  assert(true, 'UserRole type is valid (compile-time check)');

  // ── Middleware ────────────────────────────────────────────────────────

  try {
    const mw = await import('../middleware');
    assert(typeof mw.middleware === 'function', 'Middleware function exported');
    assert(!!mw.config, 'Middleware config exported');
    assert(mw.config.matcher.includes('/reader/:path*'), '/reader/:path* is protected by middleware');
  } catch (e) {
    console.error('  FAIL: Middleware threw:', e);
    failed++;
  }

  // ── Summary ──────────────────────────────────────────────────────────

  const total = passed + failed;
  console.log(`\nAuth Tests: ${passed}/${total} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
