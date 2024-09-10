import { Outlet } from 'react-router-dom';
import './App.scss';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer';

import { checkAuthStatus} from "./features/authSlice";
import { AppDispatch} from "./app/store";
import { useDispatch } from 'react-redux';
import React, { useEffect} from "react";

export const App = () => {
    const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    dispatch(checkAuthStatus());
}, [dispatch]);
  return (
    <div className="App">
      <Header />

      <Outlet />

      <Footer />
    </div>
  );
};

export default App;
