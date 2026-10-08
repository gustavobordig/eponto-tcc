export default function BounceDots() {
    return (
        <span className="inline-flex items-center">
            <span className="animate-bounce [animation-delay:-0.3s]">.</span>
            <span className="animate-bounce [animation-delay:-0.15s]">.</span>
            <span className="animate-bounce">.</span>
        </span>
    );
} 