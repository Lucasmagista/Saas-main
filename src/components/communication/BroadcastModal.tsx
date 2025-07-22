import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, MessageSquare, Send, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BroadcastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BroadcastModal({ open, onOpenChange }: BroadcastModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("recipients");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [newListName, setNewListName] = useState("");

  const contacts = [
    { id: "1", name: "Ana Silva", phone: "+55 11 99999-0001", avatar: "/placeholder.svg", tags: ["cliente", "vip"] },
    { id: "2", name: "Carlos Santos", phone: "+55 11 99999-0002", avatar: "/placeholder.svg", tags: ["prospect"] },
    { id: "3", name: "Maria Oliveira", phone: "+55 11 99999-0003", avatar: "/placeholder.svg", tags: ["cliente"] },
    { id: "4", name: "João Pereira", phone: "+55 11 99999-0004", avatar: "/placeholder.svg", tags: ["parceiro"] },
    { id: "5", name: "Luciana Costa", phone: "+55 11 99999-0005", avatar: "/placeholder.svg", tags: ["cliente", "vip"] }
  ];

  const broadcastLists = [
    { id: "list1", name: "Clientes VIP", count: 23, description: "Clientes premium e parceiros estratégicos" },
    { id: "list2", name: "Prospects 2024", count: 156, description: "Leads qualificados para este ano" },
    { id: "list3", name: "Equipe Interna", count: 12, description: "Colaboradores e funcionários" }
  ];

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleListToggle = (listId: string) => {
    setSelectedLists(prev => 
      prev.includes(listId) 
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  const handleSendBroadcast = () => {
    if (!message.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem para enviar",
        variant: "destructive"
      });
      return;
    }

    if (selectedContacts.length === 0 && selectedLists.length === 0) {
      toast({
        title: "Erro", 
        description: "Selecione pelo menos um contato ou lista",
        variant: "destructive"
      });
      return;
    }

    const totalRecipients = selectedContacts.length + 
      selectedLists.reduce((acc, listId) => {
        const list = broadcastLists.find(l => l.id === listId);
        return acc + (list?.count || 0);
      }, 0);

    toast({
      title: "Broadcast Enviado",
      description: `Mensagem enviada para ${totalRecipients} contatos`
    });

    onOpenChange(false);
    setSelectedContacts([]);
    setSelectedLists([]);
    setMessage("");
  };

  const createNewList = () => {
    if (!newListName.trim()) return;
    
    toast({
      title: "Lista Criada",
      description: `Nova lista "${newListName}" criada com sucesso`
    });
    setNewListName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Envio em Massa - WhatsApp
          </DialogTitle>
          <DialogDescription>
            Selecione contatos e listas para enviar mensagens em massa
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recipients">Destinatários</TabsTrigger>
            <TabsTrigger value="message">Mensagem</TabsTrigger>
            <TabsTrigger value="lists">Listas</TabsTrigger>
          </TabsList>

          <TabsContent value="recipients" className="space-y-4 flex-1">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contatos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Badge variant="secondary">
                {selectedContacts.length} selecionados
              </Badge>
            </div>

            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="p-4 space-y-2">
                {filteredContacts.map((contact) => (
                  <Card key={contact.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={() => handleContactToggle(contact.id)}
                      />
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                      </div>
                      <div className="flex gap-1">
                        {contact.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="message" className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="broadcast-message">Mensagem</Label>
              <Textarea
                id="broadcast-message"
                placeholder="Digite sua mensagem aqui..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[200px]"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{message.length}/1000 caracteres</span>
                <span>Estimativa: {Math.ceil(message.length / 160)} SMS</span>
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Preview da Mensagem</h4>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg border-l-4 border-green-500">
                  <p className="whitespace-pre-wrap">{message || "Sua mensagem aparecerá aqui..."}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lists" className="space-y-4 flex-1">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nome da nova lista..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={createNewList} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Criar Lista
              </Button>
            </div>

            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {broadcastLists.map((list) => (
                  <Card key={list.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedLists.includes(list.id)}
                        onCheckedChange={() => handleListToggle(list.id)}
                      />
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{list.name}</h4>
                          <Badge variant="secondary">{list.count} contatos</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{list.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">
                {selectedLists.length} listas selecionadas
              </Badge>
              <span>
                Total estimado: {selectedLists.reduce((acc, listId) => {
                  const list = broadcastLists.find(l => l.id === listId);
                  return acc + (list?.count || 0);
                }, 0)} contatos
              </span>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSendBroadcast} className="bg-green-600 hover:bg-green-700">
            <Send className="w-4 h-4 mr-2" />
            Enviar Broadcast
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}