import { forwardRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder: string;
  icon?: LucideIcon;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ id, label, type = 'text', placeholder, icon: Icon, error, disabled, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <div className="relative group">
          {Icon && (
            <Icon
              className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors",
                error ? "text-destructive" : "text-muted-foreground group-focus-within:text-primary"
              )}
            />
          )}
          <Input
            ref={ref}
            id={id}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "transition-all duration-200 focus:ring-2 focus:ring-primary/20",
              Icon && "pl-10",
              type === 'password' && "pr-10",
              error && "border-destructive focus:border-destructive",
              disabled && "opacity-60",
              className
            )}
            {...props}
          />
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                "absolute right-3 top-1/2 transform -translate-y-1/2",
                "text-muted-foreground hover:text-foreground transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm p-0.5",
                disabled && "opacity-60 cursor-not-allowed"
              )}
              disabled={disabled}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthField.displayName = 'AuthField';
