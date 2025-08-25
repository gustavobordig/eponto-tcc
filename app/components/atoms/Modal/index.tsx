import { X } from "lucide-react";

interface ModalProps {
  title: string;
  children: React.ReactNode;
}

export function Modal({ 
    title, 
    children 
}: ModalProps) {
  return (
    <>
         {/* Overlay sutil */}
        <div 
            className="fixed inset-0 bg-black flex items-center justify-center z-50"
            style={{
                opacity: '0.5',
            }}
        />
        <div 
            className="bg-white rounded-xl p-6 
            shadow-sm flex flex-col justify-center items-center max-w-sm w-full mx-4
            fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-51"
        >
          <div 
            className="w-full flex justify-end"
          >
            <X 
                className="hover:cursor-pointer hover:text-red-500"
                onClick={() => {}}
            />
          </div>

          <h1 className="text-lg font-semibold text-[#002085] mb-4">{title}</h1>

          <div className="p-4">
            {children}
          </div>
        </div>
    </>
  )
}