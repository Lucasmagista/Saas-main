
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Globe, Zap, HardDrive, TrendingUp } from "lucide-react";

export const CdnManager = () => {
  const regions = [
    { name: "América do Norte", location: "us-east-1", requests: 45000, latency: 32, hitRate: 94 },
    { name: "Europa", location: "eu-west-1", requests: 28000, latency: 28, hitRate: 91 },
    { name: "Ásia-Pacífico", location: "ap-southeast-1", requests: 18000, latency: 45, hitRate: 89 },
    { name: "América do Sul", location: "sa-east-1", requests: 12000, latency: 38, hitRate: 92 }
  ];

  const cacheStats = [
    { type: "Images", size: "2.3 GB", hitRate: 96, requests: 15000 },
    { type: "CSS/JS", size: "450 MB", hitRate: 94, requests: 8500 },
    { type: "Videos", size: "8.7 GB", hitRate: 88, requests: 3200 },
    { type: "API", size: "125 MB", hitRate: 76, requests: 25000 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">CDN Manager</h2>
          <p className="text-muted-foreground">Gestão da rede de distribuição de conteúdo</p>
        </div>
        <Button>
          <Globe className="h-4 w-4 mr-2" />
          Configurar Região
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Regiões Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Cobertura global</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Requests/hora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">103K</div>
            <p className="text-xs text-muted-foreground">+8% vs ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Cache Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.5%</div>
            <p className="text-xs text-muted-foreground">Muito eficiente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Economia Banda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">vs sem CDN</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance por Região</CardTitle>
          <CardDescription>Métricas de desempenho por localização geográfica</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regions.map((region) => (
              <div key={region.location} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Globe className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h4 className="font-semibold">{region.name}</h4>
                    <p className="text-sm text-muted-foreground">{region.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold">{region.requests.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Requests</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{region.latency}ms</div>
                    <p className="text-xs text-muted-foreground">Latência</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{region.hitRate}%</div>
                    <p className="text-xs text-muted-foreground">Hit Rate</p>
                  </div>
                  <Badge variant="default">Ativo</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Cache</CardTitle>
          <CardDescription>Análise de tipos de conteúdo em cache</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cacheStats.map((stat) => (
              <div key={stat.type} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-semibold">{stat.type}</h4>
                  <p className="text-sm text-muted-foreground">
                    {stat.size} • {stat.requests.toLocaleString()} requests
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stat.hitRate}%</div>
                  <Progress value={stat.hitRate} className="w-20 h-2 mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Hit Rate</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
