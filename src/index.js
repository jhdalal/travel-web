import React from 'react';
import { render } from 'react-dom';
import 'core-js/fn/array/from'; // Array.from polyfill

import Master from './components/Master';

import './css/style.css';
import './polyfills/removeTouchHover'; // Prevent hover effects on touchscreen

// window.ROOT = 'http://192.168.1.21';
// window.ROOT = 'http://192.168.1.5';
// window.ROOT = 'http://localhost';
// window.CANONICAL = window.ROOT;
// window.PORT = ':3000';

// staging
// window.ROOT = 'http://www.iat-when-to-travel.gcpreview.co';
// window.CANONICAL = window.ROOT;
// window.PORT = '';

// production
window.ROOT = 'https://www.iatwtt.com/when-to-travel';
window.CANONICAL = 'https://www.insideasiatours.com/when-to-travel';
window.PORT = '/build';

// aws s3 bucket
window.AWS = 'https://s3.eu-west-2.amazonaws.com/iatwhentotravel';

render(<Master/>, document.querySelector('#app'));
