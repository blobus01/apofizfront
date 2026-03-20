import React, {useState} from 'react';
import MobileTopHeader from '../../components/MobileTopHeader';
import {QuestionIcon} from '../../components/UI/Icons';
import RowToggle from '../../components/UI/RowToggle';
import useDialog from "../../components/UI/Dialog/useDialog";
import './index.scss';

const DeliverySettingsView = props => {
  const {onBack, onSave, isSubmitting=false} = props;

  const [state, setState] = useState({
    has_self_pick_up: props.disabled ? true : !!props.formikBag.values.has_self_pick_up,
    has_delivery: props.disabled ? true : !!props.formikBag.values.has_delivery,
  });

  const {alert} = useDialog();

  const onToggle = e => {
    if (props.disabled) {
      return alert({title: 'Настройки доставки доступны после создания организации'});
    }

    const {name} = e.target;
    const updatedState = {
      ...state,
      [name]: !state[name]
    }
    if (!updatedState.has_delivery && !updatedState.has_self_pick_up) {
      return alert({title: 'Один вид доставки обязателен'});
    }
    setState(updatedState);
  }

  const onSubmit = () => {
    onSave(state);
  };

  const {has_self_pick_up, has_delivery} = state;

  return (
    <div className="delivery-settings-view">
      <MobileTopHeader
        onBack={onBack}
        title="Настройки доставки"
        onNext={onSave && onSubmit}
        isSubmitting={isSubmitting}
        nextLabel="Сохранить"
      />
      <div className="delivery-settings-view__content">
        <div className="container">
          <h1 className="delivery-settings-view__title f-17 f-400">Укажите какие виды доставки доступны ?</h1>
          <p className="delivery-settings-view__desc f-15 f-400">
            Активируйте виды доставки которые будут доступны вашим клиентам, при покупки товаров или услуг в Вашей
            организации.<br/>
            <i className="f-500">Примечание: один вид доставки обязателен</i>
          </p>
          <div className="delivery-settings-view__types row">
            <div className="f-14 f-400">ВИДЫ ДОСТАВКИ</div>
            <QuestionIcon/>
          </div>
          <div className="delivery-settings-view__list">
            <RowToggle
              label="Наличными с курьером"
              name="has_delivery"
              checked={has_delivery}
              onChange={onToggle}
            />
            <RowToggle
              label="Самовывоз"
              name="has_self_pick_up"
              checked={has_self_pick_up}
              onChange={onToggle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliverySettingsView;