'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import { tokenUtils } from '@/utils/token';
import SimpleLanguageSelector from '@/app/components/atoms/SimpleLanguageSelector';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {href: '/dashboard', label: 'Usuários' },
    {href:"/dashboard/cargos", label:"Cargos"},
    {href:"/dashboard/jornada-trabalho", label:"Jornada de Trabalho"},
    {href:"/dashboard/feriados", label:"Feriados"},
    {href:"/dashboard/ferias", label:"Férias"},
    {href:"/dashboard/calendario", label:"Calendário"},
    {href:"/dashboard/analytics", label:"Estatísticas"},
  ];

  const approvalItems = [
    {href:"/dashboard/aprovacoes", label:"Central de Aprovações"},
  ];

  useEffect(() => {
    // Verificar se está logado e tem perfil ADMIN
    const token = tokenUtils.getToken();
    
    if (!token) {
      router.push('/');
      return;
    }
    
    if (tokenUtils.isAdmin()) {
      setIsAuthenticated(true);
    } else {
      // Se não tem perfil admin, redirecionar para home
      router.push('/home');
    }
  }, [router]);

  const handleLogout = () => {
    tokenUtils.logout();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">Admin</span>
              </div>
              <div className="hidden lg:ml-6 lg:flex lg:overflow-x-auto lg:flex-1 lg:min-w-0">
                <div className="flex space-x-1 min-w-max">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${
                        pathname === item.href
                          ? 'border-indigo-500 text-gray-900 bg-indigo-50'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50'
                      } inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 flex-shrink-0`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-l border-gray-300 mx-2"></div>
                  {approvalItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${
                        pathname === item.href
                          ? 'border-green-500 text-gray-900 bg-green-50'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50'
                      } inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 flex-shrink-0`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center flex-shrink-0 ml-4 gap-3">
              <SimpleLanguageSelector />
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
              >
                Sair
              </button>
            </div>
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Abrir menu principal</span>
                <svg
                  className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <svg
                  className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        <div
          className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:hidden`}
          id="mobile-menu"
        >
          <div className="pt-2 pb-3 space-y-1 max-h-96 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${
                  pathname === item.href
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-gray-200 my-2"></div>
            {approvalItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${
                  pathname === item.href
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex flex-col gap-3 px-4">
              <SimpleLanguageSelector />
              <button
                onClick={handleLogout}
                className="w-full justify-center inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-4">{children}</main>
    </div>
  );
} 