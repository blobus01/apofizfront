import {METADATA} from '../../common/metadata';
import {
  DEACTIVATE_TOKEN,
  GET_ACTIVE_DEVICES,
  GET_AUTH_HISTORY,
  GET_PHONE_NUMBERS,
  GET_SOCIALS
} from '../actions/actionTypes';

const initialState = {
  myProfile: {...METADATA.default, data: null},
  phoneNumbers: {...METADATA.default, data: null},
  socialNetworks: {...METADATA.default, data: null},
  devices: {...METADATA.default, data: null, error: null},
  authHistory: {...METADATA.default, data: null, error: null},
};

const profileReducer = (state = initialState, action) => {
  const devicesData = state.devices.data

  switch (action.type) {
    case GET_PHONE_NUMBERS.REQUEST:
      return {...state, phoneNumbers: {...state.phoneNumbers, ...METADATA.request}};
    case GET_PHONE_NUMBERS.SUCCESS:
      return {...state, phoneNumbers: {...state.phoneNumbers, ...METADATA.success, data: action.phones}};
    case GET_PHONE_NUMBERS.FAILURE:
      return {...state, phoneNumbers: {...state.phoneNumbers, ...METADATA.error}};

    case GET_SOCIALS.REQUEST:
      return {...state, socialNetworks: {...state.socialNetworks, ...METADATA.request}};
    case GET_SOCIALS.SUCCESS:
      return {...state, socialNetworks: {...state.socialNetworks, ...METADATA.success, data: action.socials}};
    case GET_SOCIALS.FAILURE:
      return {...state, socialNetworks: {...state.socialNetworks, ...METADATA.error}};

    case GET_ACTIVE_DEVICES.REQUEST:
      return {...state, devices: {...state.devices, ...METADATA.request}};
    case GET_ACTIVE_DEVICES.SUCCESS:
      return {...state, devices: {...state.devices, ...METADATA.success, data: action.payload}};
    case GET_ACTIVE_DEVICES.FAILURE:
      return {...state, devices: {...state.devices, ...METADATA.error, error: action.error}};

    case GET_AUTH_HISTORY.REQUEST:
      return {...state, authHistory: {...state.authHistory, ...METADATA.request}};
    case GET_AUTH_HISTORY.SUCCESS:
      return {...state, authHistory: {...state.authHistory, ...METADATA.success, data: action.payload}};
    case GET_AUTH_HISTORY.FAILURE:
      return {...state, authHistory: {...state.authHistory, ...METADATA.error, error: action.error}};

    case DEACTIVATE_TOKEN.SUCCESS:
      return {
        ...state,
        devices: {
          ...state.devices,
          data: {
            ...devicesData, list: devicesData?.list.filter(d => d.id !== action.payload)
          }
        }
      };

    default:
      return state;
  }
};

export default profileReducer;
