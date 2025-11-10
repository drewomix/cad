import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormEvent } from 'react';

export default function AdminSuite() {
  const queryClient = useQueryClient();
  const pendingQuery = useQuery(['pending-submissions'], async () => {
    const { data } = await api.get('/citizen/pending');
    return data.data as { persons: any[]; vehicles: any[] };
  });

  const auditQuery = useQuery(['audit-log'], async () => {
    const { data } = await api.get('/audits');
    return data.data as any[];
  });

  const reportQueueQuery = useQuery(['report-queue'], async () => {
    const { data } = await api.get('/reports/queue');
    return data as any[];
  });

  const usersQuery = useQuery(['users'], async () => {
    const { data } = await api.get('/users');
    return data.data as any[];
  });

  const approvePerson = useMutation(
    async ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) => {
      await api.post(`/citizen/persons/${id}/approve`, { status });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['pending-submissions']);
      }
    }
  );

  const approveVehicle = useMutation(
    async ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) => {
      await api.post(`/citizen/vehicles/${id}/approve`, { status });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['pending-submissions']);
      }
    }
  );

  const approveReport = useMutation(
    async ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) => {
      await api.post(`/reports/${id}/approve`, { status });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['report-queue']);
      }
    }
  );

  const createUser = useMutation(
    async (payload: Record<string, unknown>) => {
      await api.post('/users', payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
      }
    }
  );

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await createUser.mutateAsync({ email: form.get('email'), role: form.get('role'), password: form.get('password') });
    event.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Citizen Submission Queue</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-300">Persons</h4>
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Submitted</TH>
                  <TH></TH>
                </TR>
              </THead>
              <TBody>
                {(pendingQuery.data?.persons ?? []).map((person) => (
                  <TR key={person.id}>
                    <TD>
                      {person.firstName} {person.lastName}
                    </TD>
                    <TD>{new Date(person.createdAt).toLocaleString()}</TD>
                    <TD className="space-x-2">
                      <Button size="sm" onClick={() => approvePerson.mutate({ id: person.id, status: 'APPROVED' })}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => approvePerson.mutate({ id: person.id, status: 'REJECTED' })}
                      >
                        Reject
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300">Vehicles</h4>
            <Table>
              <THead>
                <TR>
                  <TH>Plate</TH>
                  <TH>Submitted</TH>
                  <TH></TH>
                </TR>
              </THead>
              <TBody>
                {(pendingQuery.data?.vehicles ?? []).map((vehicle) => (
                  <TR key={vehicle.id}>
                    <TD>
                      {vehicle.plate} / {vehicle.state}
                    </TD>
                    <TD>{new Date(vehicle.createdAt).toLocaleString()}</TD>
                    <TD className="space-x-2">
                      <Button size="sm" onClick={() => approveVehicle.mutate({ id: vehicle.id, status: 'APPROVED' })}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => approveVehicle.mutate({ id: vehicle.id, status: 'REJECTED' })}
                      >
                        Reject
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Approval Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>Incident</TH>
                <TH>Author</TH>
                <TH>Updated</TH>
                <TH></TH>
              </TR>
            </THead>
            <TBody>
              {(reportQueueQuery.data ?? []).map((report: any) => (
                <TR key={report.id}>
                  <TD>
                    #{report.incident.number} – {report.type}
                  </TD>
                  <TD>{report.author.email}</TD>
                  <TD>{new Date(report.updatedAt).toLocaleString()}</TD>
                  <TD className="space-x-2">
                    <Button size="sm" onClick={() => approveReport.mutate({ id: report.id, status: 'APPROVED' })}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => approveReport.mutate({ id: report.id, status: 'REJECTED' })}
                    >
                      Reject
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[320px_minmax(0,1fr)]">
          <form className="space-y-3" onSubmit={handleCreateUser}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" placeholder="OFFICER" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={createUser.isLoading}>
              {createUser.isLoading ? 'Creating...' : 'Create User'}
            </Button>
          </form>
          <div>
            <Table>
              <THead>
                <TR>
                  <TH>Email</TH>
                  <TH>Role</TH>
                  <TH>Created</TH>
                </TR>
              </THead>
              <TBody>
                {(usersQuery.data ?? []).map((user) => (
                  <TR key={user.id}>
                    <TD>{user.email}</TD>
                    <TD>{user.role}</TD>
                    <TD>{new Date(user.createdAt).toLocaleString()}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-auto">
          <Table>
            <THead>
              <TR>
                <TH>Actor</TH>
                <TH>Action</TH>
                <TH>Entity</TH>
                <TH>When</TH>
              </TR>
            </THead>
            <TBody>
              {(auditQuery.data ?? []).map((log) => (
                <TR key={log.id}>
                  <TD>{log.actor.email}</TD>
                  <TD>{log.action}</TD>
                  <TD>
                    {log.entityType} – {log.entityId}
                  </TD>
                  <TD>{new Date(log.at).toLocaleString()}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
