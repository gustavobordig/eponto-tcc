"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { ArrowLeft, ArrowRight, ChevronRight, Clock, Lock, Mail, ShieldCheck, WifiOff, AlertCircle } from "lucide-react";
import { authService, PerfilUsuario } from "@/features/auth/api";
import PainelMarca from "@/features/auth/components/PainelMarca";

// Atoms
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import Logo from "@/shared/ui/Logo";

// Utils
import { dataPorExtenso, horaMinuto, useAgora } from "@/shared/lib/useAgora";

interface Erro {
    titulo: string;
    detalhe?: string;
    semConexao?: boolean;
}

const DESCRICAO_PERFIL: Record<string, { texto: string; icone: typeof Clock }> = {
    admin: { texto: 'Cadastros, aprovações e férias da empresa', icone: ShieldCheck },
    funcionario: { texto: 'Bater ponto, histórico e solicitações', icone: Clock },
};

const ehAdmin = (perfil: PerfilUsuario) => /admin/i.test(perfil.dscPerfil);

export default function Form() {
    const router = useRouter();
    const agora = useAgora();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [erro, setErro] = useState<Erro | null>(null);
    // Preenchido quando o usuário tem mais de um perfil e precisa escolher
    const [perfis, setPerfis] = useState<PerfilUsuario[]>([]);

    const isFormValid = formData.email.trim() !== '' && formData.password.trim() !== '';
    const credenciais = { email: formData.email, senha: formData.password };

    // O erro fica na tela (e não num toast que some), com a mensagem da API quando houver
    const mostrarErro = (error: unknown) => {
        if (error instanceof AxiosError && !error.response) {
            setErro({ titulo: 'Não foi possível conectar ao servidor.', detalhe: 'Verifique sua conexão e tente de novo.', semConexao: true });
        } else if (error instanceof AxiosError && error.response?.data?.mensagem) {
            setErro({ titulo: error.response.data.mensagem });
        } else if (error instanceof Error) {
            setErro({ titulo: error.message });
        } else {
            setErro({ titulo: 'Ocorreu um erro ao fazer login.', detalhe: 'Tente novamente.' });
        }
    };

    // 2ª etapa: pede o token com o perfil escolhido
    const entrarComPerfil = async (idPerfil: number) => {
        try {
            setIsLoading(true);
            setErro(null);
            await authService.autenticarPerfil(credenciais, idPerfil);
            router.push('/home');
        } catch (error: unknown) {
            mostrarErro(error);
            setIsLoading(false);
        }
    };

    // 1ª etapa: confere e-mail e senha e busca os perfis do usuário
    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!isFormValid || isLoading) return;

        try {
            setIsLoading(true);
            setErro(null);
            const perfisUsuario = await authService.realizarLogin(credenciais);

            if (perfisUsuario.length === 0) {
                setErro({ titulo: 'Seu usuário não tem perfil de acesso.', detalhe: 'Fale com o RH.' });
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

    const avisoErro = erro && (
        <div role="alert" className="flex items-start gap-2.5 rounded-[10px] bg-danger-soft px-3.5 py-3 text-[13px] leading-snug text-danger-ink">
            {erro.semConexao ? <WifiOff className="mt-px h-4 w-4 shrink-0" /> : <AlertCircle className="mt-px h-4 w-4 shrink-0" />}
            <p><b>{erro.titulo}</b>{erro.detalhe && ` ${erro.detalhe}`}</p>
        </div>
    );

    const escolhendoPerfil = perfis.length > 1;
    const inicial = formData.email.trim()[0]?.toUpperCase() ?? '?';

    return (
        <div className="grid min-h-screen bg-white md:grid-cols-2">
            {escolhendoPerfil ? (
                <PainelMarca>
                    <div className="flex flex-col gap-4">
                        <span className="flex h-18 w-18 items-center justify-center rounded-full bg-white text-2xl font-extrabold text-primary" aria-hidden>
                            {inicial}
                        </span>
                        <h1 className="text-4xl font-bold tracking-tight">Que bom te ver de novo.</h1>
                        <p className="text-[15px] text-white/85">{formData.email}</p>
                    </div>
                </PainelMarca>
            ) : (
                <PainelMarca>
                    <div className="flex flex-col gap-5">
                        <p className="font-mono text-8xl font-semibold leading-none tracking-[-4px]" suppressHydrationWarning>
                            {agora ? horaMinuto(agora) : '--:--'}
                        </p>
                        <p className="text-[15px] text-white/85">
                            {agora ? dataPorExtenso(agora).replace(/^./, (c) => c.toUpperCase()) : ' '}
                        </p>
                        <h1 className="mt-6 max-w-[420px] text-[34px] font-bold leading-tight tracking-tight">
                            Seu ponto, banco de horas e solicitações num só lugar.
                        </h1>
                    </div>
                </PainelMarca>
            )}

            <div className="flex items-center justify-center px-6 py-12 md:p-12">
                {escolhendoPerfil ? (
                    <div className="flex w-full max-w-[420px] flex-col gap-6">
                        <Logo altura={26} className="md:hidden" />
                        <div className="flex flex-col gap-1.5">
                            <h2 className="text-[28px] font-bold tracking-tight">Escolha o perfil</h2>
                            <p className="text-sm text-muted">Você tem acesso com mais de um perfil. Dá para trocar depois pelo menu.</p>
                        </div>
                        {avisoErro}
                        <div className="flex flex-col gap-3">
                            {perfis.map((perfil) => {
                                const { texto, icone: Icone } = DESCRICAO_PERFIL[ehAdmin(perfil) ? 'admin' : 'funcionario'];
                                return (
                                    <button
                                        key={perfil.idPerfil}
                                        type="button"
                                        disabled={isLoading}
                                        onClick={() => entrarComPerfil(perfil.idPerfil)}
                                        className="group flex items-center gap-4 rounded-[14px] border border-line p-5 text-left transition-colors hover:border-primary hover:bg-primary-tint disabled:opacity-60"
                                    >
                                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                            <Icone className="h-[22px] w-[22px]" />
                                        </span>
                                        <span className="flex flex-1 flex-col gap-0.5">
                                            <b className="text-base">{perfil.dscPerfil}</b>
                                            <span className="text-[13px] text-muted">{texto}</span>
                                        </span>
                                        <ChevronRight className="h-[18px] w-[18px] text-muted group-hover:text-primary" />
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            type="button"
                            onClick={() => { setPerfis([]); setErro(null); }}
                            className="flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
                        >
                            <ArrowLeft className="h-4 w-4" /> Entrar com outra conta
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-[380px] flex-col gap-7">
                        <Logo altura={26} className="md:hidden" />
                        <div className="flex flex-col gap-1.5">
                            <h2 className="text-[28px] font-bold tracking-tight">Acesse sua conta</h2>
                            <p className="text-sm text-muted">Entre com seu e-mail corporativo.</p>
                        </div>

                        {avisoErro}

                        <div className="flex flex-col gap-4">
                            <Input
                                id="email"
                                label="E-mail"
                                type="email"
                                autoComplete="email"
                                placeholder="Digite seu email"
                                icon={<Mail />}
                                regex={/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/}
                                regexErrorMessage="E-mail inválido"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <Input
                                id="senha"
                                label="Senha"
                                type="password"
                                autoComplete="current-password"
                                placeholder="Digite sua senha"
                                icon={<Lock />}
                                labelAction={
                                    <Link href="/forgot-password" className="text-[13px] font-semibold text-primary hover:text-primary-dark">
                                        Esqueci minha senha
                                    </Link>
                                }
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <Button
                            type="submit"
                            text="Entrar"
                            icon={<ArrowRight className="h-[17px] w-[17px]" />}
                            iconPosition="right"
                            className="h-[50px] text-[15px]"
                            isLoading={isLoading}
                            disabled={!isFormValid}
                        />
                    </form>
                )}
            </div>
        </div>
    );
}
