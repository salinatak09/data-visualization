import { useMemo } from "react";
import Charts from "react-apexcharts";
import type { Alert, Data } from "./Visualization";
import type {ApexOptions} from "apexcharts";

type Props = {
  meterData: Data[],
  meters: string[],
  type: 'line' | 'bar',
  alerts: Alert[]
}

const LineChart = ({meterData, meters, type, alerts}: Props) => {

  // Highlight alert timestamps using annotations
  const annotations = useMemo(() => {
    if (!alerts.length) return {};
    return {
      xaxis: alerts.map((a) => ({ // cap for performance
        fillColor: a.type === "HIGH_USAGE" ? "#FF4560" : "#FEB019",
        opacity: 0.1,
        x: new Date(a.startTime).getTime(),
        x2: new Date(a.endTime).getTime(),
        borderColor: a.type === "HIGH_USAGE" ? "#FF4560" : "#FEB019",
        label: {
          text: a.type,
          offsetY: -7,
          offsetX: 15,
          style: { 
            background: a.type === "HIGH_USAGE" ? "#FF4560" : "#FEB019",
            cursor: "pointer !important"
          },
          click: (e:any)=>{
            e.fillColor = (e.label.text === "HIGH_USAGE") ? "#456088" : "#FEB01988"; 
            e.opacity = (e.label.text === "HIGH_USAGE") ? "0.4" : "1"; 
          }
        },
      })),
    };
  }, [alerts]);

  // Data to display on chart
  // const series = [
  //   {
  //     name: "Meter1",
  //     data: meterData.map((meter)=>meter.M1)
  //   },
  //   {
  //     name: "Meter2",
  //     data: meterData.map((meter)=>meter.M2),
  //   },
  //   {
  //     name: "Meter3",
  //     data: meterData.map((meter)=>meter.M3)
  //   },
  //   {
  //     name: "Meter4",
  //     data: meterData.map((meter)=>meter.M4)
  //   },
  //   {
  //     name: "Master",
  //     data: meterData.map((meter)=>meter.master)
  //   },
  // ]

  const series = useMemo(() => {
    return meters.map((m) => ({
      name: m,
      data: meterData.map((d) => d[m]),
    }));
  }, [meterData, meters]);

  const options: ApexOptions = {
    chart: {
      type,
      zoom: {
        enabled: true
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight'
    },
    title: {
      text: 'Meter Readings',
      align: 'left'
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5
      },
    },
    xaxis: {
      type: 'datetime',
      labels: { datetimeUTC: false },
      title: { text: "Time" },
      categories: meterData.map(meter=>meter.time),
    },
    yaxis:{
      title: {text: "Power (Watts)"}
    },
    tooltip:{
      shared: true,
      x: {
        format: "dd/MM/yyyy HH:mm"
      },
      y: {
        formatter: function(value:number){
          return value+" Watts";
        }
      }
    },
    annotations: annotations
  };

  return (
    <div>
      <div id="chart">
        <Charts options={options} series={series} type={type} height={400}/>
      </div>
      <div id="html-dist"></div>
    </div>
  );
}

export default LineChart;
