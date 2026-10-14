'use client';

import { useRef, useState } from 'react';
import { Calendar, CloudUpload, FileText, X } from 'lucide-react';
import { solicitacaoAusenciaService } from '@/features/ausencias/api';
import { mensagemComTipo, TIPOS_AUSENCIA, TipoAusencia } from '@/features/solicitacoes/pedidos';
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast';
import { tokenUtils } from '@/shared/lib/token';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import TextArea from '@/shared/ui/TextArea';

const TIPOS_ARQUIVO = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const TAMANHO_MAX = 5 * 1024 * 1024;

interface Props {
  onEnviado: () => void;
  onFechar?: () => void;
}

/** Painel "Novo pedido de ausência" (1f). Atestado exige o arquivo; folga e outro, a observação. */
export default function NovaAusencia({ onEnviado, onFechar }: Props) {
  const [tipo, setTipo] = useState<TipoAusencia>('atestado');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [observacao, setObservacao] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const inputArquivo = useRef<HTMLInputElement>(null);

  const escolherArquivo = (f: File | null | undefined) => {
    if (!f) return;
    if (!TIPOS_ARQUIVO.includes(f.type)) return setErros((e) => ({ ...e, arquivo: 'Use PDF, JPG ou PNG.' }));
    if (f.size > TAMANHO_MAX) return setErros((e) => ({ ...e, arquivo: 'O arquivo passa de 5 MB.' }));
    setArquivo(f);
    setErros(({ arquivo: _, ...resto }) => resto);
  };

  const validar = () => {
    const e: Record<string, string> = {};
    if (!inicio) e.inicio = 'Informe o primeiro dia.';
    if (!fim) e.fim = 'Informe o último dia.';
    if (inicio && fim && fim < inicio) e.fim = 'O último dia vem antes do primeiro.';
    if (tipo === 'atestado' && !arquivo) e.arquivo = 'Anexe o atestado.';
    if (tipo !== 'atestado' && !observacao.trim()) e.observacao = 'Conte o motivo para o RH.';
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const enviar = async () => {
    if (!validar()) return;
    setEnviando(true);
    try {
      const response = await solicitacaoAusenciaService.inserirSolicitacao({
        idUsuario: Number(tokenUtils.getId()),
        mensagemSolicitacao: mensagemComTipo(tipo, observacao),
        dataInicioAusencia: inicio,
        dataFimAusencia: fim,
        arquivo: arquivo ?? undefined,
        camposAtivos: ['mensagemSolicitacao', 'dataInicioAusencia', 'dataFimAusencia', ...(arquivo ? ['arquivo'] : [])],
      });
      if (!response.sucesso) throw new Error(response.mensagem || 'Erro ao enviar o pedido');
      showSuccessToast('Pedido enviado para o RH');
      setInicio('');
      setFim('');
      setArquivo(null);
      setObservacao('');
      onEnviado();
    } catch (error) {
      console.error('Erro ao enviar ausência:', error);
      showErrorToast('Não foi possível enviar o pedido. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="flex flex-col gap-[18px] rounded-2xl bg-surface p-6 shadow-[0_8px_30px_rgba(14,20,48,.08)]" aria-labelledby="titulo-nova-ausencia">
      <div className="flex items-center justify-between">
        <h2 id="titulo-nova-ausencia" className="text-[17px] font-bold">Novo pedido de ausência</h2>
        {onFechar && (
          <button type="button" onClick={onFechar} aria-label="Fechar" className="rounded-md p-1 text-muted hover:bg-background hover:text-foreground">
            <X className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[13px] font-semibold">Tipo</legend>
        <div className="grid grid-cols-3 gap-1.5 text-[13px] font-semibold">
          {(Object.keys(TIPOS_AUSENCIA) as TipoAusencia[]).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tipo === t}
              onClick={() => setTipo(t)}
              className={`rounded-[9px] p-2.5 text-center ${tipo === t ? 'border-[1.5px] border-primary bg-primary-tint text-primary' : 'border border-line hover:border-primary/40'}`}
            >
              {TIPOS_AUSENCIA[t]}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-2.5">
        <Input id="ausencia-inicio" label="De" type="date" icon={<Calendar />} inputClassName="h-11 font-mono text-sm" value={inicio} error={erros.inicio} onChange={(e) => setInicio(e.target.value)} />
        <Input id="ausencia-fim" label="Até" type="date" icon={<Calendar />} inputClassName="h-11 font-mono text-sm" value={fim} min={inicio || undefined} error={erros.fim} onChange={(e) => setFim(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold">{tipo === 'atestado' ? 'Atestado médico' : 'Anexo (opcional)'}</span>
        <button
          type="button"
          onClick={() => inputArquivo.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastando(false);
            escolherArquivo(e.dataTransfer.files[0]);
          }}
          className={`flex flex-col items-center gap-1.5 rounded-xl border-[1.5px] border-dashed p-5 text-center ${arrastando ? 'border-primary bg-primary-tint' : erros.arquivo ? 'border-danger bg-danger-soft/50' : 'border-line-strong bg-surface-2/50'}`}
        >
          {arquivo ? (
            <>
              <FileText className="h-[22px] w-[22px] text-primary" />
              <span className="max-w-full truncate text-[13px] font-semibold">{arquivo.name}</span>
              <span className="text-xs text-muted">Clique para trocar</span>
            </>
          ) : (
            <>
              <CloudUpload className="h-[22px] w-[22px] text-primary" />
              <span className="text-[13px]"><b className="text-primary">Escolha um arquivo</b> ou arraste aqui</span>
              <span className="text-xs text-muted">PDF, JPG ou PNG até 5 MB</span>
            </>
          )}
        </button>
        <input ref={inputArquivo} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => escolherArquivo(e.target.files?.[0])} />
        {erros.arquivo && <span className="text-[13px] text-danger-ink">{erros.arquivo}</span>}
      </div>

      <TextArea
        id="ausencia-observacao"
        label="Observação"
        placeholder={tipo === 'atestado' ? 'Opcional' : 'Motivo da ausência'}
        value={observacao}
        error={erros.observacao}
        onChange={(e) => setObservacao(e.target.value)}
      />

      <Button text="Enviar para o RH" onClick={enviar} isLoading={enviando} className="h-12 rounded-[11px]" />
    </section>
  );
}
