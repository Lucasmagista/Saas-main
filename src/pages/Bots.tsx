import { useState } from 'react';
import { useBotList } from '@/hooks/useBotList';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3002';

export default function Bots() {
  const { data: bots, isLoading, refetch } = useBotList();
  const { toast } = useToast();
  const [loadingBotId, setLoadingBotId] = useState<string | null>(null);
  const [selectedQr, setSelectedQr] = useState<string | null>(null);
  const [selectedLogs, setSelectedLogs] = useState<any[]>([]);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);

  const startBot = async (id: string) => {
    setLoadingBotId(id);
    try {
      const res = await fetch(`${API_BASE}/bots/${id}/start`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao iniciar bot');
      toast({ title: 'Bot iniciado', description: 'Sessão iniciada com sucesso.' });
      if (data.qrcode) {
        setSelectedQr(data.qrcode);
        setShowQrDialog(true);
      }
      await refetch();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingBotId(null);
    }
  };

  const stopBot = async (id: string) => {
    setLoadingBotId(id);
    try {
      const res = await fetch(`${API_BASE}/bots/${id}/stop`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao parar bot');
      toast({ title: 'Bot parado', description: 'Sessão encerrada com sucesso.' });
      await refetch();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingBotId(null);
    }
  };

  const showQr = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/bots/${id}/qrcode`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'QR code não disponível');
      setSelectedQr(data.qrcode);
      setShowQrDialog(true);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const showLogs = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/bots/${id}/logs`);
      const data = await res.json();
      setSelectedLogs(data.logs || []);
      setShowLogsDialog(true);
    } catch (err: any) {
      toast({ title: 'Erro', description: 'Não foi possível carregar logs', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Bots</h1>
            <p className="text-gray-600 mt-1">Importe bots, inicie/pare sessões e visualize logs</p>
          </div>
        </div>
        {isLoading ? (
          <p>Carregando bots...</p>
        ) : !bots || bots.length === 0 ? (
          <p>Nenhum bot cadastrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bots.map((bot) => (
              <Card key={bot.id} className="hover:shadow-md transition-all duration-300">
                <CardHeader>
                  <CardTitle>{bot.name}</CardTitle>
                  <CardDescription>{bot.description || '—'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant={bot.is_active ? 'default' : 'outline'} className={bot.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {bot.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sessão</span>
                    <span className="text-sm text-gray-800">{bot.session_name || bot.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {bot.is_active ? (
                      <Button size="sm" variant="outline" disabled={loadingBotId === bot.id} onClick={() => stopBot(bot.id)}>
                        {loadingBotId === bot.id ? 'Parando...' : 'Parar'}
                      </Button>
                    ) : (
                      <Button size="sm" disabled={loadingBotId === bot.id} onClick={() => startBot(bot.id)}>
                        {loadingBotId === bot.id ? 'Iniciando...' : 'Iniciar'}
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => showQr(bot.id)}>QR Code</Button>
                    <Button size="sm" variant="outline" onClick={() => showLogs(bot.id)}>Logs</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedQr ? (
              <img src={`data:image/png;base64,${selectedQr}`} alt="QR Code" className="mx-auto" />
            ) : (
              <p>QR Code indisponível.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-lg h-[70vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Logs do Bot</DialogTitle>
            <DialogDescription>Eventos recentes desta sessão</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(70vh-5rem)] pr-2">
            {selectedLogs.length === 0 ? (
              <p className="text-sm text-gray-600">Nenhum log registrado.</p>
            ) : (
              <ul className="space-y-2">
                {selectedLogs.map((log: any, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700">
                    <span className="font-medium mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={log.direction === 'sent' ? 'text-blue-600' : 'text-green-600'}>
                      {log.direction === 'sent' ? 'Enviado' : 'Recebido'}
                    </span>
                    : {log.message}
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}