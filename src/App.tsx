import {QueryClient, QueryClientProvider, useQuery} from '@tanstack/react-query';

type ISSData = {
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly altitude: number;
  readonly velocity: number;
  readonly timestamp: number;
}

const URL = 'https://api.wheretheiss.at/v1/satellites/25544';

const locale = navigator.language;
const unitDisplay: Intl.NumberFormatOptions = {style: 'unit', unitDisplay: 'long', maximumFractionDigits: 2};
const dateFormatter = new Intl.DateTimeFormat(locale, {timeStyle: 'medium', dateStyle: 'medium', hourCycle: 'h23'}).format;
const angleFormatter = new Intl.NumberFormat(locale, {...unitDisplay, unit: 'degree', unitDisplay: 'narrow'}).format;
const altitudeFormatter = new Intl.NumberFormat(locale, {...unitDisplay, unit: 'kilometer'}).format;
const velocityFormatter = new Intl.NumberFormat(locale, {...unitDisplay, unit: 'kilometer-per-hour'}).format;
const integerFormatter = new Intl.NumberFormat(locale).format;

const queryClient = new QueryClient();

const Value = (props: {val: any}): JSX.Element => {
  const {val} = props;
  if (typeof val === 'number') {
    if (val > 1700000000000) return <span>{dateFormatter(new Date(val))}</span>
    return <span>{integerFormatter(val)}</span>
  }
  if (typeof val === 'boolean') {
    if (val) return <span style={{color: 'green', fontWeight: 'bold'}}>true</span>;
    return <span style={{color: 'red', fontWeight: 'bold'}}>false</span>;
  }
  if (typeof val === 'string') return <span>{`"${val}"`}</span>;
  return <span>{String(val)}</span>;
}

const TableDump = (props: {obj: Record<string, unknown>}) => (
  <table style={{border: '1px solid black', background: '#eee'}}>
    <tbody>
      {Object.keys(props.obj)
        .sort()
        .filter(k => !(props.obj[k] instanceof Function))
        .map(k => (
          <tr key={k}>
            <td style={{fontFamily: 'monospace'}}>{k}</td>
            <td style={{fontSize: '11pt'}}>
              <Value val={props.obj[k]} />
            </td>
          </tr>
        ))
      }
    </tbody>
  </table>
)

async function fetchISS() {
  const response = await fetch(URL);
  if (!response.ok) throw new Error('Network response was not ok');
  console.info(`${new Date().toLocaleTimeString()} ... FETCH COMPLETE`);
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
  const {data, ...rest} = query;

  return (
    <>
      <h2>{dateFormatter(new Date(data.timestamp * 1000))}</h2>
      <p>Latitude: {angleFormatter(data.latitude)}</p>
      <p>Longitude: {angleFormatter(data.longitude)}</p>
      <p>Altitude: {altitudeFormatter(data.altitude)}</p>
      <p>Orbital Velocity: {velocityFormatter(data.velocity)}</p>
      <TableDump obj={rest} />
    </>
  );
}

export function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{paddingLeft: '20px'}}>
        <h1>International Space Station</h1>
        <ISS />
      </div>
    </QueryClientProvider>

  );
}
