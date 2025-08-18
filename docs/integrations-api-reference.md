# Sistema de Integrações - API Reference

## 📡 Visão Geral da API

Esta documentação descreve a API interna do Sistema de Integrações, incluindo hooks, serviços e componentes reutilizáveis.

---

## 🎣 Hooks

### useIntegrations

Hook principal para gerenciar o estado das integrações.

```typescript
const {
  integrations,
  loading,
  error,
  updateIntegration,
  testConnection,
  refresh
} = useIntegrations();
```

#### Retorno

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `integrations` | `Integration[]` | Lista de todas as integrações |
| `loading` | `boolean` | Estado de carregamento |
| `error` | `string \| null` | Mensagem de erro, se houver |
| `updateIntegration` | `(id: number, updates: Partial<Integration>) => void` | Atualiza uma integração |
| `testConnection` | `(integration: Integration) => Promise<ConnectionTestResult>` | Testa conectividade |
| `refresh` | `() => Promise<void>` | Recarrega as integrações |

#### Exemplo de Uso

```typescript
function MyComponent() {
  const { integrations, updateIntegration } = useIntegrations();
  
  const handleConnect = (id: number) => {
    updateIntegration(id, { 
      status: 'connected',
      connectedAt: new Date().toISOString()
    });
  };
  
  return (
    <div>
      {integrations.map(integration => (
        <IntegrationCard 
          key={integration.id}
          integration={integration}
          onConnect={handleConnect}
        />
      ))}
    </div>
  );
}
```

### useIntegrationConfig

Hook para gerenciar a configuração de integrações específicas.

```typescript
const {
  isOpen,
  currentIntegration,
  config,
  errors,
  testing,
  openConfig,
  closeConfig,
  updateConfig,
  validateConfig,
  testConnection
} = useIntegrationConfig();
```

#### Métodos

```typescript
// Abrir configuração para uma integração
openConfig(integration: Integration): void

// Fechar modal de configuração
closeConfig(): void

// Atualizar campo de configuração
updateConfig(key: string, value: any): void

// Validar configuração atual
validateConfig(): boolean

// Testar conexão com configuração atual
testConnection(): Promise<ConnectionTestResult>
```

---

## 🏗️ Classes de Serviço

### BaseIntegration

Classe abstrata base para todas as integrações.

```typescript
abstract class BaseIntegration {
  abstract name: string;
  abstract description: string;
  abstract icon: React.ReactNode;
  
  abstract getConfigFields(): ConfigField[];
  abstract getRequiredFields(): string[];
  abstract validateConfig(config: IntegrationConfig): ValidationResult;
  abstract testConnection(config: IntegrationConfig): Promise<ConnectionTestResult>;
  abstract connect(config: IntegrationConfig): Promise<void>;
  abstract disconnect(): Promise<void>;
}
```

#### Implementação de Exemplo

```typescript
class CustomIntegration extends BaseIntegration {
  name = 'Minha Integração';
  description = 'Descrição da integração personalizada';
  icon = <MyIcon />;
  
  getConfigFields(): ConfigField[] {
    return [
      {
        key: 'api_key',
        label: 'API Key',
        type: 'password',
        placeholder: 'Sua chave de API',
        required: true
      }
    ];
  }
  
  getRequiredFields(): string[] {
    return ['api_key'];
  }
  
  validateConfig(config: IntegrationConfig): ValidationResult {
    const errors: string[] = [];
    
    if (!config.api_key) {
      errors.push('API Key é obrigatória');
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  async testConnection(config: IntegrationConfig): Promise<ConnectionTestResult> {
    try {
      const response = await fetch('https://api.exemplo.com/test', {
        headers: {
          'Authorization': `Bearer ${config.api_key}`
        }
      });
      
      return {
        success: response.ok,
        message: response.ok ? 'Conexão bem-sucedida' : 'Falha na autenticação'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro de conectividade',
        error: error.message
      };
    }
  }
  
  async connect(config: IntegrationConfig): Promise<void> {
    // Lógica de conexão
  }
  
  async disconnect(): Promise<void> {
    // Lógica de desconexão
  }
}
```

### IntegrationRegistry

Gerenciador central de integrações disponíveis.

```typescript
class IntegrationRegistry {
  static register(integration: BaseIntegration): void
  static get(name: string): BaseIntegration | undefined
  static getAll(): BaseIntegration[]
  static unregister(name: string): boolean
}
```

#### Uso

