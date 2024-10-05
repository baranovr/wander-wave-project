import '../AuthorPage/AuthorPage.scss';
import React, { useState, useEffect } from 'react';
import { PostCard } from '../../components/PostCard';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  clearProfileState,
  fetchUserProfile,
  updateUserProfile,
} from '../../features/myProfileSlice';
import { logout } from '../../features/authSlice';
import { Loader } from '../../components/Loader';
import { Link } from 'react-router-dom';
import {User} from "../../types/User";

export const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { profile, loading, error } = useAppSelector(state => state.myProfile);
  const [showError, setShowError] = useState(false);
  const { error: logoutError, isAuthenticated } = useAppSelector(state => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<User> | null>(null);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setEditedProfile({
        username: profile.username,
        email: profile.email,
        status: profile.status,
        about_me: profile.about_me,
      });
    }
  }, [profile]);

  const handleLogout = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await dispatch(logout());

    if (logoutError) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);

      return () => clearTimeout(timer);
    }

    dispatch(clearProfileState());
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProfile({
      username: profile?.username,
      email: profile?.email,
      status: profile?.status,
      about_me: profile?.about_me,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editedProfile) {
      await dispatch(updateUserProfile(editedProfile));
      setIsEditing(false);
    }
  };

  return (
    <div className="user">
      <div className="container">
        <div className="user__content">
          {loading && <Loader />}
          {!isAuthenticated && !loading && (
            <p className="user__not-found">Please login or register
              <Link className="user__not-found--link" to="../login">here</Link>
            </p>
          )}
          {error && !loading && isAuthenticated && (
            <p className="user__not-found">
              Oops...something went wrong. Please try again.
            </p>
          )}

          {!error && !loading && profile && (
            <>
              <div className="user__top">
                <div className="user__right-side">
                  <img
                    className="user__photo"
                    src={profile.avatar || 'default-avatar.png'}
                    alt={profile.username}
                  />
                  <button
                    onClick={handleLogout}
                    className="user__button"
                    type="button"
                  >
                    Log out
                  </button>

                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="user__button__edit"
                      type="button"
                    >
                      Edit Profile
                    </button>
                  )}

                  {showError && <p className="user__error">
                    {logoutError}
                  </p>}
                  <div className="user__followers">
                    <div className="user__category user__category--subscr">
                      <span className="user__span user__span--centr">
                        <Link to="/my-profile/subscribers" className="user__span">
                          Subscribers:{' '}
                        </Link>
                      </span>
                      <p className="user__p user__p--center">
                        {profile.subscribers}
                      </p>
                    </div>
                    <div className="user__category user__category--subscr">
                      <span className="user__span user__span--centr">
                        <Link to="/my-profile/subscriptions" className="user__span">
                          Subscriptions:{' '}
                        </Link>
                      </span>
                      <p className="user__p user__p--center">
                        {profile.subscriptions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="user__info">
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="user__edit-form">
                      <div className="user__form-group">
                        <label htmlFor="username" className="user__form-label">Username:</label>
                        <input
                          id="username"
                          type="text"
                          name="username"
                          value={editedProfile?.username}
                          onChange={handleChange}
                          className="user__form-input"
                        />
                      </div>
                      <div className="user__form-group">
                        <label htmlFor="email" className="user__form-label">Email:</label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={editedProfile?.email}
                          onChange={handleChange}
                          className="user__form-input"
                        />
                      </div>
                      <div className="user__form-group">
                        <label htmlFor="status" className="user__form-label">Status:</label>
                        <select
                          id="status"
                          name="status"
                          value={editedProfile?.status}
                          onChange={handleChange}
                          className="user__form-select"
                        >
                          <option value="Road Tripper">Road Tripper</option>
                          <option value="Cruiser">Cruiser</option>
                          <option value="Backpacker">Backpacker</option>
                          <option value="Flyer">Flyer</option>
                          <option value="Cyclist">Cyclist</option>
                          <option value="Hiker">Hiker</option>
                          <option value="Railway Explorer">Railway Explorer</option>
                          <option value="Sailor">Sailor</option>
                          <option value="RVer">RVer</option>
                          <option value="Nomad">Nomad</option>
                        </select>
                      </div>
                      <div className="user__form-group">
                        <label htmlFor="about_me" className="user__form-label">About me:</label>
                        <textarea
                          id="about_me"
                          name="about_me"
                          value={editedProfile?.about_me}
                          onChange={handleChange}
                          className="user__form-textarea"
                        />
                      </div>
                      <div className="user__form-actions">
                        <button type="submit" className="user__button user__button--primary">Save</button>
                        <button type="button" onClick={handleCancelEdit} className="user__button user__button--secondary">Cancel</button>
                      </div>
                    </form>
                  ) : (
                      <>
                        <h2 className="user__name">
                          {profile.username}
                          <p className="user__p user__pp about-me">{profile.about_me}</p>
                        </h2>

                        <div className="user__categories">
                          <div className="user__category user__category--row">
                            <span className="user__span">Status:</span>
                            <p className="user__p">{profile.status}</p>
                        </div>
                        <div className="user__category user__category--row">
                          <span className="user__span">Email:</span>
                          <p className="user__p">{profile.email}</p>
                        </div>

                        <div className="user__category user__category--row">
                          <span className="user__span">Date Joined:</span>
                          <p className="user__p">{profile.date_joined.slice(0, 10).split('-').reverse().join('.')}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {!!profile.posts.length && (
                <>
                  <h2 className="user__posts-title">Posts</h2>
                  <h5 className="user__posts-count">{`${profile.posts.length} posts`}</h5>
                  <div className="user__list">
                    {profile.posts.map(post => (
                      <PostCard post={post} key={post.id} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};