import React from 'react';
import {QueryClient, QueryClientProvider, useQuery} from '@tanstack/react-query';

type ISSData = {
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly altitude: number;
  readonly velocity: number;
  readonly timestamp: number;
}

const locale = navigator.language ?? 'en-US';
const unitDisplay: Intl.NumberFormatOptions = {style: 'unit', unitDisplay: 'short'};
const dateFormatter = new Intl.DateTimeFormat(locale, {timeStyle: 'long', dateStyle: 'medium'}).format;
const angleFormatter = new Intl.NumberFormat(locale, {...unitDisplay, unit: 'degree'}).format;
const altitudeFormatter = new Intl.NumberFormat(locale, {...unitDisplay, unit: 'kilometer'}).format;
const velocityFormatter = new Intl.NumberFormat(locale, {...unitDisplay, unit: 'kilometer-per-hour'}).format;

const queryClient = new QueryClient();

async function fetchISS() {
  console.info(`${new Date().toLocaleTimeString()}... FETCH`);
  const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
  if (!response.ok) throw new Error('Network response was not ok');
  console.info('FETCH COMPLETE');
  return response.json() as Promise<ISSData>;
}

function ISS(): JSX.Element {
  const query = useQuery({
    queryKey: ['iss'],
    queryFn: fetchISS,
    staleTime: 2 * 60 * 1000,
    // refetchInterval: 60 * 1000,
  });
  if (query.status === 'pending') return <p>Loading...</p>;
  if (query.status === 'error') return <p>Error: {query.error.message}</p>;
  const {data} = query;

  return (
    <>
      <h2>{dateFormatter(new Date(data.timestamp * 1000))}</h2>
      <p>Latitude: {angleFormatter(data.latitude)}</p>
      <p>Longitude: {angleFormatter(data.longitude)}</p>
      <p>Altitude: {altitudeFormatter(data.altitude)}</p>
      <p>Orbital Velocity: {velocityFormatter(data.velocity)}</p>
    </>
  );
}

export function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <h1>International Space Station</h1>
        <ISS />
      </div>
    </QueryClientProvider>

  );
}