import { useRouter } from "next/navigation";
import Button from "@/app/components/atoms/Button";

//Types
import { Column } from "@/types";

interface TableProps {
  data: any[];
  title: string;
  columns: Column[];
  handleEdit?: (item: any) => void;
  handleDeleteClick?: (item: any) => void;
  addItemHref?: string;
  isAjustePonto?: boolean;
}

export default function Table({ 
    data, 
    title,
    columns,
    handleEdit,
    handleDeleteClick,  
    addItemHref,
    isAjustePonto = false
}: TableProps) {
  const router = useRouter();

  const renderCell = (item: any, column: Column) => {
    if (!item || !column) return null;

    if (column.render) {
      return column.render(item);
    }

    const value = item[column.key];
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
        return new Date(value).toLocaleDateString('pt-BR');
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
              {data.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-black"
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                  {(handleEdit || handleDeleteClick) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length === 0 && (
          <div className="text-center py-8">
            <p className="text-black">Nenhum {title} cadastrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
