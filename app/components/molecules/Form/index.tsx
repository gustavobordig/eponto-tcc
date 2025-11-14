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
            
            await authService.realizarLogin({
                email: formData.email,
                senha: formData.password
            });
            
            showSuccessToast("Login realizado com sucesso");
            
            // Verificar se o usuário tem perfil ADMIN
            if (tokenUtils.hasAdminProfile()) {
                // Se tem perfil ADMIN, vai para página de seleção
                router.push('/profile-selection');
            } else {
                // Se não tem perfil ADMIN, vai direto para home
                router.push('/home');
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
        <div className="flex flex-col items-center justify-center bg-white rounded-lg h-full w-full p-4 sm:p-6 lg:p-8 max-w-md mx-auto">
            {logo && (
                <Image 
                    src={logo} 
                    alt="logo" 
                    width={200} 
                    height={100}
                    className="w-auto h-auto max-w-[180px] sm:max-w-[200px]"
                />
            )}

            <h2 className="text-xl sm:text-2xl font-bold text-black my-4 sm:my-6 lg:my-8 text-center">{title}</h2>

            <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-full">
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
                    className="text-xs sm:text-sm text-gray-500 cursor-pointer hover:underline text-center"
                    onClick={() => router.push('/forgot-password')}
                >
                    Esqueceu sua senha? clique aqui.
                </p>
            </div>
        </div>
    );
}
