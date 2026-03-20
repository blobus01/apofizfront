import React from 'react';
import classNames from 'classnames';

import './index.scss';

const Skeleton = ({ className, ...rest }) => {
  return <div style={rest} className={classNames('skeleton', className)} />;
};

export default Skeleton;
