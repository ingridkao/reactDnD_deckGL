import React, { Component } from 'react';
import { StaticMap } from 'react-map-gl';
import DeckGL from 'deck.gl';

import {
  //圖層控制器
  LayerControls,
  //地圖樣式選擇器
  MapStylePicker,
  //散點圖控制器
  // SCATTERPLOT_CONTROLS
  //散點圖及熱力圖控制器
  HEXAGON_CONTROLS
} from './controls';

import { tooltipStyle } from './style';

import { renderLayers } from './deckgl-layers';

import taxiData from '../data/taxi';
import Charts from './charts';
import { Highlight } from 'react-vis';

const INITTAL_VIEW_STATE = {
  longitude: -74,
  latitude: 40.7,
  zoom: 12,
  maxZoom: 14,
  minZoom: 8,
  pitch: 0,
  bearing: 0,

  points: [],
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export default class Scatterplot extends Component {
  state = {
    mapBoxToken: 'pk.eyJ1IjoiaW5ncmlka2FvIiwiYSI6ImNpbjVieWliazBjbWp2b2x1cDduYXF4d3QifQ.Cu4wb2TwLd0lMVOx367mvA',
    style: 'mapbox://styles/mapbox/dark-v9',
    points: [],
    settings: Object.keys(HEXAGON_CONTROLS).reduce(
      (accu, key) => ({
        ...accu,
        [key]: HEXAGON_CONTROLS[key].value
      }),
      {}
    ),
    hover: {
      x: 0,
      y: 0,
      hoveredObject: null,
      label: null
    },
    selectedHour: null
  }

  componentDidMount() {
    //在component 被render 到DOM 之後才會執行
    this._processData();
  }

  onStyleChange = (style) => {
    this.setState({style});
  }

  //Before the render
  _updateLayerSettings = (settings) => {
    this.setState({ settings });
  }

  _onHover = ({x, y, object}) => {
    this.setState({
      hover: {
        x,
        y,
        hoveredObject: object,
        label: object? 
          (object.index? 
            (object.points? `${object.points.length}組客人在此進行接送`: null)
            : (object.pickup? '接人(Pickup)': '放人(Dropoff)'))
          : null
      }
    });
  }

  _onHightLight = (highlightedHour) => {
    this.setState({highlightedHour});
  }

  _onSelect = (hour) => {
    this.setState({
      selectedHour: (hour === this.state.selectedHour)? null: hour 
    });
  }

  _onWebGLInitialize = (gl) => {
    //console.log(gl);//WebGL2RenderingContext
    //To enable depth testing, call glEnable with GL_DEPTH_TEST. When rendering to a framebuffer that has no depth buffer, depth testing always behaves as though the test is disabled.
    gl.enable(gl.DEPTH_TEST);
    // setParameters(gl , {depthTest: false});
    gl.depthFunc(gl.LEQUAL);//515
  }

  _processData = () => {
    //reduce: 處理數字累計 & 計算相同字串的數量並以物件呈現
    //        Array.reduce(callback[accumulator, currentValue, currentIndex, array], initialValue)
    //        Array.reduce(callback[累加器, item, item index, array], 預設值(非必填))
    //accu: accumulator->累加器(經由個別 currentValue 加總的累計值)
    //curr: currentValue
    const data = taxiData.reduce(
      (accu, curr) => {
        const pickupHour = new Date(curr.pickup_datetime).getUTCHours();
        const dropoffHour = new Date(curr.dropoff_datetime).getUTCHours();

        const pickupLongitude = Number(curr.pickup_longitude);
        const pickupLatitude = Number(curr.pickup_latitude);
        const dropoffLongitude = Number(curr.dropoff_longitude);
        const dropoffLatitude = Number(curr.dropoff_latitude);

        if (!isNaN(pickupLongitude) && !isNaN(pickupLatitude)) {
          accu.points.push({
            position: [pickupLongitude, pickupLatitude],
            hour: pickupHour,
            pickup: true
          });
          accu.pickupObj[pickupHour] = (accu.pickupObj[pickupHour] || 0) + 1;
        }

        if (!isNaN(dropoffLongitude) && !isNaN(dropoffLatitude)) {
          accu.points.push({
            position: [dropoffLongitude, dropoffLatitude],
            hour: dropoffHour,
            pickup: false
          });
          accu.dropoffObj[dropoffHour] = (accu.dropoffObj[dropoffHour] || 0) + 1;
        }
        return accu;
      },
      {
        points: [],
        pickupObj: {},
        dropoffObj: {}
      }
    );

    //Object.entries
    //物件返回一個數組
    //const obj = { foo: 'bar', baz: 42 };
    //console.log(Object.entries(obj)); // [ ['foo', 'bar'], ['baz', 42] ]
  
    //console.log(data.pickupObj);
    //{0: 246, 1: 173, 2: 98, 3: 59, 4: 53, 5: 102, 6: 294, 7: 466, 8: 574, 9: 542, 10: 434, 11: 510, 12: 468, 13: 435, 14: 526, 15: 453, 16: 400, 17: 503, 18: 602, 19: 645, 20: 647, 21: 662, 22: 609, 23: 498}

    data.pickups = Object.entries(data.pickupObj).map(([hour, count]) => {
      return { hour: Number(hour), x: Number(hour) + 0.5, y: count };
    });
    data.dropoffs = Object.entries(data.dropoffObj).map(([hour, count]) => {
      return { hour: Number(hour), x: Number(hour) + 0.5, y: count };
    });
    this.setState(data);
  }

  render() {
    const {
      mapBoxToken,
      style,
      points,
      settings,
      hover,
      highlightedHour,
      selectedHour
    } = this.state;
    if(!points){
      return null;
    }

    return (
      <div>
        {hover.hoveredObject && (
          <div
            style={{
              ...tooltipStyle,
              transform: `translate(${hover.x}px, ${hover.y}px)`
            }}
          >
            <div>{hover.label}</div>
          </div>
        )}

        <MapStylePicker onStyleChange={this.onStyleChange} currentStyle={style}/>

        <LayerControls
          settings = {settings}
          propTypes ={HEXAGON_CONTROLS}
          onChange = {settings => this._updateLayerSettings(settings)}
        />

        <DeckGL
          {...settings}
          //Set initial WebGL parameters using a prop
          onWebGLInitialized={this._onWebGLInitialize}
          initialViewState={INITTAL_VIEW_STATE} 

          //圖層們
          layers={renderLayers({
            data: points,
            settings,
            onHover: hover => this._onHover(hover),

            //加一個參數
            hour: highlightedHour || selectedHour
          })}

          controller
        >
          <StaticMap mapboxApiAccessToken={mapBoxToken} mapStyle={style}/>
        </DeckGL>

        <Charts 
          {...this.state}
          hightlight = {hour => this._onHightLight(hour)}
          select = {hour => this._onSelect(hour)}
        />
      </div>
    );
  }
}
