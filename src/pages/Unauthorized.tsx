import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

/**
 * Página de acesso negado. Quando o usuário tenta acessar uma rota para a qual
 * não tem permissão, ele é redirecionado para esta página. Aqui oferecemos
 * feedback claro e uma forma de voltar à tela inicial ou dashboard.
 */
const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md">
        <CardHeader className="flex flex-col items-center gap-2">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <CardTitle className="text-xl font-bold">Acesso negado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página. Caso acredite que isto seja um engano, entre em contato com o administrador.</p>
          <Button onClick={() => navigate('/dashboard')}>Voltar para o dashboard</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;