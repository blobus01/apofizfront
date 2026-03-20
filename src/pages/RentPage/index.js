import React, {useState} from 'react';
import Rent from "../../containers/Rent";
import ProceedRentDiscount from "../../containers/ProceedRentDiscount";
import {useDispatch} from "react-redux";
import {setRentFormData} from "../../store/actions/rentActions";

const RentPage = ({match}) => {
  const dispatch = useDispatch()

  const FORMS = {
    rent: 'rent',
    discount: 'discount',
  }

  const [currentForm, setCurrentForm] = useState(FORMS.rent);

  const id = Number(match.params.id)

  switch (currentForm) {
    case FORMS.rent:
      return <Rent rentID={id} onAddClient={() => setCurrentForm(FORMS.discount)}/>
    case FORMS.discount:
      return (
        <ProceedRentDiscount
          onBack={() => setCurrentForm(FORMS.rent)}
          onSuccessSubmit={() => dispatch(setRentFormData(id, null))}
        />
      )
    default:
      return <Rent rentID={id} onAddClient={() => setCurrentForm(FORMS.discount)}/>
  }
};

export default RentPage;