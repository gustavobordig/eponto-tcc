/**
 * Sessão compartilhada entre o navegador (utils/token.ts) e o middleware.
 * Fica em cookies para o middleware conseguir proteger as rotas no servidor.
 *
 * Os cookies são legíveis pelo JS (o axios precisa do token para o header),
 * então o perfil aqui só decide a navegação. Quem bloqueia de verdade é a API.
 */

export type Perfil = 'admin' | 'funcionario';

export const SESSION_COOKIES = {
  token: 'eponto_token',
  id: 'eponto_id',
  perfil: 'eponto_perfil',
} as const;

/** Usado quando o token não é um JWT com `exp`. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

const ROLE_CLAIMS = [
  // A API do ePonto usa ClaimTypes.Role (a última da lista), com Admin ou User
  'perfil',
  'role',
  'roles',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
];

type JwtPayload = Record<string, unknown> & { exp?: number };

/** Lê o payload de um JWT sem validar a assinatura (isso é papel da API). */
export function decodeJwt(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = decodeURIComponent(
      Array.from(atob(padded), (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    );
    const payload = JSON.parse(json);
    return payload && typeof payload === 'object' ? payload : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, now = Date.now()): boolean {
  const exp = decodeJwt(token)?.exp;
  return typeof exp === 'number' && exp * 1000 <= now;
}

/** Segundos até o token expirar; cai no padrão quando não há `exp`. */
export function tokenMaxAge(token: string, now = Date.now()): number {
  const exp = decodeJwt(token)?.exp;
  if (typeof exp !== 'number') return SESSION_MAX_AGE_SECONDS;
  return Math.max(0, Math.floor(exp - now / 1000));
}

/** Perfil pela claim de role do JWT, se a API mandar uma. */
export function perfilFromToken(token: string): Perfil | undefined {
  const payload = decodeJwt(token);
  if (!payload) return undefined;
  for (const claim of ROLE_CLAIMS) {
    const value = payload[claim];
    if (value === undefined) continue;
    const roles = (Array.isArray(value) ? value : [value]).map((v) => String(v).toLowerCase());
    return roles.some((r) => r === 'admin' || r === 'administrador') ? 'admin' : 'funcionario';
  }
  return undefined;
}

export function normalizePerfil(value: unknown): Perfil | undefined {
  if (typeof value !== 'string') return undefined;
  const v = value.toLowerCase();
  if (v === 'admin' || v === 'administrador') return 'admin';
  return v ? 'funcionario' : undefined;
}

// Rotas: os grupos (authenticated)/(authenticatedAdmin) não aparecem na URL
export const USER_ROUTES = [
  '/home',
  '/perfil',
  '/history',
  '/calendar',
  '/feedback',
  '/solicitar-ausencia',
  '/minhas-solicitacoes',
];

export const ADMIN_ROUTES = [
  '/dashboard',
  '/adicionar-cargo',
  '/adicionar-feriado',
  '/adicionar-ferias',
  '/adicionar-jornada',
  '/adicionar-usuario',
];

export const matchesRoute = (pathname: string, routes: string[]) =>
  routes.some((r) => pathname === r || pathname.startsWith(`${r}/`));
