const TOKEN_KEY = '@App:token';
const ID_KEY = '@App:id';
const PROFILES_KEY = '@App:profiles';
const SELECTED_PROFILE_KEY = '@App:selectedProfile';

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

    setProfiles(profiles: Array<{idPerfil: number, dscPerfil: string}>): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
        }
    },

    getProfiles(): Array<{idPerfil: number, dscPerfil: string}> | null {
        if (typeof window !== 'undefined') {
            const profiles = localStorage.getItem(PROFILES_KEY);
            return profiles ? JSON.parse(profiles) : null;
        }
        return null;
    },

    setSelectedProfile(profile: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(SELECTED_PROFILE_KEY, profile);
        }
    },

    getSelectedProfile(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(SELECTED_PROFILE_KEY);
        }
        return null;
    },

    hasAdminProfile(): boolean {
        const profiles = this.getProfiles();
        return profiles ? profiles.some(profile => profile.dscPerfil === 'ADMIN') : false;
    },

    removeToken(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(ID_KEY);
            localStorage.removeItem(PROFILES_KEY);
            localStorage.removeItem(SELECTED_PROFILE_KEY);
        }
    },

    logout(): void {
        this.removeToken();
        window.location.href = '/';
    }
}; 