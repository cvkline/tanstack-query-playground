import React from 'react';
import {QueryClient, QueryClientProvider, useQuery} from '@tanstack/react-query';

const queryClient = new QueryClient();

async function fetchISS() {
  console.info(`${new Date().toLocaleTimeString()}... FETCH`);
  const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
  if (!response.ok) throw new Error('Network response was not ok');
  console.info('FETCH COMPLETE');
  return response.json();
}

function ISS(): JSX.Element {
  const query = useQuery({
    queryKey: ['iss'],
    queryFn: fetchISS,
    staleTime: 2 * 60 * 1000,
  });
  if (query.isLoading) return <p>Loading...</p>;
  const {data} = query;

  return (
      <>
        <p>Latitude: {data.latitude}</p>
        <p>Longitude: {data.longitude}</p>
        <p>Altitude: {data.altitude}</p>
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