import classNames from 'classnames';
import './NewPostPage.scss';
import { useEffect, useState } from 'react';
import CreatableAsyncSelect from 'react-select/async-creatable';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createPost } from '../../features/postsSlice';
import { PostData } from '../../types/PostDetails';
import { useNavigate } from 'react-router-dom';

type HashtagOption = {
  value: number;
  label: string;
};

const loadHashtagOptions = (inputValue: string): Promise<HashtagOption[]> => {
  return axios
    .get(`/api/hashtags/autocomplete/?query=${inputValue}`)
    .then(response => {
      return response.data.map((hashtag: any) => ({
        value: hashtag.id,
        label: hashtag.name,
      }));
    });
};

const loadLocationOptions = (inputValue: string): Promise<HashtagOption[]> => {
  return axios
    .get(`/api/locations/autocomplete/?query=${inputValue}`)
    .then(response => {
      return response.data.map((location: any) => ({
        value: location.id,
        label: location.name,
      }));
    });
};

const createOption = (inputValue: string): Promise<HashtagOption> => {
  return new Promise(resolve => {
    axios
      .post('/api/hashtags/autocomplete/', { name: inputValue })
      .then(response => {
        const newOption = {
          value: response.data.id,
          label: response.data.name,
        };
        resolve(newOption);
      });
  });
};

const createLocationOption = (inputValue: string): Promise<HashtagOption> => {
  return new Promise(resolve => {
    axios
      .post('/api/locations/autocomplete/', { name: inputValue })
      .then(response => {
        const newOption = {
          value: response.data.id,
          label: response.data.name,
        };
        resolve(newOption);
      });
  });
};

export const NewPostPage = () => {
  const [selectedHashtags, setSelectedHashtags] = useState<HashtagOption[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<HashtagOption>();
  const [formPhotos, setFormPhotos] = useState<File[]>([]);
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

  const handleChangeHash = (selectedOptions: any) => {
    setSelectedHashtags(selectedOptions);
    setFormState(current => ({ ...current, hashtags: selectedOptions }));
    setErrors(current => ({ ...current, hashtags: false }));
  };

  const handleChangeLocation = (selectedOptions: any) => {
    setSelectedLocations(selectedOptions);
    setFormState(current => ({ ...current, location: selectedOptions }));
    setErrors(current => ({ ...current, location: false }));
  };

  const [{ location, hashtags, title, photos, body }, setFormState] = useState({
    location: selectedLocations,
    hashtags: selectedHashtags,
    title: '',
    body: '',
    photos: formPhotos,
  });

  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({
      location: !location?.label,
      hashtags: !hashtags.length,
      title: !title.trim(),
      body: !body.trim(),
      photos: !photos.length,
    });

    const transformedLocations = selectedLocations
      ? {
          id: selectedLocations.value,
          country: selectedLocations.label.split(' ')[0],
          city: selectedLocations.label.split(' ')[1],
        }
      : {
          id: 0,
          country: '',
          city: '',
        };

    const transformedHashtags = selectedHashtags.map(hashtag => ({
      id: hashtag.value,
      name: hashtag.label,
    }));
    const transformedPhotos = await Promise.all(
      formPhotos.map(async photo => {
        const reader = new FileReader();
        return new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(photo);
        });
      }),
    );

    const postData: PostData = {
      title,
      content: body,
      hashtags: transformedHashtags,
      uploaded_photos: transformedPhotos,
      location: transformedLocations,
    };

    if (
      !title.trim() ||
      !location?.label ||
      !hashtags.length ||
      !photos.length ||
      !body.trim()
    ) {
      return;
    }

    await dispatch(createPost(postData));
    clearForm();
  };

  const [errors, setErrors] = useState({
    location: false,
    hashtags: false,
    title: false,
    body: false,
    photos: false,
  });

  const clearForm = () => {
    setFormState({
      location: { value: 0, label: '' },
      hashtags: [],
      title: '',
      body: '',
      photos: [],
    });
    setErrors({
      location: false,
      hashtags: false,
      title: false,
      body: false,
      photos: false,
    });
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name: field, value } = event.target;
    setFormState(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: false }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setFormPhotos([...formPhotos, ...newPhotos]);
      setFormState(current => ({
        ...current,
        photos: [...formPhotos, ...newPhotos],
      }));
      setErrors(current => ({ ...current, photos: false }));
    }
  };

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
                  onChange={handleChange}
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
                <CreatableAsyncSelect
                  isMulti
                  cacheOptions
                  defaultOptions
                  className="newpost__select"
                  loadOptions={loadLocationOptions}
                  onChange={handleChangeLocation}
                  placeholder="Choose location"
                  onCreateOption={(inputValue: string) => {
                    createLocationOption(inputValue).then(newOption => {
                      setSelectedLocations(newOption);
                    });
                  }}
                />
              </div>
              {errors.location && (
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
                <CreatableAsyncSelect
                  isMulti
                  cacheOptions
                  defaultOptions
                  className="newpost__select"
                  loadOptions={loadHashtagOptions}
                  onChange={handleChangeHash}
                  placeholder="Choose hashtag"
                  onCreateOption={(inputValue: string) => {
                    createOption(inputValue).then(newOption => {
                      setSelectedHashtags(prev => [...prev, newOption]);
                    });
                  }}
                />
              </div>
              {errors.hashtags && (
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
                  id="comment-body"
                  name="body"
                  placeholder="Type your post here"
                  className={classNames('newpost__textarea', {
                    'is-danger': errors.body,
                  })}
                  value={body}
                  onChange={handleChange}
                />
              </div>
              {errors.body && (
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
                  multiple
                  type="file"
                  alt="photo"
                  name="photos"
                  accept="image/png, image/jpeg"
                  id="comment-author-name"
                  placeholder="Photos"
                  className={classNames('newpost__input', {
                    'is-danger': errors.photos,
                  })}
                  onChange={handlePhotoChange}
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
