'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Camera, KeyRound, Mail, Pencil, Phone, ShieldCheck } from 'lucide-react';
import { ContratoUsuario, UserData, userService } from '@/features/usuarios/api';
import { ETAPAS_DO_DIA } from '@/features/ponto/etapas';
import { formatDate, formatMoeda, formatTelefone } from '@/shared/lib/format';
import { tokenUtils } from '@/shared/lib/token';
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast';
import Avatar from '@/shared/ui/Avatar';
import Button from '@/shared/ui/Button';
import Cartao from '@/shared/ui/Cartao';
import ConfirmationModal from '@/shared/ui/ConfirmationModal';
import Input from '@/shared/ui/Input';

/** A API guarda a foto em base64 puro; a tela precisa do prefixo data: */
const comPrefixo = (foto?: string | null) => (foto && !foto.startsWith('data:image') ? `data:image/jpeg;base64,${foto}` : foto || '');

/** Meu perfil (1h): cartão com foto e contato, dados do contrato, jornada e senha. */
export default function PerfilPage() {
  const [usuario, setUsuario] = useState<UserData | null>(null);
  const [contrato, setContrato] = useState<ContratoUsuario | null>(null);
  const [rascunho, setRascunho] = useState<UserData | null>(null);
  const [editando, setEditando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [perfil, setPerfil] = useState('');
  const arquivoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = Number(tokenUtils.getId());
    setPerfil(tokenUtils.isAdmin() ? 'Administrador' : 'Funcionário');
    Promise.all([userService.getById(id), userService.getContrato(id)])
      .then(([u, c]) => {
        if (u.usuario) setUsuario({ ...u.usuario, fotoPerfil: comPrefixo(u.usuario.fotoPerfil) });
        setContrato(c.contrato ?? null);
      })
      .catch((error) => {
        console.error('Erro ao carregar perfil:', error);
        showErrorToast('Não foi possível carregar seus dados');
      });
  }, []);

  const salvar = async (dados: UserData) => {
    setSalvando(true);
    try {
      // A API espera a foto sem o prefixo data:
      const foto = dados.fotoPerfil?.startsWith('data:image') ? dados.fotoPerfil.split(',')[1] : dados.fotoPerfil;
      const response = await userService.update({ ...dados, fotoPerfil: foto });
      if (!response.sucesso) throw new Error(response.mensagem || 'Erro ao salvar');
      setUsuario(dados);
      if (dados.fotoPerfil) localStorage.setItem('userProfilePhoto', dados.fotoPerfil);
      showSuccessToast('Dados atualizados');
      setEditando(false);
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      showErrorToast('Não foi possível salvar. Tente de novo.');
    } finally {
      setSalvando(false);
      setConfirmar(false);
    }
  };

  const trocarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo || !usuario) return;
    const leitor = new FileReader();
    leitor.onload = () => salvar({ ...usuario, fotoPerfil: leitor.result as string });
    leitor.readAsDataURL(arquivo);
    e.target.value = '';
  };

  if (!usuario) {
    return <p className="py-16 text-center text-sm text-muted">Carregando seu perfil…</p>;
  }

  const horas = contrato?.qtdHorasDiarias ?? null;
  const dadosContrato = [
    { rotulo: 'Matrícula', valor: String(usuario.idUsuario).padStart(6, '0'), mono: true },
    { rotulo: 'Cargo', valor: contrato?.nomeCargo ?? '—' },
    { rotulo: 'Salário', valor: contrato ? formatMoeda(contrato.salario) : '—' },
    { rotulo: 'Carga diária', valor: horas ? `${horas}h` : '—' },
    { rotulo: 'Carga semanal', valor: horas ? `${horas * 5}h` : '—' },
    { rotulo: 'Admissão', valor: contrato?.dataCadastro ? formatDate(contrato.dataCadastro) : '—' },
  ];

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
      <section className="flex flex-col overflow-hidden rounded-2xl bg-surface shadow-card">
        <div className="h-[88px] bg-marca" />
        <div className="-mt-12 flex flex-col items-center gap-3 px-6 pb-6 text-center">
          <div className="relative">
            <Avatar nome={usuario.nome} foto={usuario.fotoPerfil} tamanho="xl" className="border-4 border-white" />
            <button
              type="button"
              onClick={() => arquivoRef.current?.click()}
              disabled={salvando}
              aria-label="Trocar foto"
              className="absolute bottom-0.5 right-0 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-surface text-primary shadow-[0_1px_4px_rgba(0,0,0,.15)] hover:bg-primary-soft"
            >
              <Camera className="h-[15px] w-[15px]" />
            </button>
            <input ref={arquivoRef} type="file" accept="image/*" className="hidden" onChange={trocarFoto} />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[19px] font-bold">{usuario.nome}</h1>
            <p className="text-sm text-muted">{contrato?.nomeCargo}</p>
          </div>
          <ul className="flex w-full flex-col gap-2 border-t border-surface-2 pt-3 text-left text-[13px]">
            <li className="flex items-center gap-2.5 break-all"><Mail className="h-[15px] w-[15px] shrink-0 text-muted" />{usuario.email}</li>
            <li className="flex items-center gap-2.5"><Phone className="h-[15px] w-[15px] shrink-0 text-muted" />{formatTelefone(usuario.telefone)}</li>
            <li className="flex items-center gap-2.5"><ShieldCheck className="h-[15px] w-[15px] shrink-0 text-muted" />Entrou como {perfil}</li>
          </ul>
          {!editando && (
            <button
              type="button"
              onClick={() => {
                setRascunho(usuario);
                setEditando(true);
              }}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-line text-[13px] font-semibold hover:bg-background"
            >
              <Pencil className="h-3.5 w-3.5" /> Editar dados pessoais
            </button>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-5">
        {editando && rascunho && (
          <Cartao titulo="Dados pessoais">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setConfirmar(true);
              }}
              className="flex flex-col gap-5"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input id="nome" label="Nome completo" value={rascunho.nome} onChange={(e) => setRascunho({ ...rascunho, nome: e.target.value })} />
                <Input
                  id="dataNascimento"
                  label="Data de nascimento"
                  type="date"
                  value={rascunho.dataNascimento?.split('T')[0] ?? ''}
                  onChange={(e) => setRascunho({ ...rascunho, dataNascimento: e.target.value })}
                />
                <Input id="email" label="E-mail" type="email" value={rascunho.email} onChange={(e) => setRascunho({ ...rascunho, email: e.target.value })} />
                <Input
                  id="telefone"
                  label="Telefone (só números, com DDD)"
                  type="tel"
                  inputMode="numeric"
                  value={rascunho.telefone || ''}
                  onChange={(e) => setRascunho({ ...rascunho, telefone: Number(e.target.value.replace(/\D/g, '')) })}
                />
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <Button text="Cancelar" fullWidth={false} backgroundColor="bg-surface" textColor="text-foreground" className="border border-line" onClick={() => setEditando(false)} />
                <Button text="Salvar alterações" type="submit" fullWidth={false} isLoading={salvando} />
              </div>
            </form>
          </Cartao>
        )}

        <Cartao
          titulo={
            <span className="flex flex-col gap-0.5">
              <span className="text-[17px]">Informações contratuais</span>
              <span className="text-[13px] font-normal text-muted">Mantidas pelo RH. Para corrigir algo, fale com o RH.</span>
            </span>
          }
          className="gap-5"
        >
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3">
            {dadosContrato.map((d) => (
              <div key={d.rotulo} className="flex flex-col gap-1 border-b border-surface-2 pb-3.5">
                <dt className="text-xs font-semibold text-muted">{d.rotulo}</dt>
                <dd className={`text-[15px] font-semibold ${d.mono ? 'font-mono' : ''}`}>{d.valor}</dd>
              </div>
            ))}
          </dl>
        </Cartao>

        <Cartao
          titulo={<span className="text-[17px]">Jornada{horas ? ` · ${horas}h por dia` : ''}</span>}
          acao={<span className="text-[13px] text-muted">Segunda a sexta</span>}
        >
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {ETAPAS_DO_DIA.map((etapa) => (
              <li key={etapa.tipo} className="flex flex-col gap-1 rounded-xl bg-primary-tint px-4 py-3.5">
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  {etapa.icone('h-3.5 w-3.5')}
                  {etapa.label}
                </span>
                <span className="font-mono text-xl font-semibold text-primary">{etapa.referencia}</span>
              </li>
            ))}
          </ul>
        </Cartao>

        <section className="flex flex-wrap items-center gap-4 rounded-2xl bg-surface px-6 py-5 shadow-card">
          <span className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] bg-primary-soft text-primary">
            <KeyRound className="h-[19px] w-[19px]" />
          </span>
          <div className="flex flex-1 flex-col gap-0.5">
            <b className="text-[15px]">Senha</b>
            <span className="text-[13px] text-muted">A troca é feita com um código enviado ao seu e-mail.</span>
          </div>
          <Link href="/forgot-password" className="flex h-10 items-center rounded-[10px] border border-line px-4 text-[13px] font-semibold hover:bg-background">
            Alterar senha
          </Link>
        </section>
      </div>

      <ConfirmationModal
        isOpen={confirmar}
        onCancel={() => setConfirmar(false)}
        onConfirm={() => rascunho && salvar(rascunho)}
        loading={salvando}
        title="Salvar alterações?"
        message="Seus dados pessoais serão atualizados."
        confirmText="Salvar"
        cancelText="Cancelar"
      />
    </div>
  );
}
