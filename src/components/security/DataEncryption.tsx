
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, Lock, Shield } from "lucide-react";

export const DataEncryption = () => {
  const encryptionSettings = [
    { name: "Database Encryption", status: "enabled", type: "AES-256", lastUpdated: "2024-01-15" },
    { name: "File Storage Encryption", status: "enabled", type: "AES-256", lastUpdated: "2024-01-10" },
    { name: "Transit Encryption", status: "enabled", type: "TLS 1.3", lastUpdated: "2024-01-20" },
    { name: "Backup Encryption", status: "enabled", type: "AES-256", lastUpdated: "2024-01-18" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Criptografia de Dados</h2>
          <p className="text-muted-foreground">Configurações de segurança e criptografia</p>
        </div>
        <Button>
          <Key className="h-4 w-4 mr-2" />
          Gerenciar Chaves
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Nível de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Alto</div>
            <p className="text-xs text-muted-foreground">AES-256 ativado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Dados Criptografados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">Todos os dados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chaves Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Chaves de criptografia</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {encryptionSettings.map((setting) => (
          <Card key={setting.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{setting.name}</h3>
                    <Badge variant="default">
                      {setting.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Tipo: {setting.type}</span>
                    <span>Atualizado: {setting.lastUpdated}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Configurar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
