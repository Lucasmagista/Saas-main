# Sistema de Integrações - Exemplos Práticos

## 🚀 Guia de Implementação com Exemplos

Este documento fornece exemplos práticos e cenários reais de implementação do Sistema de Integrações.

---

## 📧 Exemplo 1: Integração com SendGrid

### 1.1 Definindo a Classe

```typescript
// src/integrations/sendgrid/SendGridIntegration.ts
import { BaseIntegration } from '../BaseIntegration';
import { Mail } from '@sendgrid/mail';

export class SendGridIntegration extends BaseIntegration {
  name = 'SendGrid';
  description = 'Serviço de envio de emails transacionais';
  icon = <SendGridIcon />;
  
  private client?: Mail;
  
  getConfigFields(): ConfigField[] {
    return [
      {
        key: 'api_key',
        label: 'API Key',
        type: 'password',
        placeholder: 'SG.xxxxxxxxxxxxxxxx',
        required: true,
        description: 'Chave de API do SendGrid (começa com SG.)'
      },
      {
        key: 'from_email',
        label: 'Email Remetente',
        type: 'email',
        placeholder: 'noreply@empresa.com',
        required: true,
        description: 'Email verificado no SendGrid'
      },
      {
        key: 'from_name',
        label: 'Nome Remetente',
        type: 'text',
        placeholder: 'Minha Empresa',
        required: false
      }
    ];
  }
  
  getRequiredFields(): string[] {
    return ['api_key', 'from_email'];
  }
  
  validateConfig(config: IntegrationConfig): ValidationResult {
    const errors: string[] = [];
    
    if (!config.api_key || !config.api_key.startsWith('SG.')) {
      errors.push('API Key deve começar com "SG."');
    }
    
    if (!config.from_email || !ValidationUtils.validateEmail(config.from_email)) {
      errors.push('Email remetente deve ser válido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  async testConnection(config: IntegrationConfig): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(config.api_key);
      
      // Teste simples de validação da API Key
      const response = await sgMail.send({
        to: config.from_email,
        from: config.from_email,
        subject: 'Teste de Conectividade - SendGrid',
        text: 'Este é um teste de conectividade do sistema.',
        html: '<p>Este é um <strong>teste de conectividade</strong> do sistema.</p>',
        // Mail settings para teste
        mailSettings: {
          sandboxMode: {
            enable: true // Não envia email real, apenas testa
          }
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        message: 'Conexão estabelecida com sucesso',
        responseTime,
        details: {
          messageId: response[0].headers['x-message-id'],
          statusCode: response[0].statusCode
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Falha na conexão com SendGrid',
        responseTime: Date.now() - startTime,
        error: error.message,
        details: {
          errorCode: error.code,
          errorType: error.response?.body?.errors?.[0]?.field || 'unknown'
        }
      };
    }
  }
  
  async connect(config: IntegrationConfig): Promise<void> {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(config.api_key);
    this.client = sgMail;
    
    // Salvar configuração criptografada
    await this.saveEncryptedConfig(config);
    
    // Emitir evento de conexão
    IntegrationEventBus.emit('integration:connected', {
      integrationName: this.name,
      timestamp: Date.now()
    });
  }
  
  async disconnect(): Promise<void> {
    this.client = undefined;
    await this.clearConfig();
    
    IntegrationEventBus.emit('integration:disconnected', {
      integrationName: this.name,
      timestamp: Date.now()
    });
  }
  
  // Métodos específicos da integração
  async sendEmail(to: string, subject: string, content: string, isHtml = false): Promise<boolean> {
    if (!this.client) {
      throw new Error('SendGrid não está conectado');
    }
    
    try {
      const msg = {
        to,
        from: {
          email: this.config.from_email,
          name: this.config.from_name || 'Sistema'
        },
        subject,
        [isHtml ? 'html' : 'text']: content
      };
      
      await this.client.send(msg);
      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return false;
    }
  }
  
  async sendTemplate(to: string, templateId: string, dynamicData: Record<string, any>): Promise<boolean> {
    if (!this.client) {
      throw new Error('SendGrid não está conectado');
    }
    
    try {
      const msg = {
        to,
        from: {
          email: this.config.from_email,
          name: this.config.from_name || 'Sistema'
        },
        templateId,
        dynamicTemplateData: dynamicData
      };
      
      await this.client.send(msg);
      return true;
    } catch (error) {
      console.error('Erro ao enviar template:', error);
      return false;
    }
  }
}
```

