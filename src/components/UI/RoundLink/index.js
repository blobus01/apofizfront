import * as React from 'react';
import * as classnames from 'classnames';
import {Link} from 'react-router-dom';
import './index.scss';

const RoundLink = ({ label, to, className, noBackground }) => (
  <Link
    to={to}
    className={classnames(
      "round-link",
      noBackground && "round-link__no-background",
      !noBackground && "round-link__with-background",
      className
    )}
  >
    <span className="round-link__label">{label}</span>
  </Link>
)

export default RoundLink;