'use client';

import { useSaldoAtual } from '@/features/bancoHoras/hooks/useSaldoAtual';
import { useSaldosDiarios } from '@/features/bancoHoras/hooks/useSaldosDiarios';
import { duracaoEmMinutos, saldoCurto } from '@/shared/lib/format';
import Cartao from '@/shared/ui/Cartao';

const corDoSaldo = (minutos: number) => (minutos > 0 ? 'text-ok' : minutos < 0 ? 'text-danger' : 'text-foreground');

/** Saldo do banco de horas e os últimos dias em barras (verde crédito, vermelho débito). */
export default function CardBancoHoras() {
  const { saldo, carregando } = useSaldoAtual();
  const { saldos } = useSaldosDiarios();

  const minutos = saldo ? duracaoEmMinutos(saldo.saldo) : null;
  const ultimos = saldos.slice(-5).map((s) => ({
    data: new Date(s.dataReferencia),
    minutos: duracaoEmMinutos(s.saldoDiario) ?? 0,
  }));
  const maior = Math.max(60, ...ultimos.map((d) => Math.abs(d.minutos)));
  const ultimaData = ultimos.at(-1)?.data;

  return (
    <Cartao titulo="Banco de horas" acao={{ href: '/history', texto: 'Ver extrato' }}>
      {carregando ? (
        <p className="text-sm text-muted">Carregando saldo…</p>
      ) : minutos === null ? (
        <p className="text-sm text-muted">Ainda não há saldo calculado para você.</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          <span className={`font-mono text-[40px] font-semibold tracking-[-1.5px] ${corDoSaldo(minutos)}`}>{saldoCurto(minutos)}</span>
          <span className="text-[13px] text-muted">
            {ultimaData ? `Saldo calculado até ${ultimaData.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}` : 'Saldo acumulado'}
          </span>
        </div>
      )}

      {ultimos.length > 0 && (
        <div className="mt-auto flex items-end gap-2 border-t border-surface-2 pt-3" aria-label="Saldo dos últimos dias">
          {ultimos.map((dia) => (
            <div
              key={dia.data.toISOString()}
              className="flex flex-1 flex-col items-center gap-1.5"
              title={`${dia.data.toLocaleDateString('pt-BR')}: ${saldoCurto(dia.minutos)}`}
            >
              <div className="flex h-12 w-full items-end">
                <div
                  className={`w-full rounded ${dia.minutos < 0 ? 'bg-danger' : dia.minutos > 0 ? 'bg-ok' : 'bg-line'}`}
                  style={{ height: `${Math.max(8, (Math.abs(dia.minutos) / maior) * 100)}%` }}
                />
              </div>
              <span className="text-[11px] capitalize text-muted">
                {dia.data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
              </span>
            </div>
          ))}
        </div>
      )}
    </Cartao>
  );
}
