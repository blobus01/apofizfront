import React from "react";
import { LockIcon, PromotionIcon } from "../../components/UI/Icons";
import { translate } from "../../locales/locales";
import ToggleButton from "../../components/UI/ToggleButton";
import { StandardButton } from "../../components/UI/Buttons";
import { subscribeOrganization } from "../../store/actions/subscriptionActions";
import { getOrganizationDetail } from "../../store/actions/organizationActions";
import { ButtonShopDiscounts } from "../../components/UI/ButtonShopDiscounts";
import { useDispatch } from "react-redux";
import useDialog from "../../components/UI/Dialog/useDialog";

const PrivateOrg = (props) => {
  const {
    promoCashBack,
    showDiscounts,
    toggleShowDiscounts,
    isSubscribed,
    currency,
    id,
  } = props;

  const { alert } = useDialog();
  const dispatch = useDispatch();

  return (
    <>
      <div className="organization-module__hidden-message">
        <h4 className="organization-module__hidden-message-title dfc justify-center f-14 f-500">
          <LockIcon />
          {translate("Это скрытая организация", "org.hiddenMessageTitle")}
        </h4>
        <p className="organization-module__hidden-message-desc f-13">
          {translate(
            "Подпишитесь, чтобы увидеть товары или посты. Ваш запрос на подписку будет рассмотрен организацией",
            "org.hiddenMessageDesc"
          )}
        </p>
      </div>
      {promoCashBack && (
        <button
          type="button"
          className="organization-module__promo f-14 f-500"
          onClick={() =>
            alert({
              title: translate(
                "Нажав кнопку подписаться вы получаете в подарок кэшбэк, которым вы сможете рассчитаться в данной организации",
                "promoCashback.subscribeInfo"
              ),
            })
          }
        >
          <PromotionIcon />
          <span>
            {translate(
              "Получи кэшбек {amount} за подписку",
              "promoCashback.subscribe",
              { amount: `${Number(promoCashBack)} ${currency}` }
            )}
          </span>
        </button>
      )}

      {/* <div className="organization-module__tools">
        <ToggleButton
          label={translate("Контакты и Web", "app.contactsAndWeb")}
          className="organization-module__contacts-btn"
        />

        <StandardButton
          label={isSubscribed === 'pending' ? translate("Запрошено", "subscriptions.requested") : translate("Подписаться", "subscriptions.toSubscribe")}
          className={isSubscribed === 'pending' ? "organization-module__pending-btn" : "organization-module__subscribe-btn"}
          onClick={async () => {
            if (isSubscribed !== 'pending') {
              const res = await dispatch(subscribeOrganization(id));
              res && res.success && dispatch(getOrganizationDetail(id));
            }
          }}
        />

        <ButtonShopDiscounts
          onChange={toggleShowDiscounts}
          active={showDiscounts}
          className="organization-module__switch-btn"
        />
      </div> */}
    </>
  );
};

export default PrivateOrg;
