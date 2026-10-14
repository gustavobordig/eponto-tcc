import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";
import { ChevronDown, Pencil, Plus, Search, Trash2 } from "lucide-react";

//Types
import { Column, TableRow } from "@/shared/types/ui";

// Utils
import { formatDate, formatMoeda, formatTelefone } from "@/shared/lib/format";
import StatusPill, { situacaoDoStatus } from "@/shared/ui/StatusPill";

export interface FiltroTabela<T> {
  /** "Cargo", "Status"… */
  rotulo: string;
  opcoes: { valor: string; rotulo: string }[];
  valorDe: (item: T) => string;
}

interface TableProps<T extends object> {
  data: T[];
  /** Título da lista, no plural ("Usuários") */
  title: string;
  /** Linha abaixo do título ("6 pessoas cadastradas · 5 ativas") */
  subtitle?: ReactNode;
  columns: Column<T>[];
  handleEdit?: (item: T) => void;
  handleDeleteClick?: (item: T) => void;
  /** Ações próprias da linha, no lugar de Editar/Excluir */
  renderActions?: (item: T) => ReactNode;
  addItemHref?: string;
  /** Texto do botão de cadastro, no singular ("Novo usuário") */
  addItemLabel?: string;
  isAjustePonto?: boolean;
  searchPlaceholder?: string;
  /** Campos buscados além das colunas (ex.: e-mail, que aparece dentro da coluna Nome) */
  camposBusca?: string[];
  filtros?: FiltroTabela<T>[];
  /** Sem título e botão (para tabelas dentro de outra seção) */
  semCabecalho?: boolean;
}

