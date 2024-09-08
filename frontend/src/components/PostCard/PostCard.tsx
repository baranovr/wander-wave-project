import { Link } from 'react-router-dom';
import { Post } from '../../types/Post';
import './PostCard.scss';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addToFavorites, setLike } from '../../features/postDetailsSlice';
import classNames from 'classnames';
import { useState } from 'react';
import { getImageUrl } from "../../api/imageUtils";

type Props = {
  post: Post;
};

export const PostCard: React.FC<Props> = ({ post }) => {
  const dispatch = useAppDispatch();
  const { liked, favorites } = useAppSelector(state => state.myProfile);
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [showError, setShowError] = useState(false);
  const hashtags = post?.hashtags?.length > 0
    ? post.hashtags.map(hash => (hash?.name && hash.name.startsWith('#') ? hash.name : `#${hash?.name || ''}`))
    : 'No hashtags available';
  const [likedPost, setLikedPost] = useState(liked
    .some(like => like.post.id === post.id));
  const [favoritePost, setFavoritePost ]= useState(favorites
    .some(fav => fav.post.id === post.id));

  const handleLike = () => {
    if (!isAuthenticated) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);

      return () => clearTimeout(timer);
    }

    dispatch(setLike(post.id));
    setLikedPost(!likedPost);
  };

  const handleAddToFavorites = () => {
    if (!isAuthenticated) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);

      return () => clearTimeout(timer);
    }

    dispatch(addToFavorites(post.id));
    setFavoritePost(!favoritePost);
  };

  return (
    <div className="card">
      <Link to={`../../posts/${post.id}`}>
        <div className="card__header">
          <img
              className="card__img"
              src={getImageUrl(post.photo)}
              alt="nature"
          />
        </div>
      </Link>
      <div className="card__body">
        <div className="card__top">
          <Link
              className="card__location-link"
              target="blank"
              to={`https://www.google.com/maps/place/${post.location.city},${post.location.country}/`}
          >
            <span className="card__location card__location--teal">{`${post.location.city}, ${post.location.country}`}</span>
          </Link>

          <small className="card__posted-date">
            {post?.created_at ? post.created_at.slice(0, 10).split('-').reverse().join('.') : 'N/A'}
          </small>
        </div>

        <p className="card__title">{post.title ? post.title.slice(0, 20) : 'No title'}...</p>

        <h4 className="card__hashtags">
          {post.hashtags ? hashtags : 'No hashtags available'}
        </h4>

        <h5 className="card__user-name">
          <span className="card__span">Posted by</span>
          {post.username}
        </h5>

        <div className="card__reactions">
          <div className="card__reaction">
            <button
              type="button"
              aria-label="comments"
              className="card__icon card__icon--comments"
            />
            <span className="card__count">{post.comments_count}</span>
          </div>

          <div className="card__reaction">
            <button
              type="button"
              aria-label="likes"
              onClick={handleLike}
              className={classNames('card__icon', {
                'card__icon--likes-active': likedPost,
                'card__icon--likes': !likedPost,
              })}
            />
            <span className="card__count">{post.likes_count}</span>
          </div>

          <div className="card__reaction">
            <button
              type="button"
              aria-label="save"
              onClick={handleAddToFavorites}
              className={classNames('card__icon', {
                'card__icon--save-active': favoritePost,
                'card__icon--save': !favoritePost,
              })}
            />
          </div>
        </div>

        {showError && <p className="card__error">
          Please login or register
        </p>}

        <div className="card__buttons">
          <Link to={`../../posts/${post.id}`} className="card__button button">
            <span className="button__text">Read more...</span>
            <span className="button__icon button__icon--right" />
          </Link>
        </div>
      </div>
    </div>
  );
};
