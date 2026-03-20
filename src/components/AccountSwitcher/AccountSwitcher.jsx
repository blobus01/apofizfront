import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { LOGIN_USER } from "@store/actions/actionTypes";
import {
  removeAccount,
  getSavedAccounts,
  switchToAccount,
} from "@common/utils";
import { translate } from "@locales/locales";
import { useHistory } from "react-router-dom";
import { AddUserIcon, SettingsIcon } from "@containers/Navbar/icons";

import "./index.scss";

const AccountSwitcher = ({ user, onClose }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    setAccounts(getSavedAccounts());
  }, [user?.id]);

  const handleSwitch = (account) => {
    switchToAccount(account);

    dispatch({
      type: LOGIN_USER.SUCCESS,
      payload: {
        token: account.token,
        user: account.user,
      },
    });

    window.location.reload();
    onClose?.();
  };

  const handleLogout = () => {
    removeAccount(user?.id);

    const list = getSavedAccounts();

    if (list.length > 0) {
      const nextAccount = list[0];

      switchToAccount(nextAccount);

      dispatch({
        type: LOGIN_USER.SUCCESS,
        payload: {
          token: nextAccount.token,
          user: nextAccount.user,
        },
      });

      window.location.reload();
    } else {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      history.push("/auth");
      window.location.reload();
    }
  };

  return (
    <div className="change-profile" style={{ width: "100%" }}>
      {/* текущий */}
      <div className="change-profile__user">
        <div className="change-profile__item">
          <div className="change-profile__item-info">
            <img
              src={user?.avatar?.file}
              className="change-profile__item-photo"
            />
            <div>
              <h2>{user?.full_name}</h2>
              <p>ID {user?.id}</p>
            </div>
          </div>

          <span
            className="change-profile__settings-icon"
            onClick={() => history.push(`/profile/edit`)}
          >
            <SettingsIcon />
          </span>
        </div>

        <button className="change-profile__item-btn" onClick={handleLogout}>
          {translate("Выйти", "app.exit")}
        </button>
      </div>

      {/* другие аккаунты */}
      {accounts
        .filter((acc) => acc.user.id !== user?.id)
        .map((acc) => (
          <div
            key={acc.user.id}
            className="change-profile__user"
            onClick={() => handleSwitch(acc)}
          >
            <div className="change-profile__item">
              <div className="change-profile__item-info">
                <img
                  src={acc.user?.avatar?.file}
                  className="change-profile__item-photo"
                />
                <div>
                  <h2>{acc.user.full_name}</h2>
                  <p>ID {acc.user.id}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

      {/* добавить */}
      <button
        className="change-profile__item-add-profile"
        onClick={() => history.push("/auth", { fromDisconnect: true })}
      >
        <span className="change-profile__item-add-icon">
          <AddUserIcon />
        </span>
        {translate("Добавить пользователя", "app.addUser")}
      </button>
    </div>
  );
};

export default AccountSwitcher;
