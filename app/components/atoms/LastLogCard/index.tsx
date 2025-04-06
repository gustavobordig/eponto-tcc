
interface LastLogCardProps {
    data: string;
    local: string;
}

export default function LastLogCard({
    data,
    local
}: LastLogCardProps) {
    return (
        <div className="w-full">
            <div className="flex flex-col gap-2  p-4 items-start justify-center
            rounded-lg border-2 border-[#002085]">
                <h5 className="text-xl  text-[#002085]">
                    Data: <span className="font-bold">{data}</span>
                </h5>
                <p className="text-[#002085]">
                    Local: <span className="font-bold">{local}</span>
                </p>
            </div>
        </div>
    )
}
