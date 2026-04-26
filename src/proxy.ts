import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const publicPaths = ['/login', '/setup'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix for path matching
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

  // Always run intl middleware for locale handling
  const response = intlMiddleware(request);

  // Public paths don't need auth check
  if (publicPaths.some((p) => pathWithoutLocale.startsWith(p))) {
    return response;
  }

  // Check for auth cookie
  const token = request.cookies.get('token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
