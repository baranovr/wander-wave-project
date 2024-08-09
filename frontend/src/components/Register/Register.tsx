import '../Login/Login.scss';
import React, { useState } from 'react';
import { register } from '../../features/authSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

type Props = {
  handleShowLogin: () => void;
  handleShowProfile: () => void;
};

export const Register: React.FC<Props> = ({
  handleShowLogin,
  handleShowProfile,
}) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);
  const [registerData, setRegisterData] = useState({
    avatar: '',
    status: '',
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    about_me: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    avatar: false,
    status: false,
    username: false,
    email: false,
    first_name: false,
    last_name: false,
    about_me: false,
    password: false,
  });

  const [showError, setShowError] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name: field, value } = event.target;
    setRegisterData(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: false }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    let avatarBase64 = '';
    if (file) {
      const reader = new FileReader();
      avatarBase64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    setRegisterData(prevState => ({ ...prevState, avatar: avatarBase64 }));
    setErrors(current => ({ ...current, avatar: false }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(register(registerData));
    if (errors.about_me || errors.avatar || errors.email
      || errors.first_name || errors.password) {
      return;
    }

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

  return (
    <div className="login">
      <div className="container">
        <div className="login__content">
          <form
            className="login__form login__form-register"
            onSubmit={handleRegister}
          >
            <h1 className="login__title">Register</h1>
            <div className="login__inputs">
              <div className="login__box">
                <input
                  type="file"
                  name="avatar"
                  className="login__input"
                  accept="image/png, image/jpeg, imgae/jpg"
                  alt="user photo"
                  placeholder="Your photo"
                  onChange={e => handleFileChange(e)}
                  required
                />
              </div>

              <div className="login__box">
                <select
                  name="status"
                  className="login__input"
                  value={registerData.status}
                  onChange={e => handleChange(e)}
                  required
                >
                  <option className="login__option" value="Road Tripper">
                    Road Tripper
                  </option>
                  <option className="login__option" value="Cruiser">
                    Cruiser
                  </option>
                  <option className="login__option" value="Backpacker">
                    Backpacker
                  </option>
                  <option className="login__option" value="Flyer">
                    Flyer
                  </option>
                  <option className="login__option" value="Cyclist">
                    Cyclist
                  </option>
                  <option className="login__option" value="Hiker">
                    Hiker
                  </option>
                  <option className="login__option" value="Railway Explorer ">
                    Railway Explorer
                  </option>
                  <option className="login__option" value="Sailor">
                    Sailor
                  </option>
                  <option className="login__option" value="RVer">
                    RVer (Recreational Vehicle Traveler)
                  </option>
                  <option className="login__option" value="Nomad">
                    Nomad
                  </option>
                </select>
              </div>

              <div className="login__inputs">
                <div className="login__box">
                  <input
                    type="text"
                    name="username"
                    className="login__input"
                    placeholder="User name"
                    value={registerData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="login__box">
                  <input
                    type="email"
                    name="email"
                    className="login__input"
                    placeholder="Email"
                    value={registerData.email}
                    onChange={e => handleChange(e)}
                    required
                  />
                </div>

                <div className="login__box">
                  <input
                    type="text"
                    name="first_name"
                    className="login__input"
                    placeholder="First name"
                    value={registerData.first_name}
                    onChange={e => handleChange(e)}
                    required
                  />
                </div>

                <div className="login__box">
                  <input
                    type="text"
                    name="last_name"
                    className="login__input"
                    placeholder="Last name"
                    value={registerData.last_name}
                    onChange={e => handleChange(e)}
                    required
                  />
                </div>


                <div className="login__box">
                  <textarea
                    name="about_me"
                    className="login__input login__textarea"
                    placeholder="About me"
                    value={registerData.about_me}
                    onChange={e => handleChange(e)}
                    required
                  />
                </div>

                <div className="login__box">
                  <input
                    type="password"
                    name="password"
                    value={registerData.password}
                    placeholder="Password"
                    className="login__input"
                    onChange={e => handleChange(e)}
                    required
                  />
                </div>
              </div>
            </div>

            <button disabled={loading} type="submit" className="login__button">
              {loading ? 'Registering...' : 'Register'}
            </button>

            {showError && <p className="login__error">{error}</p>}

            <div className="login__register">
              Have an account?{' '}
              <button
                type="button"
                  onClick={handleShowLogin}
                  className="login__register-button"
                >
                  Login
                </button>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
};
