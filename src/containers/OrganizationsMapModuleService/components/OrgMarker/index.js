import React from 'react';
import {renderToStaticMarkup} from "react-dom/server";
import L from "leaflet";
import {Marker} from "react-leaflet";
import {prettyMoney} from "../../../../common/utils";

const OrgMarker = ({org, position: positionProp, onClick, showAverageCheck}) => {
  const iconMarkup = renderToStaticMarkup(<OrgMarkerView org={org} showAverageCheck={showAverageCheck}/>);
  const customMarker = L.divIcon({
    html: iconMarkup,
    iconSize: L.point(42, 46),
    iconAnchor: [21, 46],
    className: 'organization-map-module__marker-div-icon'
  });


  const {latitude, longitude} = org.full_location
  const position = positionProp || [latitude, longitude]

  if (position.includes(null)) return null

  return (
    <Marker position={position} icon={customMarker} onClick={onClick}>
    </Marker>
  )
}

export const OrgMarkerView = ({org, showAverageCheck = false, ...rest}) => {
  return (
    <div className="organization-map-module__org-marker" {...rest} role="button">
      <div className="organization-map-module__org-marker-image-container">
        <MarkerBorderIcon/>
        <img
          src={org.image.small}
          alt={org.title}
          loading="lazy"
          className="organization-map-module__org-marker-image"
        />
      </div>
      {org.avg_check !== null && showAverageCheck && (
        <div className="organization-map-module__org-marker-avg-check f-14 tl">
          {prettyMoney(org.avg_check).replaceAll("'", ' ')} <span className="f-500">{org.currency}</span>
        </div>
      )}
    </div>
  )
}

const MarkerBorderIcon = () => {
  return (
    <svg
      width={42}
      height={47}
      viewBox="0 0 42 47"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 1H30C36.0751 1 41 5.92487 41 12V30.2175C41 36.1725 36.1721 41 30.2171 41H28.3113C25.4307 41 22.7364 42.3092 20.9559 44.5087C18.9918 42.2942 16.1585 41 13.1531 41H11.8562C5.86092 41 1 36.1398 1 30.1447V12C1 5.92487 5.92487 1 12 1Z"
        fill="#F5F5F5"
        stroke="#E76035"
        strokeWidth={2}
      />
    </svg>

  )
}

export default OrgMarker;