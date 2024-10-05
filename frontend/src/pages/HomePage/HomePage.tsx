import {Categories} from '../../components/Categories';
import {TextGradient} from '../../components/TextGradient';
import {Waves} from '../../components/Waves';

import './HomePage.scss';

export const HomePage = () => {
  return (
    <div className="home">
      <div className="home__content">
        <div className="home__banner">
          <div className="container">
            <h1 className="home__title">Wander Wave</h1>
          </div>
        </div>
        <section className="home__about">
          <div className="container">
            <div className="home__about-content">
              <h2 className="home__title--h2">About us</h2>
              <article className="home__article">
                <p className="home__paragraph">
                  Welcome to our travel community website, where you can share
                  and discover real travel experiences. Whether you're looking
                  for fascinating locations, exciting places, active leisure
                  activities, tourism tips, or cultural landmarks, you've come
                  to the right place.
                </p>
                <p className="home__paragraph">
                  Join thousands of users who have already shared their
                  adventures and insights through countless posts. Our platform
                  is designed for travelers by travelers, providing a space to
                  connect, inspire, and explore the world together. Dive into
                  our community and start your next adventure today!
                </p>
              </article>
            </div>
          </div>
          <Waves />
        </section>
        <section className="home__counter">
          <span className="home__counter-text">Explore our community with</span>
          <span className="home__counter-text">
            over <TextGradient countTo={276} /> users and
            <TextGradient countTo={149} /> posts to date.
          </span>
        </section>
        <section className="home__categories">
          <div className="container">
            <Categories />
          </div>
        </section>
      </div>
    </div>
  );
};
