
interface CardProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

export default function Card({
    title,
    description,
    children
}: CardProps) {
    return (
        <div 
            className="flex flex-col gap-4 bg-white rounded-lg p-4 shadow-md w-2/4 max-w-[500px]"
        >
            <h1 className="text-2xl font-bold my-4 text-black">{title}</h1>
            <p className="text-sm  text-black">{description}</p>
            {children}
        </div>
    )
}
