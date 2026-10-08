"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Clock, MapPin } from "lucide-react";
import { useAreaFuncionario } from "@/app/(pages)/(authenticated)/_components/AreaFuncionario";
import LinhaDoDia from "@/features/ponto/components/LinhaDoDia";
import { PunctualityChart } from "@/features/ponto/components/PunctualityChart";
import { pontualidadeExemplo } from "@/features/ponto/demoData";
import { useLocalizacao } from "@/features/ponto/hooks/useLocalizacao";
import { useSaldoAtual } from "@/features/bancoHoras/hooks/useSaldoAtual";
import { duracaoEmMinutos, formatHorasTrabalhadas, formatSaldo } from "@/shared/lib/format";
import Avatar from "@/shared/ui/Avatar";
import DemoBadge from "@/shared/ui/DemoBadge";

const saudacao = (hora: number) => (hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite");

export default function Home() {
  const { nomeUsuario, ponto, abrirRegistro } = useAreaFuncionario();
  const { saldo, carregando: carregandoSaldo } = useSaldoAtual();
  const { texto: localizacao } = useLocalizacao();
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setAgora(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const primeiroNome = nomeUsuario.split(" ")[0];
  const minutosSaldo = saldo ? duracaoEmMinutos(saldo.saldo) : null;

  return (
    <div className="space-y-6">
      {/* Topo: quem, quando e a ação principal (no celular, logo no início da tela) */}
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar nome={nomeUsuario} tamanho="lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {saudacao(agora.getHours())}
                {primeiroNome && `, ${primeiroNome}`}
              </h1>
              <p className="text-sm capitalize text-gray-500">{format(agora, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="max-w-[16rem] truncate sm:max-w-sm">{localizacao}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center md:flex-col md:items-end">
            <p className="flex items-center gap-2 text-4xl font-bold tabular-nums text-primary">
              <Clock className="h-6 w-6 text-gray-400" aria-hidden />
              {format(agora, "HH:mm")}
            </p>
            {ponto.carregando ? null : ponto.proxima ? (
              <button
                type="button"
                onClick={abrirRegistro}
                className="rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-dark"
              >
                Registrar {ponto.proxima.label.toLowerCase()}
              </button>
            ) : (
              <p className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                Pontos de hoje completos
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <section className="rounded-2xl bg-white p-6 shadow-sm md:col-span-2" aria-labelledby="titulo-pontos-hoje">
          <h2 id="titulo-pontos-hoje" className="mb-5 text-lg font-semibold text-gray-900">
            Pontos de hoje
          </h2>
          {ponto.carregando ? (
            <p className="text-sm text-gray-500">Carregando pontos…</p>
          ) : (
            <LinhaDoDia marcados={ponto.marcados} proxima={ponto.proxima} />
          )}
          <p className="mt-5 text-xs text-gray-500">
            Os horários em cinza são de referência. O atraso aparece em laranja na entrada e na volta do almoço.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titulo-banco-horas">
          <h2 id="titulo-banco-horas" className="mb-5 text-lg font-semibold text-gray-900">
            Banco de horas
          </h2>
          {carregandoSaldo ? (
            <p className="text-sm text-gray-500">Carregando saldo…</p>
          ) : saldo ? (
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Saldo</dt>
                <dd
                  className={`text-3xl font-bold tabular-nums ${
                    minutosSaldo === null || minutosSaldo === 0
                      ? "text-gray-900"
                      : minutosSaldo > 0
                        ? "text-green-700"
                        : "text-red-700"
                  }`}
                >
                  {minutosSaldo !== null && minutosSaldo > 0 ? "+" : ""}
                  {formatSaldo(saldo.saldo)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Horas trabalhadas</dt>
                <dd className="text-lg font-semibold tabular-nums text-gray-900">{formatHorasTrabalhadas(saldo.horasTrabalhadas)}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-500">Ainda não há saldo calculado para você.</p>
          )}
        </section>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titulo-pontualidade">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="titulo-pontualidade" className="text-lg font-semibold text-gray-900">
            Pontualidade
          </h2>
          <DemoBadge />
        </div>
        <div className="h-64">
          <PunctualityChart data={pontualidadeExemplo} />
        </div>
      </section>
    </div>
  );
}
