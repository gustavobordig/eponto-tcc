import Container from "../container";

interface LoadingTextProps {
    title: string;
}   

export default function LoadingText({
    title
}: LoadingTextProps) {
    return(
        <Container className="h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando {title}...</p>
            </div>
        </Container>
    )
}
