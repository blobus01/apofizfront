import React from "react";
import MobileTopHeader from "../../components/MobileTopHeader";
import { FAQ_DISCOUNTS_EN, FAQ_DISCOUNTS_RU } from "./images";
import { renderFaqSubcomponentSlider } from "./index";
import { LOCALES, translate } from "../../locales/locales";
import TooltipPlayer from "../../components/TooltipPlayer";

import ADiscounts1 from "../../assets/audio/ru/discounts_1.mp3";
import ADiscounts2 from "../../assets/audio/ru/discounts_2.mp3";
import ADiscounts3 from "../../assets/audio/ru/discounts_3.mp3";

import ADiscounts1_en from "../../assets/audio/en/discounts_1.mp3";
import ADiscounts2_en from "../../assets/audio/en/discounts_2.mp3";
import ADiscounts3_en from "../../assets/audio/en/discounts_3.mp3";

const FaqDiscounts = ({
  language,
  goBack,
  location,
  anchor,
  isWebviewMode,
  onBack,
}) => {
  React.useEffect(() => {
    window.scroll({ top: 0 });

    const anchorHref = location?.hash?.replace("#", "");

    if (anchor || anchorHref) {
      const el = document.getElementById(anchor || anchorHref);

      if (el) {
        const offsetHeader = 64;
        const pos = el.offsetTop - offsetHeader;

        window.scroll({
          top: pos < 0 ? 0 : pos,
          behavior: "smooth",
        });
      }
    }
  }, [location?.hash, anchor]);

  const DATA = getContent(language);

  return (
    <>
      {!isWebviewMode && (
        <MobileTopHeader
          title={translate("Описание карт", "faq.cardsDescription")}
          onBack={() => (onBack ? onBack() : goBack("/faq"))}
        />
      )}
      <div className="faq-discounts">
        <div className="faq__content">
          <div className="container">
            {DATA.map((item, index) =>
              renderFaqSubcomponentSlider(item, index),
            )}
          </div>
        </div>
      </div>
    </>
  );
};

function getContent(locale) {
  return [
    {
      title: translate("Акционные карты?", "faq.cards.title1"),
      description: translate(
        "Создавайте акционные карты проводя распродажи или в особые дни, как черная пятница. Все пользователи и конечно Ваши подписчики получат уведомления ваших акциях. Создайте очередь за вашими товарами и услугами.  Акционные карты творят чудеса.",
        "faq.cards.desc1",
      ),
      slides:
        locale === LOCALES.ru ? FAQ_DISCOUNTS_RU.one : FAQ_DISCOUNTS_EN.one,
      disableTopMargin: true,
      renderIcon: () => (
        <TooltipPlayer
          sources={[locale === LOCALES.ru ? ADiscounts1 : ADiscounts1_en]}
        />
      ),
      id: "fixed",
    },
    {
      title: translate("Фиксированные карты?", "faq.cards.title2"),
      description: translate(
        "Конечно, так было у всех. Клиент много купил и получил постоянную скидку у Вас. Вернулся за новыми товарами, а новый продавец не знает его и отказывает провести скидку, хорошо если вы разорились и выдали дисконтную карту, а что, если клиент забыл ее. Теперь это все в прошлом клиенту даже не надо показывать QR-код который привязан к его телефону, достаточно просто сказать ID номер, который привязан к приложению. Вам только останется провести скидку и клиент обязательно вернётся за новыми покупками.",
        "faq.cards.desc2",
      ),
      slides:
        locale === LOCALES.ru ? FAQ_DISCOUNTS_RU.two : FAQ_DISCOUNTS_EN.two,
      renderIcon: () => (
        <TooltipPlayer
          sources={[locale === LOCALES.ru ? ADiscounts2 : ADiscounts2_en]}
        />
      ),
      id: "cumulative",
    },
    {
      title: translate("Кэшбэк карты?", "faq.cards.title3"),
      description: translate(
        "Это самая главная и при этом, самая нужная карта, если вы хотите настроить постоянный поток клиентов. Кэшбэком могут похвастаться только те организации у кого есть средства, для создания приложения. Теперь это доступно всем. Кэшбэк карта дает возможность накапливать деньги для того, чтоб ими расплатиться при следующей покупке. Представьте вы купили много товаров или услуг, а уже в следующий раз вы сможете расплатится, используя накопленный кэшбэк и оплатить им полностью или частично вашу покупку. Каждый кто хоть раз воспользуется таким видом накопления, обязательно вернется к Вам снова и снова. Теперь представьте у вас сеть организаций, клиент сможет воспользоваться кэшбэком в любой из них, а Вам будет доступна аналитика. Очередь клиентов в ваших руках...",
        "faq.cards.desc3",
      ),
      slides:
        locale === LOCALES.ru ? FAQ_DISCOUNTS_RU.three : FAQ_DISCOUNTS_EN.three,
      renderIcon: () => (
        <TooltipPlayer
          sources={[locale === LOCALES.ru ? ADiscounts3 : ADiscounts3_en]}
        />
      ),
      id: "cashback",
    },
  ];
}

export default FaqDiscounts;
