import React, {useEffect, useState} from 'react';
import moment from 'moment';

let intervalID = null;
let isMounted = true;

export const CountDownTimer = ({fromDate, onFinish}) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    isMounted = true;
    intervalID = setInterval(function() {
      const now = moment();
      const distance = moment(fromDate).diff(now);
      // Time calculations for days, hours, minutes and seconds
      // const days = Math.floor(distance / (1000 * 60 * 60 * 24)); Disable days
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const outputList = [hours, minutes, seconds]; // List of display values

      let output = outputList.map(num => num < 10 ? `0${num}` : num).join(':');
      isMounted && setValue(output);
      // If the count down is over, write some text

      if (distance < 0 && isMounted) {
        clearInterval(intervalID);
        setValue("00:00:00");
        onFinish && onFinish();
      }
    }, 1000);
    return () => {
      isMounted = false;
      clearInterval(intervalID);
      intervalID = null;
    };
  }, [fromDate, onFinish]);

  return (
    <span className="countdown-timer f-15 f-700">{value}</span>
  );
};