import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { UserRole } from '@/lib/types';

// Route access configuration
const ROLE_ROUTES: Record<UserRole, string> = {
  mahasiswa: '/mahasiswa',
  instruktur: '/instruktur',
  admin: '/admin',
  headmaster: '/headmaster',
};

const PUBLIC_ROUTES = ['/login', '/verify', '/onboarding', '/api'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    // If user is already authenticated and tries to access /login,
    // redirect them to their dashboard
    if (user && pathname.startsWith('/login')) {
      const role = (user.app_metadata?.role as UserRole) || null;
      if (role && ROLE_ROUTES[role]) {
        const url = request.nextUrl.clone();
        url.pathname = `${ROLE_ROUTES[role]}/dashboard`;
        return NextResponse.redirect(url);
      }
    }
    return supabaseResponse;
  }

  // Redirect to login if not authenticated
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Get user role from app_metadata (set during user creation/seeding)
  // This avoids querying the database which can fail due to RLS in middleware context
  let role = user.app_metadata?.role as UserRole | undefined;

  // Fallback: try querying the database if app_metadata doesn't have role
  if (!role) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    role = userData?.role as UserRole | undefined;
  }

  // If still no role found, redirect to login
  if (!role) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const allowedPath = ROLE_ROUTES[role];

  // Check if user is accessing their allowed routes
  if (pathname.startsWith('/mahasiswa') || pathname.startsWith('/instruktur') ||
      pathname.startsWith('/admin') || pathname.startsWith('/headmaster')) {
    if (!pathname.startsWith(allowedPath)) {
      // Redirect to their dashboard
      const url = request.nextUrl.clone();
      url.pathname = `${allowedPath}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  // Redirect root to appropriate dashboard
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `${allowedPath}/dashboard`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
