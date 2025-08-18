import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export function UserRolePanel() {
  const [users, setUsers] = useState([]);
  const [editModal, setEditModal] = useState({ open: false, user: null });
  const [form, setForm] = useState({ email: "", role: "user", permissions: [] });
  const [roles, setRoles] = useState(["admin", "manager", "user", "guest"]);
  const [allPermissions, setAllPermissions] = useState([
    "canEditUser", "canViewReports", "canManageRoles", "canUploadFiles"
  ]);

  useEffect(() => {
    api.get("/api/users/list").then(res => setUsers(res.data.users));
  }, [editModal.open]);

  const handleEdit = (user) => {
    setForm({
      email: user.email,
      role: user.role,
      permissions: user.permissions || []
    });
    setEditModal({ open: true, user });
  };

  const handleSave = async () => {
    if (editModal.user) {
      await api.put(`/api/users/permissions/${editModal.user.id}`, {
        role: form.role,
        permissions: form.permissions
      });
    } else {
      await api.post("/api/users/create", form);
    }
    setEditModal({ open: false, user: null });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Usuários & Permissões</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm mb-4">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Permissões</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td><Badge>{user.role}</Badge></td>
                <td>
                  {user.permissions?.map(p => (
                    <Badge key={p} variant="outline">{p}</Badge>
                  ))}
                </td>
                <td>
                  <Button size="sm" onClick={() => handleEdit(user)}>Editar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button className="mt-2" onClick={() => {
          setForm({ email: "", role: "user", permissions: [] });
          setEditModal({ open: true, user: null });
        }}>Novo Usuário</Button>
      </CardContent>
      {editModal.open && (
        <Dialog open={editModal.open} onOpenChange={open => setEditModal({ ...editModal, open })}>
          <DialogContent>
            <div className="space-y-4">
              <Input
                placeholder="Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                disabled={!!editModal.user}
              />
              <div>
                <label htmlFor="role-select" className="block mb-1">Role</label>
                <select
                  id="role-select"
                  className="border rounded px-2 py-1 w-full"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Permissões</label>
                <div className="flex flex-wrap gap-2">
                  {allPermissions.map(p => (
                    <label key={p} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(p)}
                        onChange={e => {
                          setForm({
                            ...form,
                            permissions: e.target.checked
                              ? [...form.permissions, p]
                              : form.permissions.filter(x => x !== p)
                          });
                        }}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <Button variant="outline" onClick={() => setEditModal({ open: false, user: null })}>Cancelar</Button>
                <Button onClick={handleSave}>Salvar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
