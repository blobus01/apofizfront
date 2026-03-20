import React, {useEffect} from 'react';
import MobileTopHeader from "../../../../components/MobileTopHeader";
import {translate} from "../../../../locales/locales";
import {useFormik} from "formik";
import * as Yup from "yup";
import {ERROR_MESSAGES} from "../../../../common/messages";
import {InputTextField} from "../../../../components/UI/InputTextField";
import {validateForNumber} from "../../../../common/helpers";
import {InfoTitle} from "../../../../components/UI/InfoTitle";
import {getSizeCounts, updateSizeCount} from "../../../../store/actions/stockActions";
import {useDispatch, useSelector} from "react-redux";

const Tickets = ({eventID, onBack}) => {
  const dispatch = useDispatch()
  const VALIDATION_SCHEMA = Yup.object().shape({
    count: Yup.number()
      .min(1, translate('Количество билетов должно быть больше 0', 'hint.minTicketsQuantity'))
      .required(ERROR_MESSAGES.quantity_empty)
  });

  const { data: ticketsData} = useSelector(state => state.stockStore.sizeCounts);

  const handleSubmit = async values => {
    const res = await dispatch(updateSizeCount(eventID, {
      count: values.count,
    }, true))
    if (res && res.success) {
      onBack()
    }
  }

  useEffect(() => {
    dispatch(getSizeCounts(eventID))
  }, [dispatch, eventID]);

  const formik = useFormik({
    initialValues: {
      count: ticketsData[0]?.count ?? '',
    },
    onSubmit: handleSubmit,
    validationSchema: VALIDATION_SCHEMA,
    enableReinitialize: true,
  })

  const {values, errors, touched, setFieldValue} = formik
  const {count} = values
  return (
    <form className="event-settings__tickets-form" onSubmit={formik.handleSubmit}>
      <MobileTopHeader
        onBack={onBack}
        title={translate('Количество билетов', 'events.ticketsCount')}
        onSubmit={() => {}}
        disabled={formik.isSubmitting}
        isSubmitting={formik.isSubmitting}
        className="event-settings__header"
      />
      <div className="container">
        <InputTextField
          name="count"
          value={count}
          onChange={e => {
            const {isValid, isEmpty, value} = validateForNumber(e.target.value, {min: 0, max: 1000000000})
            if (isValid || isEmpty) {
              setFieldValue('count', value)
            }
          }}
          error={count && touched.count && errors.count}
          requiredError={!count && touched.count && errors.count}
          label={translate('Количество билетов', 'events.ticketsCount')}
          className="event-settings__tickets-form-input"
        />
        <p className="event-settings__desc event-settings__tickets-form-desc f-12">
          {translate('Укажите количество билетов доступных в кассе', 'event.settings.ticketsQuantityDesc')}
        </p>

        <InfoTitle title={translate('Примечание', 'printer.note')} className="event-settings__title"/>
        <p
          className="event-settings__desc">
          {translate('Количество билетов будет доступно для продаже в кассе. Вы всегда сможете отредактировать количество в редактирование данного мероприятия', 'events.settings.ticketsInfo')}
        </p>
      </div>
    </form>
  );
};

export default Tickets;