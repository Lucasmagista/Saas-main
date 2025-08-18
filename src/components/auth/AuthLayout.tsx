
import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export const AuthLayout = ({ children, title, description }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="relative">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader className="text-center space-y-3 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-primary rounded-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {title}
              </CardTitle>
              <CardDescription className="text-muted-foreground/90">
                {description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
