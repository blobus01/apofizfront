import React, {useEffect} from 'react';
import HomePostsModule from '../../containers/HomePostsModule';
import withScroll from '../../hoc/withScroll';
import useDialog from '../../components/UI/Dialog/useDialog';
import {translate} from '../../locales/locales';

const HomePostsPage = props => {
  const {alert} = useDialog();

  useEffect( () => {
    // Show alert on login if user has to fill profile
    const showAlert = !!Number(localStorage.getItem('has_empty_fields'));
    showAlert && alert({
      title: translate("Добро пожаловать !", "dialog.welcome"),
      description: translate("Заполните важные данные в Вашем профиле, для вашего удобства и безопасности.", "dialog.fillProfile"),
    });
    localStorage.setItem('has_empty_fields', '0');
  }, [alert])

  return (
    <HomePostsModule {...props} />
  )
};

export default withScroll(HomePostsPage);