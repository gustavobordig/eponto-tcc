"use client";

import { useEffect, useMemo, useState } from "react";
import { addMonths, format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TimeAdjustmentModal } from "@/features/ponto/components/AjustePontoModal";
import { registroPontoService, RegistroPonto } from "@/features/ponto/api";
import { bancoHorasService } from "@/features/bancoHoras/api";
import { useEventosCalendario } from "@/features/calendario/hooks/useEventosCalendario";
import { DiaDoHistorico, diasDoHistorico } from "@/features/ponto/lib/historico";
import { ETAPAS_DO_DIA } from "@/features/ponto/etapas";
import { tokenUtils } from "@/shared/lib/token";
import { duracaoEmMinutos, saldoCurto } from "@/shared/lib/format";

const corDoSaldo = (minutos: number | null) =>
  minutos === null || minutos === 0 ? "text-muted" : minutos > 0 ? "text-ok" : "text-danger";

const COLUNAS = "grid-cols-[1.4fr_repeat(4,1fr)_1fr_1fr_120px]";

/** Histórico do mês (1d): resumo, marcações do dia a dia e pedido de ajuste. */
export default function HistoricoContainer({ onAjusteEnviado }: { onAjusteEnviado?: () => void }) {
  const [mes, setMes] = useState(() => new Date());
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);
  const [saldos, setSaldos] = useState(new Map<string, number>());
  const [loading, setLoading] = useState(true);
  const [diaAjuste, setDiaAjuste] = useState<DiaDoHistorico | null>(null);
  const { eventos } = useEventosCalendario({ incluirMinhasFerias: true });

  useEffect(() => {
    const userId = tokenUtils.getId();
    if (!userId) return;
    Promise.all([
      registroPontoService.listarPorUsuario(Number(userId)),
      // Uma chamada só para os saldos; antes era uma por dia, sempre com a lista inteira
      bancoHorasService.obterSaldosDiarios(Number(userId)).catch(() => null),
    ])
      .then(([pontos, saldosDiarios]) => {
        setRegistros(pontos.registros ?? []);
        const mapa = new Map<string, number>();
        saldosDiarios?.saldosDiarios?.forEach((s) => {
          const minutos = duracaoEmMinutos(s.saldoDiario);
          if (minutos !== null) mapa.set(s.dataReferencia.split("T")[0], minutos);
        });
        setSaldos(mapa);
      })
      .catch((error) => console.error("Erro ao buscar registros:", error))
      .finally(() => setLoading(false));
  }, []);

  const dias = useMemo(() => diasDoHistorico(mes, registros, saldos, eventos), [mes, registros, saldos, eventos]);

  const resumo = useMemo(() => {
    const trabalhado = dias.reduce((t, d) => t + (d.trabalhado ?? 0), 0);
    const extras = dias.reduce((t, d) => t + Math.max(0, d.saldo ?? 0), 0);
    const faltantes = dias.reduce((t, d) => t + Math.min(0, d.saldo ?? 0), 0);
    return [
      { rotulo: "Horas trabalhadas", valor: saldoCurto(trabalhado).replace("+", ""), cor: "text-foreground" },
      { rotulo: "Horas extras", valor: saldoCurto(extras), cor: extras ? "text-ok" : "text-foreground" },
      { rotulo: "Horas faltantes", valor: saldoCurto(faltantes), cor: faltantes ? "text-danger" : "text-foreground" },
      { rotulo: "Saldo do mês", valor: saldoCurto(extras + faltantes), cor: corDoSaldo(extras + faltantes) },
    ];
  }, [dias]);

  const noMesAtual = format(mes, "yyyy-MM") === format(new Date(), "yyyy-MM");
  const nomeMes = mes.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).replace(" de ", " ");

  // O modal de ajuste recebe os horários e os ids dos registros pelo tipo da marcação.
  // Memorizado: o modal reinicia o formulário sempre que initialData muda.
  const dadosAjuste = useMemo(() => {
    if (!diaAjuste) return null;
    const m = (tipo: number) => diaAjuste.marcacoes.find((x) => x.tipo === tipo)!;
    const porTipo = <T,>(valor: (x: DiaDoHistorico["marcacoes"][number]) => T) => ({
      entrada: valor(m(1)),
      inicioAlmoco: valor(m(2)),
      fimAlmoco: valor(m(3)),
      saida: valor(m(4)),
    });
    return {
      data: format(diaAjuste.data, "dd/MM/yyyy"),
      horarios: porTipo((x) => ({ time: x.hora ?? "", location: "" })),
      ids: porTipo((x) => x.idRegistro ?? 0),
    };
  }, [diaAjuste]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold tracking-tight">Histórico</h1>
          <p className="text-sm text-muted">Suas marcações e o saldo de cada dia</p>
        </div>
        <div className="flex items-center gap-1 rounded-[10px] border border-line bg-surface p-1">
          <button type="button" onClick={() => setMes((m) => addMonths(m, -1))} aria-label="Mês anterior" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-background">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <b className="min-w-32 px-2.5 text-center text-sm capitalize">{nomeMes}</b>
          <button
            type="button"
            onClick={() => setMes((m) => addMonths(m, 1))}
            disabled={noMesAtual}
            aria-label="Próximo mês"
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-background disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {resumo.map((item) => (
          <div key={item.rotulo} className="flex flex-col gap-1 rounded-[14px] bg-surface px-5 py-[18px] shadow-card">
            <dt className="text-[13px] text-muted">{item.rotulo}</dt>
            <dd className={`font-mono text-2xl font-semibold ${item.cor}`}>{item.valor}</dd>
          </div>
        ))}
      </dl>

      <div className="overflow-x-auto rounded-2xl bg-surface shadow-card">
        <div className="min-w-[860px]" role="table" aria-label={`Marcações de ${nomeMes}`}>
          <div role="row" className={`grid ${COLUNAS} gap-3 bg-marca px-6 py-3.5 text-xs font-bold uppercase tracking-[.4px] text-white`}>
            {["Data", "Entrada", "Almoço", "Volta", "Saída", "Trabalhado", "Saldo"].map((c) => (
              <span key={c} role="columnheader">{c}</span>
            ))}
            <span role="columnheader" className="sr-only">Ações</span>
          </div>

          {loading ? (
            <p className="px-6 py-10 text-center text-sm text-muted">Carregando registros…</p>
          ) : dias.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted">Nenhum registro em {nomeMes}.</p>
          ) : (
            dias.map((dia) => (
              <div
                key={dia.chave}
                role="row"
                className={`grid ${COLUNAS} items-center gap-3 border-b border-surface-2 px-6 py-4 text-sm last:border-b-0 ${dia.incompleto ? "bg-danger-soft/50" : ""}`}
              >
                <div role="cell" className="flex flex-col gap-px">
                  <b>{format(dia.data, "dd/MM")}</b>
                  <span className="truncate text-xs text-muted first-letter:uppercase">
                    {dia.evento ?? dia.data.toLocaleDateString("pt-BR", { weekday: "long" }).replace("-feira", "")}
                  </span>
                </div>
                {dia.marcacoes.map((m, i) => {
                  // Sem entrada ou sem saída num dia útil fica em vermelho
                  const faltaImportante = !m.hora && dia.incompleto && (i === 0 || i === 3);
                  return (
                    <span
                      key={m.tipo}
                      role="cell"
                      title={m.atraso ? `${ETAPAS_DO_DIA[i].label} com atraso` : undefined}
                      className={`font-mono ${m.atraso ? "text-warn-ink" : faltaImportante ? "text-danger" : ""}`}
                    >
                      {m.hora ?? "—"}
                    </span>
                  );
                })}
                <span role="cell" className="font-mono">{dia.trabalhado === null ? "—" : saldoCurto(dia.trabalhado).replace("+", "")}</span>
                <span role="cell" className={`font-mono font-semibold ${corDoSaldo(dia.saldo)}`}>
                  {dia.saldo === null ? "—" : saldoCurto(dia.saldo)}
                </span>
                <div role="cell" className="flex justify-end">
                  {dia.evento ? null : dia.incompleto ? (
                    <button
                      type="button"
                      onClick={() => setDiaAjuste(dia)}
                      className="h-8 rounded-lg bg-danger-soft px-3 text-xs font-bold text-danger-ink hover:brightness-95"
                    >
                      Pedir ajuste
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDiaAjuste(dia)}
                      aria-label={`Ajustar o ponto de ${format(dia.data, "dd/MM")}`}
                      className="text-[13px] font-semibold text-muted hover:text-primary"
                    >
                      Ajustar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <p className="text-xs text-muted">
        Horários em âmbar indicam atraso acima de 10 min em relação à jornada (
        {ETAPAS_DO_DIA.map((e) => e.referencia).join(" · ")}). O saldo do dia aparece depois que o banco de horas é calculado.
      </p>

      <TimeAdjustmentModal
        isOpen={diaAjuste !== null}
        onClose={() => setDiaAjuste(null)}
        onSubmit={() => {
          setDiaAjuste(null);
          onAjusteEnviado?.();
        }}
        selectedDate={dadosAjuste?.data ?? ""}
        initialData={dadosAjuste?.horarios}
        registrosDoDia={dadosAjuste?.ids}
      />
    </div>
  );
}
