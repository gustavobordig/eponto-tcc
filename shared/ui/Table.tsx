import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import Button from "@/shared/ui/Button";

//Types
import { Column, TableRow } from "@/shared/types/ui";

// Utils
import { formatDate } from "@/shared/lib/format";

interface TableProps<T extends object> {
  data: T[];
  title: string;
  columns: Column<T>[];
  handleEdit?: (item: T) => void;
  handleDeleteClick?: (item: T) => void;
  /** Ações próprias da linha, no lugar de Editar/Excluir */
  renderActions?: (item: T) => ReactNode;
  addItemHref?: string;
  isAjustePonto?: boolean;
}

export default function Table<T extends object = TableRow>({ 
    data, 
    title,
    columns,
    handleEdit,
    handleDeleteClick,
    renderActions,
    addItemHref,
    isAjustePonto = false
}: TableProps<T>) {
  const router = useRouter();
  // Antes, a tabela chamava handleEdit durante a renderização para ver se ele
  // devolvia JSX; nas telas em que ele abre o modal de edição, o modal abria
  // sozinho com a última linha e não fechava mais.
  const temAcoes = Boolean(handleEdit || handleDeleteClick || renderActions);

  // Garantir que data é sempre um array
  const safeData = Array.isArray(data) ? data : [];


  const renderCell = (item: T, column: Column<T>) => {
    if (!item || !column) return null;

    if (column.render) {
      return column.render(item);
    }

    const value = (item as TableRow)[column.key];
    if (value === undefined || value === null) return '-';

    switch (column.type) {
      case 'currency':
        return `R$ ${value}`;
      case 'status':
        return (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              isAjustePonto
                ? value === 1
                  ? "bg-green-100 text-green-800"
                  : value === 0
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
                : value === 1
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {isAjustePonto
              ? value === 1 
                ? "Aprovado" 
                : value === 0 
                ? "Pendente" 
                : "Reprovado"
              : value === 1 
                ? "Ativo" 
                : "Inativo"}
          </span>
        );
      case 'date':
        return formatDate(value, false);
      case 'datetime':
        return formatDate(value, true);
      default:
        return value;
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col gap-2 md:gap-0 md:flex-row  justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Lista de {title}</h1>
          {addItemHref && (
            <div className="w-fit">
              <Button
                text={`Adicionar ${title}`}
              backgroundColor="bg-indigo-600"
              textColor="text-white"
              className="whitespace-nowrap p-2"
                onClick={() => router.push(`${addItemHref}`)}
              />
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
               {safeData.map((item, index) => (
                <tr key={(item as TableRow).id || `row-${index}`} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={`${(item as TableRow).id || index}-${column.key}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-black"
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                  {temAcoes && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {renderActions ? (
                        renderActions(item)
                      ) : (
                        <div className="flex space-x-2">
                          {handleEdit && (
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Editar
                            </button>
                          )}
                          {handleDeleteClick && (
                            <button
                              onClick={() => handleDeleteClick(item)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Excluir
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

                 {safeData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-black">Nenhum {title} cadastrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
