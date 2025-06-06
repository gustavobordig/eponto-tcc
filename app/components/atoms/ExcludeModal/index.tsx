
interface ExcludeModalProps {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function ExcludeModal({ 
    title, 
    message, 
    onCancel, 
    onConfirm, 
    loading 
}: ExcludeModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 max-w-md w-full">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar exclusão</h3>
      <p className="text-black mb-6">
        {message}
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="h-4 w-4 mr-2 border-t-2 border-white rounded-full animate-spin"></div>
              Excluindo...
            </div>
          ) : (
            'Excluir'
          )}
        </button>
      </div>
    </div>
  </div>
  );
}


