'use client';

import { useState, ChangeEvent } from 'react';
import { authService } from '@/services/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

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
            toast.success('Código de recuperação enviado para seu email');
            setStep(2);
        } catch {
            toast.error('Erro ao solicitar recuperação de senha');
        } finally {
            setLoading(false);
        }
    };

    const handleValidarCodigo = async () => {
        try {
            setLoading(true);
            await authService.validarCodigoRecuperacao({ email, codigo });
            toast.success('Código validado com sucesso');
            setStep(3);
        } catch {
            toast.error('Código inválido');
        } finally {
            setLoading(false);
        }
    };

    const handleAlterarSenha = async () => {
        try {
            setLoading(true);
            await authService.alterarSenha({ email, senha: novaSenha });
            toast.success('Senha alterada com sucesso');
            router.push('/');
        } catch {
            toast.error('Erro ao alterar senha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle className="text-black">Recuperação de Senha</CardTitle>
                    <CardDescription className="text-black">
                        {step === 1 && 'Digite seu email para receber o código de recuperação'}
                        {step === 2 && 'Digite o código recebido no seu email'}
                        {step === 3 && 'Digite sua nova senha'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 && (
                        <div className="space-y-4">
                            <Input
                                type="email"
                                placeholder="Seu email"
                                value={email}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                className="text-black"
                            />
                            <Button 
                                className="w-full text-black" 
                                onClick={handleSolicitarRecuperacao}
                                disabled={loading}
                            >
                                {loading ? 'Enviando...' : 'Solicitar Recuperação'}
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <Input
                                type="text"
                                placeholder="Código de recuperação"
                                value={codigo}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setCodigo(e.target.value)}
                                className="text-black"
                            />
                            <Button 
                                className="w-full text-black" 
                                onClick={handleValidarCodigo}
                                disabled={loading}
                            >
                                {loading ? 'Validando...' : 'Validar Código'}
                            </Button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <Input
                                type="password"
                                placeholder="Nova senha"
                                value={novaSenha}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNovaSenha(e.target.value)}
                                className="text-black"
                            />
                            <Button 
                                className="w-full text-black" 
                                onClick={handleAlterarSenha}
                                disabled={loading}
                            >
                                {loading ? 'Alterando...' : 'Alterar Senha'}
                            </Button>
                        </div>
                    )}

                    <Button 
                        variant="link" 
                        className="w-full mt-4 text-black" 
                        onClick={() => router.push('/login')}
                    >
                        Voltar para o login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