### 1.2 Hook Personalizado

```typescript
// src/hooks/useSendGrid.ts
import { useCallback } from 'react';
import { useIntegrations } from './useIntegrations';
import { SendGridIntegration } from '../integrations/sendgrid/SendGridIntegration';

export function useSendGrid() {
  const { integrations, updateIntegration } = useIntegrations();
  
  const sendGridIntegration = integrations.find(i => i.name === 'SendGrid');
  
  const sendEmail = useCallback(async (
    to: string, 
    subject: string, 
    content: string, 
    isHtml = false
  ) => {
    if (!sendGridIntegration?.status === 'connected') {
      throw new Error('SendGrid não está conectado');
    }
    
    const integration = new SendGridIntegration();
    await integration.connect(sendGridIntegration.config);
    
    const success = await integration.sendEmail(to, subject, content, isHtml);
    
    if (success) {
      // Atualizar última sincronização
      updateIntegration(sendGridIntegration.id, {
        lastSync: new Date().toISOString()
      });
    }
    
    return success;
  }, [sendGridIntegration, updateIntegration]);
  
  const sendWelcomeEmail = useCallback(async (userEmail: string, userName: string) => {
    const subject = 'Bem-vindo ao nosso sistema!';
    const content = `
      <h1>Olá, ${userName}!</h1>
      <p>Bem-vindo ao nosso sistema. Estamos felizes em tê-lo conosco.</p>
      <p>Se precisar de ajuda, não hesite em nos contatar.</p>
    `;
    
    return sendEmail(userEmail, subject, content, true);
  }, [sendEmail]);
  
  return {
    sendGridIntegration,
    isConnected: sendGridIntegration?.status === 'connected',
    sendEmail,
    sendWelcomeEmail
  };
}
```

### 1.3 Uso em Componente

```typescript
// src/components/EmailManager.tsx
import React, { useState } from 'react';
import { useSendGrid } from '../hooks/useSendGrid';
import { toast } from 'sonner';

export function EmailManager() {
  const { isConnected, sendEmail } = useSendGrid();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    content: ''
  });
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await sendEmail(
        formData.to,
        formData.subject,
        formData.content,
        true
      );
      
      if (success) {
        toast.success('Email enviado com sucesso!');
        setFormData({ to: '', subject: '', content: '' });
      } else {
        toast.error('Falha ao enviar email');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isConnected) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50">
        <p>SendGrid não está conectado. Configure a integração primeiro.</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSend} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Para:</label>
        <input
          type="email"
          value={formData.to}
          onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Assunto:</label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Conteúdo:</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          className="w-full p-2 border rounded h-32"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Enviar Email'}
      </button>
    </form>
  );
}
```

---

## 💳 Exemplo 2: Integração com Stripe

### 2.1 Definindo a Classe

