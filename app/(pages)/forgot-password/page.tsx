'use client';

import { useState, ChangeEvent } from 'react';
import { authService } from '@/features/auth/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound, Lock, Mail } from 'lucide-react';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import Logo from '@/shared/ui/Logo';
import PainelMarca from '@/features/auth/components/PainelMarca';
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast';

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [codigo, setCodigo] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [step, setStep] = useState(1); // 1: email, 2: código, 3: nova senha
    const [loading, setLoading] = useState(false);

    const handleSolicitarRecuperacao = async () => {
        try {
            setLoading(true);
            await authService.recuperarSenha({ email });
            showSuccessToast('Código de recuperação enviado para seu email');
            setStep(2);
        } catch {
            showErrorToast('Erro ao solicitar recuperação de senha');
        } finally {
            setLoading(false);
        }
    };

    const handleValidarCodigo = async () => {
        try {
            setLoading(true);
            await authService.validarCodigoRecuperacao({ email, codigo });
            showSuccessToast('Código validado com sucesso');
            setStep(3);
        } catch {
            showErrorToast('Código inválido ou expirado. Depois de 5 tentativas erradas, peça um novo código.');
        } finally {
            setLoading(false);
        }
    };

    const handleAlterarSenha = async () => {
        try {
            setLoading(true);
            if (novaSenha.length < 6) {
                showErrorToast('A senha precisa ter pelo menos 6 caracteres');
                return;
            }
            await authService.alterarSenha({ email, senha: novaSenha, codigo: Number(codigo) });
            showSuccessToast('Senha alterada com sucesso');
            router.push('/');
        } catch {
            showErrorToast('Erro ao alterar senha');
        } finally {
            setLoading(false);
        }
    };

    const etapas = [
        { titulo: 'Recuperar senha', texto: 'Digite seu e-mail para receber o código de recuperação.' },
        { titulo: 'Confira seu e-mail', texto: `Digite o código que enviamos para ${email}. Ele vale por 15 minutos.` },
        { titulo: 'Nova senha', texto: 'Escolha uma senha com pelo menos 6 caracteres.' },
    ];
    const etapa = etapas[step - 1];

    return (
        <div className="grid grid-cols-1 min-h-screen bg-surface md:grid-cols-2">
            <PainelMarca>
                <div className="flex flex-col gap-4">
                    <span className="flex h-18 w-18 items-center justify-center rounded-full bg-white text-primary" aria-hidden>
                        <KeyRound className="h-8 w-8" />
                    </span>
                    <h1 className="max-w-[420px] text-4xl font-bold tracking-tight">Vamos recuperar seu acesso.</h1>
                    <p className="text-[15px] text-white/85">Passo {step} de 3</p>
                </div>
            </PainelMarca>

            <div className="flex items-center justify-center px-6 py-12 md:p-12">
                <div className="flex w-full max-w-[380px] flex-col gap-7">
                    <Logo altura={26} className="md:hidden" />
                    <div className="flex flex-col gap-1.5">
                        <h2 className="text-[28px] font-bold tracking-tight">{etapa.titulo}</h2>
                        <p className="text-sm text-muted">{etapa.texto}</p>
                    </div>

                    {step === 1 && (
                        <div className="flex flex-col gap-4">
                            <Input
                                label="E-mail"
                                type="email"
                                autoComplete="email"
                                placeholder="Seu email"
                                icon={<Mail />}
                                value={email}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            />
                            <Button
                                text={loading ? 'Enviando...' : 'Solicitar Recuperação'}
                                onClick={handleSolicitarRecuperacao}
                                disabled={loading || !email.trim()}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col gap-4">
                            <Input
                                label="Código"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder="Código de recuperação"
                                inputClassName="font-mono tracking-[4px]"
                                value={codigo}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setCodigo(e.target.value)}
                            />
                            <Button
                                text={loading ? 'Validando...' : 'Validar Código'}
                                onClick={handleValidarCodigo}
                                disabled={loading || !codigo.trim()}
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col gap-4">
                            <Input
                                label="Nova senha"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Nova senha"
                                icon={<Lock />}
                                value={novaSenha}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNovaSenha(e.target.value)}
                            />
                            <Button
                                text={loading ? 'Alterando...' : 'Alterar Senha'}
                                onClick={handleAlterarSenha}
                                disabled={loading || !novaSenha}
                            />
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
                    >
                        <ArrowLeft className="h-4 w-4" /> Voltar para o login
                    </button>
                </div>
            </div>
        </div>
    );
}
