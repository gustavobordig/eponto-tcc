"use client";

import { useState } from "react";
import Image from "next/image";
import { User, Lock } from "lucide-react";
import { authService, PerfilUsuario } from "@/features/auth/api";
import { useRouter } from "next/navigation";
import { AxiosError } from 'axios';

// Atoms
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";

// Utils
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import { CustomTooltip } from "@/shared/ui/Tooltip";


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
    // Preenchido quando o usuário tem mais de um perfil e precisa escolher
    const [perfis, setPerfis] = useState<PerfilUsuario[]>([]);

    const isFormValid = formData.email.trim() !== '' && formData.password.trim() !== '';

    const credenciais = { email: formData.email, senha: formData.password };

    const mostrarErro = (error: unknown) => {
        if (error instanceof AxiosError && error.response?.data?.mensagem) {
            showErrorToast(error.response.data.mensagem);
        } else if (error instanceof Error) {
            showErrorToast(error.message);
        } else {
            showErrorToast('Ocorreu um erro ao fazer login. Tente novamente.');
        }
    };

    // 2ª etapa: pede o token com o perfil escolhido
    const entrarComPerfil = async (idPerfil: number) => {
        try {
            setIsLoading(true);
            await authService.autenticarPerfil(credenciais, idPerfil);
            showSuccessToast("Login realizado com sucesso");
            router.push('/home');
        } catch (error: unknown) {
            mostrarErro(error);
            setIsLoading(false);
        }
    };

    // 1ª etapa: confere e-mail e senha e busca os perfis do usuário
    const handleSubmit = async () => {
        if (!isFormValid) return;

        try {
            setIsLoading(true);
            const perfisUsuario = await authService.realizarLogin(credenciais);

            if (perfisUsuario.length === 0) {
                showErrorToast('Seu usuário não tem perfil de acesso. Fale com o RH.');
                setIsLoading(false);
                return;
            }
            if (perfisUsuario.length === 1) {
                await entrarComPerfil(perfisUsuario[0].idPerfil);
                return;
            }
            setPerfis(perfisUsuario);
            setIsLoading(false);
        } catch (error: unknown) {
            mostrarErro(error);
            setIsLoading(false);
        }
    };

    if (perfis.length > 1) {
        return (
            <div className="flex flex-col items-center justify-center bg-white rounded-lg h-full w-full p-8">
                <h2 className="text-2xl font-bold text-black mb-2">Escolha o perfil</h2>
                <p className="text-sm text-gray-500 mb-8">Você tem acesso com mais de um perfil.</p>
                <div className="flex flex-col gap-3 w-full">
                    {perfis.map((perfil) => (
                        <Button
                            key={perfil.idPerfil}
                            text={perfil.dscPerfil}
                            backgroundColor="bg-[#002085]"
                            textColor="text-white"
                            className="w-full"
                            isLoading={isLoading}
                            onClick={() => entrarComPerfil(perfil.idPerfil)}
                        />
                    ))}
                    <p
                        className="text-sm text-gray-500 cursor-pointer hover:underline text-center"
                        onClick={() => setPerfis([])}
                    >
                        Voltar
                    </p>
                </div>
            </div>
        );
    }

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
                    regex={/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/}
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
                    regex={/^(?!\s*$).+/}
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
