import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

//Types
import { Column, TableRow } from "@/shared/types/ui";

// Utils
import { formatDate, formatMoeda, formatTelefone } from "@/shared/lib/format";

interface TableProps<T extends object> {
  data: T[];
  /** Título da lista, no plural ("Usuários") */
  title: string;
  columns: Column<T>[];
  handleEdit?: (item: T) => void;
  handleDeleteClick?: (item: T) => void;
  /** Ações próprias da linha, no lugar de Editar/Excluir */
  renderActions?: (item: T) => ReactNode;
  addItemHref?: string;
  /** Texto do botão de cadastro, no singular ("Novo usuário") */
  addItemLabel?: string;
  isAjustePonto?: boolean;
}

const STATUS = {
  ativo: { 1: ["Ativo", "bg-green-100 text-green-800"], 0: ["Inativo", "bg-red-100 text-red-800"] },
  ajuste: {
    0: ["Pendente", "bg-yellow-100 text-yellow-800"],
    1: ["Aprovado", "bg-green-100 text-green-800"],
    2: ["Reprovado", "bg-red-100 text-red-800"],
  },
} as const;

export default function Table<T extends object = TableRow>({
  data,
  title,
  columns,
  handleEdit,
  handleDeleteClick,
  renderActions,
  addItemHref,
  addItemLabel = "Adicionar",
  isAjustePonto = false,
}: TableProps<T>) {
  // Antes, a tabela chamava handleEdit durante a renderização para ver se ele
  // devolvia JSX; nas telas em que ele abre o modal de edição, o modal abria
  // sozinho com a última linha e não fechava mais.
  const temAcoes = Boolean(handleEdit || handleDeleteClick || renderActions);
  const [busca, setBusca] = useState("");

  const linhas = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const renderCell = (item: T, column: Column<T>): ReactNode => {
    if (column.render) return column.render(item);

    const value = (item as TableRow)[column.key];
    if (value === undefined || value === null || value === "") return "—";

    switch (column.type) {
      case "currency":
        return formatMoeda(value);
      case "phone":
        return formatTelefone(value);
      case "status": {
        const mapa: Record<number, readonly [string, string]> = isAjustePonto ? STATUS.ajuste : STATUS.ativo;
        const [texto, classe] = mapa[Number(value)] ?? (isAjustePonto ? STATUS.ajuste[2] : STATUS.ativo[0]);
        return <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${classe}`}>{texto}</span>;
      }
      case "date":
        return formatDate(value, false);
      case "datetime":
        return formatDate(value, true);
      default:
        return value;
    }
  };

  // Busca em todas as colunas com valor simples (texto, número, data)
  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return linhas;
    return linhas.filter((item) =>
      columns.some((column) => {
        const value = (item as TableRow)[column.key];
        if (value === null || value === undefined) return false;
        const texto =
          column.type === "date" || column.type === "datetime"
            ? formatDate(value, column.type === "datetime")
            : column.type === "phone"
              ? `${value} ${formatTelefone(value)}`
              : String(value);
        return texto.toLowerCase().includes(termo);
      })
    );
  }, [busca, columns, linhas]);

  const acoes = (item: T) =>
    renderActions ? (
      renderActions(item)
    ) : (
      <div className="flex gap-3">
        {handleEdit && (
          <button type="button" onClick={() => handleEdit(item)} className="font-medium text-primary hover:underline">
            Editar
          </button>
        )}
        {handleDeleteClick && (
          <button type="button" onClick={() => handleDeleteClick(item)} className="font-medium text-red-700 hover:underline">
            Excluir
          </button>
        )}
      </div>
    );

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h1>
        {addItemHref && (
          <Link
            href={addItemHref}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            {addItemLabel}
          </Link>
        )}
      </div>

      {linhas.length > 0 && (
        <label className="relative mb-4 block sm:max-w-xs">
          <span className="sr-only">Buscar em {title.toLowerCase()}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar…"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
      )}

      {filtradas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 py-10 text-center text-sm text-gray-500">
          {linhas.length === 0 ? `Nenhum registro em ${title.toLowerCase()}.` : `Nada encontrado para “${busca}”.`}
        </p>
      ) : (
        <>
          {/* Tabela a partir do tablet */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      {column.label}
                    </th>
                  ))}
                  {temAcoes && (
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filtradas.map((item, index) => (
                  <tr key={(item as TableRow).id || `row-${index}`} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={column.key} className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                        {renderCell(item, column)}
                      </td>
                    ))}
                    {temAcoes && <td className="whitespace-nowrap px-4 py-3 text-sm">{acoes(item)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* No celular, cada linha vira um card; antes a tabela rolava de lado e escondia as ações */}
          <ul className="space-y-3 md:hidden">
            {filtradas.map((item, index) => (
              <li key={(item as TableRow).id || `card-${index}`} className="rounded-xl border border-gray-200 p-4">
                <dl className="space-y-1.5">
                  {columns.map((column) => (
                    <div key={column.key} className="flex justify-between gap-4 text-sm">
                      <dt className="text-gray-500">{column.label}</dt>
                      <dd className="text-right font-medium text-gray-900">{renderCell(item, column)}</dd>
                    </div>
                  ))}
                </dl>
                {temAcoes && <div className="mt-3 border-t border-gray-100 pt-3 text-sm">{acoes(item)}</div>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
