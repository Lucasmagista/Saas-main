
// Dois toasters são usados: um para notificações padrão e outro para Sonner (notificações avançadas)
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useNavItems } from "./nav-items";
import React from "react";
import Layout from "./components/Layout";
import { AuthProvider } from "./hooks/useAuth";
import { OnboardingGuard, PublicRoute } from "./components/auth/OnboardingGuard";
import { RoleProvider } from "./contexts/RoleContext";
import { RoleGuard } from "./components/auth/RoleGuard";
import Unauthorized from "./pages/Unauthorized";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import OnboardingPage from "./pages/auth/OnboardingPage";

const queryClient = new QueryClient();

// Componente interno que tem acesso ao contexto de autenticação
const AppContent = () => {
  const navItems = useNavItems();
  
  return (
    <BrowserRouter>
      <React.Suspense fallback={<div className="app-fallback-loader">Carregando...</div>}>
        <Routes>
          {/* Public Routes - Com proteção para usuários já autenticados */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          
          {/* Onboarding Route - Protegida mas sem verificar completion */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          
          {/* Página quando o usuário não possui permissão */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected Routes com verificação de onboarding */}
          <Route path="/" element={
            <OnboardingGuard>
              <Layout />
            </OnboardingGuard>
          }>
            {/* Rota raiz redireciona para dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            {navItems.map(({ to, page, roles }) => (
              <Route
                key={to}
                path={to === '/' ? '' : to.substring(1)} // Fix: Remove apenas a primeira barra, mantendo estrutura
                element={
                  <RoleGuard allowedRoles={roles}>
                    {page}
                  </RoleGuard>
                }
              />
            ))}
          </Route>
          {/* Redirecionamento padrão para dashboard caso rota não exista */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
};

const App = () => {
  console.log('App component rendered - Sistema de Refresh Tokens ativo');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* O provedor de Roles envolve toda a aplicação para disponibilizar o contexto */}
        <RoleProvider>
          {/* AuthProvider atualizado com sistema de refresh tokens */}
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </RoleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;