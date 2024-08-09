import './Login.scss';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { login, refreshToken } from '../../features/authSlice';
import { useAppSelector } from '../../app/hooks';

type Props = {
  handleShowRegister: () => void;
  handleShowProfile: () => void;
};

export const Login: React.FC<Props> = ({ handleShowRegister, handleShowProfile }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error, expiresAt } = useAppSelector(state => state.auth);
  const [showError, setShowError] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(login({ email, password }));

    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);

      return () => clearTimeout(timer);
    }

    if (!error) {
      handleShowProfile();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (expiresAt && expiresAt * 1000 <= Date.now()) {
        dispatch(refreshToken());
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [dispatch, expiresAt]);

  return (
    <div className="login">
      <div className="container">
        <div className="login__content">
          <form className="login__form" onSubmit={handleLogin}>
            <h1 className="login__title">Login</h1>

            <div className="login__inputs">
              <div className="login__box">
                <input
                  type="text"
                  className="login__input"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <i className="login__icon login__icon--user" />
              </div>
              <div className="login__box">
                <input
                  type="password"
                  value={password}
                  placeholder="Password"
                  className="login__input"
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <i className="login__icon login__icon--lock" />
              </div>
            </div>

            <button disabled={loading} type="submit" className="login__button">
              {loading ? 'Logging in...' : 'Login'}
            </button>

            {showError && <p className="login__error">{error}</p>}

            <div className="login__register">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={handleShowRegister}
                className="login__register-button"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
