
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MessageSquare, Smartphone, Bot, Play, Pause, RotateCcw, 
  Trash2, QrCode, Clock, Activity, AlertTriangle, CheckCircle2
} from "lucide-react";

interface Session {
  id: string;
  name: string;
  platform: string;
  status: string;
  phoneNumber: string;
  activeChats: number;
  totalMessages: number;
  uptime: string;
  lastActivity: string;
  qrCode?: string | null;
}

interface SessionGridProps {
  sessions: Session[];
  selectedSessions: string[];
  onSelectionChange: (selected: string[]) => void;
  /**
   * Handler executado quando o usuário realiza uma ação em uma sessão.
   * A string action pode ser 'start', 'pause', 'restart', 'qr' ou 'delete'.
   */
  onSessionAction?: (sessionId: string, action: string) => void;
}

const platformIcons = {
  whatsapp: "📱",
  telegram: "✈️",
  discord: "🎮",
  instagram: "📸",
  facebook: "📘"
};

const statusColors = {
  connected: "bg-green-100 text-green-800",
  disconnected: "bg-red-100 text-red-800",
  paused: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800"
};

const statusIcons = {
  connected: CheckCircle2,
  disconnected: AlertTriangle,
  paused: Pause,
  error: AlertTriangle
};

export function SessionGrid({ sessions, selectedSessions, onSelectionChange, onSessionAction }: SessionGridProps) {
  const handleSessionSelect = (sessionId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedSessions, sessionId]);
    } else {
      onSelectionChange(selectedSessions.filter(id => id !== sessionId));
    }
  };

  const handleSessionAction = (sessionId: string, action: string) => {
    // Se callback foi passado, executa.
    onSessionAction?.(sessionId, action);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {sessions.map((session) => {
        const StatusIcon = statusIcons[session.status as keyof typeof statusIcons];
        
        return (
          <Card key={session.id} className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedSessions.includes(session.id)}
                    onCheckedChange={(checked) => handleSessionSelect(session.id, checked as boolean)}
                  />
                  <div className="text-2xl">
                    {platformIcons[session.platform as keyof typeof platformIcons] || "🤖"}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{session.name}</CardTitle>
                    <p className="text-sm text-gray-500">{session.phoneNumber}</p>
                  </div>
                </div>
                <Badge className={statusColors[session.status as keyof typeof statusColors]}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {session.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{session.activeChats}</div>
                  <div className="text-xs text-gray-500">Chats Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{session.totalMessages}</div>
                  <div className="text-xs text-gray-500">Mensagens</div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Uptime:</span>
                  <span className="font-medium">{session.uptime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Última atividade:</span>
                  <span className="font-medium">{session.lastActivity}</span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2">
                  {session.status === 'connected' ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSessionAction(session.id, 'pause')}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSessionAction(session.id, 'start')}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleSessionAction(session.id, 'restart')}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>

                  {session.qrCode && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSessionAction(session.id, 'qr')}
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleSessionAction(session.id, 'delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
