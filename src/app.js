import React, { Component } from 'react';
import MapGL from 'react-map-gl';
import DeckGL from 'deck.gl';

import {MapStylePicker} from './controls';

function SetToken() {
  return (
    <div style={{fontSize: '20px'}}>
      <div>You don't have a Mapbox token set in your environemnt.</div>
      <ul>
        <li>
          Go to <a href="http://mapbox.com">Mapbox</a> and log in or sign up to
          get a token.
        </li>
        <li>Copy the token to your clipboard.</li>
        <li>Stop this app in the terminal (ctrl+c)</li>
        <li>
          <p>type: </p>
          <p>
            <code>export MapboxAccessToken="</code>, then paste your token, then
            type a closing ".
          </p>{' '}
          ie <code>export MapboxAcessToken="pk.123456"</code>
        </li>
        <li>
          Restart the app from the terminal (<code>yarn start</code>)
        </li>
      </ul>
    </div>
  );
}

export default class App extends Component {
  //1. Add default viewport state - specifies the dimensions, location and basic setting of the map
  state = {
    style: 'mapbox://styles/mapbox/light-v9',
    //Map loads for web : up to 50000/monthly load -> Free
    mapBoxToken: 'pk.eyJ1IjoiaW5ncmlka2FvIiwiYSI6ImNpbjVieWliazBjbWp2b2x1cDduYXF4d3QifQ.Cu4wb2TwLd0lMVOx367mvA',
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      longitude: 121.47,
      latitude: 25.14,
      zoom: 11,
      maxZoom: 16
    }
  }

  componentDidMount() {
    //component 被render 到DOM 之後才會執行。
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  componentWillUnmount() {
    //當元件將要從DOM 中被移除之前，React 會執行
    window.addEventListener('resize', this._resize);
  }

  onStyleChange = (style) => {
    this.setState({style});
  }

  //This callback will be called with the updated viewport every time the user interacts with the map.
  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    })
  }

  _resize = () => {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  render() {
    const {style, mapBoxToken, viewport} = this.state;
    return (
      <div>
        <div className="intro">
          {mapBoxToken ? (`You mapbox token is set. You're good to go!`) : (<SetToken />)}
        </div>

        <MapStylePicker onStyleChange={this.onStyleChange} currentStyle={style}/>

        <MapGL
          {...viewport}
          mapStyle={style}
          mapboxApiAccessToken={mapBoxToken}
          //onViewportChange callback
          onViewportChange={viewports => this._onViewportChange(viewports)}
        >
            {/* Deck.GL是react-map-gl的child */}
            <DeckGL viewport={this.viewport} />
        </MapGL>
      </div>
    );
  }
}
