
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackupManager } from "@/components/security/BackupManager";
import { AuditLogs } from "@/components/security/AuditLogs";
import { AccessControl } from "@/components/security/AccessControl";
import { DataEncryption } from "@/components/security/DataEncryption";
import { ComplianceManager } from "@/components/security/ComplianceManager";

const Security = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Segurança & Backup</h1>
          <p className="text-muted-foreground">Controle de segurança, backup e compliance</p>
        </div>
      </div>

      <Tabs defaultValue="backup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="access">Controle de Acesso</TabsTrigger>
          <TabsTrigger value="encryption">Criptografia</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="backup">
          <BackupManager />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogs />
        </TabsContent>

        <TabsContent value="access">
          <AccessControl />
        </TabsContent>

        <TabsContent value="encryption">
          <DataEncryption />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Security;
