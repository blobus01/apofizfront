import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MobileTopHeader from "../../components/MobileTopHeader";
import Preloader from "../../components/Preloader";
import {
  changeTokenExpiredTime,
  deactivateAllTokens,
  deactivateToken,
  getActiveDevices,
} from "../../store/actions/profileActions";
import Device from "../../components/Device";
import DeviceMobileMenu from "./DeviceMobileMenu";
import MobileMenu from "../../components/MobileMenu";
import {
  AuthHistoryIcon,
  RedDevicesIcon,
  TimerIcon,
} from "../../components/UI/Icons";
import Notify from "../../components/Notification";
import useDialog from "../../components/UI/Dialog/useDialog";
import { setViews } from "../../store/actions/commonActions";
import { VIEW_TYPES } from "../../components/GlobalLayer";
import { translate } from "../../locales/locales";
import { logoutUser, setPrevPath } from "../../store/actions/userActions";
import { LOGOUT_USER } from "../../store/actions/actionTypes";
import { deleteFCMToken } from "../../firebase_init";
import InfiniteScroll from "react-infinite-scroll-component";
import { DEFAULT_LIMIT } from "../../common/constants";
import "./index.scss";

const DevicesPage = ({ history }) => {
  const dispatch = useDispatch();
  const limit = DEFAULT_LIMIT;
  const { data: devices } = useSelector((state) => state.profileStore.devices);
  const token = useSelector((state) => state.userStore.token);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [deviceIDToChangeExpirationTime, setDeviceIDToChangeExpirationTime] =
    useState(null);
  const [page, setPage] = useState(1);
  const { confirm } = useDialog();

  const toggleShowMenu = () => setShowMenu(!showMenu);

  const closeExpirationTimeSelectionMenu = () =>
    setDeviceIDToChangeExpirationTime(null);

  const leaveAllDevices = async () => {
    try {
      toggleShowMenu();
      await confirm({
        title: translate("Все устройства", "profile.allDevices"),
        description: translate(
          "Вы точно хотите выйти со всех устройств, включая это?",
          "profile.leaveAllDevicesConfirm"
        ),
      });
      const res = await dispatch(deactivateAllTokens());
      dispatch({ type: LOGOUT_USER });
      await deleteFCMToken();

      if (res && res.success) {
        Notify.success({
          text: translate(
            "Вы вышли со всех устройств",
            "profile.youLeavedAllDevices"
          ),
        });
        setTimeout(() => {
          dispatch(
            setPrevPath(history.location.pathname + history.location.search)
          );
          history.push("/auth");
        }, 1500);
      }
    } catch (e) {
      if (e && "message" in e) {
        Notify.error({ text: e.message });
      }
    }
  };

  const onLeaveDevice = async (device) => {
    try {
      setSelectedDevice(null);
      await confirm({
        title: translate("Выход", "app.logOut"),
        description: translate(
          "Вы точно хотите выйти с указанного устройства?",
          "profile.leaveDeviceConfirm"
        ),
      });

      const isCurrentDevice = token === device.key;

      if (isCurrentDevice) {
        await dispatch(logoutUser());
      } else {
        await dispatch(deactivateToken(device.id));
        Notify.success({
          text: translate("Вы вышли с устройства", "profile.youLeavedDevice"),
        });
      }
    } catch (e) {
      if (e && "message" in e) {
        Notify.error({ text: e.message });
      }
    }
  };

  const changeExpirationTime = async (deviceID, newExTime) => {
    try {
      await dispatch(
        changeTokenExpiredTime(deviceID, {
          expired_time_choice: newExTime,
        })
      );
      Notify.success({
        text: translate(
          "Время деактивации сменено",
          "profile.deactivationTimeChanged"
        ),
      });
    } catch (e) {
      if (e && "message" in e) {
        Notify.error({ text: e.message });
      }
    }
  };

  const openAuthHistoryView = () => {
    dispatch(setViews({ type: VIEW_TYPES.auth_history }));
    setShowMenu(false);
  };

  const fetchDevices = useCallback(
    async (params, isNext) => {
      const res = await dispatch(getActiveDevices(params, isNext));
      if (res.error) {
        console.error(res.error);
        Notify.error({
          text: translate("Что-то пошло не так", "app.fail"),
        });
      }
    },
    [dispatch]
  );

  const fetchNextDevices = async () => {
    void fetchDevices({ page: page + 1, limit }, true);
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    void fetchDevices({ page: 1, limit });
  }, [fetchDevices, limit]);

  const deactivationTimeOptions = [
    {
      label: translate("1 неделя", "profile.week"),
      value: 7,
    },
    {
      label: translate("1 месяц", "profile.month"),
      value: 30,
    },
    {
      label: translate("3 месяца", "profile.threeMonths"),
      value: 90,
    },
    {
      label: translate("6 месяцев", "profile.sixMonths"),
      value: 180,
    },
  ];

  return (
    <div className="devices-page">
      <MobileTopHeader
        title={translate("Активные устройства", "profile.activeDevices")}
        onBack={() => history.goBack()}
        onMenu={toggleShowMenu}
      />
      <InfiniteScroll
        loader={<Preloader />}
        dataLength={devices !== null ? devices.list.length : 0}
        hasMore={devices !== null ? devices.total_pages > page : true}
        next={fetchNextDevices}
        className="container"
      >
        {devices &&
          devices.list.map((device) => {
            return (
              <Device
                key={device.id}
                device={device}
                onClick={() => setSelectedDevice(device)}
              />
            );
          })}
      </InfiniteScroll>

      {/* selected device mobile menu */}
      {selectedDevice && (
        <DeviceMobileMenu
          device={selectedDevice}
          isOpen={!!selectedDevice}
          leaveDevice={() => onLeaveDevice(selectedDevice)}
          openExpirationTimeSelection={() => {
            setDeviceIDToChangeExpirationTime(selectedDevice.id);
            setSelectedDevice(null);
          }}
          onClose={() => setSelectedDevice(null)}
          canChangeExpTime
        />
      )}

      <MobileMenu
        isOpen={showMenu}
        onRequestClose={toggleShowMenu}
        onClose={toggleShowMenu}
        contentLabel={translate("Устройства", "app.devices")}
      >
        <div
          className="devices-page__menu-option dfc"
          onClick={openAuthHistoryView}
        >
          <AuthHistoryIcon className="devices-page__menu-option-icon" />
          <span>{translate("История авторизаций", "profile.authHistory")}</span>
        </div>
        <div
          className="devices-page__menu-option dfc"
          onClick={leaveAllDevices}
        >
          <RedDevicesIcon className="devices-page__menu-option-icon" />
          <span className="devices-page__leave-all-devices">
            {translate("Выйти со всех устройств", "profile.leaveAllDevices")}
          </span>
        </div>
      </MobileMenu>

      <MobileMenu
        isOpen={!!deviceIDToChangeExpirationTime}
        onRequestClose={closeExpirationTimeSelectionMenu}
        onClose={closeExpirationTimeSelectionMenu}
        contentLabel={translate(
          "Время деактивации",
          "profile.deactivationTime"
        )}
      >
        {deactivationTimeOptions.map((timeOption) => (
          <div
            key={timeOption.label}
            className="devices-page__menu-option dfc"
            onClick={async () => {
              await changeExpirationTime(
                deviceIDToChangeExpirationTime,
                timeOption.value
              );
              setDeviceIDToChangeExpirationTime(null);
              dispatch(getActiveDevices());
            }}
          >
            <TimerIcon className="devices-page__menu-option-icon" />
            <span>{timeOption.label}</span>
          </div>
        ))}
      </MobileMenu>
    </div>
  );
};

export default DevicesPage;
