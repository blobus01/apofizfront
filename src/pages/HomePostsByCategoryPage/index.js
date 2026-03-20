import React from 'react';
import HomePostsByCategory from '../../containers/HomePostsByCategory';
import withScroll from '../../hoc/withScroll';

const HomePostsByCategoryPage = props => <HomePostsByCategory {...props} />;

export default withScroll(HomePostsByCategoryPage);