/** Tabela do painel RH no padrão 1j: cabeçalho marinho, busca, filtros e cards no celular. */
export default function Table<T extends object = TableRow>({
  data,
  title,
  subtitle,
  columns,
  handleEdit,
  handleDeleteClick,
  renderActions,
  addItemHref,
  addItemLabel = "Adicionar",
  isAjustePonto = false,
  searchPlaceholder = "Buscar…",
  camposBusca = [],
  filtros = [],
  semCabecalho = false,
}: TableProps<T>) {
  // Antes, a tabela chamava handleEdit durante a renderização para ver se ele
  // devolvia JSX; nas telas em que ele abre o modal de edição, o modal abria
  // sozinho com a última linha e não fechava mais.
  const temAcoes = Boolean(handleEdit || handleDeleteClick || renderActions);
  const [busca, setBusca] = useState("");
  const [valoresFiltro, setValoresFiltro] = useState<Record<string, string>>({});

  const linhas = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const renderCell = (item: T, column: Column<T>): ReactNode => {
    if (column.render) return column.render(item);

    const value = (item as TableRow)[column.key];
    if (value === undefined || value === null || value === "") return "—";

    switch (column.type) {
      case "currency":
        return formatMoeda(value);
      case "phone":
        return <span className="font-mono text-[13px]">{formatTelefone(value)}</span>;
      case "status":
        return isAjustePonto ? (
          <StatusPill situacao={situacaoDoStatus(Number(value))} texto={["Pendente", "Aprovado", "Reprovado"][Number(value)]} />
        ) : (
          <StatusPill situacao={Number(value) === 1 ? "ativo" : "inativo"} />
        );
      case "date":
        return formatDate(value, false);
      case "datetime":
        return formatDate(value, true);
      default:
        return value;
    }
  };

  // Busca em todas as colunas com valor simples (texto, número, data) e aplica os filtros
  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return linhas.filter((item) => {
      const passaFiltros = filtros.every((f) => !valoresFiltro[f.rotulo] || f.valorDe(item) === valoresFiltro[f.rotulo]);
      if (!passaFiltros) return false;
      if (!termo) return true;
      if (camposBusca.some((campo) => String((item as TableRow)[campo] ?? "").toLowerCase().includes(termo))) return true;
      return columns.some((column) => {
        const value = (item as TableRow)[column.key];
        if (value === null || value === undefined) return false;
        const texto =
          column.type === "date" || column.type === "datetime"
            ? formatDate(value, column.type === "datetime")
            : column.type === "phone"
              ? `${value} ${formatTelefone(value)}`
              : String(value);
        return texto.toLowerCase().includes(termo);
      });
    });
  }, [busca, columns, linhas, filtros, valoresFiltro, camposBusca]);

  const acoes = (item: T) =>
    renderActions ? (
      renderActions(item)
    ) : (
      <div className="flex justify-end gap-1">
        {handleEdit && (
          <button
            type="button"
            onClick={() => handleEdit(item)}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-muted hover:bg-surface-2 hover:text-primary"
          >
            <Pencil className="h-[15px] w-[15px]" />
            Editar
          </button>
        )}
        {handleDeleteClick && (
          <button
            type="button"
            onClick={() => handleDeleteClick(item)}
            aria-label="Excluir"
            title="Excluir"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger"
          >
            <Trash2 className="h-[15px] w-[15px]" />
          </button>
        )}
      </div>
    );

  return (
    <section className="flex flex-col gap-5">
      {!semCabecalho && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
          {addItemHref && (
            <Link
              href={addItemHref}
              className="flex h-11 items-center gap-2 rounded-[10px] bg-primary px-[18px] text-sm font-bold text-white hover:bg-primary-dark"
            >
              <Plus className="h-4 w-4" />
              {addItemLabel}
            </Link>
          )}
        </div>
      )}

      {linhas.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          <label className="relative block min-w-56 flex-1 sm:max-w-[380px]">
            <span className="sr-only">Buscar em {title.toLowerCase()}</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-[42px] w-full rounded-[10px] border border-line bg-surface pl-10 pr-3.5 text-sm placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-soft"
            />
          </label>
          {filtros.map((f) => (
            <label key={f.rotulo} className="relative">
              <span className="sr-only">Filtrar por {f.rotulo.toLowerCase()}</span>
              <select
                value={valoresFiltro[f.rotulo] ?? ""}
                onChange={(e) => setValoresFiltro((v) => ({ ...v, [f.rotulo]: e.target.value }))}
                className="h-[42px] appearance-none rounded-[10px] border border-line bg-surface pl-3.5 pr-9 text-sm font-semibold focus:border-primary focus:outline-none"
              >
                <option value="">{f.rotulo}: todos</option>
                {f.opcoes.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {f.rotulo}: {o.rotulo}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted" />
            </label>
          ))}
        </div>
      )}

      {filtradas.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface py-10 text-center text-sm text-muted">
          {linhas.length === 0 ? `Nenhum registro em ${title.toLowerCase()}.` : busca ? `Nada encontrado para “${busca}”.` : "Nada com esses filtros."}
        </p>
      ) : (
        <>
          {/* Tabela a partir do tablet */}
          <div className="hidden overflow-hidden rounded-2xl bg-surface shadow-card md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-marca">
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key} scope="col" className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[.4px] text-white first:pl-6">
                        {column.label}
                      </th>
                    ))}
                    {temAcoes && (
                      <th scope="col" className="px-4 py-3.5 last:pr-6">
                        <span className="sr-only">Ações</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((item, index) => (
                    <tr key={(item as TableRow).id || `row-${index}`} className="border-b border-surface-2 last:border-b-0 hover:bg-surface-2">
                      {columns.map((column) => (
                        <td key={column.key} className="whitespace-nowrap px-4 py-3.5 text-sm first:pl-6">
                          {renderCell(item, column)}
                        </td>
                      ))}
                      {temAcoes && <td className="whitespace-nowrap px-4 py-3.5 text-sm last:pr-6">{acoes(item)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* No celular, cada linha vira um card; antes a tabela rolava de lado e escondia as ações */}
          <ul className="space-y-3 md:hidden">
            {filtradas.map((item, index) => (
              <li key={(item as TableRow).id || `card-${index}`} className="rounded-2xl bg-surface p-4 shadow-card">
                <dl className="space-y-1.5">
                  {columns.map((column) => (
                    <div key={column.key} className="flex justify-between gap-4 text-sm">
                      <dt className="text-muted">{column.label}</dt>
                      <dd className="text-right font-medium">{renderCell(item, column)}</dd>
                    </div>
                  ))}
                </dl>
                {temAcoes && <div className="mt-3 border-t border-surface-2 pt-3 text-sm">{acoes(item)}</div>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
