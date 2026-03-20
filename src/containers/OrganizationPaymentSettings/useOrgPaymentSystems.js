import {useEffect, useState} from 'react';
import {getOrganizationPaymentSystems} from "../../store/services/organizationServices";

const useOrgPaymentSystems = (id) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    setLoading(true)
    getOrganizationPaymentSystems(id)
      .then(res => {
        setData(res.data)
      })
      .catch(e => {
        setError(e.message)
      })
      .finally(() => setLoading(false))
  }, [id]);

  return {loading, data, error};
};

export default useOrgPaymentSystems;