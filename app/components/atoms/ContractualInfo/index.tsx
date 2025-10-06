'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/services/user';
import { listCargos } from '@/services/cargo';
import { jornadaTrabalhoService } from '@/services/jornadaTrabalho';
import { tokenUtils } from '@/utils/token';
import { showErrorToast } from '@/utils/toast';

interface UserData {
  idUsuario: number;
  nome: string;
  dataNascimento: string;
  dataAdmissao?: string; // Data de admissão
  email: string;
  telefone: number;
  idCargo: number;
  idJornada: number;
  indAtivo: number;
  fotoPerfil?: string;
}

interface Cargo {
  idCargo: number;
  nomeCargo: string;
  salario: string;
  formacaoMinima: string;
  indAtivo: number;
}

interface JornadaTrabalho {
  idJornada: number;
  nomeJornada: string;
  horaInicio: string;
  horaFim: string;
  cargaHoraria: number;
  indAtivo: number;
}

interface ContractualInfoProps {
  userId?: number;
}

export default function ContractualInfo({ userId }: ContractualInfoProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [cargo, setCargo] = useState<Cargo | null>(null);
  const [jornada, setJornada] = useState<JornadaTrabalho | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContractualInfo = async () => {
      try {
        setLoading(true);
        
        // Se não foi passado userId, usa o usuário logado
        const targetUserId = userId || tokenUtils.getId();
        
        if (!targetUserId) {
          showErrorToast("Usuário não encontrado");
          return;
        }

        // Carregar dados do usuário
        const userResponse = await userService.getById(Number(targetUserId));
        
        if (userResponse.sucesso && userResponse.usuario) {
          const usuario = userResponse.usuario;
          setUserData(usuario);
          
          // Carregar dados do cargo
          const cargoResponse = await listCargos();
          const userCargo = cargoResponse.cargos?.find((c: Cargo) => c.idCargo === usuario.idCargo);
          setCargo(userCargo || null);
          
          // Carregar dados da jornada
          const jornadaResponse = await jornadaTrabalhoService.listar();
          const userJornada = jornadaResponse.jornadas?.find((j: JornadaTrabalho) => j.idJornada === usuario.idJornada);
          setJornada(userJornada || null);
        } else {
          showErrorToast("Erro ao carregar dados do usuário");
        }
      } catch (error) {
        console.error('Erro ao carregar informações contratuais:', error);
        showErrorToast("Erro ao carregar informações contratuais");
      } finally {
        setLoading(false);
      }
    };

    loadContractualInfo();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">Erro ao carregar informações contratuais</p>
      </div>
    );
  }

  const formatCurrency = (value: string) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  };

  const formatTime = (time: string | undefined | null) => {
    if (!time) return '--:--';
    return time.substring(0, 5); // Remove os segundos
  };

  return (
    <div className="border-t border-b border-gray-200 py-8">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Informações Contratuais</h3>
          <p className="text-sm text-gray-500">Dados profissionais e contratuais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Nome do Usuário */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Nome do Funcionário</label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800 font-medium">{userData.nome}</p>
          </div>
        </div>

        {/* Cargo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Cargo</label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800 font-medium">
              {cargo?.nomeCargo || `Cargo ID: ${userData.idCargo}`}
            </p>
            {cargo?.formacaoMinima && (
              <p className="text-sm text-gray-600 mt-1">
                Formação mínima: {cargo.formacaoMinima}
              </p>
            )}
          </div>
        </div>

        {/* Salário */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Salário</label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800 font-medium">
              {cargo?.salario ? formatCurrency(cargo.salario) : 'Não informado'}
            </p>
          </div>
        </div>

        {/* Carga Horária Diária */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Carga Horária Diária</label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800 font-medium">
              {jornada && jornada.cargaHoraria ? `${jornada.cargaHoraria}h/dia` : 'Não informado'}
            </p>
          </div>
        </div>

        {/* Carga Horária Semanal */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Carga Horária Semanal</label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800 font-medium">
              {jornada && jornada.cargaHoraria ? `${jornada.cargaHoraria * 5}h/semana` : 'Não informado'}
            </p>
          </div>
        </div>

        {/* Jornada de Trabalho */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Horário de Trabalho</label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800 font-medium">
              {jornada && jornada.horaInicio && jornada.horaFim 
                ? `${formatTime(jornada.horaInicio)} - ${formatTime(jornada.horaFim)}` 
                : 'Não informado'
              }
            </p>
            {jornada && jornada.nomeJornada && (
              <p className="text-sm text-gray-600 mt-1">
                {jornada.nomeJornada}
              </p>
            )}
          </div>
        </div>

        {/* Data de Admissão */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Data de Admissão</label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800 font-medium">
              {userData.dataAdmissao 
                ? new Date(userData.dataAdmissao).toLocaleDateString('pt-BR')
                : 'Não informado'
              }
            </p>
          </div>
        </div>

        {/* Data de Nascimento */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Data de Nascimento</label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800 font-medium">
              {new Date(userData.dataNascimento).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Situação do Contrato */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Situação do Contrato</label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              userData.indAtivo === 1 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {userData.indAtivo === 1 ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
