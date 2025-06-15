'use client';

import Input from '../../atoms/Input';
import { useState, useEffect } from 'react';
import { invalidFieldMessages } from '@/utils/invalidFieldMessages';

interface InputField {
    id: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'select' | 'date';
    placeholder?: string;
    required?: boolean;
    regex?: RegExp;
    render?: () => React.ReactNode;
}

interface DefaultFormProps {
    title: string;
    inputs: InputField[];
    buttonText: string;
    onSubmit: (data: Record<string, string>) => void;
}

export default function DefaultForm({
    title,
    inputs,
    buttonText = "Enviar",
    onSubmit,
}: DefaultFormProps) {
    
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const requiredInputs = inputs.filter(input => input.required);
        const allRequiredFilled = requiredInputs.every(input => {
            if (input.type === 'select') {
                // For select fields, check if the value exists in formData
                return formData[input.id] !== undefined && formData[input.id] !== '';
            }
            return formData[input.id] && formData[input.id].trim() !== '';
        });
        setIsFormValid(allRequiredFilled && Object.keys(errors).length === 0);
    }, [formData, inputs, errors]);

    const handleInputChange = (id: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));

        // Validate on change
        const input = inputs.find(input => input.id === id);
        if (input?.regex) {
            const regexPattern = new RegExp(input.regex);
            if (!regexPattern.test(value)) {
                setErrors(prev => ({
                    ...prev,
                    [id]: invalidFieldMessages[id as keyof typeof invalidFieldMessages]?.invalid || 'Valor inválido'
                }));
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[id];
                    return newErrors;
                });
            }
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isFormValid) {
            onSubmit(formData);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl text-black font-bold mb-6 text-center">{title}</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {inputs.map((input) => (
                    <div key={input.id} className="space-y-2">
                        <label htmlFor={input.id} className="block text-sm font-medium text-black">
                            {input.label}
                        </label>
                        {input.render ? (
                            <div onChange={(e) => {
                                const target = e.target as HTMLSelectElement;
                                handleInputChange(input.id, target.value);
                            }}>
                                {input.render()}
                            </div>
                        ) : (
                            <Input
                                id={input.id}
                                name={input.id}
                                type={input.type}
                                placeholder={input.placeholder}
                                required={input.required}
                                regex={input.regex}
                                error={errors[input.id]}
                                onInputChange={(value) => handleInputChange(input.id, value)}
                            />
                        )}
                        {errors[input.id] && (
                            <p className="text-red-500 text-sm">{errors[input.id]}</p>
                        )}
                    </div>
                ))}
                <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isFormValid 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    {buttonText}
                </button>
            </form>
        </div>
    );
}
