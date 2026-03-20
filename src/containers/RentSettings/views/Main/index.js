import React, {useEffect} from 'react';
import {InfoTitle} from "../../../../components/UI/InfoTitle";
import {translate} from "../../../../locales/locales";
import MobileTopHeader from "../../../../components/MobileTopHeader";
import {useDispatch, useSelector} from "react-redux";
import {clearRentSettings, getRentSettings} from "../../../../store/actions/rentActions";
import {CategoryOption} from "../../../../components/CategoryOption";
import connectionsIcon from "../../../../assets/icons/icon_connections.svg";
import calendarIcon from "../../../../assets/icons/icon_calendar.svg"
import WideButton from "../../../../components/UI/WideButton";
import useDialog from "../../../../components/UI/Dialog/useDialog";
import {deleteRentSettings} from "../../../../store/services/rentServices";
import Notify from "../../../../components/Notification";

import "./index.scss"

const Main = ({headerProps, rentID, onAddRelations, onAddTime, canDelete}) => {
  const dispatch = useDispatch()
  const {data: rentSettings} = useSelector(state => state.rentStore.rentSettings)

  const {confirm} = useDialog()

  const handleDeletion = async () => {
    try {
      await confirm({
        title: translate('Отменить', 'app.cancel'),
        description: translate('Связи будут удаленны, это не отразится на аренде\nВы уверены?', 'dialog.deleteRentSettings')
      })
      const res = await deleteRentSettings(rentID)
      if (!res.success) {
        Notify.error({
          text: res.message
        })
      } else {
        dispatch(getRentSettings(rentID))
      }
    } catch (e) {}
  }


  useEffect(() => {
    dispatch(getRentSettings(rentID))
    return () => {
      dispatch(clearRentSettings())
    }
  }, [dispatch, rentID]);

  return (
    <div className="rent-settings-main-view">
      <MobileTopHeader
        title={translate('Аренда', 'rent.rent')}
        nextLabel={translate('Готово', 'app.ready')}
        {...headerProps}
      />

      <div className="container containerMax">
        <InfoTitle title={translate('Примечание:', 'printer.note')} animated style={{marginBottom: 10}} />
        <p style={{
          fontStyle: 'italic',
          marginBottom: 38
        }}>
          {translate('Добавление связей с другими арендами и выбор времени аренды являются не обязательными. ', 'rent.note')}
        </p>

        <CategoryOption
          label={translate('Добавить связи', 'app.addRelations')}
          icon={{ file: connectionsIcon }}
          description={
            rentSettings?.collection_items_quantity
              ? translate('Добавлено связей: {count}', 'app.relationsAdded', { count: rentSettings.collection_items_quantity })
              : undefined
          }
          descPosition="underLabel"
          onClick={onAddRelations}
          className="rent-settings-main-view__option"
        />
        <CategoryOption
          label={translate('Указать время аренды', 'rent.specifyTime')}
          icon={{ file: calendarIcon }}
          descPosition="underLabel"
          description={rentSettings?.has_time ? translate('Есть время', 'rent.hasTime') : undefined}
          onClick={onAddTime}
          className="rent-settings-main-view__option"
        />
        {canDelete && rentSettings?.collection_items_quantity ? (
          <WideButton onClick={handleDeletion}>
            {translate('Удалить связи', 'rent.deleteConnections')}
          </WideButton>
        ) : null}
      </div>

    </div>
  );
};

export default Main;