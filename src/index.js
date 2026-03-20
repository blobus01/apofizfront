import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import App from "./app";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import store, { history } from "./store/configureStore";
import TranslationProvider from "./translation";
import DialogProvider from "./components/UI/Dialog/DialogProvider";
import "./i18n"; // <--- обязательно подключи здесь
import './index.scss'

import "./fonts.scss";

const Index = () => {
  React.useEffect(() => {
    import("normalize.css").then(() => import("./index.scss"));
    import("react-toastify/dist/ReactToastify.min.css");
  }, []);
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <TranslationProvider>
          <DialogProvider>
            <App history={history} />
          </DialogProvider>
        </TranslationProvider>
      </ConnectedRouter>
    </Provider>
  );
};

ReactDOM.render(<Index />, document.getElementById("root"));

serviceWorkerRegistration.register();
