'use client';

import DefaultForm from '@/app/components/molecules/DefaultForm';
import { userService } from '@/services/user';
import { regexPatterns } from '@/utils/regexPatterns';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { listCargos } from '@/services/cargo';
import { jornadaTrabalhoService } from '@/services/jornadaTrabalho';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Cargo {
  idCargo: number;
  nomeCargo: string;
}

interface Jornada {
  idJornada: number;
  nomeJornada: string;
}

export default function AdicionarUsuario() {

  const router = useRouter();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [selectedCargo, setSelectedCargo] = useState<string>('');
  const [selectedJornada, setSelectedJornada] = useState<string>('');

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [cargosResponse, jornadasResponse] = await Promise.all([
          listCargos(),
          jornadaTrabalhoService.listar()
        ]);
        setCargos(cargosResponse.cargos || []);
        setJornadas(jornadasResponse.jornadas || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showErrorToast('Erro ao carregar dados dos selects');
      }
    };

    carregarDados();
  }, []);

  const handleSubmit = async (data: Record<string, string>) => {
    try {
      const userData = {
        nome: data.name,
        email: data.email,
        senha: data.password,
        dataNascimento: data.dataNascimento,
        telefone: data.telefone ? parseInt(data.telefone) : 0,
        idCargo: parseInt(selectedCargo),
        idJornada: parseInt(selectedJornada),
        indAtivo: 1
      };

      const response = await userService.create(userData);
      
      if (response.sucesso) {
        showSuccessToast('Usuário cadastrado com sucesso!');
        router.push('/dashboard');
      } else {
        showErrorToast(response.mensagem || 'Erro ao cadastrar usuário');
      }
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      showErrorToast('Erro ao cadastrar usuário. Por favor, tente novamente.');
    }
  };

  const formInputs = [
    {
      id: 'name',
      label: 'Nome',
      type: 'text' as const,
      placeholder: 'Digite o nome completo',
      regex: regexPatterns.name,
      required: true
    },
    {
      id: 'email',
      label: 'E-mail',
      type: 'email' as const,
      placeholder: 'Digite o e-mail',
      regex: regexPatterns.email,
      required: true
    },
    {
      id: 'dataNascimento',
      label: 'Data de Nascimento',
      type: 'date' as const,
      placeholder: 'Digite a data de nascimento',
      required: true
    },
    {
      id: 'telefone',
      label: 'Telefone',
      type: 'number' as const,
      placeholder: 'Digite o telefone (opcional)',
      required: false
    },
    {
      id: 'cargo',
      label: 'Cargo',
      type: 'select' as const,
      required: true,
      render: () => (
        <Select
          value={selectedCargo}
          onValueChange={(value) => {
            setSelectedCargo(value);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o cargo" />
          </SelectTrigger>
          <SelectContent>
            {cargos.map((cargo) => (
              <SelectItem key={cargo.idCargo} value={cargo.idCargo.toString()}>
                {cargo.nomeCargo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    },
    {
      id: 'jornada',
      label: 'Jornada de Trabalho',
      type: 'select' as const,
      required: true,
      render: () => (
        <Select
          value={selectedJornada}
          onValueChange={(value) => {
            setSelectedJornada(value);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a jornada de trabalho" />
          </SelectTrigger>
          <SelectContent>
            {jornadas.map((jornada) => (
              <SelectItem key={jornada.idJornada} value={jornada.idJornada.toString()}>
                {jornada.nomeJornada}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    },
    {
      id: 'password',
      label: 'Senha',
      type: 'password' as const,
      placeholder: 'Digite a senha',
      regex: regexPatterns.minThreeChars,
      required: true
    }
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Adicionar Novo Usuário
          </h2>
        </div>
        <div className="mt-8">
          <DefaultForm
            title="Cadastro de Usuário"
            inputs={formInputs}
            buttonText="Cadastrar"
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
} 