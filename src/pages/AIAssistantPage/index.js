import React, { useEffect } from "react";
import AIAssistantForm from "@components/Forms/AIAssistantForm";
import { notifyQueryResult } from "@common/helpers";
import {
  createAiAssistant,
  toggleAssistant as toggleAssistantService,
  updateAiAssistant,
} from "@store/services/aiServices";
import { uploadFile } from "@store/actions/commonActions";
import useSearchParam from "@hooks/useSearchParam";
import Preloader from "@components/Preloader";
import { useOrganizationDetail } from "@hooks/queries/useOrganizationDetail";
import { translate } from "@locales/locales";
import RowButton, { ROW_BUTTON_TYPES } from "@ui/RowButton";
import InfoIcon from "@ui/Icons/InfoIcon";
import AIWithBadgeIcon from "@ui/Icons/AIWithBadgeIcon";
import classes from "./index.module.scss";
import {
  AiIcons,
  ConnectAiIcon,
  SettingsAiIcon,
  TelegramAiIcon,
  WhatsAppAiIcon,
} from "./icons";

const AIAssistantPage = ({ history, match }) => {
  const { id } = match.params;

  const [mode] = useSearchParam("mode");
  const isEditMode = mode === "edit";

  const {
    data: orgDetail,
    set: setOrg,
    loading,
  } = useOrganizationDetail(isEditMode ? id : null);

  const assistant = orgDetail?.assistant ?? {};

  useEffect(() => {
    const permissions = orgDetail?.permissions;

    if (!permissions) return;

    const hasAccess =
      permissions.is_owner ||
      permissions.can_edit_organization ||
      permissions.can_sale ||
      permissions.can_see_stats;

    if (!hasAccess) {
      history.replace(`/organizations/${id}`);
    }
  }, [orgDetail, history, id]);

  const handleSubmit = async (values) => {
    let uploadedImage = null;
    if (values.avatar instanceof File) {
      uploadedImage = await uploadFile(values.avatar)();
    }

    if (isEditMode) {
      const res = await notifyQueryResult(
        updateAiAssistant(assistant.id, {
          name: values.name,
          gender: values.gender,
          position: values.position,
          image_id: uploadedImage?.success ? uploadedImage?.id : undefined,
        }),
      );
      if (res?.success) {
        history.goBack();
      }
    } else {
      const res = await notifyQueryResult(
        createAiAssistant({
          organization: Number(id),
          name: values.name,
          gender: values.gender,
          position: values.position,
          image: uploadedImage?.success ? uploadedImage?.id : null,
        }),
      );
      if (res?.success) {
        history.replace(`/organizations/${id}/assistant/${res.data.id}`);
      }
    }
  };

  const toggleAssistant = async (is_enabled) => {
    setOrg((prevState) => ({
      ...prevState,
      assistant: {
        ...prevState.assistant,
        is_enabled: is_enabled,
      },
    }));
    return await notifyQueryResult(
      toggleAssistantService({
        assistant: assistant.id,
        is_enabled,
      }),
    );
  };

  if (loading) return <Preloader />;

  return (
    <AIAssistantForm
      onBack={() => history.goBack()}
      className={classes.root}
      onSubmit={handleSubmit}
      submitLabel={
        isEditMode
          ? translate("Сохранить", "app.save")
          : translate("Далее", "app.next")
      }
      initialValues={{
        name: assistant.name,
        position: assistant.position,
        gender: assistant.gender,
        avatar: assistant.image?.small,
      }}
    >
      {isEditMode && (
        <>
          <div className={classes.buttons}>
            <RowButton
              type={ROW_BUTTON_TYPES.link}
              label={translate(
                "Обучение AI Ассистента",
                "org.aiAssistant.learning",
              )}
              to={`/organizations/${id}/assistant/${assistant.id}?`}
              className={"f-17"}
            >
              <InfoIcon />
            </RowButton>

            <RowButton
              type={ROW_BUTTON_TYPES.link}
              label={translate("Сменить тариф", "shop.changeTariff")}
              to={`/organizations/${id}/assistant/${assistant.id}/tariffs/`}
              className={"f-17"}
            >
              <SettingsAiIcon />
            </RowButton>

            <RowButton
              type={ROW_BUTTON_TYPES.link}
              label={translate("Telegram Ai настройки", "shop.telegramAi")}
              to={`/organizations/${id}/assistant/${assistant.id}/telegramAi/`}
              className={"f-17"}
            >
              <TelegramAiIcon />
            </RowButton>

            <RowButton
              type={ROW_BUTTON_TYPES.link}
              label={translate("WhatsApp Ai настройки", "shop.whatsAppAi")}
              to={`/organizations/${id}/assistant/${assistant.id}/whatsAppAi/`}
              className={"f-17"}
            >
              <WhatsAppAiIcon />
            </RowButton>

            <RowButton
              type={ROW_BUTTON_TYPES.link}
              label={translate(
                "Подключение сторонних API",
                "shop.connectAnotherAi",
              )}
              to={`/organizations/${id}/connectApi`}
              className={"f-17"}
            >
              <ConnectAiIcon />
            </RowButton>

            <RowButton
              type={ROW_BUTTON_TYPES.link}
              label={translate("Договор и история платежей", "app.history")}
              to={`/organizations/${id}/historypayment`}
              className={"f-17"}
            >
              <AiIcons />
            </RowButton>
            {assistant.is_enabled ? (
              <RowButton
                label={translate(
                  "Выключить AI Ассистента ",
                  "org.aiAssistant.turnOff",
                )}
                showArrow={false}
                onClick={() => toggleAssistant(false)}
                className={"f-17"}
              >
                <AIWithBadgeIcon />
              </RowButton>
            ) : (
              <RowButton
                label={translate(
                  "Включить AI Ассистента",
                  "org.aiAssistant.turnOn",
                )}
                showArrow={false}
                onClick={() => toggleAssistant(true)}
                className={"f-17"}
              >
                <AIWithBadgeIcon badgeColor="#34A853" />
              </RowButton>
            )}
          </div>
        </>
      )}
    </AIAssistantForm>
  );
};

export default AIAssistantPage;
