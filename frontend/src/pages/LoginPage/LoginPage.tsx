import { useState } from 'react';
import { ProfilePage } from '../ProfilePage';
import { Login } from '../../components/Login';
import { Register } from '../../components/Register/Register';
export const LoginPage = () => {
  const [visibleRegistration, setVisibleRegistration] = useState(false);
  const [visibleLogin, setVisibleLogin] = useState(true);
  const [visibleProfile, setVisibleProfile] = useState(false);

  const handleShowRegister = () => {
    setVisibleRegistration(true);
    setVisibleLogin(false);
    setVisibleProfile(false);
  };

  const handleShowLogin = () => {
    setVisibleLogin(true);
    setVisibleRegistration(false);
    setVisibleProfile(false);
  };

  const handleShowProfile = () => {
    setVisibleLogin(false);
    setVisibleRegistration(false);
    setVisibleProfile(true);
  };

  return (
    <>
      {visibleProfile && <ProfilePage handleShowLogin={handleShowLogin} />}

      {visibleLogin && (
        <Login
          handleShowRegister={handleShowRegister}
          handleShowProfile={handleShowProfile}
        />)}

      {visibleRegistration && (
        <Register
          handleShowLogin={handleShowLogin}
          handleShowProfile={handleShowProfile}
        />
      )}
    </>
  );
};