```typescript
// src/integrations/stripe/StripeIntegration.ts
import Stripe from 'stripe';

export class StripeIntegration extends BaseIntegration {
  name = 'Stripe';
  description = 'Processamento de pagamentos online';
  icon = <StripeIcon />;
  
  private client?: Stripe;
  
  getConfigFields(): ConfigField[] {
    return [
      {
        key: 'secret_key',
        label: 'Secret Key',
        type: 'password',
        placeholder: 'sk_test_... ou sk_live_...',
        required: true,
        description: 'Chave secreta do Stripe'
      },
      {
        key: 'publishable_key',
        label: 'Publishable Key',
        type: 'text',
        placeholder: 'pk_test_... ou pk_live_...',
        required: true,
        description: 'Chave pública do Stripe'
      },
      {
        key: 'webhook_endpoint',
        label: 'Webhook URL',
        type: 'url',
        placeholder: 'https://meusite.com/webhook/stripe',
        required: false,
        description: 'URL para receber webhooks do Stripe'
      }
    ];
  }
  
  getRequiredFields(): string[] {
    return ['secret_key', 'publishable_key'];
  }
  
  validateConfig(config: IntegrationConfig): ValidationResult {
    const errors: string[] = [];
    
    if (!config.secret_key || !config.secret_key.startsWith('sk_')) {
      errors.push('Secret Key deve começar com "sk_"');
    }
    
    if (!config.publishable_key || !config.publishable_key.startsWith('pk_')) {
      errors.push('Publishable Key deve começar com "pk_"');
    }
    
    // Verificar se ambas as chaves são do mesmo ambiente
    const secretEnv = config.secret_key?.includes('test') ? 'test' : 'live';
    const pubEnv = config.publishable_key?.includes('test') ? 'test' : 'live';
    
    if (secretEnv !== pubEnv) {
      errors.push('Secret Key e Publishable Key devem ser do mesmo ambiente (test ou live)');
    }
    
    if (config.webhook_endpoint && !ValidationUtils.validateURL(config.webhook_endpoint)) {
      errors.push('URL do webhook deve ser válida');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  async testConnection(config: IntegrationConfig): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      const stripe = new Stripe(config.secret_key, {
        apiVersion: '2024-06-20'
      });
      
      // Testar conectividade listando produtos (não cria nada)
      const account = await stripe.accounts.retrieve();
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        message: `Conectado com sucesso à conta: ${account.business_profile?.name || account.id}`,
        responseTime,
        details: {
          accountId: account.id,
          country: account.country,
          currency: account.default_currency,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Falha na conexão com Stripe',
        responseTime: Date.now() - startTime,
        error: error.message,
        details: {
          errorType: error.type,
          errorCode: error.code
        }
      };
    }
  }
  
  async connect(config: IntegrationConfig): Promise<void> {
    this.client = new Stripe(config.secret_key, {
      apiVersion: '2024-06-20'
    });
    
    await this.saveEncryptedConfig(config);
    
    IntegrationEventBus.emit('integration:connected', {
      integrationName: this.name,
      timestamp: Date.now()
    });
  }
  
  async disconnect(): Promise<void> {
    this.client = undefined;
    await this.clearConfig();
    
    IntegrationEventBus.emit('integration:disconnected', {
      integrationName: this.name,
      timestamp: Date.now()
    });
  }
  
  // Métodos específicos do Stripe
  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    if (!this.client) {
      throw new Error('Stripe não está conectado');
    }
    
    return await this.client.customers.create({
      email,
      name
    });
  }
  
  async createPaymentIntent(amount: number, currency = 'brl', customerId?: string): Promise<Stripe.PaymentIntent> {
    if (!this.client) {
      throw new Error('Stripe não está conectado');
    }
    
    return await this.client.paymentIntents.create({
      amount: amount * 100, // Stripe usa centavos
      currency,
      customer: customerId,
      automatic_payment_methods: {
        enabled: true
      }
    });
  }
  
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!this.client) {
      throw new Error('Stripe não está conectado');
    }
    
    return await this.client.paymentIntents.retrieve(paymentIntentId);
  }
  
  async createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
    if (!this.client) {
      throw new Error('Stripe não está conectado');
    }
    
    return await this.client.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });
  }
}
```

### 2.2 Hook Personalizado

```typescript
// src/hooks/useStripe.ts
import { useCallback, useMemo } from 'react';
import { useIntegrations } from './useIntegrations';
import { StripeIntegration } from '../integrations/stripe/StripeIntegration';

export function useStripe() {
  const { integrations, updateIntegration } = useIntegrations();
  
  const stripeIntegration = useMemo(() => 
    integrations.find(i => i.name === 'Stripe'),
    [integrations]
  );
  
  const createPayment = useCallback(async (amount: number, customerEmail: string) => {
    if (!stripeIntegration?.status === 'connected') {
      throw new Error('Stripe não está conectado');
    }
    
    const integration = new StripeIntegration();
    await integration.connect(stripeIntegration.config);
    
    try {
      // Criar ou encontrar cliente
      const customer = await integration.createCustomer(customerEmail);
      
      // Criar PaymentIntent
      const paymentIntent = await integration.createPaymentIntent(amount, 'brl', customer.id);
      
      // Atualizar última sincronização
      updateIntegration(stripeIntegration.id, {
        lastSync: new Date().toISOString()
      });
      
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        customerId: customer.id
      };
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw error;
    }
  }, [stripeIntegration, updateIntegration]);
  
  const checkPaymentStatus = useCallback(async (paymentIntentId: string) => {
    if (!stripeIntegration?.status === 'connected') {
      throw new Error('Stripe não está conectado');
    }
    
    const integration = new StripeIntegration();
    await integration.connect(stripeIntegration.config);
    
    const paymentIntent = await integration.getPaymentIntent(paymentIntentId);
    
    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    };
  }, [stripeIntegration]);
  
  return {
    stripeIntegration,
    isConnected: stripeIntegration?.status === 'connected',
    publishableKey: stripeIntegration?.config.publishable_key,
    createPayment,
    checkPaymentStatus
  };
}
```

