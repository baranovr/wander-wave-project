import { useEffect, useState } from 'react';
import './PostDetailsPage.scss';
import { Link, useParams } from 'react-router-dom';
import classNames from 'classnames';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  addComment,
  addToFavorites,
  deleteComment,
  deleteFromFavorites,
  deleteLike,
  fetchPostDetails,
  setLike,
} from '../../features/postDetailsSlice';
import { Loader } from '../../components/Loader';

export const PostDetailsPage = () => {
  const dispatch = useAppDispatch();
  const { post, loading, error } = useAppSelector(state => state.postDetails);
  const { postId } = useParams<{ postId: string }>();
  const [visibleComments, setVisibleComments] = useState(false);
  const [visibleForm, setVisibleForm] = useState(false);
  const hashtags = post?.hashtags.map(hash =>
    hash.name.slice(0, 1) === '#' ? hash.name + ' ' : '#' + hash.name + ' ',
  );
  const [showError, setShowError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState(false);
  const [body, setBody] = useState('');
  const { liked, favorites, profile } = useAppSelector(state => state.myProfile);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  const [likedPost, setLikedPost] = useState(liked
    .some(like => like.post.id === post?.id));
  const [favoritePost, setFavoritePost] = useState(favorites
    .some(fav => fav.post.id === post?.id));

  const handleLike = () => {
    if (!isAuthenticated) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);

      return () => clearTimeout(timer);
    }

    if (likedPost && post) {
      const like = liked.find(l => l.post.id === post.id);
      if (like) {
        dispatch(deleteLike(like.id));
        setLikedPost(!likedPost);
      }
    } else if (!likedPost && post) {
      dispatch(setLike(post.id));
      setLikedPost(!likedPost);
    }
  };

  const handleAddToFavorites = () => {
    if (!isAuthenticated) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);

      return () => clearTimeout(timer);
    }

    if (favoritePost && post) {
      const fav = favorites.find(f => f.post.id === post.id);
      if (fav) {
        dispatch(deleteFromFavorites(fav.id));
        setFavoritePost(!favoritePost);
      }
    } else if (!favoritePost && post) {
      dispatch(addToFavorites(post.id));
      setFavoritePost(!favoritePost);
    }
  };

  const handleVisibleForm = () => {
    if (!isAuthenticated) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);

      return () => clearTimeout(timer);
    }

    setVisibleForm(true);
  }

  useEffect(() => {
    if (postId) {
      dispatch(fetchPostDetails(postId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, postId]);

  const handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(ev.target.value);
    setErrors(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const selectedId = postId ? +postId : 0;
    const profileId = profile ? profile?.id : 0;

    setErrors(!body.trim());

    if (!body.trim()) {
      return;
    }

    setSubmitting(true);

    await dispatch(
      addComment({ text: body, userId: profileId, postId: selectedId }),
    );

    setSubmitting(false);
    setBody('');
  };

  const handleDeleteComment = (commentId: number) => (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    dispatch(deleteComment(commentId));
  };

  return (
    <div className="details">
      <div className="container">
        {loading && <Loader />}
        {error && !loading && (
          <p className="details__not-found">Oops...something went wrong. Please try again.</p>
        )}
        {!loading && !error && (
          <div className="details__content">
            <div className="details__post">
              <div className="details__post-info">
                <h2 className="details__title">{post?.title}</h2>

                <Link
                  className="details__location-link"
                  target="_blank"
                  to={`https://www.google.com/maps/place/${post?.location.name}/`}
                >
                  <div className="details__location">
                    <span className="details__icon-location" />
                    {post?.location.name}
                  </div>
                </Link>
                <div className="details__hashtags">{hashtags}</div>
                <div className="details__body">{post?.content}</div>
              </div>

              <div className="details__gallery">
                <div className="details__user">
                  <Link
                    to={`/posts/${post?.id}/author-profile`}
                    className="details__user-name"
                  >
                    by
                    <span className="details__span">{post?.full_name}</span>
                  </Link>
                  <h3 className="details__user-status">{post?.user_status}</h3>
                </div>

                <div className="details__current-image-container">
                  <img
                    alt="product"
                    src={post?.photo}
                    className="details__current-image"
                  />
                </div>

                {/* <div className="details__images">
                  {post?.photos &&
                    post?.photos.map(photo => (
                      <button
                        key={photo.id}
                        type="button"
                        className={classNames('details__image-button', {
                          'details__image-button--active':
                            currentImage === photo.image,
                        })}
                        onClick={() => setCurrentImage(photo.image)}
                      >
                        <img
                          alt="product"
                          src={photo.image}
                          className="details__image"
                        />
                      </button>
                    ))}
                </div> */}
              </div>
            </div>

            <div className="details__actions">
              <div className="details__action">
                {visibleComments ? (
                  <button
                    type="button"
                    className="details__action-button"
                    onClick={() => setVisibleComments(false)}
                  >
                    Hide comments
                  </button>
                ) : (
                  <button
                    type="button"
                    className="details__action-button"
                    onClick={() => setVisibleComments(true)}
                  >
                    Show comments
                  </button>
                )}
              </div>
              <div className="details__action">
                <div className="details__reaction">
                  <button
                    type="button"
                    onClick={handleLike}
                    aria-label="likes"
                    className={classNames('details__icon', {
                      'details__icon--likes-active': likedPost,
                      'details__icon--likes': !likedPost,
                    })}
                  />
                  <span className="details__count">{post?.likes_count}</span>
                </div>
              </div>
              <div className="details__action">
                <div className="details__reaction">
                  <button
                    type="button"
                    aria-label="save"
                    onClick={handleAddToFavorites}
                    className={classNames('details__icon', {
                      'details__icon--save-active': favoritePost,
                      'details__icon--save': !favoritePost,
                    })}
                  />
                </div>
              </div>
              <div className="details__action">
                <button
                  type="button"
                  className="details__action-button"
                  onClick={handleVisibleForm}
                >
                  Add comment
                </button>
              </div>
            </div>

            {showError && <p className="details__error">
              Please login or register
            </p>}

            {visibleForm && (
              <form className="details__form" onSubmit={handleSubmit}>
                <div className="details__field" data-cy="BodyField">
                  <label className="details__label" htmlFor="comment-body">
                    Add your comment
                  </label>
                  <div className="details__control">
                    <textarea
                      id="comment-body"
                      name="body"
                      placeholder="Type your comment here"
                      className={classNames('details__textarea', {
                        'is-danger': errors,
                      })}
                      value={body}
                      onChange={handleChange}
                    />
                  </div>
                  {errors && (
                    <p
                      className="details__help details__is-danger"
                      data-cy="ErrorMessage"
                    >
                      <span
                        className="details__icon-error"
                        data-cy="ErrorIcon"
                      />
                      <span>Enter your comment</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className={classNames('details__button', 'is-link', {
                    'is-loading': submitting,
                  })}
                >
                  {submitting ? 'Adding...' : 'Add'}
                </button>
              </form>
            )}

            {visibleComments && (
              <div className="details__comments">
                <div className="details__comments-top">
                  <h2 className="details__title-h2">Comments:</h2>
                  <span className="details__comments-count">
                    {`${post?.comments.length} comments`}
                  </span>
                </div>
                {post?.comments.map(comment => (
                  <div className="details__comment" key={comment.id}>
                    <div className="details__comment-user">
                      <div className="details__comment-username">
                        {comment.commentator_username}
                      </div>
                      {profile && isAuthenticated
                        && (comment.commentator_username === profile.username
                          || post?.username === profile.username)
                        && (<span
                          className="details__delete"
                          onClick={handleDeleteComment(comment.id)}
                        />)
                      }
                    </div>
                    <div className="details__comment-body">{comment.text}</div>
                    <div className="details__comment-date">
                      {comment.created_date.slice(0, 10).split('-').reverse().join('.')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
