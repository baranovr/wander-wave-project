import { Link, useLocation } from 'react-router-dom';
import './Footer.scss';
import { Logo } from '../Logo';

export const Footer = () => {
  const location = useLocation();

  const backToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="footer">
      <div className="footer__content">
        <Link to="/" className="header__logo">
          <Logo />
        </Link>

        <nav className="header__nav">
          <Link to="/" className="footer__link">
            Contacts
          </Link>
          <Link to="/" className="footer__link">
            GitHub
          </Link>
          <Link to="/" className="footer__link">
            Support
          </Link>
        </nav>

        <Link
          className="footer__button button"
          to={{ pathname: location.pathname }}
          onClick={backToTop}
        >
          <span className="button__text">Back to top</span>
          <span className="button__icon button__icon--up" />
        </Link>
      </div>
    </footer>
  );
};
