import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import '@saleshandy/designs/lib/assets/css/design-system.scss';
import Main from './main';

const rootElement = document.getElementById('react-root');

ReactDOM.render(<Main />, rootElement);
