import React from 'react';
import {Formik} from 'formik';
import {InputTextField} from '../../UI/InputTextField';
import MobileTopHeader from '../../MobileTopHeader';
import RowToggle from '../../UI/RowToggle';
import Button from '../../UI/Button';
import * as Yup from 'yup';
import {QuestionIcon} from '../../UI/Icons';
import {Link} from 'react-router-dom';
import {ERROR_MESSAGES} from '../../../common/messages';
import {translate} from '../../../locales/locales';
import './index.scss';

const VALIDATION_SCHEMA = Yup.object().shape({
  title: Yup.string().required(ERROR_MESSAGES.role_empty)
})

const RoleManageForm = ({ showDelivery, onSubmit, data, onBack, onRemove }) => (
  <Formik
    enableReinitialize
    validationSchema={VALIDATION_SCHEMA}
    onSubmit={(values, formikBag) => onSubmit(values, formikBag)}
    initialValues={{
      title: (data && data.title) || '',
      can_deliver: !!(data && data.can_deliver),
      can_sale: !!(data && data.can_sale),
      can_check_attendance: !!(data && data.can_check_attendance),
      can_see_stats: !!(data && data.can_see_stats),
      can_edit_organization: !!(data && data.can_edit_organization),
      can_send_message: !!(data && data.can_send_message),
      can_edit_partner: !!(data && data.can_edit_partner),
    }}
  >
    {({ values, errors, touched, handleChange, handleSubmit, isSubmitting }) => (
      <form
        onSubmit={handleSubmit}
        className="role-manage-form"
      >
        <MobileTopHeader
          title={data ? data.title : translate("Новая должность", "roles.newRole") }
          onBack={onBack}
          onSubmit={handleSubmit}
          submitLabel={isSubmitting
            ? translate('Сохранение', 'app.saving')
            : translate('Сохранить', 'app.save')}
          disabled={isSubmitting}
        />

        <div className="container">
          <div className="role-manage-form__content">
            <div>
              <InputTextField
                name="title"
                label={translate("Название должности", "roles.positionTitle")}
                value={values.title}
                onChange={handleChange}
                error={errors.title && touched.title && errors.title}
              />

              <h2 className="role-manage-form__manage">
                <span className="f-14 f-600">{translate("УПРАВЛЕНИЕ ПРАВАМИ ДОЛЖНОСТИ", "roles.positionManagement")}</span>
                <Link to="/faq/role-rights"><QuestionIcon /></Link>
              </h2>

              {showDelivery && (
                <RowToggle
                  name="can_deliver"
                  label={translate("Курьерская служба", "delivery.courierService")}
                  checked={values.can_deliver}
                  onChange={handleChange}
                />
              )}
              <RowToggle
                name="can_check_attendance"
                label={translate("Сканировать пропуска", "roles.scanStaff")}
                checked={values.can_check_attendance}
                onChange={handleChange}
              />
              <RowToggle
                name="can_see_stats"
                label={translate("Статистика продаж/скидок", "roles.viewStatistics")}
                checked={values.can_see_stats}
                onChange={handleChange}
              />
              <RowToggle
                name="can_edit_organization"
                label={translate("Редактировать организацию", "roles.editOrganization")}
                checked={values.can_edit_organization}
                onChange={handleChange}
              />
              <RowToggle
                name="can_sale"
                label={translate("Проводить скидки", "roles.makeDeal")}
                checked={values.can_sale}
                onChange={handleChange}
              />
              <RowToggle
                name="can_send_message"
                label={translate("Отправлять сообщения", "roles.sendMessages")}
                checked={values.can_send_message}
                onChange={handleChange}
              />
              <RowToggle
                name="can_edit_partner"
                label={translate("Функции партнеров", "roles.partnersFunctions")}
                checked={values.can_edit_partner}
                onChange={handleChange}
              />
            </div>

            {onRemove && (
              <Button
                type="button"
                label={translate("Удалить", "app.delete")}
                className="role-manage-form__remove"
                disabled={isSubmitting}
                onClick={onRemove}
              />
            )}
          </div>
        </div>
      </form>
    )}
  </Formik>
);

export default RoleManageForm;