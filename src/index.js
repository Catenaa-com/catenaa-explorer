import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { WithGlobalState } from './Components/GlobalState';
import { BrowserRouter } from 'react-router-dom';

// const root = ReactDOM.createRoot(document.getElementById('root'));
const rootElement = document.getElementById('root');
const initialState = {
  outBound: null,
};

const initFunction = async () => {
  return { outBound: [] };
};
ReactDOM.render(
  <BrowserRouter>
    <WithGlobalState initialState={initialState} initFunction={initFunction}>
      <App />
    </WithGlobalState>
  </BrowserRouter>,
  rootElement);
// root.render(
//   <React.StrictMode>
//     <WithGlobalState initialState={initialState} initFunction={initFunction}>
//       <App />
//     </WithGlobalState>
//   </React.StrictMode>
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
