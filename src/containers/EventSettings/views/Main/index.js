import React, { useCallback, useEffect, useState } from "react";
import { translate } from "../../../../locales/locales";
import { ERROR_MESSAGES } from "../../../../common/messages";
import { CategoryOption } from "../../../../components/CategoryOption";
import { TicketIcon } from "../../../../components/UI/Icons";
import { useDispatch, useSelector } from "react-redux";
import { getStockDetail } from "../../../../store/actions/stockActions";
import {
  camelObjectToUnderscore,
  notifyQueryResult,
} from "../../../../common/helpers";
import { setEventPeriod } from "../../../../store/services/eventServices";
import moment from "moment/moment";
import {
  DATE_FORMAT_DD_MM_YYYY,
  DATE_FORMAT_YYYY_MM_DD,
} from "../../../../common/constants";
import { getPostDetail } from "../../../../store/services/postServices";
import TimeSpecificationForm from "../../components/TimeSpecificationForm";
import Preloader from "../../../../components/Preloader";
import { setEventPostSettingsInitialFormData } from "../../../../store/actions/postActions";

const Main = ({
  onBack,
  onSubmit,
  onTicketSettings,
  onAddAssociations,
  eventID,
}) => {
  const dispatch = useDispatch();

  const eventPostSettingsInitialFormData = useSelector(
    (state) => state.postStore.eventPostSettingsInitialFormData
  );
  const isFirstDateOlder = (firstDateStr, secondDateStr) => {
    return new Date(firstDateStr).getTime() > new Date(secondDateStr).getTime();
  };

  const [settings, setSettings] = useState({
    collection_items_quantity: 0,
    item_quantity: false,
  });
  const [initialValues, setInitialValues] = useState(
    eventPostSettingsInitialFormData
      ? eventPostSettingsInitialFormData
      : {
          startTime: "09:00",
          endTime: "18:00",
          startDate: "",
          endDate: "",
        }
  );

  const [isEventLoading, setIsEventLoading] = useState(!!eventID);

  const handleSubmit = async (values) => {
    const res = await notifyQueryResult(
      setEventPeriod(
        eventID,
        camelObjectToUnderscore({
          ...values,
          startDate: moment(values.startDate).format(DATE_FORMAT_DD_MM_YYYY),
          endDate: moment(values.endDate).format(DATE_FORMAT_DD_MM_YYYY),
        })
      )
    );
    if (res && res.success) {
      return onSubmit();
    }
  };

  const handleChange = (values) => {
    dispatch(setEventPostSettingsInitialFormData(values));
  };

  const validate = (values) => {
    const { startDate, endDate } = values;
    const errors = {};

    if (startDate && new Date(startDate).getTime() < new Date().getTime()) {
      errors.startDate = ERROR_MESSAGES.date;
    }

    if (endDate && startDate && isFirstDateOlder(startDate, endDate)) {
      errors.endDate = ERROR_MESSAGES.date;
    }

    return errors;
  };

  const fetchData = useCallback(() => {
    if (eventID) {
      dispatch(getStockDetail(eventID)).then(
        (res) => res && res.success && setSettings(res.data)
      );

      notifyQueryResult(
        getPostDetail(eventID).then((res) => {
          if (res.success) {
            const event = res.data;
            const ticketPeriod = event.ticket_period;
            if (ticketPeriod) {
              setInitialValues({
                startTime: ticketPeriod.start_time,
                endTime: ticketPeriod.end_time,
                startDate: ticketPeriod.start_date
                  ? moment(
                      ticketPeriod.start_date,
                      DATE_FORMAT_DD_MM_YYYY
                    ).format(DATE_FORMAT_YYYY_MM_DD)
                  : "",
                endDate: ticketPeriod.end_date
                  ? moment(
                      ticketPeriod.end_date,
                      DATE_FORMAT_DD_MM_YYYY
                    ).format(DATE_FORMAT_YYYY_MM_DD)
                  : "",
              });
            }
          }
        })
      ).finally(() => setIsEventLoading(false));
    }
  }, [dispatch, eventID]);

  useEffect(() => {
    fetchData();
  }, [dispatch, fetchData]);

  if (isEventLoading) {
    return <Preloader />;
  }

  return (
    <div className="event-settings__main-view">
      <TimeSpecificationForm
        initialValues={initialValues}
        validate={validate}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onBack={onBack}
        onSubmitWithoutChanges={onBack}
      />
      <div
        className="container"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        <CategoryOption
          icon={<TicketIcon />}
          label={translate("Количество билетов", "events.ticketsCount")}
          onClick={onTicketSettings}
          description={
            settings.item_quantity
              ? translate("Есть билеты", "events.settings.hasTickets")
              : null
          }
          descPosition="underLabel"
          className="event-settings__main-view-option"
        />
        <CategoryOption
          icon={<EventAssociationsIcon />}
          label={translate("Добавить ассоциации", "app.addAssociations")}
          onClick={onAddAssociations}
          description={
            settings.collection_items_quantity > 0
              ? translate("Добавлено связей: {count}", "app.relationsAdded", {
                  count: settings.collection_items_quantity,
                })
              : null
          }
          descPosition="underLabel"
          className="event-settings__main-view-option"
        />
      </div>
    </div>
  );
};

