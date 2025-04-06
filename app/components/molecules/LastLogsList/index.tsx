import LastLogCard from "../../atoms/LastLogCard";
import { AnimatedContainer } from "../../atoms/AnimatedContainer";

interface LastLogsListProps {
    items: {
        data: string;
        local: string;
    }[];
}

export default function LastLogsList({
    items
}: LastLogsListProps) {
    return(
        <div className="w-full flex flex-col gap-4">
            {items.map((item, index) => (
                <AnimatedContainer key={index}>
                    <LastLogCard data={item.data} local={item.local} />
                </AnimatedContainer>
            ))}
        </div>
    )
}
