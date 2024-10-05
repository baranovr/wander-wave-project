import classNames from 'classnames';
import './NewPostPage.scss';
import {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../../app/hooks';
import {createPost} from '../../features/postsSlice';
import {useNavigate} from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

interface Location {
  id?: number;
  city?: string;
  country?: string;
  name: string;
}

interface Hashtag {
  id?: number;
  name: string;
}

export const NewPostPage = () => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [visibleLocation, setVisibleLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [visibleHashtags, setVisibleHashtags] = useState(false);
  const [hashtagSuggestions, setHashtagSuggestions] = useState<Hashtag[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<number[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const dispatch = useAppDispatch();
  const { createError, createLoading } = useAppSelector(state => state.posts);
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (createError) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [createError]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);


  const fetchLocationSuggestions = async () => {
    try {
      const response = await axiosInstance.get('http://127.0.0.1:8008/api/platform/locations/');
      setLocationSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  const fetchHashtagSuggestions = async () => {
    try {
      const response = await axiosInstance.get('http://127.0.0.1:8008/api/platform/hashtags/');
      setHashtagSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching hashtag suggestions:', error);
    }
  };

  useEffect(() => {
    fetchLocationSuggestions();
  }, []);

  useEffect(() => {
    fetchHashtagSuggestions();
  }, []);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location.id ?? null);

    setErrors((current => ({ ...current, selectedLocation: false })));
    setVisibleLocation(false);
  };

  const handleHashtagSelect = (hashtag: Hashtag) => {
    if (hashtag.id && !selectedHashtags.includes(hashtag.id)) {
      setSelectedHashtags([...selectedHashtags, hashtag.id]);
      setErrors((current => ({ ...current, selectedHashtags: false })));
    }
    setVisibleHashtags(false);
  };

  const handleRemoveHashtag = (hashtagId: number) => {
    setSelectedHashtags(selectedHashtags.filter(id => id !== hashtagId));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // if (event.target.files) {
    //   setPhotos([...photos, ...Array.from(event.target.files)]);
    //   setErrors(current => ({ ...current, photos: false }))
    // }

    const file = event.target.files?.[0] || null;
      setPhoto(file);
      setErrors(current => ({
        ...current,
        photo: false,
      }));
    };

  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    setErrors({
      selectedLocation: !selectedLocation,
      selectedHashtags: !selectedHashtags.length,
      title: !title.trim(),
      content: !content.trim(),
      photo: !photo,
    });


    if (
      !title.trim() ||
      !selectedLocation ||
      !selectedHashtags.length ||
      !photo ||
      !content.trim()
    ) {
      return;
    }

    await dispatch(
      createPost({
        title,
        content,
        hashtags: selectedHashtags,
        photo: photo,
        location: selectedLocation,
      })
    );

    clearForm();
  };

  const [errors, setErrors] = useState({
    title: false,
    selectedLocation: false,
    content: false,
    selectedHashtags: false,
    photo: false,
  });


  const clearForm = () => {
    setTitle('');
    setContent('');
    setSelectedLocation(null);
    setSelectedHashtags([]);
    setPhoto(null);
    setErrors({
      title: false,
      selectedLocation: false,
      content: false,
      selectedHashtags: false,
      photo: false,
    });
  };

  const handleTitleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(ev.target.value);
    setErrors((current => ({ ...current, title: false })))
  }

  const handleContentChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(ev.target.value);
    setErrors((current => ({ ...current, content: false })))
  }

  return (
    <div className="newpost">
      <div className="container">
        <div className="newpost__content">
          <h2 className="newpost__title">Create new post</h2>
          <h4 className="newpost__span">
            Please fill the form to share your travel experiences
          </h4>
          <form onSubmit={handleSubmit} onReset={clearForm}>
            <div className="newpost__field">
              <label className="newpost__label" htmlFor="post-title">
                Title
              </label>
              <div className="newpost__control">
                <input
                  type="text"
                  name="title"
                  id="post-title"
                  placeholder="Title"
                  className={classNames('newpost__input', {
                    'is-danger': errors.title,
                  })}
                  value={title}
                  onChange={handleTitleChange}
                />
              </div>
              {errors.title && (
                <p
                  className="newpost__help newpost__is-danger"
                  data-cy="ErrorMessage"
                >
                  <span
                    className="newpost__icon newpost__icon--error"
                    data-cy="ErrorIcon"
                  />
                  <span>Title is required</span>
                </p>
              )}
            </div>

            <div className="newpost__field">
              <label className="newpost__label" htmlFor="post-location">
                Location
              </label>
              <div className="newpost__control">
                <button
                  type="button"
                  id="post-location"
                  className="newpost__select"
                  onClick={() => setVisibleLocation(true)}
                >
                  {selectedLocation
                    ? locationSuggestions.find(loc => loc.id === selectedLocation)?.name
                    : 'Choose location'}
                  <span className={classNames('newpost__icon newpost__icon--arrow',
                    { 'newpost__icon--arrow--active': visibleLocation }
                  )} />
                </button>
                {visibleLocation && (
                  <ul>
                    {locationSuggestions.map((location) => (
                      <li
                        key={location.id}
                        onClick={() => handleLocationSelect(location)}
                        className="newpost__suggestions"
                      >
                        {location.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {errors.selectedLocation && (
                <p
                  className="newpost__help newpost__is-danger"
                  data-cy="ErrorMessage"
                >
                  <span
                    className="newpost__icon newpost__icon--error"
                    data-cy="ErrorIcon"
                  />
                  <span>Location is required</span>
                </p>
              )}
            </div>

            <div className="newpost__field">
              <label className="newpost__label" htmlFor="post-hashtags">
                Hashtags
              </label>
              <div className="newpost__control">
                <button
                  type="button"
                  id="post-hashtags"
                  className="newpost__select"
                  onClick={() => setVisibleHashtags(true)}
                >
                  Choose hashtag
                  <span className={classNames('newpost__icon newpost__icon--arrow',
                    { 'newpost__icon--arrow--active': visibleHashtags }
                  )} />
                </button>
                {visibleHashtags && (
                  <ul>
                    {hashtagSuggestions.map((hashtag) => (
                      <li
                        key={hashtag.id}
                        onClick={() => handleHashtagSelect(hashtag)}
                        className="newpost__suggestions"
                      >
                        {hashtag.name}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="newpost__tags">
                  {selectedHashtags.map((tagId) => {
                    const tag = hashtagSuggestions.find(h => h.id === tagId);
                    return (
                      <span
                        key={tagId}
                        className="newpost__tag"
                      >
                        #{tag ? tag.name : tagId}
                        <button
                          type="button"
                          onClick={() => handleRemoveHashtag(tagId)}
                          className="newpost__remove-button"
                        />
                      </span>
                    );
                  })}
                </div>
              </div>
              {errors.selectedHashtags && (
                <p
                  className="newpost__help newpost__is-danger"
                  data-cy="ErrorMessage"
                >
                  <span
                    className="newpost__icon newpost__icon--error"
                    data-cy="ErrorIcon"
                  />
                  <span>Hashtags is required</span>
                </p>
              )}
            </div>

            <div className="newpost__field" data-cy="BodyField">
              <label className="newpost__label" htmlFor="post-body">
                Posts text
              </label>
              <div className="newpost__control">
                <textarea
                  name="content"
                  id="post-body"
                  placeholder="Type your post here"
                  className={classNames('newpost__textarea', {
                    'is-danger': errors.content,
                  })}
                  value={content}
                  onChange={handleContentChange}
                />
              </div>
              {errors.content && (
                <p
                  className="newpost__help newpost__is-danger"
                  data-cy="ErrorMessage"
                >
                  <span
                    className="newpost__icon newpost__icon--error"
                    data-cy="ErrorIcon"
                  />
                  <span>Text is required</span>
                </p>
              )}
            </div>

            <div className="newpost__field">
              <label className="newpost__label" htmlFor="post-photos">
                Add photos
              </label>
              <div className="newpost__control">
                <input
                  type="file"
                  //multiple
                  id="post-photos"
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  placeholder="Photo"
                  className={classNames('newpost__input', {
                    'is-danger': errors.photo,
                  })}
                />
              </div>
              {errors.photo && (
                <p
                  className="newpost__help newpost__is-danger"
                  data-cy="ErrorMessage"
                >
                  <span
                    className="newpost__icon newpost__icon--error"
                    data-cy="ErrorIcon"
                  />
                  <span>Photos is required</span>
                </p>
              )}
            </div>

            {showError && <p className="newpost__error">
              Failed to create post
            </p>}

            <div className="newpost__form-actions">
              <button
                type="submit"
                className="newpost__button"
              >
                {createLoading ? 'Creating...' : 'Create'}
              </button>

              {/* eslint-disable-next-line react/button-has-type */}
              <button type="reset" className="newpost__button is-link is-light">
                Clear
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
