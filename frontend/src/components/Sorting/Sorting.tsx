import classNames from 'classnames';
import {Option} from '../../types/Options';
import './Sorting.scss';
import {getSearchWith} from '../../helpers/getSearchWith';
import {useSearchParams} from 'react-router-dom';

type Props = {
  options: Option[];
  currentOption: string;
  param: string;
};

export const Sorting: React.FC<Props> = ({ options, currentOption, param }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleOptionChange = (option: Option) => {
    const newSearchParams = getSearchWith(
      { [param]: option.value, page: 1 },
      searchParams,
    );

    setSearchParams(newSearchParams);
  };

  return (
    <div className="sort">
      <div className="sort__content">
        {options.map(option => (
          <button
            type="button"
            key={option.value}
            className={classNames('sort__button', {
              'sort__button--is-active': currentOption === option.label,
            })}
            onClick={() => handleOptionChange(option)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
