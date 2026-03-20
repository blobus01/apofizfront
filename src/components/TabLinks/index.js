import React from 'react';
import * as classnames from 'classnames';
import {NavLink} from 'react-router-dom';
import {translate} from '../../locales/locales';
import './index.scss';

const TabLinks = ({links = [], radius}) => (
  <div className="tab-links" style={{ borderRadius: radius ? '16px' : '0'  }}>
    {links.map((link, idx) => (
      <NavLink
        to={link.path}
        key={idx}
        route={link.label}
        className={classnames("tab-links__item", !!link.count && "counter")}
        activeClassName="active"
      >
        <span className="f-16 f-600" data-count={link.count < 1000 ? link.count : '999+'}>
          {translate(link.label, link.translation)}
        </span>
      </NavLink>
    ))}
  </div>
);

export default TabLinks;