---

## 📱 Exemplo 3: Integração com WhatsApp Business

### 3.1 Definindo a Classe

```typescript
// src/integrations/whatsapp/WhatsAppIntegration.ts
export class WhatsAppIntegration extends BaseIntegration {
  name = 'WhatsApp Business';
  description = 'Envio de mensagens via WhatsApp Business API';
  icon = <WhatsAppIcon />;
  
  getConfigFields(): ConfigField[] {
    return [
      {
        key: 'access_token',
        label: 'Access Token',
        type: 'password',
        placeholder: 'EAAxxxxxxxxxxxxx',
        required: true,
        description: 'Token de acesso do WhatsApp Business API'
      },
      {
        key: 'phone_number_id',
        label: 'Phone Number ID',
        type: 'text',
        placeholder: '1234567890123456',
        required: true,
        description: 'ID do número de telefone no WhatsApp Business'
      },
      {
        key: 'webhook_verify_token',
        label: 'Webhook Verify Token',
        type: 'password',
        placeholder: 'meu_token_secreto',
        required: false,
        description: 'Token para verificação de webhooks'
      },
      {
        key: 'business_account_id',
        label: 'Business Account ID',
        type: 'text',
        placeholder: 'xxxxxxxxxxxxxxxxx',
        required: true,
        description: 'ID da conta comercial do WhatsApp'
      }
    ];
  }
  
  getRequiredFields(): string[] {
    return ['access_token', 'phone_number_id', 'business_account_id'];
  }
  
  validateConfig(config: IntegrationConfig): ValidationResult {
    const errors: string[] = [];
    
    if (!config.access_token || config.access_token.length < 50) {
      errors.push('Access Token deve ter pelo menos 50 caracteres');
    }
    
    if (!config.phone_number_id || !/^\d{15,16}$/.test(config.phone_number_id)) {
      errors.push('Phone Number ID deve ter 15-16 dígitos');
    }
    
    if (!config.business_account_id || !/^\d{15,17}$/.test(config.business_account_id)) {
      errors.push('Business Account ID deve ter 15-17 dígitos');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  async testConnection(config: IntegrationConfig): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${config.phone_number_id}`,
        {
          headers: {
            'Authorization': `Bearer ${config.access_token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        message: `Conectado ao número: ${data.display_phone_number}`,
        responseTime,
        details: {
          phoneNumber: data.display_phone_number,
          verifiedName: data.verified_name,
          status: data.status
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Falha na conexão com WhatsApp Business API',
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }
  
  async connect(config: IntegrationConfig): Promise<void> {
    await this.saveEncryptedConfig(config);
    
    IntegrationEventBus.emit('integration:connected', {
      integrationName: this.name,
      timestamp: Date.now()
    });
  }
  
  async disconnect(): Promise<void> {
    await this.clearConfig();
    
    IntegrationEventBus.emit('integration:disconnected', {
      integrationName: this.name,
      timestamp: Date.now()
    });
  }
  
  // Métodos específicos do WhatsApp
  async sendTextMessage(to: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.phone_number_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to.replace(/\D/g, ''), // Remove formatação
            type: 'text',
            text: { body: message }
          })
        }
      );
      
      return response.ok;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return false;
    }
  }
  
  async sendTemplateMessage(
    to: string, 
    templateName: string, 
    languageCode = 'pt_BR',
    parameters: string[] = []
  ): Promise<boolean> {
    try {
      const template: any = {
        name: templateName,
        language: { code: languageCode }
      };
      
      if (parameters.length > 0) {
        template.components = [{
          type: 'body',
          parameters: parameters.map(param => ({
            type: 'text',
            text: param
          }))
        }];
      }
      
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.phone_number_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to.replace(/\D/g, ''),
            type: 'template',
            template
          })
        }
      );
      
      return response.ok;
    } catch (error) {
      console.error('Erro ao enviar template WhatsApp:', error);
      return false;
    }
  }
}
```

### 3.2 Hook Personalizado

```typescript
// src/hooks/useWhatsApp.ts
export function useWhatsApp() {
  const { integrations, updateIntegration } = useIntegrations();
  
  const whatsappIntegration = useMemo(() => 
    integrations.find(i => i.name === 'WhatsApp Business'),
    [integrations]
  );
  
  const sendMessage = useCallback(async (phoneNumber: string, message: string) => {
    if (!whatsappIntegration?.status === 'connected') {
      throw new Error('WhatsApp Business não está conectado');
    }
    
    const integration = new WhatsAppIntegration();
    await integration.connect(whatsappIntegration.config);
    
    const success = await integration.sendTextMessage(phoneNumber, message);
    
    if (success) {
      updateIntegration(whatsappIntegration.id, {
        lastSync: new Date().toISOString()
      });
    }
    
    return success;
  }, [whatsappIntegration, updateIntegration]);
  
  const sendWelcomeMessage = useCallback(async (phoneNumber: string, userName: string) => {
    const message = `Olá ${userName}! 👋\n\nBem-vindo ao nosso sistema. Estamos aqui para ajudar!\n\nSe precisar de suporte, just responda esta mensagem.`;
    
    return sendMessage(phoneNumber, message);
  }, [sendMessage]);
  
  return {
    whatsappIntegration,
    isConnected: whatsappIntegration?.status === 'connected',
    sendMessage,
    sendWelcomeMessage
  };
}
```

---

## 🔄 Exemplo 4: Sistema de Webhooks

### 4.1 Webhook Manager

```typescript
// src/integrations/webhooks/WebhookManager.ts
export class WebhookManager {
  private static instance: WebhookManager;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  
  static getInstance(): WebhookManager {
    if (!WebhookManager.instance) {
      WebhookManager.instance = new WebhookManager();
    }
    return WebhookManager.instance;
  }
  
  // Registrar listener para eventos de webhook
  register(integrationName: string, callback: (data: any) => void): void {
    if (!this.listeners.has(integrationName)) {
      this.listeners.set(integrationName, []);
    }
    this.listeners.get(integrationName)!.push(callback);
  }
  
  // Remover listener
  unregister(integrationName: string, callback: (data: any) => void): void {
    const listeners = this.listeners.get(integrationName);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  // Processar webhook recebido
  async processWebhook(integrationName: string, data: any): Promise<void> {
    const listeners = this.listeners.get(integrationName);
    if (listeners) {
      // Executar todos os listeners registrados
      await Promise.all(listeners.map(callback => {
        try {
          return callback(data);
        } catch (error) {
          console.error(`Erro no webhook listener para ${integrationName}:`, error);
        }
      }));
    }
    
    // Emitir evento global
    IntegrationEventBus.emit('webhook:received', {
      integrationName,
      data,
      timestamp: Date.now()
    });
  }
}
```

### 4.2 Endpoint de Webhook

```typescript
// backend/routes/webhooks.cjs
const express = require('express');
const router = express.Router();
const { WebhookManager } = require('../services/WebhookManager.cjs');

// Webhook genérico para todas as integrações
router.post('/webhook/:integration', async (req, res) => {
  const { integration } = req.params;
  const webhookData = req.body;
  
  try {
    // Verificar se a integração existe e está ativa
    const integrationRecord = await getIntegrationByName(integration);
    if (!integrationRecord || integrationRecord.status !== 'connected') {
      return res.status(404).json({ error: 'Integração não encontrada ou inativa' });
    }
    
    // Verificar assinatura/token se necessário
    if (integration === 'stripe') {
      const signature = req.headers['stripe-signature'];
      if (!verifyStripeSignature(req.body, signature)) {
        return res.status(400).json({ error: 'Assinatura inválida' });
      }
    }
    
    // Processar webhook
    await WebhookManager.getInstance().processWebhook(integration, webhookData);
    
    // Log do webhook
    await logWebhook({
      integration,
      data: webhookData,
      headers: req.headers,
      timestamp: new Date()
    });
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Erro no webhook ${integration}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Webhook específico do Stripe
router.post('/webhook/stripe', (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      handlePaymentFailed(event.data.object);
      break;
    case 'customer.subscription.created':
      handleSubscriptionCreated(event.data.object);
      break;
    default:
      console.log(`Evento não tratado: ${event.type}`);
  }
  
  res.json({ received: true });
});

module.exports = router;
```

### 4.3 Hook para Webhooks

```typescript
// src/hooks/useWebhooks.ts
import { useEffect, useCallback } from 'react';
import { WebhookManager } from '../integrations/webhooks/WebhookManager';

export function useWebhooks(integrationName: string) {
  const handleWebhook = useCallback((data: any) => {
    // Processar dados do webhook
    console.log(`Webhook recebido de ${integrationName}:`, data);
    
    // Exemplo: atualizar estado local, mostrar notificação, etc.
    if (integrationName === 'stripe') {
      if (data.type === 'payment_intent.succeeded') {
        toast.success('Pagamento recebido com sucesso!');
      }
    }
    
    if (integrationName === 'whatsapp') {
      if (data.entry?.[0]?.changes?.[0]?.value?.messages) {
        toast.info('Nova mensagem WhatsApp recebida');
      }
    }
  }, [integrationName]);
  
  useEffect(() => {
    const webhookManager = WebhookManager.getInstance();
    
    // Registrar listener
    webhookManager.register(integrationName, handleWebhook);
    
    // Cleanup
    return () => {
      webhookManager.unregister(integrationName, handleWebhook);
    };
  }, [integrationName, handleWebhook]);
  
  return {
    // Outros métodos relacionados a webhooks...
  };
}
```

---

## 🧪 Exemplo 5: Testes Automatizados

### 5.1 Teste de Integração

```typescript
// src/integrations/__tests__/SendGridIntegration.test.ts
import { SendGridIntegration } from '../sendgrid/SendGridIntegration';

describe('SendGridIntegration', () => {
  let integration: SendGridIntegration;
  
  beforeEach(() => {
    integration = new SendGridIntegration();
  });
  
  describe('validateConfig', () => {
    it('deve validar configuração correta', () => {
      const config = {
        api_key: 'SG.test_key_123',
        from_email: 'test@exemplo.com',
        from_name: 'Teste'
      };
      
      const result = integration.validateConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('deve rejeitar API key inválida', () => {
      const config = {
        api_key: 'invalid_key',
        from_email: 'test@exemplo.com'
      };
      
      const result = integration.validateConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('API Key deve começar com "SG."');
    });
    
    it('deve rejeitar email inválido', () => {
      const config = {
        api_key: 'SG.test_key_123',
        from_email: 'email_invalido'
      };
      
      const result = integration.validateConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email remetente deve ser válido');
    });
  });
  
  describe('testConnection', () => {
    it('deve testar conexão com sucesso', async () => {
      const config = {
        api_key: process.env.SENDGRID_API_KEY || 'SG.test_key',
        from_email: 'test@exemplo.com'
      };
      
      // Mock da API do SendGrid
      const mockSend = jest.fn().mockResolvedValue([{
        statusCode: 202,
        headers: { 'x-message-id': 'test-message-id' }
      }]);
      
      jest.doMock('@sendgrid/mail', () => ({
        setApiKey: jest.fn(),
        send: mockSend
      }));
      
      const result = await integration.testConnection(config);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('sucesso');
      expect(result.responseTime).toBeGreaterThan(0);
    });
  });
});
```

### 5.2 Teste de Hook

```typescript
// src/hooks/__tests__/useSendGrid.test.ts
import { renderHook, act } from '@testing-library/react';
import { useSendGrid } from '../useSendGrid';
import { IntegrationsProvider } from '../../contexts/IntegrationsContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <IntegrationsProvider>{children}</IntegrationsProvider>
);

describe('useSendGrid', () => {
  it('deve retornar estado inicial correto', () => {
    const { result } = renderHook(() => useSendGrid(), { wrapper });
    
    expect(result.current.isConnected).toBe(false);
    expect(result.current.sendGridIntegration).toBeUndefined();
  });
  
  it('deve enviar email com sucesso', async () => {
    const { result } = renderHook(() => useSendGrid(), { wrapper });
    
    // Mock da integração conectada
    // ... configurar mock
    
    await act(async () => {
      const success = await result.current.sendEmail(
        'test@exemplo.com',
        'Teste',
        'Conteúdo de teste'
      );
      expect(success).toBe(true);
    });
  });
});
```

### 5.3 Teste E2E

```typescript
// cypress/integration/integrations.spec.ts
describe('Sistema de Integrações', () => {
  beforeEach(() => {
    cy.login('admin@empresa.com', 'senha123');
    cy.visit('/settings/integrations');
  });
  
  it('deve configurar integração SendGrid', () => {
    // Encontrar card do SendGrid
    cy.contains('SendGrid').parent().as('sendgridCard');
    
    // Clicar em configurar
    cy.get('@sendgridCard').find('[data-testid="configure-btn"]').click();
    
    // Preencher formulário
    cy.get('[data-testid="api-key-input"]').type(Cypress.env('SENDGRID_API_KEY'));
    cy.get('[data-testid="from-email-input"]').type('test@empresa.com');
    cy.get('[data-testid="from-name-input"]').type('Empresa Teste');
    
    // Testar conexão
    cy.get('[data-testid="test-connection-btn"]').click();
    cy.contains('Conexão estabelecida com sucesso').should('be.visible');
    
    // Salvar configuração
    cy.get('[data-testid="save-config-btn"]').click();
    cy.contains('Configuração salva com sucesso').should('be.visible');
    
    // Verificar status conectado
    cy.get('@sendgridCard').should('contain', 'Conectado');
  });
  
  it('deve falhar com credenciais inválidas', () => {
    cy.contains('Stripe').parent().as('stripeCard');
    
    cy.get('@stripeCard').find('[data-testid="configure-btn"]').click();
    
    // Usar chaves inválidas
    cy.get('[data-testid="secret-key-input"]').type('sk_test_invalid');
    cy.get('[data-testid="publishable-key-input"]').type('pk_test_invalid');
    
    cy.get('[data-testid="test-connection-btn"]').click();
    cy.contains('Falha na conexão').should('be.visible');
  });
});
```

---

## 🚀 Deploy e Monitoramento

### 6.1 Configuração de Produção

```typescript
// src/config/integrations.prod.ts
export const productionConfig = {
  encryption: {
    algorithm: 'aes-256-gcm',
    keyDerivation: 'pbkdf2'
  },
  
  monitoring: {
    enabled: true,
    healthCheckInterval: 300000, // 5 minutos
    errorReporting: true
  },
  
  rateLimit: {
    maxRequestsPerMinute: 100,
    burstSize: 20
  },
  
  security: {
    validateWebhookSignatures: true,
    encryptStoredCredentials: true,
    auditLogEnabled: true
  }
};
```

### 6.2 Health Check

```typescript
// src/services/HealthMonitor.ts
export class HealthMonitor {
  private static instance: HealthMonitor;
  private healthStatus: Map<string, HealthStatus> = new Map();
  
  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }
  
  async checkIntegrationHealth(integration: Integration): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      const integrationClass = IntegrationRegistry.get(integration.name);
      if (!integrationClass) {
        throw new Error('Integração não encontrada');
      }
      
      const result = await integrationClass.testConnection(integration.config);
      
      const health: HealthStatus = {
        status: result.success ? 'healthy' : 'error',
        lastCheck: new Date().toISOString(),
        message: result.message,
        details: {
          responseTime: result.responseTime,
          ...result.details
        }
      };
      
      this.healthStatus.set(integration.name, health);
      
      // Emitir evento de health check
      IntegrationEventBus.emit('health:checked', {
        integrationName: integration.name,
        health
      });
      
      return health;
    } catch (error) {
      const health: HealthStatus = {
        status: 'error',
        lastCheck: new Date().toISOString(),
        message: `Health check falhou: ${error.message}`
      };
      
      this.healthStatus.set(integration.name, health);
      return health;
    }
  }
  
  startMonitoring(integrations: Integration[]): void {
    const interval = setInterval(async () => {
      for (const integration of integrations) {
        if (integration.status === 'connected') {
          await this.checkIntegrationHealth(integration);
        }
      }
    }, productionConfig.monitoring.healthCheckInterval);
    
    // Limpar intervalo quando necessário
    return () => clearInterval(interval);
  }
  
  getHealthStatus(integrationName: string): HealthStatus | undefined {
    return this.healthStatus.get(integrationName);
  }
  
  getAllHealthStatuses(): Map<string, HealthStatus> {
    return new Map(this.healthStatus);
  }
}
```

---

## 📚 Conclusão

Este documento fornece exemplos práticos e padrões de implementação para o Sistema de Integrações. Os exemplos podem ser adaptados conforme suas necessidades específicas.

### Próximos Passos

1. **Implementar** as integrações específicas do seu caso de uso
2. **Configurar** testes automatizados para garantir qualidade
3. **Implementar** monitoramento em produção
4. **Documentar** integrações personalizadas
5. **Configurar** alertas para falhas de integração

### Recursos Adicionais

- [Documentação Técnica](./integrations-technical-guide.md)
- [API Reference](./integrations-api-reference.md)
- [Guia de Contribuição](../CONTRIBUTING.md)

---

**Versão**: 1.0.0  
**Última atualização**: 5 de agosto de 2025
