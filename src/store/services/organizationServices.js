import axios from "../../axios-api";
import Pathes from "../../common/pathes";
import { getMessage } from "@common/helpers";
import { getQuery } from "@common/utils";
import Notify from "../../components/Notification";

export const getOrganizationDetail = (id) => {
  return axios
    .get(Pathes.Organization.get(id))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        return { data, success: true, message };
      }
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message, success: false }));
};

export const getOrgPostsList = (params) => {
  return axios
    .get(Pathes.Shop.orgFeed + getQuery(params))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        return {
          data,
          success: true,
          message,
          hasMore: !!res.data.list.length,
        };
      }
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message }));
};

export const getOrgSubcategories = (orgID) => {
  return axios
    .get(Pathes.Shop.orgSubcategories(orgID))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        return { data, success: true };
      }
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message }));
};

// Get Organization Instagram Integration Link
export const getOrgInstagramLink = (orgID) => {
  return axios
    .get(Pathes.Organization.instagramLink(orgID))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        return { data, success: true };
      }
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message }));
};

// Add Organization Instagram Integration Link
export const addOrgInstagramLink = (orgID, url) => {
  return axios
    .post(Pathes.Organization.instagramLink(orgID), { url })
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 201) {
        Notify.success({ text: "Ссылка Instagram добавлена" });
        return { data, success: true };
      }
      if (status === 406) {
        Notify.info({ text: "Неверная ссылка Instagram" });
      }
      if (message === "Login device is invalid") {
        void addOrgInstagramLink(orgID, url);
      }
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message }));
};

// Parse last Instagram Posts
export const updateOrgInstagram = (orgID) => {
  return axios
    .post(Pathes.Organization.instagramUpdate(orgID))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        Notify.success({ text: "Лента Instagram обновляется..." });
        return { data, success: true };
      }
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message }));
};

// Deactivate organization
export const deactivateOrganization = (orgID) => {
  return axios
    .post(Pathes.Organization.deactivate(orgID))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        Notify.success({ text: "Организация успешно деактивирована" });
        return { data, success: true };
      }

      Notify.error({ text: "Не удалось деактивировать организацию" });
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message }));
};

// Activate organization
export const activateOrganization = (orgID) => {
  return axios
    .post(Pathes.Organization.reactivate(orgID))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        Notify.success({ text: "Организация успешно активирована" });
        return { data, success: true };
      }

      Notify.error({ text: "Не удалось активировать организацию" });
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message }));
};

// Reset purchase ID
export const resetPurchaseID = (orgID) => {
  return axios
    .post(Pathes.Organization.resetPurchaseID(orgID))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        Notify.success({ text: "Очередь заказов успешно очищена" });
        return { data, success: true };
      }

      Notify.error({ text: "Не удалось очистить очередь заказов" });
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message }));
};

// DELETE Organization Instagram Integration Link
export const removeOrgInstagramLink = (orgID) => {
  return axios
    .delete(Pathes.Organization.instagramLink(orgID))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        Notify.success({ text: "Ссылка Instagram удалена" });
        return { data, success: true };
      }
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message }));
};

// Update organization delivery settings
export const updateOrgDeliverySettings = (orgID, payload) => {
  return axios
    .put(Pathes.Organization.deliverySettings(orgID), payload)
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        Notify.success({ text: "Настройки доставки успешно сохранены" });
        return { data, success: true };
      }
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message }));
};

// Create organization hotlink
export const createOrgHotlink = (payload) => {
  return axios
    .post(Pathes.Organization.hotlinks, payload)
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 201) {
        Notify.success({ text: "Ссылка успешно создана" });
        return { data, success: true };
      }
      Notify.error({ text: message });
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message }));
};

// Update organization hotlink
export const updateOrgHotlink = (hotlinkID, payload) => {
  return axios
    .put(Pathes.Organization.hotlinkDetail(hotlinkID), payload)
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        Notify.success({ text: "Ссылка успешно обновлена" });
        return { data, success: true };
      }
      Notify.error({ text: message });
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message, success: false }));
};

// Delete organization hotlink
export const deleteOrgHotlink = (hotlinkID) => {
  return axios
    .delete(Pathes.Organization.hotlinkDetail(hotlinkID))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 204) {
        Notify.success({ text: "Ссылка успешно удалена" });
        return { data, success: true };
      }
      Notify.error({ text: message });
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message, success: false }));
};

// Create organization cashback promo
export const createOrgPromotion = (payload) => {
  return axios
    .post(Pathes.Organization.promotions, payload)
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 201) {
        Notify.success({ text: "Промо успешно создана" });
        return { data, success: true };
      }
      Notify.error({ text: message });
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message }));
};

// Update organization hotlink
export const updateOrgPromotion = (orgID, payload) => {
  return axios
    .put(Pathes.Organization.promotion(orgID), payload)
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        Notify.success({ text: "Промо успешно обновлена" });
        return { data, success: true };
      }
      Notify.error({ text: message });
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message, success: false }));
};

