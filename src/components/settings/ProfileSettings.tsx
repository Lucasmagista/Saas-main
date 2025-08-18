
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Edit3, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";

interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  bio?: string;
  avatarUrl?: string;
  role?: string;
  department?: string;
}

export const ProfileSettings = () => {
  const { toast } = useToast();
  // Obter perfil e funções de persistência do hook customizado.
  const { profile, loading, error, updateProfile, uploadAvatar, isUploading } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  // Estado temporário para edição. Inicializado com cópia do perfil atual.
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile ?? {});

  // Sincroniza tempProfile quando profile muda
  useEffect(() => {
    setTempProfile(profile ?? {});
  }, [profile]);

  const handleSave = () => {
    if (tempProfile) {
      updateProfile(tempProfile);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfile(profile ?? {});
    setIsEditing(false);
  };
  // Tratar loading, erro e perfil nulo
  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando perfil...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-64 text-red-600">Erro: {error}</div>;
  }
  if (!profile) {
    return <div className="flex items-center justify-center h-64">Perfil não encontrado.</div>;
  }

  // Upload real de avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadAvatar(file);
    toast({ title: "Avatar atualizado!" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                {/* Utiliza o avatar salvo caso exista; caso contrário,
                    exibe a imagem placeholder padrão. */}
                <AvatarImage src={profile.avatarUrl || '/placeholder.svg'} />
                <AvatarFallback className="text-lg">
                  {(profile.name ? profile.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'AU')}
                </AvatarFallback>
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
                <Badge variant="secondary">{profile.role ?? '-'}</Badge>
                <Badge variant="outline">{profile.department ?? '-'}</Badge>
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
              value={isEditing ? tempProfile.name ?? '' : profile.name ?? ''}
              onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={isEditing ? tempProfile.email ?? '' : profile.email ?? ''}
              onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input 
              id="phone" 
              value={isEditing ? tempProfile.phone ?? '' : profile.phone ?? ''}
              onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input 
              id="location" 
              value={isEditing ? tempProfile.location ?? '' : profile.location ?? ''}
              onChange={(e) => setTempProfile({...tempProfile, location: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input 
              id="website" 
              value={isEditing ? tempProfile.website ?? '' : profile.website ?? ''}
              onChange={(e) => setTempProfile({...tempProfile, website: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input 
              id="linkedin" 
              value={isEditing ? tempProfile.linkedin ?? '' : profile.linkedin ?? ''}
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
            value={isEditing ? tempProfile.bio ?? '' : profile.bio ?? ''}
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
              <div className="text-2xl font-bold text-blue-600">-</div>
              <div className="text-sm text-gray-600">Dias Ativo</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">-</div>
              <div className="text-sm text-gray-600">Projetos</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">-</div>
              <div className="text-sm text-gray-600">Tarefas</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">-</div>
              <div className="text-sm text-gray-600">Atividade</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
