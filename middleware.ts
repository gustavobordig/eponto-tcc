import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_ROUTES,
  SESSION_COOKIES,
  USER_ROUTES,
  isTokenExpired,
  matchesRoute,
  normalizePerfil,
} from '@/lib/session';

/**
 * Protege a navegação: sem sessão volta para o login, e o painel /dashboard
 * fica só para perfil admin. Os cookies podem ser editados no navegador,
 * então a API continua sendo quem bloqueia os dados de verdade.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIES.token)?.value;
  const logado = Boolean(token) && !isTokenExpired(token!);
  const admin = normalizePerfil(request.cookies.get(SESSION_COOKIES.perfil)?.value) === 'admin';

  const redirect = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url));
    // Token vencido: limpa os cookies para não ficar indo e voltando
    if (token && !logado) {
      Object.values(SESSION_COOKIES).forEach((name) => response.cookies.delete(name));
    }
    return response;
  };

  const rotaAdmin = matchesRoute(pathname, ADMIN_ROUTES);
  const rotaUsuario = matchesRoute(pathname, USER_ROUTES);

  if ((rotaAdmin || rotaUsuario) && !logado) return redirect('/');
  if (rotaAdmin && !admin) return redirect('/home');
  if (pathname === '/' && logado) return redirect('/home');

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/home/:path*',
    '/perfil/:path*',
    '/history/:path*',
    '/calendar/:path*',
    '/feedback/:path*',
    '/solicitar-ausencia/:path*',
    '/minhas-solicitacoes/:path*',
    '/dashboard/:path*',
    '/adicionar-cargo',
    '/adicionar-feriado',
    '/adicionar-ferias',
    '/adicionar-jornada',
    '/adicionar-usuario',
  ],
};
