import axios from "../../axios-api";
import originAxios from "axios";
import Pathes from "../../common/pathes";
import Notify from "../../components/Notification";
import { translate } from "../../locales/locales";
import { DEFAULT_LANGUAGE } from "../../common/constants";
import { getMessage } from "../../common/helpers";
import { getQuery } from "../../common/utils";

export const getTranslationDictionary = (locale = DEFAULT_LANGUAGE) => {
  return originAxios.get(Pathes.Common.dictionary(locale));
};

export const uploadWatermarkedImage = (fileObj, id) => {
  let file;
  if (fileObj instanceof FormData) {
    file = fileObj;
  } else {
    file = new FormData();
    file.append("file", fileObj);
  }

  return axios
    .post(Pathes.File.watermarkedUpload, file)
    .then((response) => {
      if (response && response.status === 201) {
        return { data: { ...response.data, tempID: id }, success: true };
      }
      throw new Error(response && response.message);
    })
    .catch((e) => {
      Notify.info({
        text: translate(
          "Не удалось загрузить изображение",
          "notify.imageUploadError"
        ),
      });
      return { success: false, error: e.message };
    });
};

export const uploadImageFromURL = (url, isWatermarked, id) => {
  return axios
    .post(Pathes.File.imageURL, {
      image_url: url,
      is_watermarked: isWatermarked,
    })
    .then((res) => {
      const { status, data } = res;
      if (status === 201) {
        return { data: { ...data, tempID: id }, success: true };
      }
      throw new Error("Could not upload image");
    })
    .catch((e) => {
      Notify.info({
        text: translate(
          "Не удалось загрузить изображение",
          "notify.imageUploadError"
        ),
      });
      return { success: false, error: e.message };
    });
};

export const uploadVideoFromUrl = async (video) => {
  const response = await axios.post(Pathes.File.videoURL, video);

  const { data, status } = response;
  const message = getMessage(data);

  if (status === 201) {
    return { data, success: true };
  }

  Notify.info({
    text: translate("Не удалось загрузить видео", "notify.videoUploadError"),
  });
  return { success: false, error: message };
};

export const getYoutubeVideoDetail = (videoID) => {
  // const proxyURL = 'https://cors-anywhere.herokuapp.com/';
  return axios.get(Pathes.Common.youtubeLinkDetail(videoID)).then((res) => {
    if (res && res.status === 200) {
      return { data: res.data, success: true };
    }
  });
};

// Translate shop item
export const translateShopItem = async (title, description, code = null) => {
  const response = await axios.post(Pathes.Shop.postTranslate(code), {
    title,
    description,
  });

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const getLanguagesList = async () => {
  const response = await axios.get(Pathes.Common.languages);

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const getCurrencyConversionResult = async (from, to, amount) => {
  const response = await axios.get(
    Pathes.Common.currencyConversion(from, to, amount)
  );

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  if (status === 401) {
    throw new Error(
      "Чтобы бы можно было пользоваться конвертацией, нужно залогиниться"
    );
  }

  throw new Error(message);
};

export const getServiceCategoriesList = async (serviceID, params) => {
  const response = await axios.get(
    Pathes.Services.serviceCategories(serviceID) + getQuery(params)
  );

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const getCommentedItems = async (params) => {
  const response = await axios.get(
    Pathes.Comments.commentedItem + getQuery(params)
  );

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const searchSuggestItems = async (params) => {
  const response = await axios.get(
    Pathes.Home.searchSuggest + getQuery(params)
  );

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const getUserEmail = async (phoneNumber) => {
  const response = await axios.post(Pathes.Auth.getUserEmailByNumber, {
    phone_number: phoneNumber,
  });

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const getImageByURL = async (url) => {
  const response = await axios.get(
    Pathes.Common.imageToBase64 +
      getQuery({
        image_url: url,
      })
  );

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

/**
 * @param {Object} params
 * @param {string} params.file_url
 */
export const getFile = async (params) => {
  const response = await axios.get(
    Pathes.Common.fileToBase64 + getQuery(params)
  );

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const getCountriesAndCities = async (params) => {
  const { page, limit } = params;

  const response = await axios.get(
    Pathes.Common.citiesAndCountries +
      getQuery(
        {
          ...params,
          offset: page === 1 ? null : parseInt(limit * page),
          limit: page === 1 ? null : limit,
        },
        ["page"]
      )
  );

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    const regions = [];
    Object.keys(data.results).forEach((regionType) => {
      data.results[regionType].forEach((region) =>
        regions.push({
          id: region.id ?? region.code,
          ...region,
        })
      );
    });
    return {
      data: {
        total_count: data.overall_total,
        total_pages: Math.floor(data.overall_total / limit),
        list: regions,
      },
      success: true,
      message,
    };
  }

  throw new Error(message);
};
