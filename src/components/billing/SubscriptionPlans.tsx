
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Crown, Zap, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const SubscriptionPlans = () => {
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState('pro');

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      icon: <Star className="w-6 h-6" />,
      price: billingCycle === 'monthly' ? 29 : 290,
      originalPrice: billingCycle === 'yearly' ? 348 : null,
      features: [
        'Até 1.000 usuários',
        'Suporte por email',
        'Dashboard básico',
        'API limitada',
        '5GB de armazenamento'
      ],
      color: 'blue'
    },
    {
      id: 'pro',
      name: 'Professional',
      icon: <Zap className="w-6 h-6" />,
      price: billingCycle === 'monthly' ? 99 : 990,
      originalPrice: billingCycle === 'yearly' ? 1188 : null,
      features: [
        'Até 10.000 usuários',
        'Suporte prioritário',
        'Dashboard avançado',
        'API completa',
        '50GB de armazenamento',
        'Integrações ilimitadas',
        'Relatórios customizados'
      ],
      popular: true,
      color: 'purple'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: <Crown className="w-6 h-6" />,
      price: billingCycle === 'monthly' ? 299 : 2990,
      originalPrice: billingCycle === 'yearly' ? 3588 : null,
      features: [
        'Usuários ilimitados',
        'Suporte 24/7',
        'White-label',
        'API dedicada',
        'Armazenamento ilimitado',
        'SSO/SAML',
        'Compliance avançado',
        'Gerente de conta dedicado'
      ],
      color: 'gold'
    }
  ];

  const handlePlanUpgrade = (planId: string) => {
    toast({
      title: "Plano atualizado!",
      description: `Você será redirecionado para o checkout do plano ${planId}.`,
    });
  };

  const handlePlanDowngrade = (planId: string) => {
    toast({
      title: "Plano alterado",
      description: `O plano será alterado para ${planId} no próximo ciclo de cobrança.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center items-center space-x-4">
        <span className={billingCycle === 'monthly' ? 'font-medium' : 'text-muted-foreground'}>
          Mensal
        </span>
        <Switch
          checked={billingCycle === 'yearly'}
          onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
        />
        <span className={billingCycle === 'yearly' ? 'font-medium' : 'text-muted-foreground'}>
          Anual
        </span>
        {billingCycle === 'yearly' && (
          <Badge variant="secondary">Economize 20%</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''} ${
              currentPlan === plan.id ? 'bg-primary/5' : ''
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                Mais Popular
              </Badge>
            )}
            {currentPlan === plan.id && (
              <Badge variant="secondary" className="absolute -top-2 right-4">
                Plano Atual
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className={`p-3 rounded-full bg-${plan.color}-100`}>
                  {plan.icon}
                </div>
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-lg font-normal text-muted-foreground">
                    /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                  </span>
                </span>
                {plan.originalPrice && (
                  <span className="block text-sm text-muted-foreground line-through">
                    ${plan.originalPrice}/ano
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-4">
                {currentPlan === plan.id ? (
                  <Button variant="outline" className="w-full" disabled>
                    Plano Atual
                  </Button>
                ) : currentPlan === 'basic' && plan.id !== 'basic' ? (
                  <Button 
                    className="w-full" 
                    onClick={() => handlePlanUpgrade(plan.id)}
                  >
                    Fazer Upgrade
                  </Button>
                ) : currentPlan !== 'basic' && plan.id === 'basic' ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handlePlanDowngrade(plan.id)}
                  >
                    Fazer Downgrade
                  </Button>
                ) : (
                  <Button 
                    variant={plan.popular ? 'default' : 'outline'} 
                    className="w-full"
                    onClick={() => handlePlanUpgrade(plan.id)}
                  >
                    Selecionar Plano
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
