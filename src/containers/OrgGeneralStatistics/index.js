import {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {getOrgGeneralStatistics} from "../../store/actions/statisticActions";

const OrgGeneralStatistics = ({orgID, requestParams = {}, render}) => {
  const dispatch = useDispatch()
  const generalStatistics = useSelector(state => state.statisticStore.orgGeneralStatistics)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStatistics = useCallback(() => {
    setLoading(true)

    dispatch(getOrgGeneralStatistics(orgID, requestParams)).then(res => {
      if (!res.success) {
        setError(res.error)
      }
    }).finally(() => setLoading(false))

  }, [dispatch, orgID, requestParams])

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics]);

  return render({
    loading,
    stats: generalStatistics,
    error
  })
};

export default OrgGeneralStatistics;