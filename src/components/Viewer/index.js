import React, { useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const Viewer = ({ defaultKey, selectedView, children: views, viewProps, className }) => {
  const [currentView, setCurrentView] = useState({
    key: defaultKey,
    options: {
      props: {},
    },
  });

  useEffect(() => {
    if (selectedView) {
      setCurrentView({
        key: selectedView,
        options: {
          props: {},
        },
      });
    }
  }, [selectedView]);

  const open = (
    key,
    options = {
      props: {},
    }
  ) => {
    setCurrentView({ key, options });
  };

  const renderView = useMemo(() => {
    return React.Children.map(views, view => {
      const { component: ViewComponent, onBack, onForward } = view.props;
      return (
        view.props.viewKey === currentView.key && (
          <ViewComponent
            {...viewProps}
            open={open}
            onBack={onBack ? (...args) => onBack(open, args) : undefined}
            onForward={onForward ? () => onForward(open) : undefined}
            {...currentView.options.props}
            {...view.props.props}
          />
        )
      );
    });
  }, [views, currentView, viewProps]);

  return <div className={className}>{renderView}</div>;
};

Viewer.propTypes = {
  defaultViewKey: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  children: PropTypes.node,
  viewProps: PropTypes.object,
  className: PropTypes.string,
};

export default React.memo(Viewer);
