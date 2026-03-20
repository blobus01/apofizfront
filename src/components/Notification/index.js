import * as React from "react";
import * as classnames from "classnames";
import { toast } from "react-toastify";
import { CloseButton, LinkIcon } from "@ui/Icons";
import PartnershipRequestToast from "../PartnershipRequestToast";
import "./index.scss";

const toastDefaultConfig = {
  autoClose: 3000,
  closeButton: false,
  closeOnClick: true,
  draggable: true,
  position: "top-center",
  hideProgressBar: true,
};

let toastID;

class Notify {
  static info = (data, config) => {
    toast.dismiss(toastID);
    toastID = toast(<InfoToaster text={data.text} />, {
      ...toastDefaultConfig,
      ...config,
    });
  };

  static success = (data, config) => {
    toast.dismiss(toastID);
    toastID = toast(<SuccessToaster text={data.text} />, {
      ...toastDefaultConfig,
      ...config,
    });
  };

  static error = (data, config) => {
    toast.dismiss(toastID);
    toastID = toast(<ErrorToaster text={data.text} />, {
      ...toastDefaultConfig,
      ...config,
    });
  };

  static partnershipRequest = (data, config) => {
    toast.dismiss(toastID);
    toastID = toast(<PartnershipRequestToast data={data} />, {
      ...toastDefaultConfig,
      ...config,
    });
  };

  static copyLinkSuccess = (data, config) => {
    toast.dismiss(toastID);
    toastID = toast(<CopyLinkSuccess text={data.text} />, {
      ...toastDefaultConfig,
      ...config,
      className: "toast-copy-link",
      bodyClassName: "toast-copy-link__inner",
    });
  };

   static Pinned = (data, config) => {
    toast.dismiss(toastID);
    toastID = toast(<Pinned text={data.text} />, {
      ...toastDefaultConfig,
      ...config,
      className: "toast-copy-link",
      bodyClassName: "toast-copy-link__inner",
    });
  };


  static custom = (content, config) => {
    toast.dismiss(toastID);
    toastID = toast(content, {
      ...toastDefaultConfig,
      ...config,
    });
  };

  static clearAll = () => {
    toast.dismiss();
  };
}

export default Notify;

const InfoToaster = ({ text }) => (
  <div className="toast_info">
    <div className="toast_info__inner">
      <div className={classnames("toast_info__text")}>{text || ""}</div>
    </div>
  </div>
);

const SuccessToaster = ({ text }) => (
  <div className="toast_success">
    <div className="toast_success__inner row">
      <div className="toast_success__icon">
        <svg
          width="20"
          height="14"
          viewBox="0 0 20 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 11.5858L1.70711 6.29289C1.31658 5.90237 0.683418 5.90237 0.292893 6.29289C-0.0976311 6.68342 -0.0976311 7.31658 0.292893 7.70711L6.29289 13.7071C6.68342 14.0976 7.31658 14.0976 7.70711 13.7071L19.7071 1.70711C20.0976 1.31658 20.0976 0.683418 19.7071 0.292893C19.3166 -0.0976311 18.6834 -0.0976311 18.2929 0.292893L7 11.5858Z"
            fill="white"
          />
        </svg>
      </div>

      <div className="toast_success__text f-15">{text || ""}</div>
    </div>
    <CloseButton className="toast_success__close" />
  </div>
);

const ErrorToaster = ({ text }) => (
  <div className="toast_failure">
    <div className="toast_failure__inner row">
      <div className="toast_failure__icon">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="40" height="40" rx="9" fill="#D72C20" />
          <path
            d="M20.3464 18.2536L20.7 18.6071L21.0536 18.2536L25.9536 13.3536C26.1449 13.1622 26.4551 13.1622 26.6464 13.3536C26.8378 13.5449 26.8378 13.8551 26.6464 14.0464L21.7464 18.9464L21.3929 19.3L21.7464 19.6536L26.6464 24.5536C26.8378 24.7449 26.8378 25.0551 26.6464 25.2464C26.4551 25.4378 26.1449 25.4378 25.9536 25.2464L21.0536 20.3464L20.7 19.9929L20.3464 20.3464L15.4464 25.2464C15.2551 25.4378 14.9449 25.4378 14.7536 25.2464C14.5622 25.0551 14.5622 24.7449 14.7536 24.5536L19.6536 19.6536L20.0071 19.3L19.6536 18.9464L14.7536 14.0464C14.5622 13.8551 14.5622 13.5449 14.7536 13.3536C14.9449 13.1622 15.2551 13.1622 15.4464 13.3536L20.3464 18.2536Z"
            fill="#4285F4"
            stroke="white"
          />
        </svg>
      </div>
      <div className="toast_failure__text f-15">{text || ""}</div>
    </div>
    <CloseButton className="toast_failure__close" />
  </div>
);

const CopyLinkSuccess = ({ text }) => (
  <>
    <div className="toast-copy-link__text f-14 f-500 dfc">
      <LinkIcon className="toast-copy-link__icon" />
      {text || ""}
    </div>
  </>
);


const Pinned = ({ text }) => (
  <>
    <div className="toast-copy-link__text f-14 f-500 dfc">
      {text}
    </div>
  </>
);

