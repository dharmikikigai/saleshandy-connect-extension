import React from 'react';
import { RecoilRoot } from 'recoil';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import '@saleshandy/designs/lib/assets/css/design-system.scss';
import Main from './main';

const rootElement = document.getElementById('react-root');

if (rootElement) {
  ReactDOM.render(
    <RecoilRoot>
      <Main />
    </RecoilRoot>,
    rootElement,
  );
}
