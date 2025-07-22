
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, BookOpen, Download, Github, Terminal } from "lucide-react";

export const DeveloperSdk = () => {
  const sdkFeatures = [
    { name: "REST API", description: "API completa para todas as funcionalidades", status: "stable" },
    { name: "WebHooks", description: "Notificações em tempo real", status: "stable" },
    { name: "GraphQL", description: "Query flexível de dados", status: "beta" },
    { name: "Realtime SDK", description: "Comunicação em tempo real", status: "alpha" }
  ];

  const codeExamples = [
    {
      language: "JavaScript",
      code: `import { SaasSDK } from '@saas/sdk';

const client = new SaasSDK({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.yoursaas.com'
});

// Create a new user
const user = await client.users.create({
  name: 'John Doe',
  email: 'john@example.com'
});`
    },
    {
      language: "Python",
      code: `from saas_sdk import SaasClient

client = SaasClient(
    api_key='your-api-key',
    base_url='https://api.yoursaas.com'
)

# Create a new user
user = client.users.create(
    name='John Doe',
    email='john@example.com'
)`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">SDK para Desenvolvedores</h2>
          <p className="text-muted-foreground">Ferramentas e recursos para integração</p>
        </div>
        <Button>
          <Github className="h-4 w-4 mr-2" />
          Ver no GitHub
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Code className="h-4 w-4" />
              Linguagens Suportadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">JavaScript, Python, PHP, etc.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Documentação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">APIs documentadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Download className="h-4 w-4" />
              Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5K</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recursos do SDK</CardTitle>
          <CardDescription>Funcionalidades disponíveis para desenvolvedores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sdkFeatures.map((feature) => (
              <div key={feature.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{feature.name}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <Badge variant={feature.status === "stable" ? "default" : feature.status === "beta" ? "secondary" : "outline"}>
                  {feature.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Exemplos de Código
          </CardTitle>
          <CardDescription>Como começar com nosso SDK</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {codeExamples.map((example) => (
              <div key={example.language}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{example.language}</h4>
                  <Button size="sm" variant="outline">
                    Copiar
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{example.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
