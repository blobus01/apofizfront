import MobileTopHeader from '@components/MobileTopHeader';
import { translate } from '@locales/locales';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import axios from '../../axios-api';
import { CategoryOption } from '@components/CategoryOption';
import { setOwnerInvoiceData, setCompanyInvoiceData, clearCompanyInvoiceData, clearOwnerInvoiceData } from "@store/actions/invoiceActions";
import { useDispatch } from 'react-redux';


const ChoiceFromListPage = () => {
    const history = useHistory();
    const { id } = useParams();
    const location = useLocation();

    const [data, setData] = useState([]);
    const [selectedInfo, setSelectedInfo] = useState(null);

    // читаем ?info=owner / ?info=company
    const { info } = useParams();

    const dispatch = useDispatch()


    useEffect(() => {
        if (!info) return;

        const type = info === "owner" ? "owner" : "company";
        const endpoint = `/organizations/${id}/invoice/informations/?type=${type}`;

        axios.get(endpoint)
            .then(res => {
                setData(res.data);
            })
            .catch(err => {
                console.error("API error:", err);
            });

    }, [info, id]);

    // запрос данных по выбранному id
    const handleInfo = async (itemId) => {
        try {
            const res = await axios.get(`/invoice/information/${itemId}/`);

            const payload = {
                data: {
                    full_name: res.data.full_name,
                    country: res.data.country,
                    city: res.data.city,
                    address: res.data.address,
                    email: res.data.email,
                    company_name: res.data.company_name,
                    tax_id: res.data.tax_id,
                },
                organizationId: id
            };

            if (info === "owner") {
                dispatch(setOwnerInvoiceData(payload));
                dispatch(clearCompanyInvoiceData());
            } else {
                dispatch(setCompanyInvoiceData(payload));
                dispatch(clearOwnerInvoiceData());
            }

            history.goBack(); // назад на форму

        } catch (err) {
            console.error("Load info error:", err);
        }
    };

    return (
        <>
            <MobileTopHeader
                onBack={() => history.goBack()}
                title={translate("Выбрать из списка", "register.choice")}
                className="payment-form__payment-system-selection-header"
            />

            <div className='container containerMax '>
                {data.map(item => (
                    <CategoryOption
                        key={item.id}
                        label={item.full_name}
                        className="register-payment-select__option"
                        onClick={() => handleInfo(item.id)}
                    />
                ))}
            </div>
        </>
    );
};

export default ChoiceFromListPage;
