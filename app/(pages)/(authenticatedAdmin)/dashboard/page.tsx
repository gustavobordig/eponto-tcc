"use client";

import { useState } from 'react';
import { UserData } from '@/features/usuarios/api';
import { UsuarioComDetalhes, useUsuariosAdmin } from '@/features/usuarios/hooks/useUsuariosAdmin';
import EditModal from '@/shared/ui/EditModal';
import ExcludeModal from '@/shared/ui/ExcludeModal';
import LoadingText from '@/shared/ui/LoadingText';
import Avatar from '@/shared/ui/Avatar';
import Table, { FiltroTabela } from '@/shared/ui/Table';
import { Column } from '@/shared/types/ui';

const colunas: Column<UsuarioComDetalhes>[] = [
  {
    key: 'nome',
    label: 'Nome',
    render: (u) => (
      <span className="flex min-w-0 items-center gap-3">
        <Avatar nome={u.nome} foto={u.fotoPerfil} tamanho="sm" className="!h-9 !w-9" />
        <span className="flex min-w-0 flex-col gap-px">
          <b className="text-sm">{u.nome}</b>
          <span className="text-xs text-muted">{u.email}</span>
        </span>
      </span>
    ),
  },
  { key: 'cargo', label: 'Cargo' },
  { key: 'jornada', label: 'Jornada' },
  { key: 'telefone', label: 'Telefone', type: 'phone' },
  { key: 'indAtivo', label: 'Status', type: 'status' },
];

const filtroStatus: FiltroTabela<UsuarioComDetalhes> = {
  rotulo: 'Status',
  opcoes: [
    { valor: '1', rotulo: 'ativos' },
    { valor: '0', rotulo: 'inativos' },
  ],
  valorDe: (u) => String(u.indAtivo),
};

interface Edicao {
  usuario: UserData;
  nome: string;
  email: string;
  telefone: string;
  idCargo: string;
  idJornada: string;
  indAtivo: string;
}

export default function UsuariosPage() {
  const { usuarios, cargos, jornadas, loading, atualizar, excluir } = useUsuariosAdmin();
  const [edicao, setEdicao] = useState<Edicao | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<number | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  // cargo e jornada são só os nomes para a tabela; não vão para a API
  const abrirEdicao = ({ cargo, jornada, ...usuario }: UsuarioComDetalhes) => {
    setEdicao({
      usuario,
      nome: usuario.nome,
      email: usuario.email,
      telefone: String(usuario.telefone ?? ''),
      idCargo: String(usuario.idCargo),
      idJornada: String(usuario.idJornada),
      indAtivo: String(usuario.indAtivo),
    });
  };

  const alterar = (campo: keyof Omit<Edicao, 'usuario'>) => (e: { target: { value: string } }) =>
    setEdicao((atual) => (atual ? { ...atual, [campo]: e.target.value } : atual));

  const salvar = async () => {
    if (!edicao) return;
    setSalvando(true);
    // Mantém os demais dados do usuário; antes a data de nascimento era trocada por hoje
    const ok = await atualizar({
      ...edicao.usuario,
      nome: edicao.nome,
      email: edicao.email,
      telefone: Number(edicao.telefone),
      idCargo: Number(edicao.idCargo),
      idJornada: Number(edicao.idJornada),
      indAtivo: Number(edicao.indAtivo),
      senha: '',
    });
    setSalvando(false);
    if (ok) setEdicao(null);
  };

  const confirmarExclusao = async () => {
    if (usuarioParaExcluir === null) return;
    setExcluindo(true);
    await excluir(usuarioParaExcluir);
    setExcluindo(false);
    setUsuarioParaExcluir(null);
  };

  if (loading) {
    return <LoadingText title="usuários" />;
  }

  return (
    <>
      <Table
        data={usuarios}
        title="Usuários"
        subtitle={`${usuarios.length} ${usuarios.length === 1 ? 'pessoa cadastrada' : 'pessoas cadastradas'} · ${usuarios.filter((u) => u.indAtivo === 1).length} ativas`}
        columns={colunas}
        searchPlaceholder="Buscar por nome ou e-mail"
        camposBusca={['email']}
        filtros={[
          {
            rotulo: 'Cargo',
            opcoes: cargos.map((c) => ({ valor: c.nomeCargo, rotulo: c.nomeCargo })),
            valorDe: (u) => u.cargo,
          },
          filtroStatus,
        ]}
        handleEdit={abrirEdicao}
        handleDeleteClick={(user) => setUsuarioParaExcluir(user.idUsuario)}
        addItemHref="/adicionar-usuario"
        addItemLabel="Novo usuário"
      />

      {edicao && (
        <EditModal
          title="Editar Usuário"
          fields={[
            { label: 'Nome', value: edicao.nome, onChange: alterar('nome') },
            { label: 'Email', value: edicao.email, onChange: alterar('email') },
            { label: 'Telefone', value: edicao.telefone, onChange: alterar('telefone') },
            {
              label: 'Cargo',
              value: edicao.idCargo,
              onChange: alterar('idCargo'),
              type: 'select',
              options: cargos.map((c) => ({ value: String(c.idCargo), label: c.nomeCargo })),
            },
            {
              label: 'Jornada',
              value: edicao.idJornada,
              onChange: alterar('idJornada'),
              type: 'select',
              options: jornadas.map((j) => ({ value: String(j.idJornada), label: j.nomeJornada })),
            },
            // Sem Status: a API não grava IND_ATIVO na atualização; inativar é pelo Excluir
          ]}
          onClose={() => setEdicao(null)}
          onConfirm={salvar}
          loading={salvando}
        />
      )}

      {usuarioParaExcluir !== null && (
        <ExcludeModal
          title="Confirmar exclusão"
          message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
          onCancel={() => setUsuarioParaExcluir(null)}
          onConfirm={confirmarExclusao}
          loading={excluindo}
        />
      )}
    </>
  );
}
