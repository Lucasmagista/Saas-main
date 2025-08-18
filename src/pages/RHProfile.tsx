import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RHProfile = () => (
  <div className="p-8">
    <Card>
      <CardHeader>
        <CardTitle>Perfil de RH</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Área exclusiva para RH. Gerencie colaboradores, benefícios e processos de RH.</p>
      </CardContent>
    </Card>
  </div>
);

export default RHProfile;
