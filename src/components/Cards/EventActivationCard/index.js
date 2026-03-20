import React, {useEffect, useState} from 'react';
import EventPostRowCard from "../EventPostRowCard";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../UI/WideButton";
import {translate} from "../../../locales/locales";
import Lottie from "react-lottie";
import classNames from "classnames";
import "./index.scss"

const EventActivationCard = ({data: ticket, onActivate, onActiveButtonClick, isSubmitting, isPlayingAnimation, className}) => {
  const [animationData, setAnimationData] = useState(null);
  const id = ticket.id
  const isActive = ticket.is_active

  useEffect(() => {
    import('../../../assets/animations/button_ticket_activated.json')
      .then(res => setAnimationData(res))
  }, []);

  return (
    <div className={classNames('event-activation-card', className)} key={id}>
      <EventPostRowCard
        event={ticket.item}
        eventPeriod={ticket.item.ticket_period}
        activatedTime={ticket.activated_time}
        isActivated={isActive}
      />
      {ticket.is_active ? (
        <WideButton
          variant={WIDE_BUTTON_VARIANTS.ACCEPT_CONTAINED}
          className="event-activation-card__button"
          disabled={!onActiveButtonClick}
          onClick={() => onActiveButtonClick(id)}
        >
          {translate('Активирован', 'app.activated')}
        </WideButton>
      ) : (
        <WideButton
          variant={WIDE_BUTTON_VARIANTS.ACCEPT}
          onClick={() => onActivate(id)}
          disabled={isSubmitting || isPlayingAnimation}
          className="event-activation-card__button"
        >
          {translate('Активировать', 'app.activate')}
          {isPlayingAnimation && (
            <Lottie
              options={{
                loop: true,
                autoplay: true,
                animationData,
                rendererSettings: {
                  preserveAspectRatio: 'xMidYMid slice',
                },
              }}
              className="event-activation-card__button-animation"

              style={{
                position: 'absolute',
                right: '2em',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
              width="3em"
              height="6.5em"
            />
          )}
        </WideButton>
      )}
    </div>
  )
};

export default EventActivationCard;