// Delete organization promo
export const deleteOrgPromotion = (orgID) => {
  return axios
    .delete(Pathes.Organization.promotion(orgID))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 204) {
        Notify.success({ text: "Промо успешно удалена" });
        return { data, success: true };
      }
      Notify.error({ text: message });
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message, success: false }));
};

// Get promo stats
export const getPromoStats = (orgID) => {
  return axios
    .get(Pathes.Organization.promoStats(orgID))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        return { data, success: true, message };
      }
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message, success: false }));
};

// Subscribe to partners of a particular organization
export const subscribeToPartners = (orgID) => {
  return axios
    .post(Pathes.Subscriptions.subscribeToPartners, { organization: orgID })
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        return { data, success: true, message };
      }
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message, success: false }));
};

export const getOrgStatusDetail = async (orgID) => {
  const response = await axios.get(Pathes.Organization.shadowBanStatus(orgID));
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const requestFromShadowBan = async (orgID) => {
  const response = await axios.post(
    Pathes.Organization.requestFromShadowBan(orgID)
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const sendVerificationOrganization = async (orgID, payload) => {
  const response = await axios.post(
    Pathes.Organization.verificationOrganization(orgID),
    payload
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 201) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const acceptRequestFollower = async (orgID, userID) => {
  const response = await axios.put(Pathes.Organization.acceptFollower(), {
    organization: orgID,
    user: userID,
  });

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    Notify.success({
      text: "Вы приняли запрос на добавления в подписки данного пользователя",
    });
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const cancelRequestFollower = async (orgID, userID) => {
  const response = await axios.delete(Pathes.Organization.acceptFollower(), {
    data: {
      organization: orgID,
      user: userID,
    },
  });
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 204) {
    Notify.success({ text: "Данный пользователь больше не подписан на вас" });
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const acceptAllFollowers = async (orgID) => {
  const response = await axios.put(
    Pathes.Organization.acceptAllFollowers(orgID)
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const complainAboutOrganization = async (orgID, reason) => {
  const response = await axios.post(Pathes.Organization.complainAbout, {
    organization: orgID,
    reason,
  });
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 201) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const addToBlacklist = async (orgID) => {
  const response = await axios.post(Pathes.Organization.blacklist, {
    organization: orgID,
  });
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 201) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const removeFromBlacklist = async (orgID) => {
  const response = await axios.delete(
    Pathes.Organization.deleteFromBlacklist(orgID)
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const blockUser = async (userID, orgID) => {
  const response = await axios.post(Pathes.Organization.blockUser, {
    user: userID,
    organization: orgID,
  });
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 201) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const unblockUser = async (userID, orgID) => {
  const response = await axios.delete(
    Pathes.Organization.unblockUser(userID, orgID)
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const getOrganizationRentals = async (params) => {
  const response = await axios.get(
    Pathes.Shop.organizationRentals + getQuery(params)
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const getOrganizationFromGoogleMaps = async (googleMapsOrgLink) => {
  const response = await axios.post(Pathes.Organization.createFromGoogleMaps, {
    google_maps_url: googleMapsOrgLink,
  });
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const getOrganizationFrom2Gis = async (orgLink) => {
  const response = await axios.post(Pathes.Organization.createFrom2Gis, {
    two_gis_url: orgLink,
  });
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const getPaymentSystemsForOrganizations = async (queryParams) => {
  const response = await axios.get(
    Pathes.Organization.paymentSystems + getQuery(queryParams)
  );

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const getOrganizationPaymentSystems = async (orgID) => {
  const response = await axios.get(
    Pathes.Organization.connectedPaymentSystems(orgID)
  );

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const connectPaymentSystem = async (orgID, payload) => {
  const response = await axios.post(
    Pathes.Organization.paymentSystemConnection(orgID),
    payload
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 201) {
    return { data, success: true, message, status };
  }

  if (status === 406) {
    return { data, success: false, message, status };
  }

  throw new Error(message);
};

export const updatePaymentSystems = async (orgID, payload) => {
  const response = await axios.put(
    Pathes.Organization.paymentSystemsActivation(orgID),
    payload
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const getPaymentSystemsActivationInfo = async (orgID) => {
  const response = await axios.get(
    Pathes.Organization.paymentSystemsActivation(orgID)
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const togglePaymentSystem = async (orgID, paymentSystem, boolVal) => {
  const response = await axios.put(
    Pathes.Organization.paymentSystemsActivationDetail(orgID),
    {
      id: paymentSystem,
      is_active: boolVal,
    }
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const requestConfirmationForWholesale = async (orgID) => {
  const response = await axios.post(
    Pathes.Organization.wholesaleConfirmation(orgID)
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const getOrganizationsOnMap = async (params) => {
  const response = await axios.get(
    Pathes.Organization.organizationsOnMap + getQuery(params)
  );

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const getOrganizationTypesOnMap = async (params) => {
  const response = await axios.get(
    Pathes.Organization.typesOnMap + getQuery(params)
  );

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const getUserOrganizations = async (params) => {
  const response = await axios.get(Pathes.Organization.my + getQuery(params));

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const getOrgBlockedUsers = async (orgID, params) => {
  const response = await axios.get(
    Pathes.Organization.blockedUsers(orgID) + getQuery(params)
  );

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};
