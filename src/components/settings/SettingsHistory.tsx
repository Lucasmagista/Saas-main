
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { History, User, Clock, Settings } from "lucide-react";
import { SettingsHistory } from "@/hooks/useSettings";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SettingsHistoryProps {
  history: SettingsHistory[];
}

export function SettingsHistoryComponent({ history }: SettingsHistoryProps) {
  const getSectionColor = (section: string) => {
    switch (section) {
      case 'Empresa':
        return 'bg-blue-100 text-blue-800';
      case 'Geral':
        return 'bg-green-100 text-green-800';
      case 'Segurança':
        return 'bg-red-100 text-red-800';
      case 'Notificações':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatChanges = (changes: Record<string, string | number | boolean>) => {
    return Object.entries(changes).map(([key, value]) => (
      <div key={key} className="text-xs text-muted-foreground">
        <span className="font-medium">{key}:</span> {String(value).substring(0, 50)}
        {String(value).length > 50 && '...'}
      </div>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Histórico de Alterações
        </CardTitle>
        <CardDescription>
          Acompanhe todas as mudanças realizadas nas configurações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma alteração registrada ainda</p>
              </div>
            ) : (
              history.map((entry, index) => (
                <div key={entry.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getSectionColor(entry.section)}>
                          {entry.section}
                        </Badge>
                        <span className="font-medium text-sm">{entry.action}</span>
                      </div>
                      
                      <div className="space-y-1">
                        {formatChanges(entry.changes)}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {entry.user}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(entry.timestamp, {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {index < history.length - 1 && <Separator className="mt-4" />}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        {history.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm">
              Ver Histórico Completo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
