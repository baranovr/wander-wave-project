import './Login.scss';
import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { login, refreshToken } from '../../features/authSlice';
import { useAppSelector } from '../../app/hooks';

type Props = {
  handleShowRegister: () => void;
};

export const Login: React.FC<Props> = ({ handleShowRegister }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error, isAuthenticated } = useAppSelector(state => state.auth);

  const handleLogin = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();

      const refreshInterval = 14 * 60 * 1000;
      setInterval(() => {
        dispatch(refreshToken());
      }, refreshInterval);

    } catch (err) {
      console.error('Login failed:', err);
    }
  }, [dispatch, email, password])

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

            {/*{showError && <p className="login__error">{error}</p>}*/}
            {isAuthenticated && <p className="login__success">Login Success!</p>}

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
