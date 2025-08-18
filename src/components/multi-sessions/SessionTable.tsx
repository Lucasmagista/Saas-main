
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Play, Pause, RotateCcw, Trash2, QrCode, 
  AlertTriangle, CheckCircle2, Clock
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

interface SessionTableProps {
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

export function SessionTable({ sessions, selectedSessions, onSelectionChange, onSessionAction }: SessionTableProps) {
  const handleSessionSelect = (sessionId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedSessions, sessionId]);
    } else {
      onSelectionChange(selectedSessions.filter(id => id !== sessionId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(sessions.map(s => s.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSessionAction = (sessionId: string, action: string) => {
    onSessionAction?.(sessionId, action);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedSessions.length === sessions.length}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Sessão</TableHead>
            <TableHead>Plataforma</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Chats Ativos</TableHead>
            <TableHead>Mensagens</TableHead>
            <TableHead>Uptime</TableHead>
            <TableHead>Última Atividade</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => {
            const StatusIcon = statusIcons[session.status as keyof typeof statusIcons];
            
            return (
              <TableRow key={session.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedSessions.includes(session.id)}
                    onCheckedChange={(checked) => handleSessionSelect(session.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{session.name}</div>
                    <div className="text-sm text-gray-500">{session.phoneNumber}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {platformIcons[session.platform as keyof typeof platformIcons] || "🤖"}
                    </span>
                    <span className="capitalize">{session.platform}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[session.status as keyof typeof statusColors]}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {session.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{session.activeChats}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="font-bold text-green-600">{session.totalMessages}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-sm">{session.uptime}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500">{session.lastActivity}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 justify-end">
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

                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleSessionAction(session.id, 'delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
