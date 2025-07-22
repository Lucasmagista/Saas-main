import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ADMINProfile = () => (
  <div className="p-8">
    <Card>
      <CardHeader>
        <CardTitle>Perfil do Administrador</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Área exclusiva para ADMIN. Gerencie configurações, permissões e recursos administrativos.</p>
      </CardContent>
    </Card>
  </div>
);

export default ADMINProfile;
