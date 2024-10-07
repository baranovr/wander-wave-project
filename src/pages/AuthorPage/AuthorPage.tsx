import './AuthorPage.scss';
import React, { useState, useEffect } from 'react';
import { PostCard } from '../../components/PostCard';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  subscribeToAuthor,
  unsubscribeFromAuthor,
} from '../../features/subscriptionSlice';
import { fetchSubscriptions } from '../../features/myProfileSlice';
import { fetchAuthorProfile } from '../../features/authorProfileSlice';
import { Loader } from '../../components/Loader';
import {getImageUrl} from "../../api/imageUtils";

export const AuthorPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const dispatch = useAppDispatch();
  const { subscriptions } = useAppSelector(state => state.myProfile);
  const { profile, loading, error } = useAppSelector(state => state.author)
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [showError, setShowError] = useState(false);
  const [followCurrentUser, setFollowCurrentUser] = useState(subscriptions.some(subs => subs.username === profile?.username));

  useEffect(() => {
    if (postId) {
      dispatch(fetchAuthorProfile(+postId));
    }
  }, [dispatch, postId]);

  useEffect(() => {
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  const handleUnsubscribe = () => {
    if (postId) {
      dispatch(unsubscribeFromAuthor({ postId: +postId }));
      dispatch(fetchAuthorProfile(+postId));
      setFollowCurrentUser(!followCurrentUser);
    }
  };

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);

      return () => clearTimeout(timer);
    }

    if (postId) {
      dispatch(subscribeToAuthor({ postId: +postId }));
      dispatch(fetchAuthorProfile(+postId));
      setFollowCurrentUser(!followCurrentUser);
    }
  };

  return (
    <div className="user">
      <div className="container">
        <div className="user__content">
          {loading && <Loader />}
          {error && !loading && (
            <p className="user__not-found">Oops...something went wrong. Please try again.</p>
          )}

          {!loading && !error && profile && (
            <>
              <div className="user__top">
                <div className="user__right-side">
                  <img
                    className="user__photo"
                    src={getImageUrl(profile.avatar) || 'default-avatar.png'}
                    alt={profile.username}
                  />
                  {followCurrentUser ? (
                    <button
                      onClick={handleUnsubscribe}
                      className="user__button"
                      type="button"
                    >
                      Unfollow
                    </button>
                  ) : (
                    <button
                      onClick={handleSubscribe}
                      className="user__button"
                      type="button"
                    >
                      Follow
                    </button>
                  )}

                  {showError && <p className="user__error">
                    Please login or register
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
                    <p className="user__about">{profile.about_me}</p>
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
