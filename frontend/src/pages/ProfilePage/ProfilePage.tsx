import '../AuthorPage/AuthorPage.scss';
import React, { useState, useEffect } from 'react';
import { PostCard } from '../../components/PostCard';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  clearProfileState,
  fetchUserProfile,
} from '../../features/myProfileSlice';
import { logout } from '../../features/authSlice';
import { Loader } from '../../components/Loader';
import { Link } from 'react-router-dom';

export const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { profile, loading, error } = useAppSelector(state => state.myProfile);
  const [showError, setShowError] = useState(false);
  const { error: logoutError, isAuthenticated } = useAppSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

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

                  {showError && <p className="user__error">
                    {logoutError}
                  </p>}
                  <div className="user__followers">
                    <div className="user__category user__category--subscr">
                      <span className="user__span user__span--centr">
                        Subscribers:{' '}
                      </span>
                      <p className="user__p user__p--center">
                        {profile.subscribers}
                      </p>
                    </div>
                    <div className="user__category user__category--subscr">
                      <span className="user__span user__span--centr">
                        Subscriptions:{' '}
                      </span>
                      <p className="user__p user__p--center">
                        {profile.subscriptions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="user__info">
                  <h2 className="user__name">
                    {profile.username}
                    <p className="user__p user__pp">{profile.about_me}</p>
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
                      <p className="user__p">{profile.date_joined}</p>
                    </div>
                  </div>
                </div>
              </div>

              {!!profile.posts.length && (
                <>
                  <h2 className="user__posts-title">Posts</h2>
                  <h5 className="user__posts-count">{`${profile.posts.length} posts`}</h5>
                  <div className="user__list">
                    {profile.posts.map(post => (
                      <PostCard post={post} />
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
