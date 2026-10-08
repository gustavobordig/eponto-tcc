// Monta um JWT de teste (assinatura falsa: o front só lê o payload)
const base64url = (obj: object) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export function jwtDeTeste(idUsuario: number, role: 'Admin' | 'User') {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url({ sub: String(idUsuario), [ROLE_CLAIM]: role, exp })}.assinatura`;
}
