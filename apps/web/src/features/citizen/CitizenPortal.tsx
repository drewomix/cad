import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { FormEvent, useState } from 'react';

export default function CitizenPortal() {
  const queryClient = useQueryClient();
  const personsQuery = useQuery(['citizen-persons'], async () => {
    const { data } = await api.get('/citizen/persons');
    return data;
  });
  const vehiclesQuery = useQuery(['citizen-vehicles'], async () => {
    const { data } = await api.get('/citizen/vehicles');
    return data;
  });

  const createPerson = useMutation(
    async (payload: Record<string, unknown>) => {
      await api.post('/citizen/persons', payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['citizen-persons']);
      }
    }
  );

  const createVehicle = useMutation(
    async (payload: Record<string, unknown>) => {
      await api.post('/citizen/vehicles', payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['citizen-vehicles']);
      }
    }
  );

  const submitOnlineReport = useMutation(async (payload: Record<string, unknown>) => {
    await api.post('/citizen/online-report', payload);
  });

  const [personError, setPersonError] = useState<string | null>(null);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  const handlePersonSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    setPersonError(null);
    try {
      await createPerson.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        sex: data.sex,
        race: data.race,
        heightCm: Number(data.heightCm),
        weightKg: Number(data.weightKg),
        dlNumber: data.dlNumber,
        notes: data.notes,
        flags: []
      });
      event.currentTarget.reset();
    } catch (error: any) {
      setPersonError(error?.response?.data?.message ?? 'Unable to submit profile');
    }
  };

  const handleVehicleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    setVehicleError(null);
    try {
      await createVehicle.mutateAsync({
        plate: data.plate,
        state: data.state,
        vin: data.vin,
        make: data.make,
        model: data.model,
        year: Number(data.year),
        color: data.color,
        insuranceStatus: data.insuranceStatus,
        ownerPersonId: data.ownerPersonId || undefined
      });
      event.currentTarget.reset();
    } catch (error: any) {
      setVehicleError(error?.response?.data?.message ?? 'Unable to submit vehicle');
    }
  };

  const handleReportSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    setReportError(null);
    setReportSuccess(null);
    try {
      await submitOnlineReport.mutateAsync({
        priority: Number(data.priority),
        type: data.type,
        address: data.address,
        narrative: data.narrative,
        locationLat: Number(data.locationLat),
        locationLng: Number(data.locationLng)
      });
      setReportSuccess('Report submitted for review. Dispatch will triage shortly.');
      event.currentTarget.reset();
    } catch (error: any) {
      setReportError(error?.response?.data?.message ?? 'Unable to submit report');
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Person Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3" onSubmit={handlePersonSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input name="firstName" id="firstName" required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input name="lastName" id="lastName" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input type="date" name="dob" id="dob" required />
                </div>
                <div>
                  <Label htmlFor="dlNumber">Driver License #</Label>
                  <Input name="dlNumber" id="dlNumber" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="sex">Sex</Label>
                  <Input name="sex" id="sex" required />
                </div>
                <div>
                  <Label htmlFor="race">Race</Label>
                  <Input name="race" id="race" required />
                </div>
                <div>
                  <Label htmlFor="heightCm">Height (cm)</Label>
                  <Input name="heightCm" id="heightCm" type="number" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="weightKg">Weight (kg)</Label>
                  <Input name="weightKg" id="weightKg" type="number" required />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input name="notes" id="notes" />
                </div>
              </div>
              {personError && <p className="text-sm text-red-400">{personError}</p>}
              <Button type="submit" disabled={createPerson.isLoading}>
                {createPerson.isLoading ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Register Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3" onSubmit={handleVehicleSubmit}>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="plate">Plate</Label>
                  <Input name="plate" id="plate" required />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input name="state" id="state" required maxLength={2} />
                </div>
                <div>
                  <Label htmlFor="vin">VIN</Label>
                  <Input name="vin" id="vin" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="make">Make</Label>
                  <Input name="make" id="make" required />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input name="model" id="model" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input name="year" id="year" type="number" required />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input name="color" id="color" required />
                </div>
                <div>
                  <Label htmlFor="insuranceStatus">Insurance</Label>
                  <Input name="insuranceStatus" id="insuranceStatus" defaultValue="VALID" />
                </div>
              </div>
              <div>
                <Label htmlFor="ownerPersonId">Owner Profile</Label>
                <select
                  name="ownerPersonId"
                  id="ownerPersonId"
                  className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                >
                  <option value="">Self</option>
                  {(personsQuery.data ?? []).map((person: any) => (
                    <option key={person.id} value={person.id}>
                      {person.firstName} {person.lastName} ({person.approvalStatus})
                    </option>
                  ))}
                </select>
              </div>
              {vehicleError && <p className="text-sm text-red-400">{vehicleError}</p>}
              <Button type="submit" disabled={createVehicle.isLoading}>
                {createVehicle.isLoading ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Online Report Intake</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={handleReportSubmit}>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="type">Incident Type</Label>
                <Input name="type" id="type" placeholder="Theft / Lost Property" required />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input name="priority" id="priority" type="number" min={2} max={4} defaultValue={3} required />
              </div>
              <div>
                <Label htmlFor="address">Address / Location</Label>
                <Input name="address" id="address" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="locationLat">Latitude</Label>
                <Input name="locationLat" id="locationLat" type="number" step="0.0001" defaultValue={34.0522} />
              </div>
              <div>
                <Label htmlFor="locationLng">Longitude</Label>
                <Input name="locationLng" id="locationLng" type="number" step="0.0001" defaultValue={-118.2437} />
              </div>
            </div>
            <div>
              <Label htmlFor="narrative">Narrative</Label>
              <Textarea name="narrative" id="narrative" required rows={4} />
            </div>
            {reportError && <p className="text-sm text-red-400">{reportError}</p>}
            {reportSuccess && <p className="text-sm text-emerald-400">{reportSuccess}</p>}
            <Button type="submit" disabled={submitOnlineReport.isLoading}>
              {submitOnlineReport.isLoading ? 'Sending...' : 'Submit Report'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submission Status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-300">Persons</h4>
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {(personsQuery.data ?? []).map((person: any) => (
                  <TR key={person.id}>
                    <TD>
                      {person.firstName} {person.lastName}
                    </TD>
                    <TD>{person.approvalStatus}</TD>
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
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {(vehiclesQuery.data ?? []).map((vehicle: any) => (
                  <TR key={vehicle.id}>
                    <TD>
                      {vehicle.plate} / {vehicle.state}
                    </TD>
                    <TD>{vehicle.approvalStatus}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
