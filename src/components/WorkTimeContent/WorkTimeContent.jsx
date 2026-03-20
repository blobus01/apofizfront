import React, { useEffect, useMemo, useState } from "react";
import { translate } from "@locales/locales";
import classes from "./workTime.module.scss";
import { inTimeRange } from "@common/utils";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios-api";

const WEEK_DAYS = [
  { id: 1, label: "Понедельник" },
  { id: 2, label: "Вторник" },
  { id: 3, label: "Среда" },
  { id: 4, label: "Четверг" },
  { id: 5, label: "Пятница" },
  { id: 6, label: "Суббота" },
  { id: 7, label: "Воскресенье" },
];

const getToday = () => {
  const day = new Date().getDay();
  return day === 0 ? 7 : day; // делаем воскресенье = 7
};

const isNowBetween = (from, to) => {
  const now = new Date();
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);

  const fromDate = new Date();
  fromDate.setHours(fh, fm, 0);

  const toDate = new Date();
  toDate.setHours(th, tm, 0);

  return now >= fromDate && now <= toDate;
};

const WorkTimeContent = ({
  workingDays = [],
  start,
  end,
  backEndData,
  setBackEndData,
}) => {
  const today = getToday();

  const params = useParams();

  console.log("PARAMS",params)

  // const [backEndData, setBackEndData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/opening-hours/?organization=${params?.id}`,
        );

        setBackEndData(response.data.list || []);
        console.log(backEndData);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [params.id]);

  const mappedBackendDays = useMemo(() => {
    if (!Array.isArray(backEndData) || !backEndData.length) return [];

    return backEndData.map((d) => ({
      day: Number(d?.day_of_week),
      from: d?.opens_at || null,
      to: d?.closes_at || null,
      enabled: !d?.is_closed,
    }));
  }, [backEndData]);

  const fallbackDays = useMemo(() => {
    return WEEK_DAYS.map((d) => ({
      day: d.id,
      from: "09:00",
      to: "21:00",
      enabled: true,
    }));
  }, []);

  let startTime = start;
  let endTime = end;

  const formatTime = (time) => time?.slice(0, 5);

  console.log(startTime, endTime);

  const daysData = useMemo(() => {
    return WEEK_DAYS.map((day) => {
      const fromBackend = mappedBackendDays.find((d) => d.day === day.id);
      const fromProps = workingDays.find((d) => d.day === day.id);

      return {
        day: day.id,
        from: fromBackend?.from || fromProps?.from || start || "09:00",

        to: fromBackend?.to || fromProps?.to || end || "21:00",

        enabled: fromBackend?.enabled ?? fromProps?.enabled ?? true,
      };
    });
  }, [mappedBackendDays, workingDays, start, end]);

  const todayData = daysData.find((d) => d.day === today);

  const isOpen =
    todayData?.enabled &&
    todayData?.from &&
    todayData?.to &&
    isNowBetween(todayData.from.slice(0, 5), todayData.to.slice(0, 5));

  return (
    <div className={classes.wrap}>
      {/* статус */}
      <div
        className={`${classes.status} ${
          isOpen ? classes.open : classes.closed
        }`}
      >
        <span className={classes.dot} />
        {isOpen
          ? translate("Сейчас открыто", "org.openNow")
          : translate("Сейчас закрыто", "org.closedNow")}
      </div>

      {/* список */}
      <div className={classes.list}>
        {WEEK_DAYS.map((day) => {
          const data = daysData.find((d) => Number(d.day) === day.id);

          return (
            <div key={day.id} className={classes.row}>
              <div className={classes.day}>
                {day.label}

                {today === day.id && (
                  <span className={classes.today}>
                    {translate("сегодня", "app.today")}
                  </span>
                )}
              </div>

              <div className={classes.time}>
                {data?.enabled ? (
                  <>
                    <span>с</span>
                    <p>{formatTime(data?.from || startTime)}</p>
                    <span>до</span>
                    <p>{formatTime(data?.to || endTime)}</p>
                  </>
                ) : (
                  <span className={classes.off}>
                    {translate("выходной", "org.dayOff")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkTimeContent;
