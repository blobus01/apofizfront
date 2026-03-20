import React, {useEffect} from 'react';
import MobileTopHeader from '../../components/MobileTopHeader';
import {Formik} from 'formik';
import PartnerCard from '../../components/Cards/PartnerCard';
import RowToggle from '../../components/UI/RowToggle';
import {useDispatch, useSelector} from 'react-redux';
import {
  acceptPartnership,
  getPartnershipDetail,
  rejectPartnership,
  setPartnershipPermissions
} from '../../store/actions/partnerActions';
import Notify from '../../components/Notification';
import {canGoBack} from '../../common/helpers';
import Button from '../../components/UI/Button';
import {QuestionIcon} from '../../components/UI/Icons';
import {Link, useParams} from 'react-router-dom';
import {translate} from '../../locales/locales';
import useDialog from '../../components/UI/Dialog/useDialog';
import './index.scss';

const PartnershipDetailPage = ({history}) => {
  const dispatch = useDispatch();
  const {orgID, partnerID} = useParams();
  const {confirm} = useDialog();
  const partnershipDetail = useSelector(state => state.partnerStore.partnershipDetail);

  useEffect(() => {
    dispatch(getPartnershipDetail(partnerID));
  }, [dispatch, partnerID]);

  const onDeletePartnership = async () => {
    const allow = window.confirm('Вы действительно хотите удалить партнера ?');
    if (allow) {
      const res = await dispatch(rejectPartnership(partnerID));
      res && res.success && history.push(`/organizations/${orgID}/partners`);
    }
  };

  const onRejectPartnership = async () => {
    const res = await dispatch(rejectPartnership(partnerID));

    if (res && res.success) {
      history.push(`/organizations/${orgID}/partners`);
    }
  };

  const onAcceptPartnership = async values => {
    const res = await dispatch(acceptPartnership(partnerID));

    if (res && res.success) {
      const res = await dispatch(setPartnershipPermissions(partnerID, values));

      if (res && res.success) {
        Notify.success({ text: translate("Партнёр добавлен", "notify.rightsUpdateSuccess") });
        history.push(`/organizations/${orgID}/partners`);
      }
    }
  };

  const onSubmit = async values => {
    const res = await dispatch(setPartnershipPermissions(partnerID, values));
    if (res && res.success) {
      Notify.success({ text: translate("Права успешно обновлены", "notify.rightsUpdateSuccess") });
      history.push(`/organizations/${orgID}/partners`);
    }
  };

  const {data} = partnershipDetail;
  if (!data) { return null; }
  const {requested_by, can_check_attendance, can_see_stats, can_edit_organization, can_share_cashback, can_share_cumulative, can_share_items, is_accepted} = data;
  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={{
        can_check_attendance,
        can_see_stats,
        can_edit_organization,
        can_share_cashback,
        can_share_cumulative,
        can_share_items,
      }}
    >
      {({ values, handleChange, setFieldValue, handleSubmit, isSubmitting }) => (
        <form onSubmit={handleSubmit} className="partnership-detail-page">
          <MobileTopHeader
            onBack={() => canGoBack(history) ? history.goBack() : history.push(`/organizations/${orgID}/partners`)}
            title={translate("Настройки прав", "partnership.settings")}
            onSubmit={is_accepted ? handleSubmit : undefined}
            isSubmitting={isSubmitting}
          />

          <div className="partnership-detail-page__content-wrap">
            <div className="container partnership-detail-page__content">
              <PartnerCard
                partner={requested_by}
                to={`/organizations/${requested_by.id}`}
                className="partnership-detail-page__card"
              />
              <h4 className="partnership-detail-page__title f-14 f-600">
                <span>{translate("ПРАВА ДЛЯ ПАРТНЕРА", "partnership.rights")}</span>
                <Link to="/faq/partner-rights" className="partnership-detail-page__tooltip"><QuestionIcon /></Link>
              </h4>
              <RowToggle
                name="can_check_attendance"
                label={translate("Сканировать пропуска", "partnership.scanStaff")}
                checked={values.can_check_attendance}
                onChange={handleChange}
              />
              <RowToggle
                name="can_see_stats"
                label={translate("Статистика продаж/скидок", "partnership.viewStatistics")}
                checked={values.can_see_stats}
                onChange={handleChange}
              />
              <RowToggle
                name="can_edit_organization"
                label={translate("Редактировать организацию", "partnership.editOrganization")}
                checked={values.can_edit_organization}
                onChange={handleChange}
              />
              <RowToggle
                name="can_share_cumulative"
                label={translate("Объединить накопит. скидки", "partnership.mergeFixedDiscounts")}
                checked={values.can_share_cumulative}
                onChange={handleChange}
              />
              <RowToggle
                name="can_share_cashback"
                label={translate("Объединить кешбэк скидки", "partnership.mergeCashbackDiscounts")}
                checked={values.can_share_cashback}
                onChange={handleChange}
              />
              <RowToggle
                name="can_share_items"
                label={translate("Объединить товары", "partnership.mergeItems")}
                checked={values.can_share_items}
                onChange={async () => {
                  if (values.can_share_items) {
                    try {
                      await confirm({
                        title: 'Предупреждение',
                        description: 'Все объеденные товары будут удалены',
                      });
                      setFieldValue('can_share_items', !values.can_share_items);
                    } catch (e) {
                      // do nothing
                    }
                  } else {
                    setFieldValue('can_share_items', !values.can_share_items);
                  }
                }}
              />
            </div>

            <div className="container">
              {is_accepted
                ? <Button
                    type="button"
                    label={translate("Удалить партнера", "partnership.removePartner")}
                    onClick={onDeletePartnership}
                    className="partnership-detail-page__remove"
                  />
                : <div className="partnership-detail-page__actions dfc justify-center">
                    <Button
                      type="button"
                      label={translate("Принять", "app.accept")}
                      onClick={() => onAcceptPartnership(values)}
                      className="partnership-detail-page__actions-btn partnership-detail-page__actions-btn--accept"
                    />

                    <Button
                      type="button"
                      label={translate("Отклонить", "app.reject")}
                      onClick={onRejectPartnership}
                      className="partnership-detail-page__actions-btn partnership-detail-page__actions-btn--reject"
                    />
                  </div>
              }
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
}

export default PartnershipDetailPage;