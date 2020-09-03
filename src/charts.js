import React from "react";
import { charts, chartsP } from "./style";

import { 
  XYPlot,
  XAxis, 
  YAxis,
  VerticalBarSeries,
  LineSeries,
  MarkSeries
} from "react-vis";

const chartColor = ['#00bcd4', '#49a7b4', '#b69de2', '#f08'];

//將父層的state中兩個物件：pickups, dropoffs, highlightedHour, selectedHour解構出來
//綁定method: hightlight, select
export default function Charts({ 
  pickups, dropoffs, 
  highlightedHour, hightlight,
  selectedHour, select
}) {
  if(!pickups){
    return (
      <div style={charts} />
    )
  }
  const data = pickups.map(d => {
    let color =  (d.hour === highlightedHour)? chartColor[0]: chartColor[1];
    color =  (d.hour === selectedHour)? chartColor[2]: color;
    return {...d, color};
  });

  return (
    <div style={charts}>
      <h2>Pickups by hour</h2>
      <p style={chartsP}>As percentage of all trips</p>

      {/* chart wrapper - 圖表容器 */}
      <XYPlot 
        height={140}
        width={500}

        // 與邊寬的距離(預設auto)
        margin={{left: 50, right: 20}}

        //y軸最小值與最大值 
        yDomain={[0,1000]}

        //滑鼠事件-如果滑鼠超出VerticalBarSeries則return null
        onMouseLeave={() => hightlight(null)}
      >
        {/* x水平軸 */}
        <XAxis 
          tickFormat = {h => `${(h%12 || 12)}${(h%24 >= 12) ? 'PM': 'AM'}`}
          tickSizeInner={0}
          
          // x軸的指定值顯示 
          tickValues={[0,6,,12,18,24]}
        />

        {/* y垂直軸 */}
        <YAxis 
          tickFormat = {d => `${(d/10).toFixed(0)}%`}
        />
        <VerticalBarSeries 
          data={data} 
          opacity="0.5"

          // color: string | object
          // color="#00bcd4"
          //color={chartColor[0]}
          
          //將圖表顏色透過data傳遞
          colorType="literal"

          //滑鼠hover事件
          onValueMouseOver={d => hightlight(d.hour)}
          //滑鼠click事件
          onValueClick={d => select(d.hour)}

          //不是一個偵測整個block而是偵測每個bar
          style={{cursor: 'pointer'}}
        />

        <MarkSeries
          data={pickups} 
          color={chartColor[1]}
          size="3"
        />

        <LineSeries
          data={dropoffs} 
          color={chartColor[2]}
        />
      </XYPlot>
    </div>
  );
}
