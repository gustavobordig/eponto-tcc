import Image from "next/image";

// Molecules
import Form from "@/app/components/molecules/Form";

// Assets
import logo from "@/public/images/Logo.png";
import login from "@/public/images/Login.png";

export default function LoginContainer() {
return (
<div className="flex flex-col items-center justify-center min-h-screen p-4">
    <div className="w-full max-w-6xl h-[90vh] md:h-[80vh] flex flex-col md:flex-row border-2 border-[#002085] rounded-lg overflow-hidden">
        <div className="hidden md:flex w-full md:w-1/2 h-full bg-white flex-col items-center justify-center gap-4 p-4">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
                <h1 className="text-black text-xl md:text-2xl font-bold">
                    Bem-vindo de volta!
                </h1>
                <h2 className="text-[#002085] text-sm md:text-base">
                    Faça login para continuar
                </h2>
            </div>

            <div>
                <Image src={login.src} alt="login" width={400} height={600} />
            </div>
        </div>

        <div className="w-full md:w-1/2 h-full bg-[#002085] py-8 px-4 md:p-8">
            <Form logo={logo.src} title="Acesse sua conta" />
        </div>
    </div>
</div>
)
}
