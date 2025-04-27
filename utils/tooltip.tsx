import * as Tooltip from '@radix-ui/react-tooltip';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  show?: boolean;
}

export const CustomTooltip = ({ children, content, show = true }: TooltipProps) => {
  if (!show) return <>{children}</>;

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content 
            className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm"
            sideOffset={5}
          >
            {content}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}; 