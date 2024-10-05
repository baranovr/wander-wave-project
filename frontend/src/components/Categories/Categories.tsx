import {Link} from 'react-router-dom';
import './Categories.scss';

export const Categories = () => {
  return (
    <div className="categories">
      <h2 className="categories__title">
        Categories
      </h2>
      <div className="categories__content"></div>
      <Link to="/posts" className="categories__category">
        <img
          className="categories__image categories__image--position-right"
          src="img/pexels-andreimike-1271619.jpg"
          alt="mountain"
        />
        <div className="categories__details">
          <span className="categories__name categories__text">
            Mountain Retreats
          </span>
          <span className="categories__info categories__text">
            Escape to the heights to the best mountain villages, ski resorts,
            and hiking trails.
          </span>
        </div>
      </Link>
      <Link to="/posts" className="categories__category">
        <img
          className="categories__image"
          src="img/pexels-andre-furtado-43594-2916819.jpg"
          alt="water"
        />
        <div className="categories__details">
          <span className="categories__name categories__text">
            Water Wonders
          </span>
          <span className="categories__info categories__text">
            Discover breathtaking beaches, serene lakes, and thrilling water
            sports locations for your next aquatic adventure.
          </span>
        </div>
      </Link>
      <Link to="/posts" className="categories__category">
        <img
          className="categories__image"
          src="img/pexels-jesus-esteban-san-jose-11194232-23489703.jpg"
          alt="sky"
        />
        <div className="categories__details">
          <span className="categories__name categories__text">
            Sky High Adventures
          </span>
          <span className="categories__info categories__text">
            Soar to new heights with experiences like hot air balloon rides,
            paragliding, and scenic viewpoints.
          </span>
        </div>
      </Link>
      <Link to="/posts" className="categories__category">
        <img
          className="categories__image"
          src="img/pexels-spencer-4356144.jpg"
          alt="cultural wonders"
        />
        <div className="categories__details">
          <span className="categories__name categories__text">
            Cultural Wonders
          </span>
          <span className="categories__info categories__text">
            Immerse yourself in history and heritage by visiting museums,
            historical sites, and cultural festivals.
          </span>
        </div>
      </Link>
      <Link to="/posts" className="categories__category">
        <img
          className="categories__image"
          src="img/pexels-lizzie-prokhorova-491137305-16443021.jpg"
          alt="culinary"
        />
        <div className="categories__details">
          <span className="categories__name categories__text">
            Culinary Journeys
          </span>
          <span className="categories__info categories__text">
            Savor the flavors of the world through our recommendations for local
            cuisines, food markets, and culinary tours.
          </span>
        </div>
      </Link>
      <Link to="/posts" className="categories__category">
        <img
          className="categories__image"
          src="img/pexels-zvolskiy-2253640.jpg"
          alt=""
        />
        <div className="categories__details">
          <span className="categories__name categories__text">
            City Explorations
          </span>
          <span className="categories__info categories__text">
            Navigate the urban jungle with our insights into bustling nightlife,
            iconic landmarks, and vibrant neighborhoods.
          </span>
        </div>
      </Link>
    </div>
  );
};
