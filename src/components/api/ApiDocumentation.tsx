
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Play, Book } from "lucide-react";

export const ApiDocumentation = () => {
  const endpoints = [
    { method: "GET", path: "/api/users", description: "Lista todos os usuários", status: "Active" },
    { method: "POST", path: "/api/users", description: "Cria novo usuário", status: "Active" },
    { method: "PUT", path: "/api/users/:id", description: "Atualiza usuário", status: "Active" },
    { method: "DELETE", path: "/api/users/:id", description: "Remove usuário", status: "Active" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Documentação da API</h2>
          <p className="text-muted-foreground">Explore e teste todos os endpoints da API</p>
        </div>
        <Button>
          <Book className="h-4 w-4 mr-2" />
          Baixar OpenAPI
        </Button>
      </div>

      <Tabs defaultValue="endpoints">
        <TabsList>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="authentication">Autenticação</TabsTrigger>
          <TabsTrigger value="examples">Exemplos</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          {endpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Badge variant={endpoint.method === "GET" ? "default" : "secondary"}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{endpoint.path}</code>
                  </div>
                  <Badge variant="outline">{endpoint.status}</Badge>
                </div>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Testar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle>Autenticação API</CardTitle>
              <CardDescription>Como autenticar suas requisições</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Bearer Token</h4>
                  <code className="block bg-muted p-3 rounded text-sm">
                    Authorization: Bearer YOUR_API_KEY_HERE
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples">
          <Card>
            <CardHeader>
              <CardTitle>Exemplos de Código</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="block bg-muted p-4 rounded text-sm whitespace-pre">
{`curl -X GET "https://api.example.com/users" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
              </code>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
