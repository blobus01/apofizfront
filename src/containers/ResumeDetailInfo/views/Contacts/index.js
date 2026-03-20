import React, {useEffect, useState} from 'react';
import ContactsForm from "../../../../components/Forms/ContactsForm";
import Preloader from "../../../../components/Preloader";
import {notifyQueryResult} from "../../../../common/helpers";
import {getResumePhoneNumbers, updateResumePhoneNumbers} from "../../../../store/services/resumeServices";
import {getUUID} from "../../../../common/utils";

const Contacts = ({id, canEdit = false, onBack}) => {
  const [numbers, setNumbers] = useState([{
    id: getUUID(),
    phone_number: '',
  }]);
  const [loading, setLoading] = useState(true);

  const handleSubmit = async ({numbers}) => {
    const res = await notifyQueryResult(updateResumePhoneNumbers({
      item: id,
      phone_numbers: numbers.map(number => number.phone_number)
    }))

    if (res && res.success) {
      onBack()
    }
  }

  useEffect(() => {
    notifyQueryResult(getResumePhoneNumbers(id))
      .then(res => {
        if (res && res.success && res.data.length) {
          setNumbers(res.data)
        }
        setLoading(false)
      })
  }, [id]);

  if (loading) return <Preloader className="resume-detail-info__preloader"/>

  return (
    <ContactsForm
      onSubmit={handleSubmit}
      numbers={numbers}
      onBack={onBack}
      disabled={!canEdit}
    />
  );
};

export default Contacts;