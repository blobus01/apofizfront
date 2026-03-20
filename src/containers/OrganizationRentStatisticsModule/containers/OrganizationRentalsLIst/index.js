import React from 'react';
import {getOrganizationRentals} from "../../../../store/services/organizationServices";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../../../components/Preloader";
import Notify from "../../../../components/Notification";
import {translate} from "../../../../locales/locales";
import classNames from "classnames";
import {ImageWithPlaceholder} from "../../../../components/ImageWithPlaceholder";
import {calculateDiscount, prettyFloatMoney} from "../../../../common/utils";
import {Link} from "react-router-dom";
import useInfiniteScrollQuery from "../../../../hooks/useInfiniteScrollQuery";
import "./index.scss"

const OrganizationRental = ({className, rental, to=`/organizations/${rental.organization.id}/rent/${rental.id}/statistics`}) => {
  const discountedPrice = calculateDiscount(rental.discount, rental.price)
  const currency = rental.organization.currency

  return (
    <Link to={to} className={classNames("organization-rentals-list__rental", className)}>
      <ImageWithPlaceholder
        src={rental.images[0] && rental.images[0].small}
        alt={rental.name}
        className="organization-rentals-list__rental-image"
      />
      <div className="organization-rentals-list__rental-content">
        <h3 className="organization-rentals-list__rental-name f-16 f-500 tl">
          {rental.name}
        </h3>
        {rental.subcategory?.name && (
          <p className="organization-rentals-list__rental-org f-13 tl">{rental.subcategory?.name}</p>
        )}
        <p className="organization-rentals-list__rental-price tl">
          <b>
            {rental.discount > 0 && (
              <span className="organization-rentals-list__rental-price-without-discount f-14 f-500">
                {prettyFloatMoney(rental.price, false, currency)}
              </span>
            )}
            <span className="organization-rentals-list__rental-discounted-price f-16 f-500">
              {prettyFloatMoney(rental.discount > 0 ? discountedPrice : rental.price, false, currency)}
            </span>
          </b>
        </p>
      </div>
    </Link>
  )
}

const OrganizationRentalsList = ({orgID, search, rentalLink}) => {
  const getRentals = async queryParams => {
    try {
      return await getOrganizationRentals(queryParams)
    } catch (e) {
      Notify.error({
        text: translate('Что-то пошло не так', 'app.fail')
      })
      console.error(e)
    }
  }

  const {data: rentals, next, hasMore} = useInfiniteScrollQuery(
    ({params}) => getRentals({...params, search, organization: orgID}),
    [search, orgID]
  )

  return (
    <div className="organization-rentals-list">
      <InfiniteScroll
        next={next}
        hasMore={hasMore}
        loader={<Preloader/>}
        dataLength={rentals.length}
      >
        {rentals.map(rental => (
          <OrganizationRental
            to={rentalLink?.(rental) ?? undefined}
            rental={rental}
            key={rental.id}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default OrganizationRentalsList;