import React, { Component } from 'react';

const withScroll = WrappedComponent => class ScrollTopOnMount extends Component {
  componentDidMount () {
    const main = document.querySelector('main');
    main && main.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }

  render () {
    return <WrappedComponent {...this.props} />;
  }
};

export default withScroll;