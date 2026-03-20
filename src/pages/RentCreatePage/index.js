import React, {useEffect} from 'react';
import RentCreateForm from "../../components/Forms/Rent/RentCreateForm";
import {useDispatch, useSelector} from "react-redux";
import {getOrganizationDetail} from "../../store/actions/organizationActions";
import Preloader from "../../components/Preloader";
import {useParams} from "react-router-dom";
import Notify from "../../components/Notification";

const RentCreatePage = ({history}) => {
  const {loading, data: orgDetail} = useSelector(state => state.organizationStore.orgDetail)
  const {id: orgID} = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getOrganizationDetail(orgID)).then(res => {
      if ('error' in res) {
        Notify.error({text: res.error})
        history.push(`/organizations/${orgID}`)
      }
    })
  }, [dispatch, orgID, history]);

  // const handleSubmit = data => {
  // }

  return (
    <div>
      {loading || !orgDetail ? (
        <Preloader />
      ) : (
        // TODO: make it access onSubmit handler
        <RentCreateForm
          orgDetail={orgDetail}
          // onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default RentCreatePage;