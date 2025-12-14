import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from '@/infrastructure/services/auth/auth.service';

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/settings", "/organizations"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get access token from cookies
  const accessToken = request.cookies.get("access_token")?.value;

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Verify token if present
  let isAuthenticated = false;
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    isAuthenticated = !!payload;
  }

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Try to refresh token if access token is expired but refresh token exists
  if (isProtectedRoute && !isAuthenticated) {
    const refreshToken = request.cookies.get("refresh_token")?.value;
    if (refreshToken) {
      // Redirect to refresh endpoint which will handle token refresh
      const response = NextResponse.redirect(request.url);
      response.headers.set("x-needs-refresh", "true");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
