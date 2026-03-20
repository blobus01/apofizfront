import React from 'react';

const TabPanel = ({value, index, children, ...other}) => {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && children}
    </div>
  );
};

export default TabPanel;