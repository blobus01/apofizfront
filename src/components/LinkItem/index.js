import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { TrashIcon } from '../UI/Icons';
import { animated } from 'react-spring';

import './index.scss';

const LinkItem = ({ link: linkItem, onDelete, className, style }) => {
  return (
    <animated.div className={classNames('link-item', className)} style={style}>
      <div className="link-item__content">
        <img src={linkItem.images[0].small} alt={linkItem.name} className="link-item__image" loading="lazy" />
        <a className="link-item__link tl f-17" href={linkItem.link} target="_blank" rel="noreferrer">
          {linkItem.link}
        </a>
      </div>
      <TrashIcon onClick={() => onDelete(linkItem.id)} />
    </animated.div>
  );
};

LinkItem.propTypes = {
  link: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        file: PropTypes.string,
        name: PropTypes.string,
        large: PropTypes.string,
        medium: PropTypes.string,
        small: PropTypes.string,
      })
    ),
    link: PropTypes.string,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default LinkItem;
