'use client';

import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

//Atoms
import Input from '@/app/components/atoms/Input';
import Button from '@/app/components/atoms/Button';
import Card from '@/app/components/atoms/Card';

//Services
import { authService } from '@/services/auth';

//Animations
import { PageEntrance } from '@/app/Animations/pageEntrance';

//Utils
import { regexPatterns, regexMessages } from '@/utils/regexPatterns';



export default function ForgotPassword() {
    
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [codigo, setCodigo] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [step, setStep] = useState(1); // 1: email, 2: código, 3: nova senha
    const [loading, setLoading] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isCodeValid, setIsCodeValid] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        setIsEmailValid(regexPatterns.email.test(newEmail));
    };

    const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newCode = e.target.value;
        setCodigo(newCode);
        setIsCodeValid(newCode.length >= 6); // Assuming code should be at least 6 characters
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setNovaSenha(newPassword);
        setIsPasswordValid(newPassword.length >= 6); // Assuming password should be at least 6 characters
    };

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
            <PageEntrance>
                {step === 1 && (
                    <Card
                        title="Recuperação de Senha"
                        description="Para definir uma nova senha, informe o email do usuario cadastrado que lhe enviaremos um codigo de recuperação"
                    >
                        <Input
                            type="email"
                            placeholder="Seu email"
                            value={email}
                            onChange={handleEmailChange}
                            className="text-black"
                            regex={regexPatterns.email}
                            regexErrorMessage={regexMessages.email}
                        />
                        <Button 
                            text="Solicitar Recuperação"
                            isLoading={loading}
                            loadingText="Enviando..."
                            backgroundColor="bg-[#002085]"
                            textColor="text-white"
                            className="w-full"
                            onClick={handleSolicitarRecuperacao}
                            disabled={loading || !isEmailValid}
                        />
                    </Card>
                )}

                {step === 2 && (
                    <Card
                        title="Código de Recuperação"
                        description="Digite o código de recuperação que foi enviado para o seu email"
                    >
                        <Input
                            type="text"
                            placeholder="Código de recuperação"
                            value={codigo}
                            onChange={handleCodeChange}
                            className="text-black"
                        />        
                        <Button 
                            text="Validar Código"
                            isLoading={loading}
                            loadingText="Validando..."
                            backgroundColor="bg-[#002085]"
                            textColor="text-white"
                            className="w-full"
                            onClick={handleValidarCodigo}
                            disabled={loading || !isCodeValid}
                        />
                    </Card> 
                )}

                {step === 3 && (
                    <Card
                        title="Nova Senha"
                        description="Digite sua nova senha"
                    >
                        <Input
                            type="password"
                            placeholder="Nova senha"
                            value={novaSenha}
                            onChange={handlePasswordChange}
                            className="text-black"
                        />  
                        <Button 
                            text="Alterar Senha"
                            isLoading={loading}
                            loadingText="Alterando..."
                            backgroundColor="bg-[#002085]"
                            textColor="text-white"
                            className="w-full"
                            onClick={handleAlterarSenha}
                            disabled={loading || !isPasswordValid}
                        />
                    </Card>
                )}      
            </PageEntrance>

        </div>
    );
}