const EventAssociationsIcon = (props) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M20.0389 16.4617C19.8256 16.4588 19.6217 16.3687 19.4709 16.2106C19.32 16.0526 19.234 15.8391 19.2312 15.6155V13.3591C19.2312 13.2843 19.2029 13.2126 19.1524 13.1597C19.1019 13.1068 19.0334 13.0771 18.962 13.0771H6.03891C5.96751 13.0771 5.89903 13.1068 5.84854 13.1597C5.79805 13.2126 5.76968 13.2843 5.76968 13.3591V15.6155C5.76968 15.84 5.68459 16.0552 5.53311 16.2139C5.38164 16.3726 5.1762 16.4617 4.96199 16.4617C4.74778 16.4617 4.54234 16.3726 4.39086 16.2139C4.23939 16.0552 4.1543 15.84 4.1543 15.6155V13.3591C4.15712 12.8364 4.35659 12.3359 4.70941 11.9663C5.06223 11.5967 5.53995 11.3877 6.03891 11.3848H18.962C19.4609 11.3877 19.9387 11.5967 20.2915 11.9663C20.6443 12.3359 20.8438 12.8364 20.8466 13.3591V15.6155C20.8438 15.8391 20.7578 16.0526 20.607 16.2106C20.4561 16.3687 20.2523 16.4588 20.0389 16.4617Z"
      fill="#007AFF"
    />
    <path
      d="M12.81 13C12.596 12.9983 12.3916 12.945 12.2403 12.8516C12.089 12.7582 12.0028 12.6321 12 12.5V8.5C12 8.36739 12.0853 8.24022 12.2372 8.14645C12.3891 8.05268 12.5952 8 12.81 8C13.0248 8 13.2309 8.05268 13.3828 8.14645C13.5347 8.24022 13.62 8.36739 13.62 8.5V12.5C13.6172 12.6321 13.531 12.7582 13.3797 12.8516C13.2284 12.945 13.024 12.9983 12.81 13Z"
      fill="#007AFF"
    />
    <path
      d="M14 1V2M14 4V5M14 7V8M9 1C8.73478 1 8.48043 1.10536 8.29289 1.29289C8.10536 1.48043 8 1.73478 8 2V3.5C8.26522 3.5 8.51957 3.60536 8.70711 3.79289C8.89464 3.98043 9 4.23478 9 4.5C9 4.76522 8.89464 5.01957 8.70711 5.20711C8.51957 5.39464 8.26522 5.5 8 5.5V7C8 7.26522 8.10536 7.51957 8.29289 7.70711C8.48043 7.89464 8.73478 8 9 8H16C16.2652 8 16.5196 7.89464 16.7071 7.70711C16.8946 7.51957 17 7.26522 17 7V5.5C16.7348 5.5 16.4804 5.39464 16.2929 5.20711C16.1054 5.01957 16 4.76522 16 4.5C16 4.23478 16.1054 3.98043 16.2929 3.79289C16.4804 3.60536 16.7348 3.5 17 3.5V2C17 1.73478 16.8946 1.48043 16.7071 1.29289C16.5196 1.10536 16.2652 1 16 1H9Z"
      stroke="#007AFF"
      strokeWidth={1.62}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 16V17M5 19V20M5 22V23M10 16C10.2652 16 10.5196 16.1054 10.7071 16.2929C10.8946 16.4804 11 16.7348 11 17V18.5C10.7348 18.5 10.4804 18.6054 10.2929 18.7929C10.1054 18.9804 10 19.2348 10 19.5C10 19.7652 10.1054 20.0196 10.2929 20.2071C10.4804 20.3946 10.7348 20.5 11 20.5V22C11 22.2652 10.8946 22.5196 10.7071 22.7071C10.5196 22.8946 10.2652 23 10 23H3C2.73478 23 2.48043 22.8946 2.29289 22.7071C2.10536 22.5196 2 22.2652 2 22V20.5C2.26522 20.5 2.51957 20.3946 2.70711 20.2071C2.89464 20.0196 3 19.7652 3 19.5C3 19.2348 2.89464 18.9804 2.70711 18.7929C2.51957 18.6054 2.26522 18.5 2 18.5V17C2 16.7348 2.10536 16.4804 2.29289 16.2929C2.48043 16.1054 2.73478 16 3 16H10Z"
      stroke="#007AFF"
      strokeWidth={1.62}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 16V17M20 19V20M20 22V23M15 16C14.7348 16 14.4804 16.1054 14.2929 16.2929C14.1054 16.4804 14 16.7348 14 17V18.5C14.2652 18.5 14.5196 18.6054 14.7071 18.7929C14.8946 18.9804 15 19.2348 15 19.5C15 19.7652 14.8946 20.0196 14.7071 20.2071C14.5196 20.3946 14.2652 20.5 14 20.5V22C14 22.2652 14.1054 22.5196 14.2929 22.7071C14.4804 22.8946 14.7348 23 15 23H22C22.2652 23 22.5196 22.8946 22.7071 22.7071C22.8946 22.5196 23 22.2652 23 22V20.5C22.7348 20.5 22.4804 20.3946 22.2929 20.2071C22.1054 20.0196 22 19.7652 22 19.5C22 19.2348 22.1054 18.9804 22.2929 18.7929C22.4804 18.6054 22.7348 18.5 23 18.5V17C23 16.7348 22.8946 16.4804 22.7071 16.2929C22.5196 16.1054 22.2652 16 22 16H15Z"
      stroke="#007AFF"
      strokeWidth={1.62}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Main;
