import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthButtonProps {
  type?: 'submit' | 'button';
  isLoading: boolean;
  isSuccess: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  loadingText: string;
  successText: string;
  onClick?: () => void;
}

export const AuthButton = ({
  type = 'submit',
  isLoading,
  isSuccess,
  disabled = false,
  className,
  children,
  loadingText,
  successText,
  onClick,
}: AuthButtonProps) => {
  const isDisabled = isLoading || isSuccess || disabled;

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      );
    }
    
    if (isSuccess) {
      return (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {successText}
        </>
      );
    }
    
    return children;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "w-full px-4 py-2 text-sm font-medium rounded-md",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        !isDisabled && "hover:shadow-lg hover:shadow-primary/25",
        isSuccess ? "bg-green-600 hover:bg-green-600 text-white" : "bg-primary hover:bg-primary/90 text-primary-foreground",
        className
      )}
    >
      {getButtonContent()}
    </button>
  );
};
