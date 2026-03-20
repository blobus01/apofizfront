import axios from '../../axios-api';
import Pathes from '../../common/pathes';
import {getMessage} from '../../common/helpers';

export const updateNotificationSettings = settings => {
  return axios.post(Pathes.Notifications.settings, settings).then(
    res => {
      const {status, data} = res;
      const message = getMessage(data);
      if (status === 200) {
        return {data, success: true, message};
      }
      throw new Error(message)
    }).catch(e => ({error: e.message}));
}

export const getNotificationSettings = () => {
  return axios.get(Pathes.Notifications.settings).then(
    res => {
      const {status, data} = res;
      const message = getMessage(data);
      if (status === 200) {
        return {data, success: true, message};
      }
      throw new Error(message)
    }).catch(e => ({error: e.message}));
}