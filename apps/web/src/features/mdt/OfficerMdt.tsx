import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { useSocket } from '@/hooks/useSocket';
import { DutyStatusHotkeys } from '@cad/shared';

const statusOrder: Array<{ label: string; value: string }> = [
  { label: 'Available (A)', value: 'AVAILABLE' },
  { label: 'En Route (E)', value: 'EN_ROUTE' },
  { label: 'On Scene (O)', value: 'ON_SCENE' },
  { label: 'Transport (T)', value: 'TRANSPORT' },
  { label: 'Code 4', value: 'CODE4' },
  { label: 'Unavailable (UC)', value: 'UNAVAILABLE' }
];

export default function OfficerMdt() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [activeUnitId, setActiveUnitId] = useState<string>('');
  const [reportIncidentId, setReportIncidentId] = useState<string>('');
  const [reportBody, setReportBody] = useState('');
  const [reportType, setReportType] = useState('INCIDENT');

  const unitsQuery = useQuery(['units'], async () => {
    const { data } = await api.get('/units');
    return data as any[];
  });

  const incidentsQuery = useQuery(['incidents'], async () => {
    const { data } = await api.get('/incidents');
    return data as any[];
  });

  const reportsQuery = useQuery(['reports', reportIncidentId], async () => {
    if (!reportIncidentId) return [];
    const { data } = await api.get(`/reports/incident/${reportIncidentId}`);
    return data as any[];
  }, { enabled: Boolean(reportIncidentId) });

  const setDuty = useMutation(
    async ({ unitId, status }: { unitId: string; status: string }) => {
      await api.post(`/units/${unitId}/duty`, { status });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['units']);
      }
    }
  );

  const submitStatus = useMutation(async ({ incidentId, status }: { incidentId: string; status: string }) => {
    await api.patch(`/incidents/${incidentId}`, { status });
  });

  const submitReport = useMutation(
    async ({ incidentId, body, type }: { incidentId: string; body: string; type: string }) => {
      const report = await api.post('/reports', { incidentId, bodyRtf: body, type });
      await api.post(`/reports/${report.data.id}/submit`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reports', reportIncidentId]);
      }
    }
  );

  const approveReport = useMutation(
    async ({ reportId, status }: { reportId: string; status: 'APPROVED' | 'REJECTED' }) => {
      await api.post(`/reports/${reportId}/approve`, { status });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reports', reportIncidentId]);
      }
    }
  );

  const registerSocket = useCallback(() => {
    queryClient.invalidateQueries(['incidents']);
    queryClient.invalidateQueries(['units']);
  }, [queryClient]);

  const socketReady = useCallback(
    (socket: any) => {
      socket.on('incident:updated', registerSocket);
      socket.on('dispatch:assign', registerSocket);
      socket.on('unit:status.update', registerSocket);
    },
    [registerSocket]
  );

  useSocket(socketReady);

  const officerUnits = useMemo(() => {
    return (unitsQuery.data ?? []).filter((unit) => unit.user?.id === user?.id);
  }, [unitsQuery.data, user?.id]);

  const selectedUnit = officerUnits.find((unit) => unit.id === activeUnitId) ?? officerUnits[0];

  const assignedIncidents = useMemo(() => {
    if (!selectedUnit) return [];
    return (incidentsQuery.data ?? []).filter((incident) =>
      incident.units?.some((link: any) => link.unitId === selectedUnit.id && !link.clearedAt)
    );
  }, [selectedUnit, incidentsQuery.data]);

  if (!selectedUnit) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
        No unit is currently assigned to your account. Contact a supervisor to attach a unit before using the MDT.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Unit Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs uppercase text-slate-500">Assigned Unit</label>
            <select
              className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
              value={selectedUnit?.id ?? ''}
              onChange={(event) => setActiveUnitId(event.target.value)}
            >
              {officerUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.callsign} ({unit.dutyStatus})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {statusOrder.map((status) => (
              <Button
                key={status.value}
                variant={selectedUnit?.dutyStatus === status.value ? 'default' : 'outline'}
                onClick={() => selectedUnit && setDuty.mutate({ unitId: selectedUnit.id, status: status.value })}
              >
                {status.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Quick keys: {Object.entries(DutyStatusHotkeys).map(([status, key]) => `${status}=${key}`).join(', ')}
          </p>
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR>
                  <TH>#</TH>
                  <TH>Type</TH>
                  <TH>Status</TH>
                  <TH></TH>
                </TR>
              </THead>
              <TBody>
                {assignedIncidents.map((incident) => (
                  <TR key={incident.id}>
                    <TD>{incident.number}</TD>
                    <TD>{incident.type}</TD>
                    <TD>{incident.status}</TD>
                    <TD className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => submitStatus.mutate({ incidentId: incident.id, status: 'EN_ROUTE' })}
                      >
                        En Route
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => submitStatus.mutate({ incidentId: incident.id, status: 'ON_SCENE' })}
                      >
                        On Scene
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setReportIncidentId(incident.id);
                          setReportBody('');
                          setReportType('INCIDENT');
                        }}
                      >
                        Report
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
        {reportIncidentId && (
          <Card>
            <CardHeader>
              <CardTitle>Incident Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Narrative"
                rows={5}
                value={reportBody}
                onChange={(event) => setReportBody(event.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="INCIDENT"
                  value={reportType}
                  onChange={(event) => setReportType(event.target.value)}
                  className="w-40"
                />
                <Button
                  onClick={() => {
                    if (!reportBody.trim()) return;
                    submitReport.mutate({ incidentId: reportIncidentId, body: reportBody, type: reportType });
                    setReportBody('');
                  }}
                >
                  Submit for Review
                </Button>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-300">Draft History</h4>
                <Table>
                  <THead>
                    <TR>
                      <TH>Type</TH>
                      <TH>Status</TH>
                      <TH>Updated</TH>
                      <TH></TH>
                    </TR>
                  </THead>
                  <TBody>
                    {(reportsQuery.data ?? []).map((report: any) => (
                      <TR key={report.id}>
                        <TD>{report.type}</TD>
                        <TD>{report.status}</TD>
                        <TD>{new Date(report.updatedAt).toLocaleString()}</TD>
                        <TD>
                          {user?.role === 'SUPERVISOR' && report.status === 'SUBMITTED' && (
                            <div className="space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => approveReport.mutate({ reportId: report.id, status: 'APPROVED' })}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => approveReport.mutate({ reportId: report.id, status: 'REJECTED' })}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
