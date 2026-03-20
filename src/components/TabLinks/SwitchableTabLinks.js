import React from 'react';
import * as classnames from 'classnames';
import {translate} from '../../locales/locales';
import './index.scss';

const TabLinks = ({links = [], activeLink, ...rest}) => (
  <div className="tab-links" {...rest}>
    {links.map(link => (
      <button
        key={link.key}
        onClick={link.onClick}
        className={classnames("tab-links__item", !!link.count && "counter", activeLink === link.key && 'active')}
      >
        <span className="f-16 f-600" data-count={link.count}>
          {translate(link.label, link.translation)}
        </span>
      </button>
    ))}
  </div>
);

export default TabLinks;