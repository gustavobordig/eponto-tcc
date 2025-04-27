import React from 'react';
import Button from '../Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
                <h2 className="text-xl text-black font-semibold mb-4">{title}</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end gap-4">
                    <Button
                        text={cancelText}
                        backgroundColor="bg-gray-200"
                        textColor="text-gray-700"
                        onClick={onClose}
                        fullWidth={false}
                    />
                    <Button
                        text={confirmText}
                        backgroundColor="bg-[#002085]"
                        textColor="text-white"
                        onClick={onConfirm}
                        fullWidth={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal; 