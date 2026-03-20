import * as React from 'react'
import ProfileModule from '../../containers/ProfileModule';
import withScroll from '../../hoc/withScroll';

const ProfilePage = props => <ProfileModule {...props} />

export default withScroll(ProfilePage)