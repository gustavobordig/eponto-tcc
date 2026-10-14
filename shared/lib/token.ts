import { agoraReal } from '@/shared/lib/relogioSimulado';
import {
  Perfil,
  SESSION_COOKIES,
  normalizePerfil,
  tokenMaxAge,
} from '@/shared/lib/session';

const USER_KEY = 'user';
// Chaves da versão antiga, que guardava a sessão no localStorage
const LEGACY_KEYS = ['@App:token', '@App:id', 'adminAuthenticated'];

const isBrowser = () => typeof document !== 'undefined';

function readCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function writeCookie(name: string, value: string, maxAge: number): void {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export const tokenUtils = {
  getToken(): string | null {
    return readCookie(SESSION_COOKIES.token);
  },

  getId(): string | null {
    return readCookie(SESSION_COOKIES.id);
  },

  getPerfil(): Perfil | undefined {
    return normalizePerfil(readCookie(SESSION_COOKIES.perfil));
  },

  isAdmin(): boolean {
    return this.getPerfil() === 'admin';
  },

  // Os três cookies expiram junto com o token
  setSession({ token, id, perfil }: { token: string; id: string; perfil: Perfil }): void {
    if (!isBrowser()) return;
    const maxAge = tokenMaxAge(token, agoraReal());
    writeCookie(SESSION_COOKIES.token, token, maxAge);
    writeCookie(SESSION_COOKIES.id, id, maxAge);
    writeCookie(SESSION_COOKIES.perfil, perfil, maxAge);
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  },

  clear(): void {
    if (!isBrowser()) return;
    Object.values(SESSION_COOKIES).forEach((name) => writeCookie(name, '', 0));
    [USER_KEY, ...LEGACY_KEYS].forEach((key) => localStorage.removeItem(key));
  },

  logout(): void {
    this.clear();
    window.location.href = '/';
  },
};
