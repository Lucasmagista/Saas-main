import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Spinner mostra um ícone de carregamento animado. Pode ser usado no
 * lugar de textos como "Carregando..." em seções da aplicação que
 * dependem de dados assíncronos. Aceita classes adicionais para ajustar
 * tamanho e cor conforme o contexto em que for utilizado.
 */
interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

const Spinner: React.FC<SpinnerProps> = ({ className, ...props }) => (
  <div className={cn('flex items-center justify-center', className)} {...props}>
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

export default Spinner;