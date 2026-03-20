import MobileTopHeader from "@components/MobileTopHeader";
import React, { useEffect, useState } from "react";
import classes from "./index.module.scss";
import { translate } from "@locales/locales";
import ToggleSwitch from "@components/UI/ToggleSwitch";
import axios from "axios-api";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";

const DEFAULT_FROM = "09:00";
const DEFAULT_TO = "18:00";

const WEEK_DAYS = [
  { id: 1, key: "org.workingDaysMonday", label: "Понедельник" },
  { id: 2, key: "org.workingDaysTuesday", label: "Вторник" },
  { id: 3, key: "org.workingDaysWednesday", label: "Среда" },
  { id: 4, key: "org.workingDaysThursday", label: "Четверг" },
  { id: 5, key: "org.workingDaysFriday", label: "Пятница" },
  { id: 6, key: "org.workingDaysSaturday", label: "Суббота" },
  { id: 7, key: "org.workingDaysSunday", label: "Воскресенье" },
];

const WorkingDays = ({ setOpen, start, end }) => {
  const params = useParams();

  console.log("PARAMS", params);

  const [backendData, setBackEndData] = useState([]);
  const [initialDays, setInitialDays] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/opening-hours/?organization=${params?.id}`,
        );

        setBackEndData(response.data.list || []);
        console.log(backendData);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [params?.id]);

  useEffect(() => {
    const mapped = WEEK_DAYS.map((day) => {
      const fromBackend = backendData.find((d) => d.day_of_week === day.id);

      return {
        day: day.id,

        from: fromBackend?.opens_at || start || DEFAULT_FROM,

        to: fromBackend?.closes_at || end || DEFAULT_TO,

        enabled: fromBackend ? !fromBackend.is_closed : false,
      };
    });

    setDays(mapped);
    setInitialDays(mapped);
  }, [backendData, start, end]);

  const getChangedDays = () => {
    return days.filter((d) => {
      const initial = initialDays.find((i) => i.day === d.day);

      if (!initial) return true;

      return (
        initial.from !== d.from ||
        initial.to !== d.to ||
        initial.enabled !== d.enabled
      );
    });
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const createInitialState = () => {
    return WEEK_DAYS.map((day) => {
      const fromBackend = backendData.find((d) => d.day === day.id);

      return {
        day: day.id,
        from: fromBackend?.from || DEFAULT_FROM,
        to: fromBackend?.to || DEFAULT_TO,
        enabled: fromBackend?.enabled ?? false,
      };
    });
  };

  const [days, setDays] = useState(createInitialState);

  const changeTime = (dayId, field, value) => {
    setDays((prev) =>
      prev.map((d) => (d.day === dayId ? { ...d, [field]: value } : d)),
    );
  };

  const toggleDay = (dayId) => {
    setDays((prev) =>
      prev.map((d) => (d.day === dayId ? { ...d, enabled: !d.enabled } : d)),
    );
  };

  const handleSave = async () => {
    const changedDays = getChangedDays();

    if (!changedDays.length) {
      console.log("NOTHING CHANGED");
      setOpen(false);
      return;
    }

    const payload = changedDays.map((d) => ({
      organization: Number(params?.id),
      day_of_week: d.day,
      opens_at: d.from,
      closes_at: d.to,
      is_closed: !d.enabled,
    }));

    console.log("PAYLOAD", payload);

    try {
      if (backendData.length) {
        // есть данные → PATCH
        await axios.patch(`/opening-hours/bulk-update/`, payload);
      } else {
        // нет → POST
        await axios.patch(`/opening-hours/bulk-update/`, payload);
      }

      setOpen(false);
    } catch (e) {
      console.log(e);
    }
  };

  const isDayChanged = (dayId) => {
    const current = days.find((d) => d.day === dayId);
    const initial = initialDays.find((i) => i.day === dayId);

    if (!initial) return false;

    return (
      current.from !== initial.from ||
      current.to !== initial.to ||
      current.enabled !== initial.enabled
    );
  };

  const isChanged = getChangedDays().length > 0;

  return (
    <div className={classes.overlay}>
      <div className={classes.modal}>
        <MobileTopHeader
          title={translate("Рабочие дни", "org.workingDays")}
          onNext={handleSave}
          nextLabel={translate("Сохранить", "app.save")}
          onBack={() => setOpen(false)}
          nextDisabled={!isChanged}
          submitLabel={translate("Сохранить", "app.save")}
        />

        <div className="container containerMax">
          <div className={classes.workingDaysDescription}>
            <p className={classes.workingDesc}>
              {translate(
                "В этом разделе настраиваются рабочие дни и часы работы организации. Укажите, в какие дни и в какое время компания работает. Статус показывает режим дня:",
                "org.descWorkingDays",
              )}
            </p>

            <ul className={classes.workingListDesc}>
              <li className={classes.workingItemOn}>
                {translate("включено — рабочий день", "org.workingOnDay")}
              </li>
              <li className={classes.workingItemOff}>
                <span style={{ color: "#333333" }}>
                  {translate("выключено — выходной день", "org.workingOffDay")}
                </span>
              </li>
            </ul>
          </div>
          <div className={classes.workingDaysContent}>
            <div className={classes.workingDaysTitle}>
              <h2>{translate("Дни работы", "org.daysWork")}</h2>
              <h2>{translate("Время работы", "org.daysTime")}</h2>
              <h2>{translate("Статус", "org.daysStatus")}</h2>
            </div>

            {WEEK_DAYS.map((weekDay) => {
              const current = days.find((d) => d.day === weekDay.id);

              return (
                <div
                  key={weekDay.id}
                  className={`${classes.row} ${
                    isDayChanged(weekDay.id) ? classes.changed : ""
                  }`}
                >
                  <div className={classes.day}>
                    {translate(weekDay.label, weekDay.key)}
                  </div>

                  <div className={classes.time}>
                    <span>c</span>

                    <input
                      type="time"
                      lang="en-GB"
                      inputMode="numeric"
                      step="60"
                      value={current.from?.slice(0, 5) || start}
                      onChange={(e) =>
                        changeTime(weekDay.id, "from", e.target.value)
                      }
                      className={classes.timeInput}
                    />
                    <span style={{ marginLeft: "20px" }}>до</span>
                    <input
                      type="time"
                      lang="en-GB"
                      inputMode="numeric"
                      step="60"
                      value={current.to?.slice(0, 5) || end}
                      onChange={(e) =>
                        changeTime(weekDay.id, "to", e.target.value)
                      }
                    />
                  </div>

                  <div className={classes.status}>
                    <ToggleSwitch
                      type="checkbox"
                      checked={current.enabled}
                      onChange={() => toggleDay(weekDay.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingDays;
