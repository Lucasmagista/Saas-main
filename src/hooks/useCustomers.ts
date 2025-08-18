import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  location?: string;
  avatar?: string;
  status: string;
  segment: string;
  totalSpent: number;
  orders: number;
  lastPurchase: string;
  lifetimeValue: number;
  satisfaction: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const API_BASE = (import.meta.env as { [key: string]: string | undefined }).VITE_API_BASE || 'http://localhost:3002';

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE}/api/customers`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao carregar clientes');
        }

        // Garante que sempre seja um array
        const customersArray = Array.isArray(data) ? data : [];
        setCustomers(customersArray);
      } catch (err: unknown) {
        console.error('Erro ao carregar clientes:', err);
        let errorMessage = 'Erro desconhecido';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        setCustomers([]); // Define como array vazio em caso de erro
        toast({
          title: 'Erro ao carregar clientes',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [API_BASE, toast]);

  const refetch = () => {
    setLoading(true);
    const fetchCustomers = async () => {
      try {
        setError(null);
        
        const response = await fetch(`${API_BASE}/api/customers`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao carregar clientes');
        }

        // Garante que sempre seja um array
        const customersArray = Array.isArray(data) ? data : [];
        setCustomers(customersArray);
      } catch (err: unknown) {
        console.error('Erro ao recarregar clientes:', err);
        let errorMessage = 'Erro desconhecido';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  };

  return {
    customers,
    loading,
    error,
    refetch,
  };
};
