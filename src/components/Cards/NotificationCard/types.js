import React from "react";
import {
  BagIcon,
  CashbackIcon,
  ChangePositionIcon,
  CheckInIcon,
  DiscountIcon,
  LeftIcon,
  MessageIcon,
  RightIcon,
  SubsIcon,
  NewUserIcon,
  UserQuitedIcon,
  DeliveryIcon,
  NewCommentIcon,
  CalendarIcon,
  DollarIcon,
  DoneIcon,
  ActivatedTicketIcon,
  ResumeIcon,
} from "./icons";

export const NOTIFICATION_TYPES = {
  // Discounts
  accept_discount: "accept_discount", // Вам провели скидку
  accepted_seller_discount: "accepted_seller_discount", // Вы провели скидку
  decline_discount: "decline_discount", // Отменить скидку

  // Personal
  followed_to_organization: "followed_to_organization", // Вам подписались
  organization_followed: "organization_followed", // Вы подписались
  get_job: "get_job", // Вас приняли на работу
  recruit: "recruit", // Вы приняли на работу
  changed_position: "changed_position", // Вас назначили новую должность
  changed_position_as_owner: "changed_position_as_owner", // Вы назначили другую должность
  quit: "quit", // Вас уволили
  dismissed: "dismissed", // Вы уволили с работы
  organization_message: "organization_message", // Сообщение от организации
  sent_message: "sent_message", // Вы отправили сообщение
  gave_organization: "gave_organization", // Вы передали права собственности
  owned_organization: "owned_organization", // Вы стали собственником

  requested_partnership: "requested_partnership", // В ожидании партнершип
  requested_partnership_recipient: "requested_partnership_recipient", // Принять отклонить
  declined_partnership_recipient: "declined_partnership_recipient", // Вы отклонили
  declined_partnership: "declined_partnership", // Вас отклонили
  accepted_partnership: "accepted_partnership", // Вас приняли партнершип
  accepted_partnership_recipient: "accepted_partnership_recipient", // Вы приняли

  check_attendance_in: "check_attendance_in", // Пропуск на вход Lamoda
  check_attendance_out: "check_attendance_out", // Пропуск на выход Lamoda
  attendance_in: "attendance_in", // Вход Lamoda
  attendance_out: "attendance_out", // Выход Lamoda

  withdraw_cashback_seller: "withdraw_cashback_seller",
  charge_cashback_seller: "charge_cashback_seller",
  withdraw_cashback_client: "withdraw_cashback_client",
  charge_cashback_client: "charge_cashback_client",

  // System
  new_organization: "new_organization", // Доступна новая организация
  new_discount: "new_discount", // Доступны новые скидки
  new_cashback: "new_cashback", // Доступны новые кешбэк
  new_device: "new_device", // Новая активация пользователя

  // Products
  accepted_order_client: "accepted_order_client", // Ваш заказ приняли
  accepted_online_order_client: "accepted_online_order_client", // Ваш заказ с онлайн оплатой приняли
  accepted_order: "accepted_order", // Вы приняли заказ
  declined_order_client: "declined_order_client", // Вам отменили заказ
  declined_order: "declined_order", // Вы отменили заказ
  requested_order_client: "requested_order_client", // Спасибо Вам за заказ
  requested_order: "requested_order", // У вас новый заказ
  requested_online_order: "requested_online_order", // Уведомление о заказе продукта, который был оплачен онлайн
  accepted_order_payment_client: "accepted_order_payment_client", // Ваш заказ оплачен
  accepted_order_payment: "accepted_order_payment", // Клиент оплатил заказ
  declined_order_payment_client: "declined_order_payment_client", // Вы отклонили оплату за заказ
  declined_order_payment: "declined_order_payment", // Клиент отклонил оплату за заказ

  // Rental
  accepted_rental_client: "accepted_rental_client", // Ваш заказ на аренду приняли
  accepted_rental: "accepted_rental", // Вы приняли заказ на аренду
  declined_rental_client: "declined_rental_client", // Вам отменили заказ на аренду
  declined_rental: "declined_rental", // Вы отменили заказ на аренду
  requested_rental_client: "requested_rental_client", // Спасибо Вам за аренду
  requested_rental: "requested_rental", // У вас новый запрос на аренду

  accepted_rental_payment: "accepted_rental_payment", // Уведомление организации о принятии оплаты
  declined_rental_payment: "declined_rental_payment", // Уведомление организации об отклонении оплаты аренды

  accepted_rental_payment_client: "accepted_rental_payment_client", // Вы оплатили аренду
  declined_rental_payment_client: "declined_rental_payment_client", // Вы отменили оплату аренды

  declined_accepted_rental: "declined_accepted_rental", // Вы отменили принятый заказ аренды, возвращение денег клиенту (не точно)
  declined_accepted_rental_client: "declined_accepted_rental_client", // Вам отменили принятый заказ аренды, возвращение денег (не точно)

  activated_rental_client: "activated_rental_client", // Вам активировали аренду
  activated_rental: "activated_rental", // Вы активировали аренду

  // Events
  activated_ticket_client: "activated_ticket_client", // Вам активировали билет
  activated_ticket: "activated_ticket", // Вы активировали билет

  // Resume requests from user
  requested_resume: "requested_resume", // У вас новый запрос на Вакансию
  accepted_resume: "accepted_resume", // Вы приняли запрос на Вакансию
  declined_resume: "declined_resume", // Вы отклонили запрос на Вакансию
  requested_resume_client: "requested_resume_client", // Спасибо Вам за запрос
  accepted_resume_client: "accepted_resume_client", // Ваш запрос приняли на Вакансию
  declined_resume_client: "declined_resume_client", // Ваш запрос отклонили на Вакансию

  // Resume requests from organization
  organization_requested_resume: "organization_requested_resume", // У вас новый запрос на Вакансию
  organization_accepted_resume: "organization_accepted_resume", // Вы приняли запрос на Вакансию
  organization_declined_resume: "organization_declined_resume", // Вы отклонили запрос на Вакансию
  organization_requested_resume_client: "organization_requested_resume_client", // Спасибо Вам за запрос
  organization_accepted_resume_client: "organization_accepted_resume_client", // Ваш запрос приняли на Вакансию
  organization_declined_resume_client: "organization_declined_resume_client", // Ваш запрос отклонили на Вакансию

  // Delivery
  rejected_by_delivery: "rejected_by_delivery", // Вы отменили заказ курЧ
  rejected_by_delivery_for_client: "rejected_by_delivery_for_client", // Доставка вашего заказа отменена (Клиент) кЧ
  accepted_by_delivery: "accepted_by_delivery", // Вы взяли заказ к доставке курЧ
  delivery_delivered_for_client: "delivery_delivered_for_client", // Ваш заказ доставлен (Клиент) кЧ
  for_delivery: "for_delivery", // Доступен новый заказ!!! курЧ
  for_delivery_for_organization: "for_delivery_for_organization", // Курьерская служба может доставить ваш заказ оЧ
  accepted_by_delivery_for_client: "accepted_by_delivery_for_client", // Ваш заказ в пути кЧ
  sent_to_delivery_by_organization_for_client:
    "sent_to_delivery_by_organization_for_client", // Ваш заказ отправлен в курьерскую службу. С вами свяжуться кЧ
  accepted_by_delivery_for_organization:
    "accepted_by_delivery_for_organization", // Ваш заказ взяли к доставке оЧ
  rejected_by_delivery_for_organization:
    "rejected_by_delivery_for_organization", // Доставка вашего заказа отменена (Организация) оЧ
  delivery_delivered_for_organization: "delivery_delivered_for_organization", // Ваш заказ доставлен (Организация) оЧ

  // Comments
  new_comment: "new_comment",
};

