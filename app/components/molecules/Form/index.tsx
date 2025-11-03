"use client";

import { useState } from "react";
import Image from "next/image";
import { User, Lock } from "lucide-react";
import { authService } from "@/services/auth";
import { useRouter } from "next/navigation";
import { AxiosError } from 'axios';

// Atoms
import Input from "@/app/components/atoms/Input";
import Button from "@/app/components/atoms/Button";

// Utils
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { CustomTooltip } from "@/utils/tooltip";
import { tokenUtils } from "@/utils/token";


interface FormProps {
    logo?: string;
    title?: string;
}

export default function Form({
    logo,
    title,
}: FormProps) {
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const isFormValid = formData.email.trim() !== '' && formData.password.trim() !== '';

    const handleSubmit = async () => {
        if (!isFormValid) return;
        
        try {
            setIsLoading(true);
            
            // Primeira etapa: buscar perfis disponíveis
            const loginResponse = await authService.realizarLogin({
                email: formData.email,
                senha: formData.password
            });
            
            if (loginResponse.sucesso) {
                // Salvar credenciais temporariamente para usar na seleção de perfil
                localStorage.setItem('tempEmail', formData.email);
                localStorage.setItem('tempPassword', formData.password);
                
                showSuccessToast("Login realizado com sucesso");
                
                // Verificar quantos perfis o usuário tem
                if (loginResponse.perfisUsuario.length === 1) {
                    // Se tem apenas um perfil, autenticar automaticamente
                    const profile = loginResponse.perfisUsuario[0];
                    await authService.autenticarPerfil({
                        email: formData.email,
                        senha: formData.password,
                        idPerfil: profile.idPerfil
                    });
                    
                    // Limpar dados temporários
                    localStorage.removeItem('tempEmail');
                    localStorage.removeItem('tempPassword');
                    
                    // Redirecionar baseado no perfil
                    if (profile.dscPerfil === 'ADMIN') {
                        router.push('/dashboard');
                    } else {
                        router.push('/home');
                    }
                } else {
                    // Se tem múltiplos perfis, ir para página de seleção
                    router.push('/profile-selection');
                }
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response?.data?.mensagem) {
                showErrorToast(error.response.data.mensagem);
            } else if (error instanceof Error) {
                showErrorToast(error.message);
            } else {
                showErrorToast('Ocorreu um erro ao fazer login. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white rounded-lg h-full w-full p-8">
            {logo && (
                <Image 
                    src={logo} 
                    alt="logo" 
                    width={200} 
                    height={100} 
                />
            )}

            <h2 className="text-2xl font-bold text-black my-8">{title}</h2>

            <div className="flex flex-col gap-8 w-full">
                <Input
                    label="Email"
                    placeholder="Digite seu email"
                    icon={<User />}
                    inputClassName="w-full"
                    regex="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                    regexErrorMessage="Email inválido"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <Input
                    label="Senha"
                    type="password"
                    placeholder="Digite sua senha"
                    icon={<Lock />}
                    inputClassName="w-full"
                    regex="^(?!\s*$).+"
                    regexErrorMessage="A senha não pode estar em branco"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />

                <CustomTooltip 
                    content="Preencha todos os campos para continuar"
                    show={!isFormValid}
                >
                    <div className="w-full">
                        <Button
                            text="Entrar"
                            backgroundColor="bg-[#002085]"
                            textColor="text-white"
                            className="w-full"
                            onClick={handleSubmit}
                            isLoading={isLoading}
                            disabled={!isFormValid}
                        />
                    </div>
                </CustomTooltip>
                <p 
                    className="text-sm text-gray-500 cursor-pointer hover:underline"
                    onClick={() => router.push('/forgot-password')}
                >
                    Esqueceu sua senha? clique aqui.
                </p>
            </div>
        </div>
    );
}
