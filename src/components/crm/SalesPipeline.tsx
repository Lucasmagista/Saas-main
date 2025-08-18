
interface Opportunity {
  stage: string | null;
  value: number | null;
}

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StageData {
  name: string;
  count: number;
  value: number;
  color: string;
}

/**
 * Exibe o pipeline de vendas utilizando dados reais do banco de dados.  
 * Em vez de exibir números estáticos, o componente consulta a tabela
 * `opportunities` do Supabase e agrupa as oportunidades por etapa (`stage`).
 * O resultado é um array de estágios com a quantidade de oportunidades e
 * o valor total de cada etapa.  Cores são atribuídas dinamicamente com
 * base no índice do estágio.
 */
export const SalesPipeline = () => {
  const [stages, setStages] = useState<StageData[]>([]);


  useEffect(() => {
    const colorPalette = [
      "bg-blue-500",
      "bg-yellow-500",
      "bg-orange-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-red-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    const fetchData = async () => {
      try {
        const { data: dataRaw, error } = await supabase
          .from('opportunities')
          .select('stage, value');
        const data = dataRaw as Opportunity[] | null;
        if (error) {
          console.error('Erro ao buscar oportunidades:', error.message);
          return;
        }
        const grouped: Record<string, StageData> = {};
        (data || []).forEach((op) => {
          const name = op.stage || 'Sem estágio';
          if (!grouped[name]) {
            const color = colorPalette[Object.keys(grouped).length % colorPalette.length];
            grouped[name] = { name, count: 0, value: 0, color };
          }
          grouped[name].count += 1;
          // Some opportunities might not have a value defined; treat undefined as 0
          grouped[name].value += Number(op.value ?? 0);
        });
        setStages(Object.values(grouped));
      } catch (err) {
        console.error('Erro inesperado ao carregar pipeline:', err);
      }
    };
    fetchData();
  }, []);

  // Determine the maximum count to normalizar a barra de progresso
  const maxCount = stages.reduce((acc, s) => Math.max(acc, s.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pipeline de Vendas</h2>
          <p className="text-muted-foreground">Acompanhe oportunidades em cada etapa</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Oportunidade
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {stages.length === 0 && (
          <p className="col-span-5 text-center text-muted-foreground">Nenhum dado de oportunidades encontrado.</p>
        )}
        {stages.map((stage, index) => (
          <Card key={stage.name} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stage.count}</div>
                <div className="text-sm text-muted-foreground">
                  R$ {stage.value.toLocaleString()}
                </div>
                <Progress
                  value={maxCount > 0 ? (stage.count / maxCount) * 100 : 0}
                  className="h-2"
                />
              </div>
            </CardContent>
            {index < stages.length - 1 && (
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
