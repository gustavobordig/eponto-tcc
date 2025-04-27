"use client";

interface ButtonProps {
  text: string;
  backgroundColor?: string;
  textColor?: string;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  iconClassName?: string;
  style?: React.CSSProperties;
  fullWidth?: boolean;
  hoverSwapColors?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}

const Button = ({
  text,
  backgroundColor = 'bg-[#002085]',
  textColor = 'text-white',
  onClick,
  className = '',
  icon,
  iconPosition = 'left',
  iconClassName = '',
  style,
  fullWidth = true,
  hoverSwapColors = false,
  disabled = false,
  isLoading = false,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={style}
      disabled={disabled || isLoading}
      className={`
        ${backgroundColor}
        ${textColor}
        py-3
        rounded-lg
        font-medium
        transition-all
        duration-300
        ease-in-out
        hover:scale-[1.02]
        hover:shadow-lg
        hover:brightness-110
        active:scale-[0.98]
        flex
        items-center
        justify-center
        gap-2
        ${fullWidth ? 'w-full' : 'w-auto px-4'}
        ${className}
        ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${hoverSwapColors ? 'hover:bg-[#002085] hover:text-white' : ''}
        transition-all
        duration-300
        ease-in-out
        relative
        overflow-hidden
        before:absolute
        before:inset-0
        before:bg-gradient-to-r
        before:from-transparent
        before:via-white/10
        before:to-transparent
        before:translate-x-[-100%]
        hover:before:translate-x-[100%]
        before:transition-transform
        before:duration-1000
        shadow-[0_2px_8px_rgba(0,32,133,0.15)]
        hover:shadow-[0_4px_12px_rgba(0,32,133,0.25)]
      `}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Carregando...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={iconClassName}>{icon}</span>
          )}
          {text}
          {icon && iconPosition === 'right' && (
            <span className={iconClassName}>{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
