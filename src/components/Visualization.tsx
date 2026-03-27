import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Button from '../ui/Button';
import LineChart from './LineChart.js';
dayjs.extend(customParseFormat);

export type Data= {
  time: string;
  M1: number;
  M2: number;
  M3: number;
  M4: number;
  master: number;
}

export type Alert = {
  type: string;
  startTime: string;
  endTime: string;
  value: number;
}

const Visualization = () => {

  const [data, setData] = useState<Data[] | []>([]);
  const [filteredData, setFilteredData] = useState<Data[] | []>([]);
  const [graphType, setGraphType] = useState<'line' | 'bar'>("line");
  const [startDate, setStartDate]= useState<string | number>();
  const [endDate, setEndDate]= useState<string | number>();
  const [minStart, setMinStart] = useState<string | number>();
  const [maxEnd, setMaxEnd] = useState<string>();
  const [enableAlert, setEnableAlert] = useState<boolean>(false);
  const [selectedMeters, setSelectedMeters] = useState<string[]>([]);
  
  // Fetch Data from CSV file
  const fetchData = async()=>{
    const res = await fetch('/data/meter.csv');
    const text = await res.text();
    const rows = text.split("\n").slice(1);
    const parsedRows = rows.map((row) => {
      const [time, M1, M2, M3, M4, master] = row.split(",");
      return {
        time: dayjs(time, "DD-MM-YYYY HH:mm").format('YYYY-MM-DDTHH:mm'),
        M1: +M1,    // + converts string to number
        M2: +M2,
        M3: +M3,
        M4: +M4,
        master: +master,
      };
    });
    setData(parsedRows);

    setMinStart(parsedRows[0].time);
    setMaxEnd(parsedRows[parsedRows.length - 1].time);

    setStartDate(parsedRows[0].time);
    setEndDate(parsedRows[20].time);

    setFilteredData(parsedRows);
  }

  // Filter the data based on start & end date
  const filterData = ()=>{
    const fData = data.filter((d) => {
      const date =dayjs(d.time);
      return ( date.isSame(dayjs(startDate)) || date.isAfter(dayjs(startDate)) ) && 
              ( date.isSame(dayjs(endDate)) || date.isBefore(dayjs(endDate)) );
    });
    setFilteredData(fData);
    generateAlerts(fData);
  }

  // Generate alerts for High usage & Leakage
  const generateAlerts = (dataset: Data[]): Alert[] => {
    const arr: Alert[] = [];

    let highStart: string | null = null;
    let leakStart: string | null = null;

    let maxHigh = 0;
    let maxLeak = 0;

    for (let i = 0; i < dataset.length; i++) {
      const row = dataset[i];

      const total = row.M1 + row.M2 + row.M3 + row.M4;
      const leakage = row.master - total;

      const isHigh = total > 1000;
      const isLeak = Math.abs(leakage) > 300;

      // HIGH USAGE
      if (isHigh) {
        if (!highStart) {
          highStart = row.time;
          maxHigh = total;
        } else {
          if (total > maxHigh) maxHigh = total;
        }
      } else if (highStart) {
        arr.push({
          type: "HIGH_USAGE",
          startTime: highStart,
          endTime: row.time,
          value: maxHigh,
        });
        highStart = null;
      }

      // LEAKAGE
      if (isLeak) {
        if (!leakStart) {
          leakStart = row.time;
          maxLeak = leakage;
        } else {
          if (Math.abs(leakage) > Math.abs(maxLeak)) {
            maxLeak = leakage;
          }
        }
      } else if (leakStart) {
        arr.push({
          type: "LEAKAGE",
          startTime: leakStart,
          endTime: row.time,
          value: maxLeak,
        });
        leakStart = null;
      }

      // Handle last row
      if (i === dataset.length - 1) {
        if (highStart) {
          arr.push({
            type: "HIGH_USAGE",
            startTime: highStart,
            endTime: row.time,
            value: maxHigh,
          });
        }

        if (leakStart) {
          arr.push({
            type: "LEAKAGE",
            startTime: leakStart,
            endTime: row.time,
            value: maxLeak,
          });
        }
      }
    }

    return arr;
  };

  const toggleMeter = (m:string) => {
    setSelectedMeters((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  // avoid using setState to minimize re-renders
  // use useMemo instead
  const alerts = useMemo(()=>{
    return generateAlerts(filteredData);
  },[filteredData])
  
  useEffect(()=>{
    fetchData();
  },[]);

  // Filter Data whenever start or end date changes
  useEffect(()=>{
    filterData();
  },[startDate, endDate]);

  return (
    <div className='flex flex-col items-center text-center max-w-7xl'>   
      <h1 className='text-3xl font-bold m-4'>Data Visualization</h1>

      {/* Controls */}
      <div className="m-4 flex flex-col gap-2 justify-center">
        {/* Start & end Date inputs */}
        <div className='flex gap-4'>
          <div className='mx-4 my-2'>
            <label>Start Date & time: </label>
            <input className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' type="datetime-local" onChange={(e) => setStartDate(e.target.value)} min={minStart} max={maxEnd} value={startDate}/>
          </div>
          <div className='mx-4 my-2'>
            <label>End Date & time: </label>
            <input className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' type="datetime-local" onChange={(e) => setEndDate(e.target.value)} min={minStart} max={maxEnd} value={endDate}/>
          </div>
        </div>

        {/* Meter selection */}
        <div className='flex gap-4 my-4'>
          <span>Select Meters: </span>
          {['M1','M2','M3','M4', 'master'].map((m) => (
            <label key={m} className="ml-2">
              <input
                type="checkbox"
                checked={selectedMeters.includes(m)}
                onChange={() => toggleMeter(m)}
              /> {m}
            </label>
          ))}
        </div>

        {/* Button Controls */}
        <div className='flex gap-4'>
          <Button 
            variant='outline' 
            disabled={graphType === 'bar'} 
            onClick={()=>setGraphType("bar")}
          >
            Bar
          </Button>

          <Button 
            disabled={graphType === 'line'} 
            onClick={() => setGraphType("line")}
          >
            Line
          </Button>

          <label className='flex items-center justify-center gap-2'>
            <input type='checkbox' checked={enableAlert} onClick={() => setEnableAlert(prev => !prev)}/>
            Enable Alert
          </label>
        </div>
      </div>

      {/* Graph */}
      <div className='w-4xl lg:w-6xl'>
        <LineChart meterData={filteredData} meters={selectedMeters} type={graphType} alerts={enableAlert ?  alerts : []}/>
      </div>
    </div>
  )
}

export default Visualization