import axios from "../../axios-api";
import Notify from "../../components/Notification";
import { translate } from "../../locales/locales";

export const toggleApplication = async (applicationId) => {
  try {
    const response = await axios.post(`/applications/${applicationId}/toggle/`);
    if (response.data.message === "Successfully added") {
      Notify.success({
        text: translate("Приложение успешно добавлено", "apps.addSuccess"),
      });
    } else if (response.data.message === "Successfully deleted") {
      Notify.success({
        text: translate("Приложение успешно удалено", "apps.removeSuccess"),
      });
    }
    return response.data;
  } catch (error) {
    if (
      error.response?.status === 400 &&
      error.response?.data?.detail === "You cannot add your own app."
    ) {
      Notify.error({
        text: translate(
          "Вы не можете добавить свое собственное приложение",
          "apps.cannotAddOwnApp"
        ),
      });
    } else {
      Notify.error({
        text: translate(
          "Произошла ошибка при выполнении операции",
          "apps.toggleError"
        ),
      });
    }
    throw error;
  }
};

export const toggleApplicationVisibility = async (appId, isHidden) => {
  try {
    const response = await axios.post("/applications/toggle-visibility/", {
      app: appId,
      is_hidden: isHidden,
    });

    if (response.status === 200) {
      Notify.success({
        text: translate(
          isHidden
            ? "Приложение успешно скрыто"
            : "Приложение успешно показано",
          isHidden ? "apps.hideSuccess" : "apps.showSuccess"
        ),
      });
      return { success: true, data: response.data };
    }
    throw new Error(response.data.message || "Failed to update visibility");
  } catch (error) {
    Notify.error({
      text: translate(
        "Произошла ошибка при обновлении видимости приложения",
        "apps.visibilityError"
      ),
    });
    return { success: false, error: error.message };
  }
};
