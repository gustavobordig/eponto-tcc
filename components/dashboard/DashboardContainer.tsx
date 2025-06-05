import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface DashboardContainerProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function DashboardContainer({ title, children, className }: DashboardContainerProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <h2 className="text-2xl font-bold mb-4 text-black">{title}</h2>
      <div className="w-full h-full">
        {children}
      </div>
    </Card>
  );
} 