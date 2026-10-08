const TOKEN_KEY = '@App:token';
const ID_KEY = '@App:id';
const USER_KEY = 'user';

const isBrowser = () => typeof window !== 'undefined';

export const tokenUtils = {
    getToken(): string | null {
        return isBrowser() ? localStorage.getItem(TOKEN_KEY) : null;
    },

    setToken(token: string): void {
        if (isBrowser()) localStorage.setItem(TOKEN_KEY, token);
    },

    getId(): string | null {
        return isBrowser() ? localStorage.getItem(ID_KEY) : null;
    },

    setId(id: string): void {
        if (isBrowser()) localStorage.setItem(ID_KEY, id);
    },

    // Limpa a sessão inteira; antes o id e os dados do usuário ficavam para trás
    clear(): void {
        if (!isBrowser()) return;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ID_KEY);
        localStorage.removeItem(USER_KEY);
    },

    logout(): void {
        this.clear();
        window.location.href = '/';
    }
};
