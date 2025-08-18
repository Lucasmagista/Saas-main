import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User, Building, Phone, MapPin, Briefcase, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

interface OnboardingData {
  // Dados pessoais
  fullName: string;
  phone: string;
  location: string;
  bio: string;
  avatarFile?: File;
  
  // Dados profissionais
  position: string;
  department: string;
  companyName: string;
  companySize: string;
  industry: string;
  
  // Preferências
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  timezone: string;
  language: string;
}

const steps = [
  {
    id: 1,
    title: 'Informações Pessoais',
    description: 'Conte-nos mais sobre você',
    icon: User
  },
  {
    id: 2,
    title: 'Informações Profissionais',
    description: 'Dados sobre sua empresa e cargo',
    icon: Building
  },
  {
    id: 3,
    title: 'Preferências',
    description: 'Configure suas preferências pessoais',
    icon: Briefcase
  }
];

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateProfile } = useAuth();
  const { uploadAvatar } = useUserProfile();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: user?.full_name || user?.email?.split('@')[0] || '',
    phone: '',
    location: '',
    bio: '',
    position: '',
    department: '',
    companyName: '',
    companySize: '',
    industry: '',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR'
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof OnboardingData] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatarFile: file }));
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName.trim() && formData.phone.trim();
      case 2:
        return formData.position.trim() && formData.companyName.trim();
      case 3:
        return formData.timezone && formData.language;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive'
      });
      return;
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!validateCurrentStep()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload do avatar se fornecido
      if (formData.avatarFile) {
        await uploadAvatar(formData.avatarFile);
      }

      // Atualizar perfil do usuário
      const profileUpdate = {
        full_name: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        position: formData.position,
        department: formData.department,
        company_name: formData.companyName,
        company_size: formData.companySize,
        industry: formData.industry,
        timezone: formData.timezone,
        language: formData.language,
        notifications_email: formData.notifications.email,
        notifications_push: formData.notifications.push,
        notifications_sms: formData.notifications.sms,
        profile_completed: true,
        onboarding_completed_at: new Date().toISOString()
      };

      await updateProfile(profileUpdate);

      // Salvar também no localStorage para persistência
      const completeProfile = {
        ...user,
        ...profileUpdate,
        avatarUrl: avatarPreview || user?.avatarUrl
      };
      
      localStorage.setItem('user-profile', JSON.stringify(completeProfile));
      localStorage.setItem('user', JSON.stringify(completeProfile));
      localStorage.setItem('onboarding-completed', 'true');

      toast({
        title: 'Perfil configurado com sucesso!',
        description: 'Bem-vindo ao sistema. Você está pronto para começar.',
      });

      // Redirecionar para dashboard
      navigate('/dashboard', { replace: true });

    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      toast({
        title: 'Erro ao salvar dados',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="text-2xl">
                    {formData.fullName.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-muted-foreground">Adicione uma foto de perfil</p>
            </div>

            {/* Dados Pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Cidade, Estado"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Cargo/Posição *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="Ex: Desenvolvedor, Gerente, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="rh">Recursos Humanos</SelectItem>
                    <SelectItem value="operacoes">Operações</SelectItem>
                    <SelectItem value="atendimento">Atendimento</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Nome da sua empresa"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companySize">Tamanho da Empresa</Label>
                <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 funcionários</SelectItem>
                    <SelectItem value="11-50">11-50 funcionários</SelectItem>
                    <SelectItem value="51-200">51-200 funcionários</SelectItem>
                    <SelectItem value="201-500">201-500 funcionários</SelectItem>
                    <SelectItem value="500+">500+ funcionários</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="industry">Setor/Indústria</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="saude">Saúde</SelectItem>
                    <SelectItem value="educacao">Educação</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="varejo">Varejo</SelectItem>
                    <SelectItem value="industria">Indústria</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário *</Label>
                <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fuso horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                    <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                    <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">Idioma *</Label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preferências de Notificação */}
            <div className="space-y-4">
              <h4 className="font-medium">Preferências de Notificação</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">Receber atualizações importantes por email</p>
                  </div>
                  <Label htmlFor="email-notifications" className="flex items-center space-x-3 cursor-pointer">
                    <input
                      id="email-notifications"
                      type="checkbox"
                      checked={formData.notifications.email}
                      onChange={(e) => handleInputChange('notifications.email', e.target.checked)}
                      className="rounded"
                      aria-label="Ativar notificações por email"
                    />
                    <span>Ativar notificações por email</span>
                  </Label>
                </div>
                
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-notifications">Notificações Push</Label>
                        <p className="text-sm text-muted-foreground">Receber notificações no navegador</p>
                      </div>
                      <Label htmlFor="push-notifications" className="flex items-center space-x-3 cursor-pointer">
                        <input
                          id="push-notifications"
                          type="checkbox"
                          checked={formData.notifications.push}
                          onChange={(e) => handleInputChange('notifications.push', e.target.checked)}
                          className="rounded"
                          aria-label="Ativar notificações push"
                        />
                        <span>Ativar notificações push</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-notifications">Notificações por SMS</Label>
                        <p className="text-sm text-muted-foreground">Receber alertas urgentes por SMS</p>
                      </div>
                      <Label htmlFor="sms-notifications" className="flex items-center space-x-3 cursor-pointer">
                        <input
                          id="sms-notifications"
                          type="checkbox"
                          checked={formData.notifications.sms}
                          onChange={(e) => handleInputChange('notifications.sms', e.target.checked)}
                          className="rounded"
                          aria-label="Ativar notificações por SMS"
                        />
                        <span>Ativar notificações por SMS</span>
                      </Label>
                    </div>
                  </div>
                </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Complete seu Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Ajude-nos a personalizar sua experiência no sistema
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={`flex items-center ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`
                  rounded-full p-2 border-2 transition-colors
                  ${currentStep >= step.id 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-border'
                  }
                `}>
                  <step.icon className="w-4 h-4" />
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-px mx-4 ${currentStep > step.id ? 'bg-primary' : 'bg-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>
          
          {currentStep < steps.length ? (
            <Button onClick={handleNext}>
              Próximo
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isSubmitting}>
              {isSubmitting ? 'Finalizando...' : 'Finalizar'}
            </Button>
          )}
        </div>

        {/* Skip Option */}
        <div className="text-center mt-4">
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.setItem('onboarding-skipped', 'true');
              navigate('/dashboard', { replace: true });
            }}
            className="text-sm"
          >
            Pular por agora
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
