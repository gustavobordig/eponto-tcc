"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tokenUtils } from "@/utils/token";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function ProfileSelectionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Verificar se está logado
    const token = tokenUtils.getToken();
    if (!token) {
      router.push('/');
      return;
    }

    // Verificar se já tem perfil selecionado
    const selectedProfile = tokenUtils.getSelectedProfile();
    if (selectedProfile === 'admin') {
      router.push('/dashboard');
    } else if (selectedProfile === 'user') {
      router.push('/home');
    }
  }, [router]);

  const handleProfileSelection = async (profile: 'admin' | 'user') => {
    try {
      setIsLoading(true);
      
      // Salvar perfil selecionado
      tokenUtils.setSelectedProfile(profile);
      
      showSuccessToast(`Perfil ${profile === 'admin' ? 'Administrador' : 'Usuário'} selecionado com sucesso!`);
      
      // Redirecionar baseado no perfil
      if (profile === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/home');
      }
    } catch (error) {
      showErrorToast('Erro ao selecionar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#002085]/5 via-transparent to-[#002085]/10"></div>
      
      <div className="relative z-10 max-w-4xl w-full px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#002085] mb-4">
            {t('profile.who-watching')}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-12 max-w-2xl mx-auto">
          {/* Perfil Administrador */}
          <div className="group cursor-pointer" onClick={() => handleProfileSelection('admin')}>
            <div className="relative">
              <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-[#002085] shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <div className="w-full h-full bg-gradient-to-br from-[#002085] to-blue-700 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-medium text-gray-900 group-hover:text-[#002085] transition-colors">
                  {t('profile.admin')}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {t('profile.admin-desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Perfil Usuário */}
          <div className="group cursor-pointer" onClick={() => handleProfileSelection('user')}>
            <div className="relative">
              <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-[#002085] shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-medium text-gray-900 group-hover:text-[#002085] transition-colors">
                  {t('profile.user')}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {t('profile.user-desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="mt-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#002085]"></div>
            <p className="text-gray-700 mt-4">{t('common.loading')}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <button 
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-[#002085] transition-colors text-sm border border-gray-300 hover:border-[#002085] px-4 py-2 rounded bg-white hover:bg-gray-50"
          >
            {t('profile.logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
