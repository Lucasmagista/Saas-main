import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart3, FileText, DollarSign, TrendingUp, Download } from "lucide-react";
import styles from "./FINANCEIROProfile.module.css";

const financeSummary = [
  { label: "Receita Total", value: "R$ 1.250.000,00", icon: DollarSign, color: "text-green-600" },
  { label: "Despesas", value: "R$ 830.000,00", icon: FileText, color: "text-red-600" },
  { label: "Lucro Líquido", value: "R$ 420.000,00", icon: TrendingUp, color: "text-blue-600" },
  { label: "Faturas Pendentes", value: "8", icon: BarChart3, color: "text-yellow-600" },
];

const recentTransactions = [
  { id: 1, desc: "Pagamento fornecedor ABC", value: "-R$ 12.500,00", date: "21/07/2025", status: "Pago" },
  { id: 2, desc: "Recebimento cliente XPTO", value: "+R$ 35.000,00", date: "20/07/2025", status: "Recebido" },
  { id: 3, desc: "Pagamento folha salarial", value: "-R$ 80.000,00", date: "18/07/2025", status: "Pago" },
  { id: 4, desc: "Recebimento cliente ZYX", value: "+R$ 18.000,00", date: "17/07/2025", status: "Recebido" },
];

const FINANCEIROProfile = () => (

  <div className="p-8 space-y-8">
    <Card>
      <CardHeader>
        <CardTitle>Financeiro</CardTitle>
        <CardDescription>Área exclusiva para FINANCEIRO. Visualize relatórios, controle de despesas e receitas.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtros avançados */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input type="text" className="border rounded px-3 py-2 w-full md:w-1/3" placeholder="Buscar transação, fornecedor ou cliente..." />
          <label htmlFor="tipo-select" className="sr-only">Tipo</label>
          <select id="tipo-select" aria-label="Tipo" className="border rounded px-3 py-2 w-full md:w-1/6">
            <option value="">Tipo</option>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
            <option value="fatura">Fatura</option>
          </select>
          <label htmlFor="status-select" className="sr-only">Status</label>
          <select id="status-select" aria-label="Status" className="border rounded px-3 py-2 w-full md:w-1/6">
            <option value="">Status</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="recebido">Recebido</option>
          </select>
          <Button variant="default" className="w-full md:w-auto">Filtrar</Button>
        </div>

        {/* Painel de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {financeSummary.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="shadow-sm">
                <CardContent className="flex items-center gap-4 py-6">
                  <Icon className={`w-8 h-8 ${item.color}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-xl font-bold">{item.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Painel de Metas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Metas Financeiras</CardTitle>
            <CardDescription>Acompanhe o progresso das metas do setor.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Meta de Receita</p>
                <p className="text-lg font-bold text-green-600">R$ 1.500.000,00</p>
                <div className="w-full h-2 bg-green-100 rounded mt-2">
                  <div className={`h-2 bg-green-500 rounded ${styles.metaGreenWidth}`}></div>
                </div>
                <span className="text-xs text-green-700">83% atingido</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meta de Redução de Despesas</p>
                <p className="text-lg font-bold text-red-600">R$ 800.000,00</p>
                <div className="w-full h-2 bg-red-100 rounded mt-2">
                  <div className="h-2 bg-red-500 rounded meta-red-width"></div>
                </div>
                <span className="text-xs text-red-700">Ultrapassado</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meta de Lucro</p>
                <p className="text-lg font-bold text-blue-600">R$ 500.000,00</p>
                <div className="w-full h-2 bg-blue-100 rounded mt-2">
                  <div className={`h-2 bg-blue-500 rounded ${styles.metaBlueWidth}`}></div>
                </div>
                <span className="text-xs text-blue-700">84% atingido</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Simulação de Fluxo de Caixa */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Fluxo de Caixa Projetado</CardTitle>
            <CardDescription>Simulação dos próximos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center text-muted-foreground">[Gráfico de Fluxo de Caixa]</div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline"><Download className="w-4 h-4 mr-2" />Exportar Simulação</Button>
              <Button variant="default">Ver Detalhes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Transações */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Transações Recentes</h2>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exportar Extrato</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-2 text-left">Descrição</th>
                  <th className="px-4 py-2 text-left">Valor</th>
                  <th className="px-4 py-2 text-left">Data</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(tx => (
                  <tr key={tx.id} className="border-b">
                    <td className="px-4 py-2">{tx.desc}</td>
                    <td className={`px-4 py-2 font-medium ${tx.value.startsWith("-") ? "text-red-600" : "text-green-600"}`}>{tx.value}</td>
                    <td className="px-4 py-2">{tx.date}</td>
                    <td className="px-4 py-2"><Badge variant={tx.status === "Pago" ? "secondary" : "default"}>{tx.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Relatórios e Ações */}
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
              <CardDescription>Visualize gráficos e relatórios detalhados.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center text-muted-foreground">[Gráfico de Receita/Despesa]</div>
              <Button variant="outline" className="mt-4"><FileText className="w-4 h-4 mr-2" />Ver Relatórios</Button>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Gerencie pagamentos, recebimentos e faturas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="default" className="w-full">Registrar Pagamento</Button>
              <Button variant="default" className="w-full">Registrar Recebimento</Button>
              <Button variant="outline" className="w-full">Gerenciar Faturas</Button>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        {/* Notificações e Alertas */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações e Alertas</CardTitle>
            <CardDescription>Fique atento às pendências e movimentações importantes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="text-yellow-700">⚠️ 2 faturas vencem hoje</li>
              <li className="text-green-700">✔️ Recebimento confirmado de R$ 35.000,00</li>
              <li className="text-red-700">❌ Despesa acima do previsto: folha salarial</li>
              <li className="text-blue-700">ℹ️ Relatório mensal disponível para download</li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  </div>
);

export default FINANCEIROProfile;
