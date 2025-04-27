const TOKEN_KEY = '@App:token';
const ID_KEY = '@App:id';

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

    logout(): void {
        this.removeToken();
        window.location.href = '/';
    }
}; 