import '../PostsPage/PostsPage.scss';
import { PostCard } from '../../components/PostCard';
import { Loader } from '../../components/Loader';
import { Sorting } from '../../components/Sorting';
import { itemsPerPageOptions, sortOptions } from '../../types/Options';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { Pagination } from '../../components/Pagination';
import { Dropdown } from '../../components/Dropdown';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { init } from '../../features/postsSlice';
import { fetchMyFavorites, fetchMyLiked } from '../../features/myProfileSlice';

export const FavoritesPage = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { favorites, favError, favLoading } = useAppSelector(state => state.myProfile);
  const sortBy = searchParams.get('sort') || 'new';
  const query = searchParams.get('query') || '';
  const location = searchParams.get('location') || '';
  const itemsOnPage = searchParams.get('perPage') || 'all';
  const currentPage = searchParams.get('page') || '1';

  const firstItem = +itemsOnPage * +currentPage - +itemsOnPage + 1;
  const lastItem = Math.min(+itemsOnPage * +currentPage, favorites.length);
  const favotitesPosts = favorites.map(fav => fav.post);

  useEffect(() => {
    dispatch(init());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchMyLiked());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchMyFavorites());
  }, [dispatch]);

  const filteredPosts = useMemo(() => {
    let filtered = [...favotitesPosts];

    if (query) {
      filtered = filtered.filter(
        item =>
          item.hashtags.some(hash =>
            hash.name.toLowerCase().includes(query.toLowerCase()),
          ) ||
          item.location.country.toLowerCase().includes(query.toLowerCase()) ||
          item.location.city.toLowerCase().includes(query.toLowerCase()),
      );
    }

    if (location) {
      filtered = filtered.filter(
        item =>
          item.location.country
            .toLowerCase()
            .includes(location.toLowerCase()) ||
          item.location.city.toLowerCase().includes(location.toLowerCase()),
      );
    }

    switch (sortBy) {
      case 'likes':
        return filtered.sort((a, b) => b.likes_count - a.likes_count);

      case 'comments':
        return filtered.sort((a, b) => b.comments_count - a.comments_count);

      case 'age':
        return filtered.sort(
          (a, b) =>
            +b.created_at
              .slice(0, 19)
              .replaceAll('-', '')
              .replaceAll(':', '')
              .replace('T', '') -
            +a.created_at
              .slice(0, 19)
              .replaceAll('-', '')
              .replaceAll(':', '')
              .replace('T', ''),
        );

      default:
        return filtered;
    }
  }, [location, favotitesPosts, query, sortBy]);

  const visibleItems =
    itemsOnPage === 'all'
      ? filteredPosts
      : filteredPosts.slice(firstItem - 1, lastItem);

  const visiblePagination =
    (itemsOnPage !== 'all' || visibleItems.length > +itemsOnPage) &&
    visibleItems.length > 0;

  const currentSort = sortOptions.find(o => o.value === sortBy) || {
    label: 'Newest',
  };

  const currentPerPage = itemsPerPageOptions.find(
    o => o.value === itemsOnPage,
  ) || {
    label: 'All',
  };

  const locationOptions = useMemo(() => {
    let locations = [{ label: 'All', value: '' }];

    favotitesPosts.forEach(
      post =>
        !locations.some(loc => loc.value === post.location.city) &&
        locations.push({
          value: post.location.city,
          label: `${post.location.city}, ${post.location.country}`,
        }),
    );

    return locations;
  }, [favotitesPosts]);

  const currentLocation = locationOptions.find(o => o.value === location) || {
    label: 'All',
  };

  return (
    <div className="posts">
      <div className="container">
        <div className="posts__content">
          <h1 className="posts__title">Favorites posts</h1>
          {favLoading && <Loader />}
          {favError && !favLoading && (
            <p className="posts__not-found">
              Oops...something went wrong. Please try again.
            </p>
          )}
          {!favotitesPosts.length && !favError && !favLoading && (
            <p className="posts__not-found">
              Your favorites is empty.
              Take a look at our board to find someting you may like.
            </p>
          )}
          {!favLoading && !favError && !!favotitesPosts.length && (
            <>
              <h5 className="posts__count">{`${favotitesPosts.length} posts`}</h5>

              <div className="posts__sorting">
                <Sorting
                  options={sortOptions}
                  currentOption={currentSort.label}
                  param="sort"
                />

                <Sorting
                  options={itemsPerPageOptions}
                  currentOption={currentPerPage.label}
                  param="perPage"
                />

                <div className="posts__dropdown">
                  <Dropdown
                    currentOption={currentLocation}
                    options={locationOptions}
                    label="Sort by location"
                    param="location"
                  />
                </div>
              </div>

              {!visibleItems.length && (
                <p className="posts__no-results">No search results...</p>
              )}

              <div className="posts__list">
                {visibleItems.map(post => (
                  <PostCard post={post} key={post.id} />
                ))}
              </div>

              {visiblePagination && (
                <div className="posts__pagination">
                  <Pagination
                    total={filteredPosts.length}
                    perPage={+itemsOnPage}
                    currentPage={+currentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
