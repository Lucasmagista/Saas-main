import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Mail, 
  Send, 
  Search, 
  Star,
  Archive,
  Trash2,
  Forward,
  Reply,
  ReplyAll,
  Paperclip,
  Calendar,
  Users,
  Filter,
  Plus,
  Edit,
  Eye,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { FileUploadModal, ScheduleEmailModal } from "@/components/communication/CommunicationModals";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  usage: string;
  openRate: number;
}

interface EmailLog {
  id: string;
  from: string;
  email: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  isStarred?: boolean;
  hasAttachment?: boolean;
  avatar?: string;
  labels: string[];
}

export function EmailCenter() {
  const { toast } = useToast();
  const [selectedEmail, setSelectedEmail] = useState<string | null>("1");
  const [activeTab, setActiveTab] = useState("inbox");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showScheduleEmail, setShowScheduleEmail] = useState(false);

  // Lista de emails (logs) carregada da API
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [emailsError, setEmailsError] = useState<string | null>(null);

  // Carrega logs de emails da API /api/email/logs na montagem
  useEffect(() => {
    const fetchEmails = async () => {
      setLoadingEmails(true);
      setEmailsError(null);
      try {
        const data = await api.get('/api/email/logs');
        setEmails(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        console.error('Erro ao carregar logs de email', err);
        setEmailsError('Erro ao carregar emails');
      } finally {
        setLoadingEmails(false);
      }
    };
    fetchEmails();
  }, []);

  // Estados para templates reais
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Busca templates reais da API
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const data = await api.get('/api/email/templates');
        setTemplates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao carregar templates:', err);
        // Em caso de erro, mostra que não há templates
        setTemplates([]);
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  const sendEmail = (templateName?: string) => {
    toast({
      title: templateName ? "Template enviado" : "Email enviado",
      description: templateName 
        ? `Template "${templateName}" foi enviado com sucesso.`
        : "Seu email foi enviado com sucesso.",
    });
  };

  const selectedEmailData = emails.find(e => e.id === selectedEmail);

  return (
    <>
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="inbox">Caixa de Entrada</TabsTrigger>
        <TabsTrigger value="compose">Redigir</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      {/* Inbox */}
      <TabsContent value="inbox">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          {/* Email List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Emails</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Archive className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar emails..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[550px]">
                <div className="space-y-1 p-3">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedEmail === email.id 
                          ? "bg-accent" 
                          : "hover:bg-muted/50"
                      } ${!email.isRead ? "border-l-4 border-l-primary" : ""}`}
                      onClick={() => setSelectedEmail(email.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={email.avatar} />
                          <AvatarFallback>
                            {email.from.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm truncate ${!email.isRead ? "font-semibold" : "font-medium"}`}>
                              {email.from}
                            </h4>
                            <div className="flex items-center gap-1">
                              {email.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                              {email.hasAttachment && <Paperclip className="w-3 h-3 text-muted-foreground" />}
                              <span className="text-xs text-muted-foreground">{email.timestamp}</span>
                            </div>
                          </div>
                          <p className={`text-sm truncate mt-1 ${!email.isRead ? "font-medium" : "text-muted-foreground"}`}>
                            {email.subject}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {email.preview}
                          </p>
                          <div className="flex gap-1 mt-2">
                            {email.labels.map((label, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs px-1 py-0">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Email View */}
          <Card className="lg:col-span-2">
            {selectedEmailData ? (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedEmailData.avatar} />
                        <AvatarFallback>
                          {selectedEmailData.from.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedEmailData.from}</h3>
                        <p className="text-sm text-muted-foreground">{selectedEmailData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Reply className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ReplyAll className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Forward className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Archive className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">{selectedEmailData.subject}</h2>
                    <p className="text-sm text-muted-foreground">{selectedEmailData.timestamp}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed">
                      Olá equipe,<br/><br/>
                      Espero que estejam todos bem. Estou entrando em contato para solicitar ajuda com a integração do Stripe em nossa plataforma.
                      <br/><br/>
                      Estou seguindo a documentação fornecida, mas encontrei alguns obstáculos durante o processo de configuração. Especificamente, estou tendo dificuldades com:
                      <br/><br/>
                      1. Configuração das chaves de API<br/>
                      2. Implementação dos webhooks<br/>
                      3. Testes de pagamento em ambiente sandbox
                      <br/><br/>
                      Agradeço qualquer orientação que possam fornecer.
                      <br/><br/>
                      Atenciosamente,<br/>
                      Ana Silva
                    </p>
                    {selectedEmailData.hasAttachment && (
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">anexo-integracao.pdf</span>
                          <Button variant="ghost" size="sm">
                            Baixar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Selecione um email</h3>
                  <p className="text-muted-foreground">
                    Escolha um email da lista para visualizar seu conteúdo
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </TabsContent>

      {/* Compose */}
      <TabsContent value="compose">
        <Card>
          <CardHeader>
            <CardTitle>Redigir Email</CardTitle>
            <CardDescription>Crie e envie um novo email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Para:</label>
                <Input placeholder="destinatario@email.com" />
              </div>
              <div>
                <label className="text-sm font-medium">CC:</label>
                <Input placeholder="cc@email.com (opcional)" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Assunto:</label>
              <Input placeholder="Assunto do email" />
            </div>
            <div>
              <label className="text-sm font-medium">Mensagem:</label>
              <Textarea 
                placeholder="Digite sua mensagem aqui..." 
                className="min-h-[200px]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFileUpload(true)}
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Anexar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowScheduleEmail(true)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">Salvar Rascunho</Button>
                <Button onClick={() => sendEmail()}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Templates */}
      <TabsContent value="templates">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Templates de Email</h3>
              <p className="text-muted-foreground">Gerencie seus templates de comunicação</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Template
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.subject}</p>
                    </div>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Uso</p>
                      <p className="font-medium">{template.usage}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taxa Abertura</p>
                      <p className="font-medium text-primary">{template.openRate}%</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => sendEmail(template.name)}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Usar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>

      {/* Analytics */}
      <TabsContent value="analytics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Emails Enviados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-2">2,456</div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% este mês
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Taxa de Abertura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-2">68.5%</div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5% este mês
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Taxa de Clique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-2">24.3%</div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8% este mês
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>

    {/* Modals */}
    <FileUploadModal open={showFileUpload} onOpenChange={setShowFileUpload} />
    <ScheduleEmailModal open={showScheduleEmail} onOpenChange={setShowScheduleEmail} />
    </>
  );
}