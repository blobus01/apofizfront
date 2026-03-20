import React from "react";
import { Helmet } from "react-helmet";
import { withRouter } from "react-router";
import config from "../../config";

const title = "Apofiz - Социально-торговая сеть";
const description =
  "Вам больше не надо открывать интернет - магазин, искать новых клиентов, запускать и тратить деньги на продвижение своего сайта или приложения. Мы сделали торговый онлайн инструмент, в котором есть всё для Вас. Вам будут доступны не только система лояльности своим и новым клиентам, теперь вы сможете управлять, получать всю статистику в режиме онлайн, не только о продажах и скидках вашей организации, но и всё о своих сотрудниках, мир на Вашей ладони.";
const image = "/logo192.png";

// Exclude default Helmet from Organization, Post and Apps pages
const EXCLUDED_PATH_REGEX =
  /^\/(apps|organizations|p|(home\/partners))\/\d*(\/?)/;

const PageHelmet = (props) => {
  const path = props.location.pathname;
  const showDefaults = !EXCLUDED_PATH_REGEX.test(path);

  return (
    <Helmet>
      {/* Main meta tags */}
      <title>{props.title || title}</title>
      {(showDefaults || props.description) && (
        <meta
          name="description"
          content={showDefaults ? description : props.description}
        />
      )}

      {/* Open Graph meta tags */}
      <meta property="og:title" content={props.title || title} />
      {(showDefaults || props.image) && (
        <meta
          property="og:image"
          content={showDefaults ? image : props.image}
        />
      )}
      {(showDefaults || props.description) && (
        <meta
          name="og:description"
          content={showDefaults ? description : props.description}
        />
      )}
      {props.video && <meta property="og:video:url" content={props.video} />}
      {props.url && (
        <meta property="og:url" content={config.domain + props.url} />
      )}
      {props.price && <meta property="og:type" content="og:product" />}
      {props.price && (
        <meta property="product:plural_title" content={props.title} />
      )}
      {props.price && (
        <meta property="product:price:amount" content={props.price} />
      )}
      {props.price && props.currency && (
        <meta property="product:price:currency" content={props.currency} />
      )}

      {/* Google+ meta tags */}
      <meta itemProp="name" content={props.title || title} />
      {(showDefaults || props.description) && (
        <meta
          itemProp="description"
          content={showDefaults ? description : props.description}
        />
      )}
      {(showDefaults || props.image) && (
        <meta itemProp="image" content={showDefaults ? image : props.image} />
      )}
      {props.url && <meta itemProp="url" content={config.domain + props.url} />}

      {/* Twitter meta tags */}
      {config.appAppStoreID && (
        <meta name="twitter:app:name:iphone" content="Apofiz" />
      )}
      {config.appAppStoreID && (
        <meta name="twitter:app:id:iphone" content={config.appAppStoreID} />
      )}
      {config.appAppStoreID && (
        <meta name="twitter:app:name:ipad" content="Apofiz" />
      )}
      {config.appAppStoreID && (
        <meta name="twitter:app:id:ipad" content={config.appAppStoreID} />
      )}
      {config.appGooglePlayID && (
        <meta name="twitter:app:name:googleplay" content="Apofiz" />
      )}
      {config.appGooglePlayID && (
        <meta
          name="twitter:app:id:googleplay"
          content={config.appGooglePlayID}
        />
      )}
    </Helmet>
  );
};

export default withRouter(PageHelmet);
