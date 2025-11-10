import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

export default function DashboardPage() {
  const incidentsQuery = useQuery(['incidents'], async () => {
    const { data } = await api.get('/incidents');
    return data;
  });

  const unitsQuery = useQuery(['units'], async () => {
    const { data } = await api.get('/units');
    return data;
  });

  const boloQuery = useQuery(['bolos'], async () => {
    const { data } = await api.get('/bolos');
    return data;
  });

  const summary = useMemo(() => {
    const incidents = incidentsQuery.data ?? [];
    return {
      openCalls: incidents.length,
      priority1: incidents.filter((inc: any) => inc.priority === 1).length,
      unitsAvailable: (unitsQuery.data ?? []).filter((unit: any) => unit.dutyStatus === 'AVAILABLE').length,
      boloCount: (boloQuery.data ?? []).length
    };
  }, [incidentsQuery.data, unitsQuery.data, boloQuery.data]);

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Active Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <SummaryItem label="Open Incidents" value={summary.openCalls} />
          <SummaryItem label="Priority 1" value={summary.priority1} tone="danger" />
          <SummaryItem label="Units Available" value={summary.unitsAvailable} tone="success" />
          <SummaryItem label="Active BOLOs" value={summary.boloCount} tone="warning" />
        </CardContent>
      </Card>
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Active Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>#</TH>
                <TH>Type</TH>
                <TH>Priority</TH>
                <TH>Status</TH>
                <TH>Address</TH>
              </TR>
            </THead>
            <TBody>
              {(incidentsQuery.data ?? []).map((incident: any) => (
                <TR key={incident.id}>
                  <TD>{incident.number}</TD>
                  <TD>{incident.type}</TD>
                  <TD>
                    <Badge className={incident.priority === 1 ? 'border-danger text-danger' : ''}>
                      P{incident.priority}
                    </Badge>
                  </TD>
                  <TD>{incident.status}</TD>
                  <TD>{incident.address}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle>Unit Status Board</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>Callsign</TH>
                <TH>Type</TH>
                <TH>Status</TH>
                <TH>Assigned</TH>
              </TR>
            </THead>
            <TBody>
              {(unitsQuery.data ?? []).map((unit: any) => (
                <TR key={unit.id}>
                  <TD>{unit.callsign}</TD>
                  <TD>{unit.type}</TD>
                  <TD>{unit.dutyStatus}</TD>
                  <TD>{unit.user?.email ?? 'Unassigned'}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone?: 'danger' | 'success' | 'warning';
}) {
  const toneClass =
    tone === 'danger'
      ? 'text-red-400'
      : tone === 'success'
      ? 'text-emerald-400'
      : tone === 'warning'
      ? 'text-amber-400'
      : 'text-slate-100';
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
