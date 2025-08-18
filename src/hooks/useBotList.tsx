import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BotRecord {
  id: string;
  name: string;
  session_name: string | null;
  qrcode: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  organization_id: string | null;
  description: string | null;
}

// Hook para listar bots cadastrados na tabela `bots` do Supabase
export const useBotList = () => {
  return useQuery<BotRecord[]>({
    queryKey: ['botList'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BotRecord[];
    },
  });
};