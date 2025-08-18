import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Copy,
  MessageSquare,
  Mail,
  Phone,
  Globe
} from 'lucide-react';
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from '@/hooks/useTemplates';
import { useToast } from '@/hooks/use-toast';

export const TemplateManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: '',
    channel: 'whatsapp',
    language: 'pt-BR',
    subject: '',
    content: '',
    variables: [],
    media_urls: [],
    is_active: true,
  });

  const { toast } = useToast();
  const { data: templates, isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesChannel = channelFilter === 'all' || template.channel === channelFilter;
    
    return matchesSearch && matchesCategory && matchesChannel;
  });

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createTemplate.mutateAsync({
        ...newTemplate,
        organization_id: 'temp-org-id', // Será preenchido pelo backend
        created_by: 'temp-user-id', // Será preenchido pelo backend
      });
      
      setIsCreateDialogOpen(false);
      setNewTemplate({
        name: '',
        category: '',
        channel: 'whatsapp',
        language: 'pt-BR',
        subject: '',
        content: '',
        variables: [],
        media_urls: [],
        is_active: true,
      });
    } catch (error) {
      console.error('Erro ao criar template:', error);
    }
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTemplate) return;
    
    try {
      await updateTemplate.mutateAsync({
        id: editingTemplate.id,
        ...newTemplate,
      });
      
      setEditingTemplate(null);
      setNewTemplate({
        name: '',
        category: '',
        channel: 'whatsapp',
        language: 'pt-BR',
        subject: '',
        content: '',
        variables: [],
        media_urls: [],
        is_active: true,
      });
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;
    
    try {
      await deleteTemplate.mutateAsync(templateId);
    } catch (error) {
      console.error('Erro ao excluir template:', error);
    }
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      category: template.category || '',
      channel: template.channel,
      language: template.language,
      subject: template.subject || '',
      content: template.content,
      variables: template.variables || [],
      media_urls: template.media_urls || [],
      is_active: template.is_active,
    });
  };

  const handleCopyTemplate = (template: any) => {
    navigator.clipboard.writeText(template.content);
    toast({
      title: 'Template copiado',
      description: 'O conteúdo do template foi copiado para a área de transferência.',
    });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const categories = [...new Set(templates?.map(t => t.category).filter(Boolean))];

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Gerenciador de Templates
            </CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? 'Editar Template' : 'Criar Template'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Categoria</Label>
                        <Input
                          id="category"
                          value={newTemplate.category}
                          onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                          placeholder="Ex: Vendas, Suporte, Marketing"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="channel">Canal</Label>
                        <Select value={newTemplate.channel} onValueChange={(value) => setNewTemplate({ ...newTemplate, channel: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="phone">Telefone</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="language">Idioma</Label>
                        <Select value={newTemplate.language} onValueChange={(value) => setNewTemplate({ ...newTemplate, language: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-BR">Português (BR)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="es-ES">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {newTemplate.channel === 'email' && (
                      <div>
                        <Label htmlFor="subject">Assunto</Label>
                        <Input
                          id="subject"
                          value={newTemplate.subject}
                          onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                          placeholder="Assunto do email"
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="content">Conteúdo</Label>
                      <Textarea
                        id="content"
                        value={newTemplate.content}
                        onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                        placeholder="Digite o conteúdo do template..."
                        rows={6}
                        required
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={newTemplate.is_active}
                        onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, is_active: checked })}
                      />
                      <Label htmlFor="active">Template ativo</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setEditingTemplate(null);
                        setNewTemplate({
                          name: '',
                          category: '',
                          channel: 'whatsapp',
                          language: 'pt-BR',
                          subject: '',
                          content: '',
                          variables: [],
                          media_urls: [],
                          is_active: true,
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createTemplate.isPending || updateTemplate.isPending}>
                      {editingTemplate ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando templates...</div>
          ) : filteredTemplates?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum template encontrado
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTemplates?.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <div className="flex items-center gap-1">
                            {getChannelIcon(template.channel)}
                            <span className="text-sm text-muted-foreground capitalize">
                              {template.channel}
                            </span>
                          </div>
                          {template.category && (
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                          )}
                          {!template.is_active && (
                            <Badge variant="destructive" className="text-xs">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {template.content}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Usado {template.usage_count} vezes</span>
                          <span>Criado em {new Date(template.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyTemplate(template)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
