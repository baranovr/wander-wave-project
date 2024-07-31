import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom';
import './Header.scss';
import { Logo } from '../Logo';
import classNames from 'classnames';
import { useCallback, useState } from 'react';
import { debounce } from '../../helpers/debounce';
import { getSearchWith } from '../../helpers/getSearchWith';
import { Notifications } from '../Notifications';

export const Header = () => {
  const location = useLocation();
  const [searchParams, setSerchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    classNames('header__link', { 'header__link--is-active': isActive });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const applieHash = useCallback(debounce(setSerchParams, 1000), [
    setSerchParams,
  ]);

  const hasdleQueryChange = (value: string) => {
    const newSearchParams = getSearchWith(
      { query: value || null, page: 1 },
      searchParams,
    );

    setQuery(value);
    applieHash(newSearchParams);
  };

  return (
    <header className="header">
      <div className="header__content">
        <div className="header__left-side">
          <Link to="/" className="header__logo">
            <Logo />
          </Link>
          <nav className="header__nav">
            <NavLink to="/" className={getLinkClass}>
              Home
            </NavLink>
            <NavLink to="/posts" className={getLinkClass}>
              Board
            </NavLink>
            <NavLink to="/favorites" className={getLinkClass}>
              Favorites
            </NavLink>
          </nav>
        </div>

        <div className="header__right-side">
          {(location.pathname === '/posts' ||
            location.pathname === '/favorites') && (
            <label htmlFor="search" className="header__label">
              <input
                value={query}
                type="text"
                className="header__input"
                aria-label="search"
                placeholder="Search..."
                onChange={ev => hasdleQueryChange(ev.target.value)}
              />
              {!query ? (
                <button
                  type="button"
                  aria-label="search"
                  className="header__icon header__icon--search"
                />
              ) : (
                <button
                  type="button"
                  aria-label="close"
                  className="header__icon header__icon--close"
                  onClick={() => hasdleQueryChange('')}
                />
              )}
            </label>
          )}
          <Notifications />
          <Link to="/login">
            <span className="header__login" />
          </Link>
          <Link to="/newpost" className="header__button button">
            <span className="button__text">Create post</span>
            <span className="button__icon button__icon--right" />
          </Link>
        </div>
      </div>
    </header>
  );
};
