"use client";

import { useState } from 'react';
import { UserData } from '@/features/usuarios/api';
import { UsuarioComDetalhes, useUsuariosAdmin } from '@/features/usuarios/hooks/useUsuariosAdmin';
import Container from '@/shared/ui/Container';
import EditModal from '@/shared/ui/EditModal';
import ExcludeModal from '@/shared/ui/ExcludeModal';
import LoadingText from '@/shared/ui/LoadingText';
import Table from '@/shared/ui/Table';
import { Column } from '@/shared/types/ui';

const colunas: Column<UsuarioComDetalhes>[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'jornada', label: 'Jornada' },
  { key: 'indAtivo', label: 'Status', type: 'status' },
];

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
    <Container className="py-8">
      <Table
        data={usuarios}
        title="Usuários"
        columns={colunas}
        handleEdit={abrirEdicao}
        handleDeleteClick={(user) => setUsuarioParaExcluir(user.idUsuario)}
        addItemHref="/adicionar-usuario"
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
            {
              label: 'Status',
              value: edicao.indAtivo,
              onChange: alterar('indAtivo'),
              type: 'select',
              options: [
                { value: '1', label: 'Ativo' },
                { value: '0', label: 'Inativo' },
              ],
            },
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
    </Container>
  );
}