```typescript
// Registrar nova integração
IntegrationRegistry.register(new CustomIntegration());

// Obter integração específica
const slackIntegration = IntegrationRegistry.get('Slack');

// Obter todas as integrações
const allIntegrations = IntegrationRegistry.getAll();
```

---

## 🧩 Componentes

### IntegrationCard

Componente para exibir uma integração individual.

```typescript
interface IntegrationCardProps {
  integration: Integration;
  onConnect: (id: number) => void;
  onConfigure: (integration: Integration) => void;
  onDisconnect: (id: number) => void;
}

function IntegrationCard(props: IntegrationCardProps): JSX.Element
```

#### Exemplo

```typescript
<IntegrationCard
  integration={slackIntegration}
  onConnect={(id) => console.log('Conectar', id)}
  onConfigure={(integration) => openConfigModal(integration)}
  onDisconnect={(id) => console.log('Desconectar', id)}
/>
```

### ConfigModal

Modal de configuração para integrações.

```typescript
interface ConfigModalProps {
  isOpen: boolean;
  integration: Integration | null;
  onClose: () => void;
  onSave: (config: IntegrationConfig) => void;
  onTest: (config: IntegrationConfig) => Promise<ConnectionTestResult>;
}

function ConfigModal(props: ConfigModalProps): JSX.Element
```

### ConnectionStatus

Componente para exibir status de conexão.

```typescript
interface ConnectionStatusProps {
  status: IntegrationStatus;
  lastSync?: string;
  health?: HealthStatus;
}

function ConnectionStatus(props: ConnectionStatusProps): JSX.Element
```

---

## 🔧 Utilitários

### ValidationUtils

Utilitários para validação de dados.

```typescript
class ValidationUtils {
  static validateURL(url: string): boolean
  static validateEmail(email: string): boolean
  static validateToken(token: string, prefix?: string): boolean
  static sanitizeInput(input: string): string
  static maskSensitiveData(data: string, visibleChars?: number): string
}
```

#### Exemplos

```typescript
// Validar URL
const isValidURL = ValidationUtils.validateURL('https://exemplo.com');

// Validar email
const isValidEmail = ValidationUtils.validateEmail('user@exemplo.com');

// Validar token com prefixo
const isValidToken = ValidationUtils.validateToken('xoxb-123456', 'xoxb-');

// Sanitizar entrada
const cleanInput = ValidationUtils.sanitizeInput('<script>alert("xss")</script>');

// Mascarar dados sensíveis
const maskedToken = ValidationUtils.maskSensitiveData('sk_live_123456789');
// Resultado: "sk_l••••••••6789"
```

### EncryptionUtils

Utilitários para criptografia (versão simplificada).

```typescript
class EncryptionUtils {
  static encrypt(data: string): string
  static decrypt(encryptedData: string): string
  static encryptConfig(config: IntegrationConfig): IntegrationConfig
  static decryptConfig(config: IntegrationConfig): IntegrationConfig
}
```

---

## 📊 Tipos TypeScript

### Integration

```typescript
interface Integration {
  id: number;
  name: string;
  description: string;
  status: IntegrationStatus;
  icon: React.ReactNode;
  config: IntegrationConfig;
  connectedAt?: string;
  lastSync?: string;
  health?: HealthStatus;
}

type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'syncing';
```

### ConfigField

```typescript
interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'url' | 'tel' | 'number';
  placeholder: string;
  required?: boolean;
  validation?: (value: string) => boolean;
  description?: string;
}
```

### ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}
```

### ConnectionTestResult

```typescript
interface ConnectionTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  error?: string;
  details?: Record<string, any>;
}
```

### HealthStatus

```typescript
interface HealthStatus {
  status: 'healthy' | 'warning' | 'error';
  lastCheck: string;
  message?: string;
  details?: Record<string, any>;
}
```

---

## 🎯 Contextos

### IntegrationsContext

Contexto principal para gerenciar estado global das integrações.

```typescript
interface IntegrationsContextType {
  integrations: Integration[];
  updateIntegration: (id: number, updates: Partial<Integration>) => void;
  testConnection: (integration: Integration) => Promise<ConnectionTestResult>;
  getIntegrationById: (id: number) => Integration | undefined;
  loading: boolean;
  error: string | null;
}

