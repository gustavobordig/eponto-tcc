"use client";

import { useState } from "react";
import Image from "next/image";
import { User, Lock } from "lucide-react";

// Atoms
import Input from "@/app/components/atoms/Input";
import Button from "@/app/components/atoms/Button";

interface FormProps {
    logo?: string;
    title?: string;
}

export default function Form({
    logo,
    title,
}: FormProps) {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = () => {
        console.log('Form submitted:', formData);
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white rounded-lg  h-full w-full p-8">
            {logo && (
                <Image 
                    src={logo} 
                    alt="logo" 
                    width={200} 
                    height={100} 
                />
            )}

            <h2 className="text-2xl font-bold text-black my-8">{title}</h2>

            <div className="flex flex-col gap-8 w-full">
                <Input
                    label="Email"
                    placeholder="Digite seu email"
                    icon={<User />}
                    inputClassName="w-full"
                    regex="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                    regexErrorMessage="Email inválido"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />

                <Input
                    label="Senha"
                    type="password"
                    placeholder="Digite sua senha"
                    icon={<Lock />}
                    inputClassName="w-full"
                    regex="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                    regexErrorMessage="A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula e um número."
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />

                <Button
                    text="Entrar"
                    textColor="text-white"
                    onClick={handleSubmit}
                />
            </div>
            
        </div>
    );
}
