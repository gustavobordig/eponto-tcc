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
import { regexPatterns, regexMessages } from "@/utils/regexPatterns";


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
            
            router.push('/home');
        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response?.data?.mensagem) {
                showErrorToast(error.response.data.mensagem);
            } else if (error instanceof Error) {
                showErrorToast(error.message);
            } else {
                showErrorToast('Ocorreu um erro ao fazer login. Tente novamente.');
            }
        } finally {
            showSuccessToast("Login realizado com sucesso");
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
                    regex={regexPatterns.email}
                    regexErrorMessage={regexMessages.email}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <Input
                    label="Senha"
                    type="password"
                    placeholder="Digite sua senha"
                    icon={<Lock />}
                    inputClassName="w-full"
                    regex={regexPatterns.password}
                    regexErrorMessage={regexMessages.password}
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