const IntegrationsContext = createContext<IntegrationsContextType | null>(null);
```

#### Provider

```typescript
function IntegrationsProvider({ children }: { children: React.ReactNode }) {
  return (
    <IntegrationsContext.Provider value={contextValue}>
      {children}
    </IntegrationsContext.Provider>
  );
}
```

#### Hook de Consumo

```typescript
function useIntegrationsContext() {
  const context = useContext(IntegrationsContext);
  if (!context) {
    throw new Error('useIntegrationsContext deve ser usado dentro de IntegrationsProvider');
  }
  return context;
}
```

---

## 🔌 Eventos do Sistema

### EventBus

Sistema de eventos para comunicação entre componentes.

```typescript
class IntegrationEventBus {
  private listeners: Map<string, Function[]> = new Map();
  
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
  emit(event: string, data?: any): void
}

// Eventos disponíveis
type IntegrationEvents = 
  | 'integration:connected'
  | 'integration:disconnected'
  | 'integration:error'
  | 'integration:testing'
  | 'integration:config_updated';
```

#### Uso

```typescript
// Registrar listener
IntegrationEventBus.on('integration:connected', (data) => {
  console.log('Integração conectada:', data.integrationName);
});

// Emitir evento
IntegrationEventBus.emit('integration:connected', {
  integrationName: 'Slack',
  timestamp: Date.now()
});
```

---

## 🛠️ Customização Avançada

### Criando Integração Personalizada

1. **Definir a Classe**

```typescript
class MinhaIntegracao extends BaseIntegration {
  name = 'Minha API';
  description = 'Integração com minha API personalizada';
  icon = <MeuIcon />;
  
  // Implementar métodos abstratos...
}
```

2. **Registrar no Sistema**

```typescript
IntegrationRegistry.register(new MinhaIntegracao());
```

3. **Configurar Campos Específicos**

```typescript
getConfigFields(): ConfigField[] {
  return [
    {
      key: 'server_url',
      label: 'URL do Servidor',
      type: 'url',
      placeholder: 'https://meuservidor.com/api',
      required: true,
      validation: (value) => value.startsWith('https://')
    },
    {
      key: 'api_version',
      label: 'Versão da API',
      type: 'text',
      placeholder: 'v1',
      required: false
    }
  ];
}
```

### Hook Personalizado

```typescript
function useMinhaIntegracao() {
  const { integrations, updateIntegration } = useIntegrations();
  
  const minhaIntegracao = useMemo(() => 
    integrations.find(i => i.name === 'Minha API'),
    [integrations]
  );
  
  const enviarDados = useCallback(async (dados: any) => {
    if (!minhaIntegracao?.config.server_url) {
      throw new Error('Integração não configurada');
    }
    
    const response = await fetch(`${minhaIntegracao.config.server_url}/dados`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${minhaIntegracao.config.api_key}`
      },
      body: JSON.stringify(dados)
    });
    
    return response.json();
  }, [minhaIntegracao]);
  
  return {
    minhaIntegracao,
    enviarDados,
    isConfigured: !!minhaIntegracao?.config.server_url
  };
}
```

---

## 📋 Checklist de Implementação

### Para Nova Integração

- [ ] Criar classe que estende `BaseIntegration`
- [ ] Implementar todos os métodos abstratos
- [ ] Definir campos de configuração
- [ ] Implementar validação específica
- [ ] Criar teste de conectividade
- [ ] Registrar no `IntegrationRegistry`
- [ ] Adicionar ícone/logo
- [ ] Criar testes unitários
- [ ] Documentar configuração
- [ ] Testar fluxo completo

### Para Novo Componente

- [ ] Definir interface de props
- [ ] Implementar componente funcional
- [ ] Adicionar memoização se necessário
- [ ] Criar testes de componente
- [ ] Documentar uso
- [ ] Verificar acessibilidade
- [ ] Testar responsividade

---

## 🐛 Debug e Troubleshooting

### Logs de Debug

```typescript
// Ativar logs detalhados
localStorage.setItem('integrations_debug', 'true');

// Logs automáticos
console.log('Integration config:', integration.config);
console.log('Validation result:', validationResult);
console.log('Connection test:', testResult);
```

### Problemas Comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| Hook não funciona | Não está dentro do Provider | Envolver com `IntegrationsProvider` |
| Validação falha | Campos obrigatórios vazios | Verificar `getRequiredFields()` |
| Teste de conexão falha | API indisponível ou credenciais erradas | Verificar logs de rede |
| Estado não atualiza | Mutação direta do estado | Usar `updateIntegration()` |

---

**Versão da API**: 1.0.0  
**Compatibilidade**: React 18+, TypeScript 4.5+  
**Última atualização**: 5 de agosto de 2025
