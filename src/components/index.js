import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import '@saleshandy/designs/lib/assets/css/design-system.scss';
import Popup from './popup';

const rootElement = document.getElementById('sh-email-finder');

ReactDOM.render(<Popup />, rootElement);
