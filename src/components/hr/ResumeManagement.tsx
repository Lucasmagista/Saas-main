import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Candidate = Database["public"]["Tables"]["candidates"]["Row"];

/*
 * ResumeManagement
 *
 * Esta tela foi criada para centralizar a gestão de candidatos e currículos recebidos pelo bot de recrutamento.
 * Ela exibe métricas agregadas, permite filtrar/pesquisar candidatos e lista cada inscrição
 * com suas informações básicas e um indicador de pontuação. Os dados são obtidos da tabela candidates
 * que contém as informações de status dos candidatos.
 */

// Retorna classes Tailwind para colorir o badge conforme o status do candidato
const getStatusColor = (status: string) => {
  switch (status) {
    case "screening":
      return "bg-yellow-100 text-yellow-800";
    case "review":
      return "bg-blue-100 text-blue-800";
    case "selected":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Converte o status interno em um rótulo em português
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    screening: "Triagem",
    review: "Em avaliação",
    selected: "Selecionado",
    rejected: "Rejeitado",
  };
  return labels[status] ?? status;
};

export const ResumeManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("candidates")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) {
          setError("Erro ao buscar candidatos: " + error.message);
        } else {
          setCandidates(data || []);
        }
      } catch (err) {
        console.error("Erro ao carregar candidatos:", err);
        setError("Erro ao carregar candidatos");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  // Cálculo das métricas agregadas por status
  const metrics = useMemo(() => {
    return candidates.reduce(
      (acc, cur) => {
        // Ajuste: se não houver status, considerar 'screening'
        const status = cur.status || 'screening';
        acc.total += 1;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {
        total: 0,
        screening: 0,
        review: 0,
        selected: 0,
        rejected: 0,
      } as Record<string, number>
    );
  }, [candidates]);

  // Filtragem de candidatos por termo de busca
  const filteredCandidates = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return candidates.filter((candidate) => {
      return (
        candidate.name?.toLowerCase().includes(term) ||
        candidate.email?.toLowerCase().includes(term) ||
        candidate.phone?.toLowerCase().includes(term)
      );
    });
  }, [candidates, searchTerm]);

  const renderCandidatesList = () => {
    if (loading) {
      return <div className="text-center py-12 text-muted-foreground">Carregando candidatos...</div>;
    }
    
    if (error) {
      return (
        <Card>
          <CardContent className="text-center py-12 text-red-600">{error}</CardContent>
        </Card>
      );
    }
    
    return (
      <div className="grid gap-6">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground">{candidate.email}</p>
                  {candidate.phone && (
                    <p className="text-sm text-muted-foreground">{candidate.phone}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Aplicado em {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString("pt-BR") : 'Data não disponível'}
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <Badge className={getStatusColor(candidate.status || 'screening')}>
                    {getStatusLabel(candidate.status || 'screening')}
                  </Badge>
                  {candidate.resume_url && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Currículo
                    </Button>
                  )}
                  <Button size="sm" variant="secondary">
                    <Eye className="h-4 w-4 mr-2" />
                    Análise
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Pontuação</p>
                <Progress value={candidate.score || 0} />
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredCandidates.length === 0 && (
          <div className="text-center text-muted-foreground">Nenhum candidato encontrado.</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Total */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        {/* Triagem */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.screening}</div>
              <div className="text-sm text-muted-foreground">Triagem</div>
            </div>
          </CardContent>
        </Card>
        {/* Em Avaliação */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.review}</div>
              <div className="text-sm text-muted-foreground">Avaliação</div>
            </div>
          </CardContent>
        </Card>
        {/* Selecionados */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.selected}</div>
              <div className="text-sm text-muted-foreground">Selecionados</div>
            </div>
          </CardContent>
        </Card>
        {/* Rejeitados */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.rejected}</div>
              <div className="text-sm text-muted-foreground">Rejeitados</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de pesquisa e filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar candidatos por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Candidatos */}
      {renderCandidatesList()}
    </div>
  );
};