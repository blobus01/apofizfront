import React, { useEffect, useState } from 'react';

import { translate } from '@locales/locales';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { useDispatch } from "react-redux";
import { setSelectedCoupon } from "@store/actions/couponActions";


import MobileTopHeader from '@components/MobileTopHeader';

import axios from 'axios-api';

import '../OrganizationCouponCreatePage/index.scss'
import OrgAvatar from '@components/UI/OrgAvatar';
import { SelectedCoupon, UnSelectCoupon } from './icons';
import Notify from '@components/Notification';


const ChoiceCouponCashbox = () => {

    const history = useHistory()
    const { id } = useParams()
    const dispatch = useDispatch()

    const [coupons, setCoupons] = useState([]);


    const [banner, setBanner] = useState({ url: "https://picsum.photos/600/300" });
    const [discountPercent, setDiscountPercent] = useState(15);
    const [endDate, setEndDate] = useState("01.01.2026");
    const [withoutEndDate, setWithoutEndDate] = useState(false);
    const [isSelectedCoupon, setIsSelectedCoupon] = useState(null);
    const [selectedCouponId, setSelectedCouponId] = useState(null);

    const handleSelectCoupon = (coupon) => {
        setIsSelectedCoupon(prev =>
            prev?.id === coupon.id ? null : coupon
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`/coupons/${id}/available/`);
                console.log("API DATA:", res);

                // когда API будет готов, распарсим так:
                // setBanner(res.data.banner)
                // setProduct(res.data.product)
                // setDiscountPercent(res.data.percent)
                // setEndDate(res.data.end_date)

            } catch (error) {
                console.log("ERROR RES", error);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = () => {
        if (!isSelectedCoupon) {
            return Notify.error({
                text: "Выберите купон"
            });
        }

        dispatch(setSelectedCoupon(isSelectedCoupon)); // сохраняем в глобальный стейт
        history.goBack(); // назад
    }

    // Post запрос Id купона после выбора купона или купонов  




    return (
        <>
            <MobileTopHeader
                title={translate("Выбор купонов", "org.choiceCoupon")}
                submitLabel={translate("Готово", "app.ready")}
                onSubmit={handleSubmit}
                onClick={handleSubmit}
                onBack={() => history.goBack()}
            />

            <div className="organization-coupon-create container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2
                    style={{
                        fontSize: '16px',
                        fontWeight: '500'
                    }}
                >
                    {translate("Купон на товар", "app.couponToProduct")}
                </h2>
                <div className="organization-coupon-create__content">
                    {coupons.map((coupon) => (
                        <div
                            key={coupon.id}
                            className="organization-coupon-create__content-wallpaper"
                            onClick={() => handleSelectCoupon(coupon)}
                            style={{
                                backgroundImage: `url(${coupon.banner})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                cursor: "pointer",
                            }}
                        >
                            <div className="organization-coupon-create__content-wallpaper-discount">
                                <span className="discount-text">{coupon.percent}%</span>
                            </div>

                            <div className="organization-coupon-create__content-wallpaper-divider" />

                            <div className="organization-coupon-create__content-wallpaper-content">

                                {/* Иконка выбора */}
                                <div className="organization-coupon-create__content-wallpaper-content-buttons">
                                    {isSelectedCoupon?.id === coupon.id ? (
                                        <button><SelectedCoupon /></button>
                                    ) : (
                                        <button><UnSelectCoupon /></button>
                                    )}
                                </div>

                                <h2 className="organization-coupon-create__content-wallpaper-content-title">
                                    {translate("app.getDiscount", "app.getDiscount")} До {coupon.endDate}
                                </h2>

                                <div className="organization-coupon-create__content-wallpaper-content-product">
                                    <OrgAvatar
                                        size={60}
                                        src={coupon.product.image}
                                        alt={coupon.product.name}
                                    />

                                    <div className="organization-coupon-create__content-wallpaper-content-product-info">
                                        <p className="organization-coupon-create__content-wallpaper-content-product-info-title">
                                            {coupon.product.name}
                                        </p>

                                        <div className="organization-coupon-create__content-wallpaper-content-product-info-price">
                                            <p className="organization-coupon-create__content-wallpaper-content-product-info-price-new">
                                                {coupon.product.discounted_price} {coupon.product.currency}
                                            </p>

                                            {coupon.product.price_old && (
                                                <p className="organization-coupon-create__content-wallpaper-content-product-info-price-old">
                                                    {coupon.product.price_old}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>


            </div>
        </>
    );
};

export default ChoiceCouponCashbox;
