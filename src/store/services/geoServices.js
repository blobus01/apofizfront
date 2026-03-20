import nominatimApi from "../../nominatim-api";
import Pathes from "../../common/pathes";
import {getMessage} from "../../common/helpers";
import axios from "axios";

export const getLocationByCoords = async (lat, lon, params={}) => {
  const response = await nominatimApi.get(Pathes.Nominatim.reverse, {
    params: {
      lat,
      lon,
      // TODO: write base parameters in the nominatimApi
      format: 'json',
      ...params,
    }
  })

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getGeoObjects = async (params={}) => {
  const response = await nominatimApi.get(Pathes.Nominatim.search, {
    params: {
      format: 'json',
      ...params,
    }
  })

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getCountryByCountryCode = async countryCode => {
  const response = await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`, {timeout: 350})

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}