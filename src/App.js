import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Routes } from 'react-router-dom';
import TransactionList from "./Components/TransactionsList";
import './App.css';
import Matching from "./Components/Matching";

function App() {
  return (
    // <Router>
      <Routes>
        <Route exact={true} path="/" element={<TransactionList />} />
        <Route exact={true} path="/matching" element={<Matching/>} />
      </Routes>
    // </Router>
  );
}

export default App;
