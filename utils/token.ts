const TOKEN_KEY = '@App:token';
const ID_KEY = '@App:id';
const PERFIS_KEY = '@App:perfis';
const TIPO_ACESSO_KEY = '@App:tipoAcesso';

export const tokenUtils = {
    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(TOKEN_KEY);
        }
        return null;
    },

    setId(id: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(ID_KEY, id);
        }
    },

    getId(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(ID_KEY);
        }
        return null;
    },

    setToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token);
        }
    },

    removeToken(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
        }
    },

    setPerfis(perfis: any[]): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(PERFIS_KEY, JSON.stringify(perfis));
        }
    },

    getPerfis(): any[] | null {
        if (typeof window !== 'undefined') {
            const perfis = localStorage.getItem(PERFIS_KEY);
            return perfis ? JSON.parse(perfis) : null;
        }
        return null;
    },

    setTipoAcesso(tipo: 'user' | 'admin'): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TIPO_ACESSO_KEY, tipo);
        }
    },

    getTipoAcesso(): 'user' | 'admin' | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(TIPO_ACESSO_KEY) as 'user' | 'admin' | null;
        }
        return null;
    },

    isAdmin(): boolean {
        const perfis = this.getPerfis();
        return perfis?.some((perfil: any) => perfil.dscPerfil === 'ADMIN') || false;
    },

    logout(): void {
        this.removeToken();
        if (typeof window !== 'undefined') {
            localStorage.removeItem(ID_KEY);
            localStorage.removeItem(PERFIS_KEY);
            localStorage.removeItem(TIPO_ACESSO_KEY);
        }
        window.location.href = '/';
    }
}; 