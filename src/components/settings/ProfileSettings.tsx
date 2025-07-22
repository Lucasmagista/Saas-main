
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Check, X, Edit3, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ProfileSettings = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@empresa.com",
    phone: "+55 11 99999-0000",
    company: "SaaS Pro Enterprise",
    role: "Administrador",
    department: "Tecnologia",
    location: "São Paulo, SP",
    bio: "Especialista em soluções empresariais com mais de 10 anos de experiência.",
    website: "https://empresa.com.br",
    linkedin: "https://linkedin.com/in/adminuser"
  });

  const [tempProfile, setTempProfile] = useState(profile);

  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simular upload
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi alterada com sucesso.",
      });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-lg">AU</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                  </div>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>
            <div>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Gerencie seus dados pessoais e preferências</CardDescription>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{profile.role}</Badge>
                <Badge variant="outline">{profile.department}</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit3 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input 
              id="name" 
              value={isEditing ? tempProfile.name : profile.name}
              onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={isEditing ? tempProfile.email : profile.email}
              onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input 
              id="phone" 
              value={isEditing ? tempProfile.phone : profile.phone}
              onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input 
              id="location" 
              value={isEditing ? tempProfile.location : profile.location}
              onChange={(e) => setTempProfile({...tempProfile, location: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input 
              id="website" 
              value={isEditing ? tempProfile.website : profile.website}
              onChange={(e) => setTempProfile({...tempProfile, website: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input 
              id="linkedin" 
              value={isEditing ? tempProfile.linkedin : profile.linkedin}
              onChange={(e) => setTempProfile({...tempProfile, linkedin: e.target.value})}
              disabled={!isEditing}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Biografia</Label>
          <textarea
            id="bio"
            className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-background text-sm resize-none disabled:cursor-not-allowed disabled:opacity-50"
            value={isEditing ? tempProfile.bio : profile.bio}
            onChange={(e) => setTempProfile({...tempProfile, bio: e.target.value})}
            disabled={!isEditing}
            placeholder="Conte um pouco sobre você..."
          />
        </div>
        
        {/* Estatísticas do usuário */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Estatísticas da Conta</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">127</div>
              <div className="text-sm text-gray-600">Dias Ativo</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">45</div>
              <div className="text-sm text-gray-600">Projetos</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">1,234</div>
              <div className="text-sm text-gray-600">Tarefas</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">98%</div>
              <div className="text-sm text-gray-600">Produtividade</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
