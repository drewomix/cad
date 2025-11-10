import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { Tabs } from '@/components/ui/tabs';
import { useSocket } from '@/hooks/useSocket';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fromPostgresPoint } from '@cad/shared';
import { Icon } from 'leaflet';
import { FormEvent } from 'react';

const unitIcon = new Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function DispatchConsole() {
  const queryClient = useQueryClient();

  const incidentsQuery = useQuery(['incidents'], async () => {
    const { data } = await api.get('/incidents');
    return data as any[];
  });

  const unitsQuery = useQuery(['units'], async () => {
    const { data } = await api.get('/units');
    return data as any[];
  });

  const bolosQuery = useQuery(['bolos'], async () => {
    const { data } = await api.get('/bolos');
    return data as any[];
  });

  const createIncident = useMutation(
    async (payload: Record<string, unknown>) => {
      await api.post('/incidents', payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['incidents']);
      }
    }
  );

  const assignUnit = useMutation(
    async ({ incidentId, unitId }: { incidentId: string; unitId: string }) => {
      await api.post(`/incidents/${incidentId}/assign/${unitId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['incidents']);
      }
    }
  );

  const updateStatus = useMutation(
    async ({ incidentId, status }: { incidentId: string; status: string }) => {
      await api.patch(`/incidents/${incidentId}`, { status });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['incidents']);
      }
    }
  );

  const handleSocket = useCallback(() => {
    queryClient.invalidateQueries(['incidents']);
    queryClient.invalidateQueries(['units']);
    queryClient.invalidateQueries(['bolos']);
  }, [queryClient]);

  const registerSocket = useCallback(
    (socket: any) => {
      socket.on('incident:created', handleSocket);
      socket.on('incident:updated', handleSocket);
      socket.on('dispatch:assign', handleSocket);
      socket.on('unit:status.update', handleSocket);
      socket.on('bolo:created', handleSocket);
      socket.on('bolo:updated', handleSocket);
      socket.on('bolo:cleared', handleSocket);
    },
    [handleSocket]
  );

  useSocket(registerSocket);

  const mapUnits = useMemo(() => {
    return (unitsQuery.data ?? [])
      .map((unit) => ({
        ...unit,
        position: fromPostgresPoint(unit.locationGeom)
      }))
      .filter((unit) => unit.position);
  }, [unitsQuery.data]);

  const handleCreateIncident = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      priority: Number(form.get('priority')),
      type: form.get('type'),
      address: form.get('address'),
      narrative: form.get('narrative'),
      locationLat: Number(form.get('locationLat')),
      locationLng: Number(form.get('locationLng'))
    };
    await createIncident.mutateAsync(payload);
    event.currentTarget.reset();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Call Intake</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleCreateIncident}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="type">Nature</Label>
                <Input id="type" name="type" placeholder="Robbery" required />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input id="priority" name="priority" type="number" min={1} max={4} defaultValue={2} />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="locationLat">Lat</Label>
                <Input id="locationLat" name="locationLat" type="number" step="0.0001" defaultValue={34.0522} />
              </div>
              <div>
                <Label htmlFor="locationLng">Lng</Label>
                <Input id="locationLng" name="locationLng" type="number" step="0.0001" defaultValue={-118.2437} />
              </div>
            </div>
            <div>
              <Label htmlFor="narrative">Narrative</Label>
              <textarea
                id="narrative"
                name="narrative"
                required
                className="h-24 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit" disabled={createIncident.isLoading} className="w-full">
              {createIncident.isLoading ? 'Creating...' : 'Create Incident'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              items={[
                {
                  id: 'list',
                  label: 'Incident Board',
                  content: (
                    <Table>
                      <THead>
                        <TR>
                          <TH>#</TH>
                          <TH>Type</TH>
                          <TH>Priority</TH>
                          <TH>Status</TH>
                          <TH>Units</TH>
                          <TH></TH>
                        </TR>
                      </THead>
                      <TBody>
                        {(incidentsQuery.data ?? []).map((incident) => (
                          <TR key={incident.id}>
                            <TD>{incident.number}</TD>
                            <TD>{incident.type}</TD>
                            <TD>P{incident.priority}</TD>
                            <TD>{incident.status}</TD>
                            <TD>
                              {(incident.units ?? [])
                                .map((link: any) => link.unit?.callsign)
                                .filter(Boolean)
                                .join(', ')}
                            </TD>
                            <TD className="space-x-2">
                              <select
                                className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs"
                                onChange={(event) => {
                                  const unitId = event.target.value;
                                  if (unitId) {
                                    assignUnit.mutate({ incidentId: incident.id, unitId });
                                    event.target.selectedIndex = 0;
                                  }
                                }}
                              >
                                <option value="">Assign Unit</option>
                                {(unitsQuery.data ?? [])
                                  .filter((unit) => unit.dutyStatus !== 'OFF')
                                  .map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                      {unit.callsign}
                                    </option>
                                  ))}
                              </select>
                              <select
                                className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs"
                                defaultValue=""
                                onChange={(event) => {
                                  const status = event.target.value;
                                  if (status) {
                                    updateStatus.mutate({ incidentId: incident.id, status });
                                    event.target.selectedIndex = 0;
                                  }
                                }}
                              >
                                <option value="">Status</option>
                                <option value="ASSIGNED">Assigned</option>
                                <option value="ON_SCENE">On Scene</option>
                                <option value="CLOSED">Closed</option>
                              </select>
                            </TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  )
                },
                {
                  id: 'bolos',
                  label: `BOLOs (${bolosQuery.data?.length ?? 0})`,
                  content: (
                    <Table>
                      <THead>
                        <TR>
                          <TH>Category</TH>
                          <TH>Subject</TH>
                          <TH>Description</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {(bolosQuery.data ?? []).map((bolo) => (
                          <TR key={bolo.id}>
                            <TD>{bolo.category}</TD>
                            <TD>{bolo.subjectRef}</TD>
                            <TD>{bolo.description}</TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  )
                }
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Operational Map</CardTitle>
          </CardHeader>
          <CardContent className="h-[420px] overflow-hidden rounded-lg">
            <MapContainer
              center={[34.0522, -118.2437]}
              zoom={12}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {mapUnits.map((unit: any) => (
                <Marker key={unit.id} position={unit.position!} icon={unitIcon}>
                  <Popup>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">{unit.callsign}</p>
                      <p>Status: {unit.dutyStatus}</p>
                      <p>Last Seen: {unit.lastSeenAt ? new Date(unit.lastSeenAt).toLocaleTimeString() : '—'}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
