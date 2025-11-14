import Image from "next/image";

// Molecules
import Form from "@/app/components/molecules/Form";

// Assets
import logo from "@/public/images/Logo.png";
import login from "@/public/images/Login.png";

export default function LoginContainer() {
return (
<div className="flex flex-col items-center justify-center min-h-screen p-2 sm:p-4">
    <div className="w-full max-w-6xl min-h-[90vh] sm:h-[90vh] lg:h-[80vh] flex flex-col lg:flex-row border-2 border-[#002085] rounded-lg overflow-hidden shadow-lg">
        {/* Seção da esquerda - oculta em mobile, visível em desktop */}
        <div className="hidden lg:flex w-full lg:w-1/2 h-full bg-white flex-col items-center justify-center gap-4 p-4">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
                <h1 className="text-black text-xl xl:text-2xl font-bold">
                    Bem-vindo de volta!
                </h1>
                <h2 className="text-[#002085] text-sm xl:text-base">
                    Faça login para continuar
                </h2>
            </div>

            <div className="w-full max-w-sm">
                <Image 
                    src={login.src} 
                    alt="login" 
                    width={400} 
                    height={600}
                    className="w-full h-auto object-contain"
                />
            </div>
        </div>

        {/* Seção da direita - formulário de login */}
        <div className="w-full lg:w-1/2 h-full bg-[#002085] py-4 px-4 sm:py-8 sm:px-8 flex items-center justify-center">
            <Form logo={logo.src} title="Acesse sua conta" />
        </div>
    </div>
</div>
)
}
