import React from 'react';
import ReactDOM from 'react-dom';

import App from './app';
// ReactDOM.render(<App />, document.getElementById('app'));
import Scatterplot from './scatterplot';
ReactDOM.render(<Scatterplot />, document.getElementById('app'));
module.hot.accept();
