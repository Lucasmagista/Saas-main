import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus,
  Send,
  FileText,
  Copy,
  Edit,
  Trash2,
  Users,
  Calendar,
  Clock,
  Video,
  Phone,
  Settings,
  QrCode,
  Upload,
  Download,
  Star,
  Smile,
  Paperclip,
  Mic,
  Camera,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Modal de Nova Conversa
export function NewConversationModal({ open, onOpenChange }: ModalProps) {
  const { toast } = useToast();
  const [type, setType] = useState("whatsapp");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");

  const createConversation = () => {
    if (!contact.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um contato válido.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Conversa criada",
      description: `Nova conversa ${type} iniciada com ${contact}`,
    });
    onOpenChange(false);
    setContact("");
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Conversa</DialogTitle>
          <DialogDescription>
            Inicie uma nova conversa via WhatsApp, Email ou Chamada
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="type">Tipo de Comunicação</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="call">Chamada</SelectItem>
                <SelectItem value="video">Videochamada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="contact">
              {type === "whatsapp" || type === "call" || type === "video" ? "Telefone" : "Email"}
            </Label>
            <Input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={
                type === "whatsapp" || type === "call" || type === "video" 
                  ? "+55 11 99999-9999" 
                  : "contato@empresa.com"
              }
            />
          </div>
          {(type === "whatsapp" || type === "email") && (
            <div>
              <Label htmlFor="message">Mensagem Inicial (opcional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="min-h-[80px]"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={createConversation}>
            {type === "call" || type === "video" ? "Iniciar Chamada" : "Criar Conversa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Modal de QR Code WhatsApp
export function QRCodeModal({ open, onOpenChange }: ModalProps) {
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvZGUgUVI8L3RleHQ+Cjwvc3ZnPg==");

  const refreshQRCode = () => {
    toast({
      title: "QR Code renovado",
      description: "Um novo QR Code foi gerado.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>QR Code WhatsApp</DialogTitle>
          <DialogDescription>
            Escaneie este código com o WhatsApp para conectar
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="bg-white p-4 rounded-lg border">
            <img src={qrCode} alt="QR Code" className="w-48 h-48" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Código expira em: <strong>15:32</strong>
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm">Aguardando conexão...</span>
            </div>
          </div>
          <Button variant="outline" onClick={refreshQRCode} className="w-full">
            <QrCode className="w-4 h-4 mr-2" />
            Gerar Novo Código
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Modal de Templates WhatsApp
export function WhatsAppTemplatesModal({ open, onOpenChange }: ModalProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = [
    {
      id: "1",
      name: "Boas-vindas",
      message: "Olá {{nome}}! Bem-vindo ao nosso atendimento. Como posso ajudar?",
      category: "Atendimento",
      usage: 156
    },
    {
      id: "2", 
      name: "Agendamento",
      message: "Olá! Gostaria de agendar uma reunião para {{data}} às {{hora}}?",
      category: "Agendamento",
      usage: 89
    },
    {
      id: "3",
      name: "Follow-up",
      message: "Oi {{nome}}! Como está andando o projeto? Precisa de alguma ajuda?",
      category: "Vendas",
      usage: 234
    },
    {
      id: "4",
      name: "Suporte Técnico",
      message: "Recebi seu relato sobre o problema. Vou investigar e retorno em breve.",
      category: "Suporte",
      usage: 67
    }
  ];

  const useTemplate = (template: any) => {
    toast({
      title: "Template aplicado",
      description: `Template "${template.name}" foi inserido na conversa.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Templates WhatsApp</DialogTitle>
          <DialogDescription>
            Escolha um template para usar na conversa
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate === template.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    {template.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {template.usage} usos
                    </span>
                    <Button size="sm" onClick={() => useTemplate(template)}>
                      <Send className="w-3 h-3 mr-1" />
                      Usar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Modal de Upload de Arquivo
export function FileUploadModal({ open, onOpenChange }: ModalProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um arquivo.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    // Simular upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Arquivo enviado",
      description: `${files.length} arquivo(s) enviado(s) com sucesso.`,
    });
    
    setUploading(false);
    onOpenChange(false);
    setFiles(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Arquivo</DialogTitle>
          <DialogDescription>
            Selecione arquivos para enviar na conversa
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" size="sm" asChild>
                <span>Selecionar Arquivos</span>
              </Button>
            </label>
          </div>
          
          {files && files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Arquivos selecionados:</h4>
              {Array.from(files).map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleFileUpload} disabled={uploading}>
            {uploading ? "Enviando..." : "Enviar Arquivo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Modal de Agendamento de Email
export function ScheduleEmailModal({ open, onOpenChange }: ModalProps) {
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");

  const scheduleEmail = () => {
    if (!date || !time) {
      toast({
        title: "Erro",
        description: "Por favor, selecione data e horário.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Email agendado",
      description: `Email será enviado em ${date} às ${time}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Agendar Email</DialogTitle>
          <DialogDescription>
            Defina quando este email deve ser enviado
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="time">Horário</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="timezone">Fuso Horário</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                <SelectItem value="America/New_York">Nova York (UTC-5)</SelectItem>
                <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={scheduleEmail}>
            <Calendar className="w-4 h-4 mr-2" />
            Agendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Modal de Videochamada
export function VideoCallModal({ open, onOpenChange }: ModalProps) {
  const { toast } = useToast();
  const [roomName, setRoomName] = useState("");
  const [participants, setParticipants] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const startVideoCall = () => {
    if (!roomName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, defina um nome para a sala.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Videochamada iniciada",
      description: `Sala "${roomName}" criada com sucesso.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Videochamada</DialogTitle>
          <DialogDescription>
            Configure e inicie uma videochamada
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="roomName">Nome da Sala</Label>
            <Input
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Ex: Reunião de Vendas"
            />
          </div>
          <div>
            <Label htmlFor="participants">Participantes (emails)</Label>
            <Textarea
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="email1@empresa.com, email2@empresa.com"
              className="min-h-[80px]"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Gravar reunião</h4>
              <p className="text-xs text-muted-foreground">
                A gravação será salva automaticamente
              </p>
            </div>
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? <Mic className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={startVideoCall}>
            <Video className="w-4 h-4 mr-2" />
            Iniciar Chamada
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}