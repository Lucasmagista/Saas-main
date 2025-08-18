import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CEOProfile = () => (
  <div className="p-8">
    <Card>
      <CardHeader>
        <CardTitle>Perfil do CEO</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Bem-vindo à sua área exclusiva de CEO. Aqui você pode visualizar indicadores estratégicos, tomar decisões e acessar recursos de diretoria.</p>
      </CardContent>
    </Card>
  </div>
);

export default CEOProfile;
