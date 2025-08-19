import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, Zap, Shield, ExternalLink, Copy, RefreshCw, Trash2, Plus, Settings, Activity, FileText, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const IntegrationsSettings = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState([
    // Sem chaves API iniciais - usuário deve criar suas próprias chaves
  ]);

  const [webhooks, setWebhooks] = useState([
    // Sem webhooks iniciais - usuário deve configurar seus próprios webhooks
  ]);

  const [integrations, setIntegrations] = useState([
    { 
      id: 1, 
      name: "Slack", 
      description: "Comunicação em equipe", 
      status: "disconnected", 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52-2.523A2.528 2.528 0 0 1 5.042 10.12h2.52v2.522a2.528 2.528 0 0 1-2.52 2.523Zm0 0a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165v-6.734a2.528 2.528 0 0 1 2.522-2.523 2.528 2.528 0 0 1 2.52 2.523v6.734ZM8.837 15.165a2.528 2.528 0 0 1 2.523-2.523 2.528 2.528 0 0 1 2.52 2.523v2.52a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.523-2.523v-2.52Zm6.741-6.757a2.528 2.528 0 0 1 2.523-2.52A2.528 2.528 0 0 1 20.623 8.41v2.52h-2.52a2.528 2.528 0 0 1-2.523-2.522Zm0 0a2.528 2.528 0 0 1-2.523-2.52A2.528 2.528 0 0 1 15.578 3.36h6.734a2.528 2.528 0 0 1 2.523 2.523 2.528 2.528 0 0 1-2.523 2.52h-6.734Z"/></svg>,
      config: {} 
    },
    { 
      id: 2, 
      name: "Google Workspace", 
      description: "Produtividade e colaboração", 
      status: "disconnected", 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
      config: {} 
    },
    { 
      id: 3, 
      name: "Trello", 
      description: "Gerenciamento de projetos", 
      status: "disconnected", 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0079BF"><path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.657 1.343 3 3 3h18c1.657 0 3-1.343 3-3V3c0-1.657-1.343-3-3-3zM10.5 18.5c0 .828-.672 1.5-1.5 1.5H6c-.828 0-1.5-.672-1.5-1.5V6c0-.828.672-1.5 1.5-1.5h3c.828 0 1.5.672 1.5 1.5v12.5zm9-4c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V6c0-.828.672-1.5 1.5-1.5h3c.828 0 1.5.672 1.5 1.5v8.5z"/></svg>,
      config: {} 
    },
    { 
      id: 4, 
      name: "GitHub", 
      description: "Controle de versão", 
      status: "disconnected", 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>,
      config: {} 
    },
    { 
      id: 5, 
      name: "Stripe", 
      description: "Pagamentos online", 
      status: "disconnected", 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#635BFF"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305h0z"/></svg>,
      config: {} 
    },
    { 
      id: 6, 
      name: "Zoom", 
      description: "Videoconferências", 
      status: "disconnected", 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#2D8CFF"><path d="M21.546 8.441c-.81 0-1.465.654-1.465 1.465 0 0 0 4.094 0 4.094 0 .81.654 1.465 1.465 1.465s1.465-.654 1.465-1.465V9.906c0-.81-.654-1.465-1.465-1.465zm-19.586 0c-.81 0-1.465.654-1.465 1.465v4.094c0 .81.654 1.465 1.465 1.465s1.465-.654 1.465-1.465V9.906c0-.81-.654-1.465-1.465-1.465zm15.707-4.441H6.333c-1.621 0-2.932 1.311-2.932 2.932v10.136c0 1.621 1.311 2.932 2.932 2.932h11.334c1.621 0 2.932-1.311 2.932-2.932V6.932c0-1.621-1.311-2.932-2.932-2.932zM16 13l-4.5-2.25v4.5L16 13z"/></svg>,
      config: {} 
    },
    { 
      id: 7, 
      name: "Microsoft Teams", 
      description: "Colaboração empresarial", 
      status: "disconnected", 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#5059C9"><path d="M20.875 8.625A3.13 3.13 0 0 0 24 5.625V3.125A3.13 3.13 0 0 0 20.875 0H16.25a3.13 3.13 0 0 0-3.125 3.125v.875h-2.25v-.875A3.13 3.13 0 0 0 7.75 0H3.125A3.13 3.13 0 0 0 0 3.125v13.75A3.13 3.13 0 0 0 3.125 20h4.625A3.13 3.13 0 0 0 10.875 16.875v-.875h2.25v.875A3.13 3.13 0 0 0 16.25 20h4.625A3.13 3.13 0 0 0 24 16.875V12.25a3.13 3.13 0 0 0-3.125-3.125zm-14 5.5H5.25v-1.75h1.625v1.75zm0-3.25H5.25v-1.75h1.625v1.75zm0-3.25H5.25V6h1.625v1.625zm3.25 6.5H8.5v-1.75h1.625v1.75zm0-3.25H8.5v-1.75h1.625v1.75zm0-3.25H8.5V6h1.625v1.625zm7.75 6.5h-1.625v-1.75h1.625v1.75zm0-3.25h-1.625v-1.75h1.625v1.75zm0-3.25h-1.625V6h1.625v1.625zm3.25 6.5h-1.625v-1.75h1.625v1.75zm0-3.25h-1.625v-1.75h1.625v1.75z"/></svg>,
      config: {} 
    },
    { 
      id: 8, 
      name: "Salesforce", 
      description: "CRM e vendas", 
      status: "disconnected", 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#00A1E0"><path d="M8.5 11.25a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0-4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/><path d="M12 3.75c-4.414 0-8 3.586-8 8s3.586 8 8 8 8-3.586 8-8-3.586-8-8-8zm0 15c-3.859 0-7-3.141-7-7s3.141-7 7-7 7 3.141 7 7-3.141 7-7 7z"/><path d="M16.5 12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zm-6 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0z"/></svg>,
      config: {} 
    },
    { 
      id: 9, 
      name: "WhatsApp Business", 
      description: "Mensagens comerciais", 
      status: "disconnected", 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.064 3.488"/></svg>,
      config: {} 
    },
    { 
      id: 10, 
      name: "Discord", 
      description: "Comunidades e chat", 
      status: "disconnected", 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/></svg>,
      config: {} 
    },
    { 
      id: 11, 
      name: "Notion", 
      description: "Workspace e documentação", 
      status: "disconnected", 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.336.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.61c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z"/></svg>,
      config: {} 
    },
    { 
      id: 12, 
      name: "Asana", 
      description: "Gestão de tarefas", 
      status: "disconnected", 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#F06A6A"><path d="M18.78 12.653c-1.673 0-3.07 1.098-3.648 2.61h-6.264c-.578-1.512-1.975-2.61-3.648-2.61C2.447 12.653 0 15.1 0 18.326S2.447 24 5.22 24c1.673 0 3.07-1.098 3.648-2.61h6.264c.578 1.512 1.975 2.61 3.648 2.61 2.773 0 5.22-2.447 5.22-5.674s-2.447-5.673-5.22-5.673zM5.22 21.39c-1.673 0-3.07-1.098-3.648-2.61h6.264c.578 1.512 1.975 2.61 3.648 2.61-2.773 0-5.22-2.447-5.22-5.674s2.447-5.673 5.22-5.673c1.673 0 3.07 1.098 3.648 2.61H8.868c-.578-1.512-1.975-2.61-3.648-2.61C2.447 9.043 0 11.49 0 14.716s2.447 5.674 5.22 5.674zm8.34-10.737c1.673 0 3.07-1.098 3.648-2.61h6.264c.578 1.512 1.975 2.61 3.648 2.61-2.773 0-5.22-2.447-5.22-5.674S21.007 0 23.78 0c1.673 0 3.07 1.098 3.648 2.61H21.164c-.578-1.512-1.975-2.61-3.648-2.61C14.743 0 12.296 2.447 12.296 5.674s2.447 5.673 5.22 5.673z"/></svg>,
      config: {} 
    }
  ]);

  const [showAddApiKey, setShowAddApiKey] = useState(false);
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [showIntegrationConfig, setShowIntegrationConfig] = useState(false);
  const [showApiDocs, setShowApiDocs] = useState(false);
  const [configuringIntegration, setConfiguringIntegration] = useState(null);
  const [newApiKey, setNewApiKey] = useState({ name: "", permissions: [], expires: "" });
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: [] });
  const [testingConnection, setTestingConnection] = useState(false);

  const generateApiKey = () => {
    if (!newApiKey.name || newApiKey.permissions.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const key = `sk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const apiKey = {
      id: apiKeys.length + 1,
      name: newApiKey.name,
      key: key,
      masked: `${key.slice(0, 8)}••••••••••••${key.slice(-4)}`,
      created: new Date().toLocaleDateString('pt-BR'),
      lastUsed: "Nunca",
      permissions: newApiKey.permissions,
      expires: newApiKey.expires
    };

    setApiKeys([...apiKeys, apiKey]);
    setNewApiKey({ name: "", permissions: [], expires: "" });
    setShowAddApiKey(false);
    
    toast({
      title: "Chave API gerada",
      description: `${apiKey.name} foi criada com sucesso.`,
    });
  };

  const revokeApiKey = (id: number) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    toast({
      title: "Chave revogada",
      description: "A chave API foi revogada permanentemente.",
      variant: "destructive",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Chave copiada para a área de transferência.",
    });
  };

  const toggleIntegration = (id: number) => {
    const integration = integrations.find(i => i.id === id);
    
    if (integration?.status === "connected") {
      // Desconectar - apenas remove a conexão
      setIntegrations(integrations.map(int =>
        int.id === id
          ? { ...int, status: "disconnected", config: {} }
          : int
      ));
      
      toast({
        title: "Integração desconectada",
        description: `${integration.name} foi desconectada com sucesso.`,
      });
    } else {
      // Conectar - abrir modal de configuração primeiro
      setConfiguringIntegration({ ...integration });
      setShowIntegrationConfig(true);
    }
  };

  const configureIntegration = (integration) => {
    setConfiguringIntegration({ ...integration });
    setShowIntegrationConfig(true);
  };

  const saveIntegrationConfig = () => {
    if (!configuringIntegration) return;

    // Validar se os campos necessários estão preenchidos
    const requiredFields = getRequiredFields(configuringIntegration.name);
    const missingFields = requiredFields.filter(field => 
      !configuringIntegration.config[field] || configuringIntegration.config[field].trim() === ''
    );

    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: `Preencha todos os campos: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Atualizar integração com status conectado e configurações
    setIntegrations(integrations.map(integration =>
      integration.id === configuringIntegration.id
        ? { 
            ...integration, 
            config: configuringIntegration.config,
            status: "connected",
            connectedAt: new Date().toISOString()
          }
        : integration
    ));

    setConfiguringIntegration(null);
    setShowIntegrationConfig(false);

    toast({
      title: "Integração conectada",
      description: `${configuringIntegration.name} foi conectada com sucesso!`
    });
  };

  // Função auxiliar para definir campos obrigatórios por integração
  const getRequiredFields = (integrationName: string): string[] => {
    const fieldMap: { [key: string]: string[] } = {
      "Slack": ["webhook_url", "bot_token"],
      "Google Workspace": ["client_id", "client_secret"],
      "Trello": ["api_key", "token"],
      "GitHub": ["access_token"],
      "Stripe": ["secret_key", "publishable_key"],
      "Zoom": ["api_key", "api_secret"],
      "Microsoft Teams": ["tenant_id", "client_id", "client_secret"],
      "Salesforce": ["username", "password", "security_token"],
      "WhatsApp Business": ["phone_number", "access_token"],
      "Discord": ["bot_token"],
      "Notion": ["access_token"],
      "Asana": ["access_token"]
    };
    return fieldMap[integrationName] || ["api_key"];
  };

  // Função auxiliar para obter campos de configuração por integração
  const getConfigFields = (integrationName: string) => {
    const configMap: { [key: string]: Array<{key: string, label: string, type: string, placeholder: string}> } = {
      "Slack": [
        { key: "webhook_url", label: "Webhook URL", type: "url", placeholder: "https://hooks.slack.com/services/..." },
        { key: "bot_token", label: "Bot Token", type: "password", placeholder: "xoxb-..." },
        { key: "channel", label: "Canal Padrão", type: "text", placeholder: "#geral" }
      ],
      "Google Workspace": [
        { key: "client_id", label: "Client ID", type: "text", placeholder: "Client ID do Google" },
        { key: "client_secret", label: "Client Secret", type: "password", placeholder: "Client Secret" },
        { key: "domain", label: "Domínio", type: "text", placeholder: "exemplo.com" }
      ],
      "Trello": [
        { key: "api_key", label: "API Key", type: "password", placeholder: "Chave da API do Trello" },
        { key: "token", label: "Token", type: "password", placeholder: "Token de acesso" },
        { key: "board_id", label: "Board ID", type: "text", placeholder: "ID do quadro padrão" }
      ],
      "GitHub": [
        { key: "access_token", label: "Personal Access Token", type: "password", placeholder: "ghp_..." },
        { key: "organization", label: "Organização", type: "text", placeholder: "nome-da-org" }
      ],
      "Stripe": [
        { key: "secret_key", label: "Secret Key", type: "password", placeholder: "sk_..." },
        { key: "publishable_key", label: "Publishable Key", type: "text", placeholder: "pk_..." },
        { key: "webhook_secret", label: "Webhook Secret", type: "password", placeholder: "whsec_..." }
      ],
      "Zoom": [
        { key: "api_key", label: "API Key", type: "password", placeholder: "Chave da API" },
        { key: "api_secret", label: "API Secret", type: "password", placeholder: "Secret da API" }
      ],
      "Microsoft Teams": [
        { key: "tenant_id", label: "Tenant ID", type: "text", placeholder: "ID do tenant" },
        { key: "client_id", label: "Client ID", type: "text", placeholder: "ID da aplicação" },
        { key: "client_secret", label: "Client Secret", type: "password", placeholder: "Secret da aplicação" }
      ],
      "Salesforce": [
        { key: "username", label: "Username", type: "email", placeholder: "usuario@empresa.com" },
        { key: "password", label: "Password", type: "password", placeholder: "Senha" },
        { key: "security_token", label: "Security Token", type: "password", placeholder: "Token de segurança" }
      ],
      "WhatsApp Business": [
        { key: "phone_number", label: "Número de Telefone", type: "tel", placeholder: "+5511999999999" },
        { key: "access_token", label: "Access Token", type: "password", placeholder: "Token de acesso" },
        { key: "webhook_verify_token", label: "Webhook Verify Token", type: "password", placeholder: "Token de verificação" }
      ],
      "Discord": [
        { key: "bot_token", label: "Bot Token", type: "password", placeholder: "Token do bot" },
        { key: "guild_id", label: "Server ID", type: "text", placeholder: "ID do servidor" }
      ],
      "Notion": [
        { key: "access_token", label: "Integration Token", type: "password", placeholder: "secret_..." },
        { key: "database_id", label: "Database ID", type: "text", placeholder: "ID do banco de dados" }
      ],
      "Asana": [
        { key: "access_token", label: "Personal Access Token", type: "password", placeholder: "Token de acesso pessoal" },
        { key: "workspace_id", label: "Workspace ID", type: "text", placeholder: "ID do workspace" }
      ]
    };
    return configMap[integrationName] || [
      { key: "api_key", label: "API Key", type: "password", placeholder: "Chave da API" }
    ];
  };

  // Função para testar conexão com a integração
  const testConnection = async (integration: { name: string; config: Record<string, string> }) => {
    setTestingConnection(true);
    
    toast({
      title: "Testando conexão",
      description: `Verificando conectividade com ${integration.name}...`
    });

    // Simular teste de conexão
    setTimeout(() => {
      // Validação básica dos campos
      const requiredFields = getRequiredFields(integration.name);
      const missingFields = requiredFields.filter(field => 
        !integration.config[field] || integration.config[field].trim() === ''
      );

      if (missingFields.length > 0) {
        toast({
          title: "Campos obrigatórios",
          description: `Preencha os campos: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        setTestingConnection(false);
        return;
      }

      // Simulação de diferentes resultados baseados na integração
      const success = Math.random() > 0.3; // 70% de chance de sucesso
      
      if (success) {
        toast({
          title: "Conexão bem-sucedida",
          description: `${integration.name} está respondendo corretamente.`,
        });
      } else {
        toast({
          title: "Falha na conexão",
          description: `Verifique as credenciais de ${integration.name}. Erro de autenticação.`,
          variant: "destructive"
        });
      }
      
      setTestingConnection(false);
    }, 2000);
  };

  const addWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const webhook = {
      id: webhooks.length + 1,
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      status: "active"
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: "", url: "", events: [] });
    setShowAddWebhook(false);

    toast({
      title: "Webhook criado",
      description: `${webhook.name} foi criado com sucesso`
    });
  };

  const testWebhook = (webhook: { name: string }) => {
    toast({
      title: "Testando webhook",
      description: `Enviando teste para ${webhook.name}...`
    });

    // Simula teste
    setTimeout(() => {
      toast({
        title: "Webhook testado",
        description: `Teste enviado para ${webhook.name}. Verifique os logs.`,
      });
    }, 2000);
  };

  const configureWebhook = (webhook: { name: string }) => {
    // Implementa configuração do webhook
    toast({
      title: "Configurando webhook",
      description: `Abrindo configurações para ${webhook.name}`
    });
  };

  const deleteWebhook = (id) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    toast({
      title: "Webhook removido",
      description: "Webhook foi removido com sucesso"
    });
  };

  const openApiDocs = (docType) => {
    setShowApiDocs(true);
    toast({
      title: "Abrindo documentação",
      description: `Carregando ${docType}...`
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="api-keys">Chaves API</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        {/* Integrações */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Integrações Disponíveis
              </CardTitle>
              <CardDescription>Conecte com suas ferramentas favoritas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{integration.icon}</div>
                        <div>
                          <h4 className="font-medium">{integration.name}</h4>
                          <p className="text-sm text-gray-600">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={integration.status === "connected" ? "default" : "secondary"}
                          className={integration.status === "connected" ? "bg-green-100 text-green-800" : ""}
                        >
                          {integration.status === "connected" ? "Conectado" : "Desconectado"}
                        </Badge>
                        {integration.status === "connected" && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    
                    {integration.status === "connected" && integration.connectedAt && (
                      <div className="space-y-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <h5 className="text-sm font-medium text-green-800">Conectado com sucesso</h5>
                        </div>
                        <p className="text-xs text-green-600">
                          Conectado em: {new Date(integration.connectedAt).toLocaleString('pt-BR')}
                        </p>
                        {Object.keys(integration.config).length > 0 && (
                          <div className="space-y-1">
                            <h6 className="text-xs font-medium text-green-700">Configurações:</h6>
                            <div className="grid grid-cols-1 gap-1 text-xs">
                              {Object.entries(integration.config).map(([key, value]) => {
                                const getDisplayValue = (configKey: string, configValue: any): string => {
                                  if (typeof configValue === 'boolean') {
                                    return configValue ? 'Ativado' : 'Desativado';
                                  }
                                  if (configKey.includes('token') || configKey.includes('secret') || configKey.includes('password')) {
                                    return '••••••••';
                                  }
                                  if (configValue === null || configValue === undefined) {
                                    return '';
                                  }
                                  return String(configValue);
                                };

                                return (
                                  <div key={key} className="flex justify-between">
                                    <span className="capitalize text-green-600">{key.replace('_', ' ')}:</span>
                                    <span className="font-medium text-green-800">
                                      {getDisplayValue(key, value)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        variant={integration.status === "connected" ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleIntegration(integration.id)}
                        className="flex-1"
                      >
                        {integration.status === "connected" ? "Desconectar" : "Conectar"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => configureIntegration(integration)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chaves API */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Chaves de API
                  </CardTitle>
                  <CardDescription>Gerencie suas chaves de acesso à API</CardDescription>
                </div>
                <Dialog open={showAddApiKey} onOpenChange={setShowAddApiKey}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Chave
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Gerar Nova Chave API</DialogTitle>
                      <DialogDescription>Configure uma nova chave de API</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="key-name">Nome da Chave</Label>
                        <Input
                          id="key-name"
                          value={newApiKey.name}
                          onChange={(e) => setNewApiKey({...newApiKey, name: e.target.value})}
                          placeholder="Ex: Chave de Produção"
                        />
                      </div>
                      <div>
                        <Label>Permissões</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['read', 'write', 'delete', 'admin'].map(permission => (
                            <Button
                              key={permission}
                              variant={newApiKey.permissions.includes(permission) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                const newPermissions = newApiKey.permissions.includes(permission)
                                  ? newApiKey.permissions.filter(p => p !== permission)
                                  : [...newApiKey.permissions, permission];
                                setNewApiKey({...newApiKey, permissions: newPermissions});
                              }}
                            >
                              {permission.charAt(0).toUpperCase() + permission.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="key-expires">Data de Expiração</Label>
                        <Input
                          id="key-expires"
                          type="date"
                          value={newApiKey.expires}
                          onChange={(e) => setNewApiKey({...newApiKey, expires: e.target.value})}
                        />
                      </div>
                      <Button onClick={generateApiKey} className="w-full">
                        Gerar Chave API
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>Criado: {apiKey.created}</span>
                          <span>Último uso: {apiKey.lastUsed}</span>
                          {apiKey.permissions && (
                            <div className="flex gap-1">
                              {apiKey.permissions.map(perm => (
                                <Badge key={perm} variant="outline" className="text-xs">
                                  {perm}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key + "exemplo_completo")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revogar chave API?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. A chave será permanentemente revogada.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => revokeApiKey(apiKey.id)}>
                                Revogar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded font-mono text-sm break-all">
                      {apiKey.masked}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documentação da API */}
          <Card>
            <CardHeader>
              <CardTitle>Documentação da API</CardTitle>
              <CardDescription>Aprenda como usar nossa API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Guia de Início Rápido</h4>
                  <p className="text-sm text-gray-600 mb-3">Comece a usar nossa API em poucos minutos</p>
                  <Button variant="outline" size="sm" onClick={() => openApiDocs('Guia de Início Rápido')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Guia
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Referência da API</h4>
                  <p className="text-sm text-gray-600 mb-3">Documentação completa de todos os endpoints</p>
                  <Button variant="outline" size="sm" onClick={() => openApiDocs('Referência da API')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Referência
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>Configure endpoints para receber eventos em tempo real</CardDescription>
                </div>
                <Dialog open={showAddWebhook} onOpenChange={setShowAddWebhook}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Webhook</DialogTitle>
                      <DialogDescription>Configure um novo webhook</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="webhook-name">Nome</Label>
                        <Input
                          id="webhook-name"
                          value={newWebhook.name}
                          onChange={(e) => setNewWebhook({...newWebhook, name: e.target.value})}
                          placeholder="Ex: Webhook de Pagamentos"
                        />
                      </div>
                      <div>
                        <Label htmlFor="webhook-url">URL</Label>
                        <Input
                          id="webhook-url"
                          value={newWebhook.url}
                          onChange={(e) => setNewWebhook({...newWebhook, url: e.target.value})}
                          placeholder="https://api.suaempresa.com/webhook"
                        />
                      </div>
                      <div>
                        <Label>Eventos</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['user.created', 'payment.success', 'message.sent', 'order.completed'].map(event => (
                            <Button
                              key={event}
                              variant={newWebhook.events.includes(event) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                const newEvents = newWebhook.events.includes(event)
                                  ? newWebhook.events.filter(e => e !== event)
                                  : [...newWebhook.events, event];
                                setNewWebhook({...newWebhook, events: newEvents});
                              }}
                            >
                              {event}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <Button onClick={addWebhook} className="w-full">
                        Criar Webhook
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{webhook.name}</h4>
                        <p className="text-sm text-gray-600">{webhook.url}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={webhook.status === "active" ? "default" : "secondary"}>
                          {webhook.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                        <Switch defaultChecked={webhook.status === "active"} />
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <h5 className="text-sm font-medium">Eventos:</h5>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => testWebhook(webhook)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Testar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => configureWebhook(webhook)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Configurar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteWebhook(webhook.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Logs de Webhook */}
          <Card>
            <CardHeader>
              <CardTitle>Logs Recentes</CardTitle>
              <CardDescription>Histórico de entrega de webhooks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { event: "user.created", status: "success", time: "Há 5 min", webhook: "Webhook Principal" },
                  { event: "payment.success", status: "success", time: "Há 12 min", webhook: "Webhook Principal" },
                  { event: "system.alert", status: "failed", time: "Há 30 min", webhook: "Backup Webhook" },
                  { event: "user.updated", status: "success", time: "Há 1 hora", webhook: "Webhook Principal" },
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <span className="font-mono text-sm">{log.event}</span>
                        <p className="text-xs text-gray-600">{log.webhook}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status === 'success' ? 'Sucesso' : 'Falha'}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Configuração de Integração */}
      <Dialog open={showIntegrationConfig} onOpenChange={setShowIntegrationConfig}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {configuringIntegration && (
                <>
                  <div className="text-lg">{configuringIntegration.icon}</div>
                  Configurar {configuringIntegration.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Insira as credenciais necessárias para conectar com {configuringIntegration?.name}
            </DialogDescription>
          </DialogHeader>
          {configuringIntegration && (
            <div className="space-y-4">
              {getConfigFields(configuringIntegration.name).map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={configuringIntegration.config[field.key] || ''}
                    onChange={(e) => setConfiguringIntegration({
                      ...configuringIntegration,
                      config: { 
                        ...configuringIntegration.config, 
                        [field.key]: e.target.value 
                      }
                    })}
                  />
                </div>
              ))}
              
              {/* Configurações adicionais específicas */}
              {configuringIntegration.name === "Slack" && (
                <div className="space-y-2">
                  <Label>Configurações adicionais</Label>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={configuringIntegration.config.notifications_enabled || false}
                      onCheckedChange={(checked) => setConfiguringIntegration({
                        ...configuringIntegration,
                        config: { 
                          ...configuringIntegration.config, 
                          notifications_enabled: checked 
                        }
                      })}
                    />
                    <Label className="text-sm">Ativar notificações automáticas</Label>
                  </div>
                </div>
              )}

              {configuringIntegration.name === "WhatsApp Business" && (
                <div className="space-y-2">
                  <Label>Configurações de mensagem</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={configuringIntegration.config.auto_reply || false}
                        onCheckedChange={(checked) => setConfiguringIntegration({
                          ...configuringIntegration,
                          config: { 
                            ...configuringIntegration.config, 
                            auto_reply: checked 
                          }
                        })}
                      />
                      <Label className="text-sm">Resposta automática</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={configuringIntegration.config.read_receipts || false}
                        onCheckedChange={(checked) => setConfiguringIntegration({
                          ...configuringIntegration,
                          config: { 
                            ...configuringIntegration.config, 
                            read_receipts: checked 
                          }
                        })}
                      />
                      <Label className="text-sm">Confirmação de leitura</Label>
                    </div>
                  </div>
                </div>
              )}

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => testConnection(configuringIntegration)}
                    disabled={testingConnection}
                    className="flex-1"
                  >
                    {testingConnection ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Activity className="w-4 h-4 mr-2" />
                    )}
                    {testingConnection ? "Testando..." : "Testar"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowIntegrationConfig(false)}
                    className="flex-1"
                    disabled={testingConnection}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={saveIntegrationConfig} 
                    className="flex-1"
                    disabled={testingConnection}
                  >
                    Conectar
                  </Button>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Documentação */}
      <Dialog open={showApiDocs} onOpenChange={setShowApiDocs}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Documentação da API</DialogTitle>
            <DialogDescription>Guia completo para usar nossa API</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Endpoints Principais</h4>
              <div className="space-y-2 text-sm">
                <div><Badge variant="outline">GET</Badge> <code>/api/messages</code> - Listar mensagens</div>
                <div><Badge variant="outline">POST</Badge> <code>/api/messages</code> - Enviar mensagem</div>
                <div><Badge variant="outline">GET</Badge> <code>/api/contacts</code> - Listar contatos</div>
                <div><Badge variant="outline">POST</Badge> <code>/api/webhooks</code> - Criar webhook</div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Exemplo de Uso</h4>
              <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                <pre>{`curl -X POST https://api.suaempresa.com/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+5511999999999",
    "message": "Olá mundo!"
  }'`}</pre>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
