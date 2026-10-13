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
  type?: 'button' | 'submit';
}

/** Botão no padrão MK Ponto: cantos de 10px, peso 700, sem animação de escala. */
const Button = ({
  text,
  backgroundColor = 'bg-primary',
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
  type = 'button',
}: ButtonProps) => {
  const primario = backgroundColor === 'bg-primary';
  return (
    <button
      type={type}
      onClick={onClick}
      style={style}
      disabled={disabled || isLoading}
      className={`
        ${backgroundColor}
        ${textColor}
        flex min-h-11 items-center justify-center gap-2 rounded-[10px] py-2.5 text-sm font-bold
        transition-colors
        ${primario ? 'hover:bg-primary-dark' : 'hover:brightness-95'}
        ${fullWidth ? 'w-full' : 'w-auto px-4'}
        ${(disabled || isLoading) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${hoverSwapColors ? 'hover:bg-primary hover:text-white' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
          <span>Carregando…</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className={iconClassName}>{icon}</span>}
          {text}
          {icon && iconPosition === 'right' && <span className={iconClassName}>{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
