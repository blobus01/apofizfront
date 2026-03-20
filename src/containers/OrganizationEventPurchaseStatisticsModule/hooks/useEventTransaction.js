import {useEffect, useState} from 'react';
import {getEventTransaction} from "../../../store/services/eventServices";
import {notifyQueryResult} from "../../../common/helpers";

const useEventTransaction = (eventID) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    notifyQueryResult(getEventTransaction({ticket: eventID}))
      .then(res => res && res.success && setData(res.data))
      .finally(() => setLoading(false))
  }, [eventID]);

  return {loading, data};
};

export default useEventTransaction;