export const getBadge = ({ type }) => {
  let bgColor = "#007aff";

  if (
    type === NOTIFICATION_TYPES.followed_to_organization ||
    type === NOTIFICATION_TYPES.changed_position ||
    type === NOTIFICATION_TYPES.get_job ||
    type === NOTIFICATION_TYPES.organization_message ||
    type === NOTIFICATION_TYPES.owned_organization ||
    type === NOTIFICATION_TYPES.accept_discount ||
    type === NOTIFICATION_TYPES.declined_partnership_recipient ||
    type === NOTIFICATION_TYPES.declined_partnership ||
    type === NOTIFICATION_TYPES.accepted_partnership ||
    type === NOTIFICATION_TYPES.attendance_in ||
    type === NOTIFICATION_TYPES.check_attendance_in ||
    type === NOTIFICATION_TYPES.withdraw_cashback_client ||
    type === NOTIFICATION_TYPES.charge_cashback_client ||
    type === NOTIFICATION_TYPES.requested_order ||
    type === NOTIFICATION_TYPES.requested_rental ||
    type === NOTIFICATION_TYPES.accepted_order_client ||
    type === NOTIFICATION_TYPES.delivery_delivered_for_organization ||
    type === NOTIFICATION_TYPES.delivery_delivered_for_client ||
    type === NOTIFICATION_TYPES.accepted_rental_client ||
    type === NOTIFICATION_TYPES.accepted_online_order_client ||
    type === NOTIFICATION_TYPES.accepted_order_payment_client ||
    type === NOTIFICATION_TYPES.accepted_order_payment ||
    type === NOTIFICATION_TYPES.accepted_rental_payment ||
    type === NOTIFICATION_TYPES.accepted_rental_payment_client ||
    type === NOTIFICATION_TYPES.activated_ticket_client ||
    type === NOTIFICATION_TYPES.requested_online_order ||
    type === NOTIFICATION_TYPES.requested_resume ||
    type === NOTIFICATION_TYPES.accepted_resume ||
    type === NOTIFICATION_TYPES.accepted_resume_client ||
    type === NOTIFICATION_TYPES.organization_requested_resume ||
    type === NOTIFICATION_TYPES.organization_accepted_resume ||
    type === NOTIFICATION_TYPES.organization_accepted_resume_client
  ) {
    bgColor = "#34A853";
  }

  if (
    type === NOTIFICATION_TYPES.new_organization ||
    type === NOTIFICATION_TYPES.new_discount ||
    type === NOTIFICATION_TYPES.new_cashback ||
    type === NOTIFICATION_TYPES.for_delivery ||
    type === NOTIFICATION_TYPES.for_delivery_for_organization ||
    type === NOTIFICATION_TYPES.sent_to_delivery_by_organization_for_client
  ) {
    bgColor = "#FBBC05";
  }

  if (
    type === NOTIFICATION_TYPES.decline_discount ||
    type === NOTIFICATION_TYPES.attendance_out ||
    type === NOTIFICATION_TYPES.check_attendance_out ||
    type === NOTIFICATION_TYPES.dismissed ||
    type === NOTIFICATION_TYPES.quit ||
    type === NOTIFICATION_TYPES.declined_order ||
    type === NOTIFICATION_TYPES.declined_order_client ||
    type === NOTIFICATION_TYPES.declined_rental ||
    type === NOTIFICATION_TYPES.declined_rental_client ||
    type === NOTIFICATION_TYPES.rejected_by_delivery ||
    type === NOTIFICATION_TYPES.rejected_by_delivery_for_organization ||
    type === NOTIFICATION_TYPES.rejected_by_delivery_for_client ||
    type === NOTIFICATION_TYPES.declined_rental_payment ||
    type === NOTIFICATION_TYPES.declined_rental_payment_client ||
    type === NOTIFICATION_TYPES.declined_accepted_rental ||
    type === NOTIFICATION_TYPES.declined_accepted_rental_client ||
    type === NOTIFICATION_TYPES.declined_order_payment_client ||
    type === NOTIFICATION_TYPES.declined_order_payment ||
    type === NOTIFICATION_TYPES.declined_resume ||
    type === NOTIFICATION_TYPES.declined_resume_client ||
    type === NOTIFICATION_TYPES.organization_declined_resume ||
    type === NOTIFICATION_TYPES.organization_declined_resume_client
  ) {
    bgColor = "#D72C20";
  }

  switch (type) {
    case NOTIFICATION_TYPES.new_organization:
    case NOTIFICATION_TYPES.organization_followed:
    case NOTIFICATION_TYPES.followed_to_organization:
      return <SubsIcon fill={bgColor} />;

    case NOTIFICATION_TYPES.dismissed:
    case NOTIFICATION_TYPES.quit:
    case NOTIFICATION_TYPES.recruit:
    case NOTIFICATION_TYPES.get_job:
      return <UserQuitedIcon fill={bgColor} />;

    case NOTIFICATION_TYPES.changed_position:
    case NOTIFICATION_TYPES.changed_position_as_owner:
    case NOTIFICATION_TYPES.gave_organization:
    case NOTIFICATION_TYPES.owned_organization:
      return <ChangePositionIcon fill={bgColor} />;

    case NOTIFICATION_TYPES.organization_message:
    case NOTIFICATION_TYPES.sent_message:
      return <MessageIcon fill={bgColor} />;

    case NOTIFICATION_TYPES.decline_discount:
    case NOTIFICATION_TYPES.new_discount:
    case NOTIFICATION_TYPES.accept_discount:
    case NOTIFICATION_TYPES.accepted_seller_discount:
      return <DiscountIcon fill={bgColor} />;

    case NOTIFICATION_TYPES.declined_partnership:
    case NOTIFICATION_TYPES.accepted_partnership:
      return <LeftIcon fill={bgColor} />;

    case NOTIFICATION_TYPES.accepted_partnership_recipient:
    case NOTIFICATION_TYPES.requested_partnership_recipient:
    case NOTIFICATION_TYPES.requested_partnership:
    case NOTIFICATION_TYPES.declined_partnership_recipient:
      return <RightIcon fill={bgColor} />;

    case NOTIFICATION_TYPES.accepted_order_client:
    case NOTIFICATION_TYPES.accepted_order:
    case NOTIFICATION_TYPES.declined_order_client:
    case NOTIFICATION_TYPES.declined_order:
    case NOTIFICATION_TYPES.requested_order_client:
    case NOTIFICATION_TYPES.requested_order:
    case NOTIFICATION_TYPES.requested_online_order:
      return <BagIcon fill={bgColor} />;

    case NOTIFICATION_TYPES.requested_rental_client:
    case NOTIFICATION_TYPES.requested_rental:
    case NOTIFICATION_TYPES.accepted_rental:
    case NOTIFICATION_TYPES.declined_rental_client:
    case NOTIFICATION_TYPES.declined_rental:
      return <CalendarIcon fill={bgColor} />;

    case NOTIFICATION_TYPES.accepted_rental_client:
    case NOTIFICATION_TYPES.accepted_rental_payment:
    case NOTIFICATION_TYPES.declined_rental_payment:
    case NOTIFICATION_TYPES.accepted_rental_payment_client:
    case NOTIFICATION_TYPES.declined_rental_payment_client:
    case NOTIFICATION_TYPES.declined_accepted_rental:
    case NOTIFICATION_TYPES.declined_accepted_rental_client:
    case NOTIFICATION_TYPES.accepted_online_order_client:
    case NOTIFICATION_TYPES.accepted_order_payment_client:
    case NOTIFICATION_TYPES.accepted_order_payment:
    case NOTIFICATION_TYPES.declined_order_payment_client:
    case NOTIFICATION_TYPES.declined_order_payment:
      return <DollarIcon fill={bgColor} />;

    case NOTIFICATION_TYPES.check_attendance_in:
    case NOTIFICATION_TYPES.check_attendance_out:
    case NOTIFICATION_TYPES.attendance_in:
    case NOTIFICATION_TYPES.attendance_out:
      return <CheckInIcon fill={bgColor} />;

    case NOTIFICATION_TYPES.withdraw_cashback_seller:
    case NOTIFICATION_TYPES.charge_cashback_seller:
    case NOTIFICATION_TYPES.withdraw_cashback_client:
    case NOTIFICATION_TYPES.charge_cashback_client:
    case NOTIFICATION_TYPES.new_cashback:
      return <CashbackIcon fill={bgColor} />;

    case NOTIFICATION_TYPES.delivery_delivered_for_client:
    case NOTIFICATION_TYPES.accepted_by_delivery:
    case NOTIFICATION_TYPES.rejected_by_delivery:
    case NOTIFICATION_TYPES.rejected_by_delivery_for_client:
    case NOTIFICATION_TYPES.accepted_by_delivery_for_client:
    case NOTIFICATION_TYPES.for_delivery:
    case NOTIFICATION_TYPES.for_delivery_for_organization:
    case NOTIFICATION_TYPES.sent_to_delivery_by_organization_for_client:
    case NOTIFICATION_TYPES.accepted_by_delivery_for_organization:
    case NOTIFICATION_TYPES.rejected_by_delivery_for_organization:
    case NOTIFICATION_TYPES.delivery_delivered_for_organization:
      return <DeliveryIcon fill={bgColor} />;
    case NOTIFICATION_TYPES.new_comment:
      return <NewCommentIcon />;
    case NOTIFICATION_TYPES.activated_rental_client:
      return <DoneIcon />;
    case NOTIFICATION_TYPES.activated_rental:
      return <DoneIcon fill={bgColor} />;
    case NOTIFICATION_TYPES.activated_ticket:
    case NOTIFICATION_TYPES.activated_ticket_client:
      return <ActivatedTicketIcon fill={bgColor} />;
    case NOTIFICATION_TYPES.new_device:
      return <NewUserIcon />;

    case NOTIFICATION_TYPES.requested_resume:
    case NOTIFICATION_TYPES.accepted_resume:
    case NOTIFICATION_TYPES.declined_resume:
    case NOTIFICATION_TYPES.requested_resume_client:
    case NOTIFICATION_TYPES.accepted_resume_client:
    case NOTIFICATION_TYPES.declined_resume_client:
    case NOTIFICATION_TYPES.organization_requested_resume:
    case NOTIFICATION_TYPES.organization_accepted_resume:
    case NOTIFICATION_TYPES.organization_declined_resume:
    case NOTIFICATION_TYPES.organization_requested_resume_client:
    case NOTIFICATION_TYPES.organization_accepted_resume_client:
    case NOTIFICATION_TYPES.organization_declined_resume_client:
      return <ResumeIcon fill={bgColor} />;
    default:
      return null;
  }
};
