import classNames from 'classnames';
import './NewPostPage.scss';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createPost } from '../../features/postsSlice';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

interface Location {
  id?: string;
  city?: string;
  country?: string;
  name: string;
}

interface Hashtag {
  id?: string;
  name: string;
}

export const NewPostPage = () => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [locationInput, setLocationInput] = useState<string>('');
  const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [hashtagInput, setHashtagInput] = useState<string>('');
  const [hashtagSuggestions, setHashtagSuggestions] = useState<Hashtag[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
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
      const response = await axiosInstance.get(`/api/locations/autocomplete/?query=${locationInput}`);
      setLocationSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  const fetchHashtagSuggestions = async () => {
    try {
      const response = await axiosInstance.get(`/api/hashtags/autocomplete/?q=${hashtagInput}`);
      setHashtagSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching hashtag suggestions:', error);
    }
  };

  useEffect(() => {
    if (locationInput.length > 2) {
      fetchLocationSuggestions();
    } else {
      setLocationSuggestions([]);
    }
  }, [locationInput]);

  useEffect(() => {
    if (hashtagInput.length > 1) {
      fetchHashtagSuggestions();
    } else {
      setHashtagSuggestions([]);
    }
  }, [hashtagInput]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location.name);
    setLocationInput(location.name);
    setLocationSuggestions([]);
  };

  const handleHashtagSelect = (hashtag: Hashtag) => {
    if (!selectedHashtags.includes(hashtag.name)) {
      setSelectedHashtags([...selectedHashtags, hashtag.name]);
    }
    setHashtagInput('');
    setHashtagSuggestions([]);
  };

  const handleRemoveHashtag = (hashtag: string) => {
    setSelectedHashtags(selectedHashtags.filter(tag => tag !== hashtag));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setPhotos([...photos, ...Array.from(event.target.files)]);
      setErrors(current => ({ ...current, photos: false }))
    }
  };

  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('location_name', selectedLocation);
    selectedHashtags.forEach(tag => formData.append('hashtags', tag));
    photos.forEach(photo => formData.append('uploaded_photos', photo));

    setErrors({
      locationInput: !locationInput.trim(),
      hashtagInput: !selectedHashtags.length,
      title: !title.trim(),
      content: !content.trim(),
      photos: !photos.length,
    });


    if (
      !title.trim() ||
      !locationInput.trim() ||
      !selectedHashtags.length ||
      !photos.length ||
      !content.trim()
    ) {
      return;
    }

    await dispatch(createPost(formData));
    clearForm();
  };

  const [errors, setErrors] = useState({
    title: false,
    locationInput: false,
    content: false,
    hashtagInput: false,
    photos: false,
  });


  const clearForm = () => {
    setTitle('');
    setContent('');
    setLocationInput('');
    setHashtagInput('');
    setPhotos([]);
    setErrors({
      title: false,
      locationInput: false,
      content: false,
      hashtagInput: false,
      photos: false,
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

  const handleLocationInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setLocationInput(ev.target.value);
    setErrors((current => ({ ...current, locationInput: false })))
  }

  const handleHashtagInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setHashtagInput(ev.target.value);
    setErrors((current => ({ ...current, hashtagInput: false })))
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
              <label className="newpost__label" htmlFor="comment-author-name">
                Title
              </label>
              <div className="newpost__control">
                <input
                  type="text"
                  name="title"
                  id="comment-author-name"
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
              <label className="newpost__label" htmlFor="comment-author-name">
                Location
              </label>
              <div className="newpost__control">
                <input
                  type="text"
                  value={locationInput}
                  className="newpost__select"
                  onChange={handleLocationInputChange}
                  placeholder="Location"
                />
                {locationSuggestions.length > 0 && (
                  <ul>
                    {locationInput && (
                      <li
                        onClick={() => handleLocationSelect({ name: locationInput })}
                        className="newpost__suggestions"
                      >

                        {locationInput}
                      </li>
                    )}
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
              {errors.locationInput && (
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
              <label className="newpost__label" htmlFor="comment-author-name">
                Hashtags
              </label>
              <div className="newpost__control">
                <input
                  type="text"
                  className="newpost__select"
                  value={hashtagInput}
                  onChange={handleHashtagInputChange}
                  placeholder="Add hashtag"
                />
                {hashtagSuggestions.length > 0 && (
                  <ul>
                    {hashtagInput && (
                      <li
                        onClick={() => handleHashtagSelect({ name: hashtagInput })}
                        className="newpost__suggestions"
                      >

                        {hashtagInput}
                      </li>
                    )}
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
                  {selectedHashtags.map((tag) => (
                    <span
                      key={tag}
                      className="newpost__tag"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveHashtag(tag)}
                        className="newpost__remove-button"
                      />
                    </span>
                  ))}
                </div>
              </div>
              {errors.hashtagInput && (
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
              <label className="newpost__label" htmlFor="comment-body">
                Posts text
              </label>
              <div className="newpost__control">
                <textarea
                  name="content"
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
              <label className="newpost__label" htmlFor="comment-author-name">
                Add photos
              </label>
              <div className="newpost__control">
                <input
                  type="file"
                  multiple
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  placeholder="Photos"
                  className={classNames('newpost__input', {
                    'is-danger': errors.photos,
                  })}
                />
              </div>
              {errors.photos && (
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
