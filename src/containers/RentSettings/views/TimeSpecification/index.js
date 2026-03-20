import React, { useEffect } from "react";
import RentTimeSpecificationForm from "../../../../components/Forms/RentTimeSpecificationForm";
import { addRentalPeriod } from "../../../../store/services/rentServices";
import { camelObjectToUnderscore } from "../../../../common/helpers";
import Notify from "../../../../components/Notification";
import moment from "moment";
import { DATE_FORMAT_DD_MM_YYYY } from "../../../../common/constants";
import { useDispatch, useSelector } from "react-redux";
import {
  clearRentPeriod,
  getRentPeriod,
} from "../../../../store/actions/rentActions";
import Preloader from "../../../../components/Preloader";
import { translate } from "../../../../locales/locales";
import { getOrganizationPosts } from "@store/actions/organizationActions";

const TimeSpecification = ({ rentID, onBack, onSubmit }) => {
  const dispatch = useDispatch();
  const { loading, data: rentPeriod } = useSelector(
    (state) => state.rentStore.rentPeriod
  );

  const state = useSelector(state => state)

  console.log(state)

  useEffect(() => {
    dispatch(getRentPeriod(rentID)).catch((e) => {
      Notify.error({ text: translate("Что-то пошло не так", "app.fail") });
      console.log(e);
    });

    return () => dispatch(clearRentPeriod());
  }, [dispatch, rentID]);

  const handleSubmit = async (values) => {
    const res = await addRentalPeriod(
      rentID,
      camelObjectToUnderscore({
        ...values,
        startDate: moment(values.startDate).format(DATE_FORMAT_DD_MM_YYYY),
        endDate: moment(values.endDate).format(DATE_FORMAT_DD_MM_YYYY),
      })
    );
    if (res.success) {
      return (
        dispatch(getOrganizationPosts({ orgID: 728, page: 1, limit: 16 })),
        onSubmit(res)
      );
    }
    Notify.error({
      text: res.message,
    });
  };

  const hasRentPeriod =
    rentPeriod &&
    Object.keys(rentPeriod).reduce((acc, field) => !!rentPeriod[field], false);

  return (
    <>
      {loading || !rentPeriod ? (
        <Preloader />
      ) : (
        <RentTimeSpecificationForm
          onSubmit={handleSubmit}
          initialValues={
            hasRentPeriod
              ? {
                  rentTimeType: rentPeriod.rent_time_type,
                  startDate: rentPeriod.start_date
                    ? moment(
                        rentPeriod.start_date,
                        DATE_FORMAT_DD_MM_YYYY
                      ).toDate()
                    : new Date(),
                  endDate: rentPeriod.end_date
                    ? moment(
                        rentPeriod.end_date,
                        DATE_FORMAT_DD_MM_YYYY
                      ).toDate()
                    : new Date(),
                  startTime: rentPeriod.start_time,
                  endTime: rentPeriod.end_time,
                }
              : undefined
          }
          onBack={onBack}
        />
      )}
    </>
  );
};

export default TimeSpecification;
