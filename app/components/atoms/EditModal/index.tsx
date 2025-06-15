import React from 'react';
import { EditModalField } from '@/app/types';
import { X } from 'lucide-react';

interface EditModalProps {
  title: string;
  fields: EditModalField[];
  onClose: () => void;
  onConfirm?: () => void;
  loading?: boolean;
  confirmText?: string;
}

const EditModal: React.FC<EditModalProps> = ({
  title,
  fields,
  onClose,
  onConfirm,
  loading = false,
  confirmText = 'Salvar'
}) => {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-blue-950">{title}</h2>
        
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  value={field.value}
                  onChange={field.onChange}
                  className={`w-full p-2 border rounded-md text-black ${
                    field.readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={field.readOnly}
                  required={field.required}
                >
                  {field.options?.map((option: any) => (
                    <option key={option.value} value={option.value} className="text-black">
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                  className={`w-full p-2 border rounded-md text-black ${
                    field.readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  readOnly={field.readOnly}
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Cancelar
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Processando...' : confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditModal;


