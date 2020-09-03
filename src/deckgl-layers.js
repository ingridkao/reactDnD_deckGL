import React, { Component } from 'react';

//Add deck.gl layers
import {
  ScatterplotLayer,
  HexagonLayer
} from 'deck.gl';

// Scatterplot point color
const PICKUP_COLOR = [114, 19, 108];
const DROPOFF_COLOR = [243, 185, 72];

// HexagonCell color
const HEATMAP_COLOR = [
  [255,255,204],
  [199,233,180],
  [127,205,187],
  [65,182,196],
  [44,127,184],
  [37,52,148]
];

const LIGHT_SETTINGS = {
  lightsPosition: [-73.8, 40.5, 8000, -74.2, 40.9, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const elevationRange = [0, 1000];

export function renderLayers(props) {
  const {data, settings, onHover, hour} = props;
  //過濾出選定hour
  const filteredData = (hour === null)? data: data.filter(d => d.hour === hour);

  return [
    //settings.showScatterplot開關圖層
    settings.showScatterplot && new ScatterplotLayer({
      id: 'scatterplot',
      getPositon: d => d.position,
      getColor: d => d.pickup ? PICKUP_COLOR: DROPOFF_COLOR,
      getRadius: d => 2.5,
      opacity: 0.5,
      pickable: true,
      radiusMinPixels: 0.25,
      radiusMaxPixels: 15,
      data:filteredData,
      ...settings,
      onHover
    }),
    //settings.showHexagon開關圖層
    settings.showHexagon && new HexagonLayer({
      id: 'heatmap',
      getPositon: d => d.position,
      colorRange: HEATMAP_COLOR,
      elevationRange,
      elevationScale: 5,
      extruded: true, //是否啟用六角形海拔
      lightSettings: LIGHT_SETTINGS,
      opacity: 0.6,
      pickable: true,
      // radius:10, //半徑以米為單位
      upperPercentile: 100, //大於100的六角形會被隱藏
      data:filteredData,
      ...settings,
      onHover
    })
  ];
}
