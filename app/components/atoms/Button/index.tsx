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
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={style}
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
        cursor-pointer
        ${hoverSwapColors ? 'hover:bg-[#002085] hover:text-white' : ''}
        transition-all
        duration-300
        ease-in-out
      `}
    >
      {icon && iconPosition === 'left' && (
        <span className={iconClassName}>{icon}</span>
      )}
      {text}
      {icon && iconPosition === 'right' && (
        <span className={iconClassName}>{icon}</span>
      )}
    </button>
  );
};

export default Button;
