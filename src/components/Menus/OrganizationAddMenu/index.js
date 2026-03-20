import React from "react";
import RowButton, { ROW_BUTTON_TYPES } from "../../UI/RowButton";
import { translate } from "@locales/locales";
import { CalendarIcon, CreateWithAI, GoodsIcon, TicketIcon } from "@ui/Icons";
import "./index.scss";
import { useSelector } from "react-redux";
import { AddProductOnline } from "./icons";

const OrganizationAddMenu = ({ orgID }) => {
  const tariffStatus = useSelector((state) => state.tariffStatus);

  return (
    <div className="org-add-menu container">
      {tariffStatus?.tariff?.tariff_type && (
        <RowButton
          className="org-add-menu__btn"
          type={ROW_BUTTON_TYPES.link}
          to={{
            pathname: `/organizations/${orgID}/posts/create/AIphoto`,
            state: { from: `/organizations/${orgID}/posts/create/` },
          }}
          showArrow={false}
          label={translate("Добавить с Ai", "dialog.addPhotoWithAi")}
        >
          <CreateWithAI />
        </RowButton>
      )}
      <RowButton
        className="org-add-menu__btn"
        to={`/organizations/${orgID}/posts/createOnline`}
        showArrow={false}
        type={ROW_BUTTON_TYPES.link}
        label={translate("Добавить онлайн товар", "dialog.addProductOnline")}
      >
        <AddProductOnline />
      </RowButton>
      <RowButton
        className="org-add-menu__btn"
        to={`/organizations/${orgID}/posts/create`}
        showArrow={false}
        type={ROW_BUTTON_TYPES.link}
        label={translate(
          "Добавить товар или новость",
          "dialog.addProductOrNews",
        )}
      >
        <GoodsIcon />
      </RowButton>
      <RowButton
        className="org-add-menu__btn"
        to={`/organizations/${orgID}/rent/create`}
        showArrow={false}
        type={ROW_BUTTON_TYPES.link}
        label={translate("Добавить аренду", "rent.add")}
      >
        <CalendarIcon />
      </RowButton>
      <RowButton
        className="org-add-menu__btn"
        to={`/organizations/${orgID}/events/create`}
        showArrow={false}
        type={ROW_BUTTON_TYPES.link}
        label={translate("Добавить мероприятие", "events.add")}
      >
        <TicketIcon />
      </RowButton>
      {/*<RowButton*/}
      {/*  className="org-add-menu__btn"*/}
      {/*  to={`/resumes/create?org=${orgID}`}*/}
      {/*  showArrow={false}*/}
      {/*  type={ROW_BUTTON_TYPES.link}*/}
      {/*  label={translate('Добавить вакансию', 'resumes.add')}*/}
      {/*>*/}
      {/*  <ResumeAddIcon />*/}
      {/*</RowButton>*/}
    </div>
  );
};

export default OrganizationAddMenu;
