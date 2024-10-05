import { useState } from 'react';
import { Login } from '../../components/Login';
import { Register } from '../../components/Register/Register';
export const LoginPage = () => {
  const [visibleRegistration, setVisibleRegistration] = useState(false);
  const [visibleLogin, setVisibleLogin] = useState(true);

  const handleShowRegister = () => {
    setVisibleRegistration(true);
    setVisibleLogin(false);
  };

  const handleShowLogin = () => {
    setVisibleLogin(true);
    setVisibleRegistration(false);
  };

  return (
    <>
      {visibleLogin && (
        <Login
          handleShowRegister={handleShowRegister}
        />)}

      {visibleRegistration && (
        <Register
          handleShowLogin={handleShowLogin}
        />
      )}
    </>
  );
};
