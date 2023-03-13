import React from "react";
import { Route, Routes } from 'react-router-dom';
import TransactionList from "./Components/TransactionsList";
import './App.css';
import Matching from "./Components/Matching";

function App() {
  return (
    <Routes>
      <Route exact={true} path="/" element={<TransactionList />} />
      <Route exact={true} path="/matching" element={<Matching />} />
    </Routes>
  );
}
export default App;
