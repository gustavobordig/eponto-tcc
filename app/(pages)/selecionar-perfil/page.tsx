"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenUtils } from "@/utils/token";
import Image from "next/image";

// Atoms
import Button from "@/app/components/atoms/Button";
import Container from "@/app/components/atoms/container";

// Assets
import logo from "@/public/images/Logo.png";
import { User, Shield } from "lucide-react";

export default function SelecionarPerfil() {
  const router = useRouter();

  useEffect(() => {
    // Verificar se existe token válido
    const token = tokenUtils.getToken();
    if (!token) {
      router.push('/');
      return;
    }

    // Verificar se o usuário tem perfil de admin
    if (!tokenUtils.isAdmin()) {
      router.push('/home');
      return;
    }

    // Não redirecionar automaticamente - deixar o usuário escolher o perfil
  }, [router]);

  const handleSelecionarPerfil = (tipo: 'user' | 'admin') => {
    tokenUtils.setTipoAcesso(tipo);
    
    if (tipo === 'admin') {
      router.push('/dashboard');
    } else {
      router.push('/home');
    }
  };

  const handleLimparPerfil = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('@App:tipoAcesso');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Container>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Image 
              src={logo.src} 
              alt="logo" 
              width={200} 
              height={100} 
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Selecione o tipo de acesso
            </h1>
            <p className="text-gray-600">
              Como administrador, você pode acessar o sistema como usuário comum ou administrador
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Acesso como Usuário */}
            <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-[#002085] transition-colors">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-[#002085]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Acesso como Usuário
                </h3>
                <p className="text-gray-600 mb-6">
                  Acesse o sistema com as funcionalidades de usuário comum: 
                  registrar ponto, visualizar histórico, solicitar férias, etc.
                </p>
                <Button
                  text="Acessar como Usuário"
                  backgroundColor="bg-[#002085]"
                  textColor="text-white"
                  className="w-full"
                  onClick={() => handleSelecionarPerfil('user')}
                />
              </div>
            </div>

            {/* Acesso como Admin */}
            <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-[#002085] transition-colors">
              <div className="text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Acesso como Administrador
                </h3>
                <p className="text-gray-600 mb-6">
                  Acesse o painel administrativo com funcionalidades avançadas: 
                  gerenciar usuários, relatórios, configurações do sistema, etc.
                </p>
                <Button
                  text="Acessar como Admin"
                  backgroundColor="bg-red-600"
                  textColor="text-white"
                  className="w-full"
                  onClick={() => handleSelecionarPerfil('admin')}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 text-center space-y-2">
            <div>
              <button
                onClick={handleLimparPerfil}
                className="text-blue-600 hover:text-blue-800 underline mr-4"
              >
                Limpar perfil atual
              </button>
              <button
                onClick={() => {
                  tokenUtils.logout();
                  router.push('/');
                }}
                className="text-gray-500 hover:text-gray-700 underline"
              >
                Fazer logout
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
