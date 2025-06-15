import LoadingText from "@/app/components/atoms/LoadingText";

interface LoadModalProps {
    title: string;
}

export default function LoadModal({
    title
}: LoadModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <LoadingText title={title} />
            </div>
        </div>
    );
}