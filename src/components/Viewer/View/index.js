import React from 'react';
import PropTypes from 'prop-types';

const View = () => {
  return <></>;
};

View.propTypes = {
  viewKey: PropTypes.oneOfType([PropTypes.string, PropTypes.string]).isRequired,
  onBack: PropTypes.func,
  props: PropTypes.object,
};

export default React.memo(View);
