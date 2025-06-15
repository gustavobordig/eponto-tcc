interface EditModalProps {
  title: string;
  fields: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    type?: 'text' | 'select';
    options?: { value: string; label: string; }[];
  }[];
  onClose: () => void;
  onConfirm?: () => void;
  loading: boolean;
}

export default function EditModal({
  title,
  fields,
  onClose,
  onConfirm,
  loading
}: EditModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={index}>
              <label htmlFor={field.label} className="block text-sm font-medium text-black">
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  id={field.label}
                  value={field.value}
                  onChange={field.onChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value} className="text-black">
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id={field.label}
                  value={field.value}
                  onChange={field.onChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 mr-2 border-t-2 border-white rounded-full animate-spin"></div>
                  Salvando...
                </div>
              ) : (
                'Salvar'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


