import React, {useCallback, useEffect, useState, memo, useRef} from 'react';
import RowButton, {ROW_BUTTON_TYPES} from "../UI/RowButton";
import {LocationIcon} from "../UI/Icons";
import {setViews} from "../../store/actions/commonActions";
import {VIEW_TYPES} from "../GlobalLayer";
import {getLocationByCoords} from "../../store/services/geoServices";
import {translate} from "../../locales/locales";
import {useDispatch} from "react-redux";
import PropTypes from "prop-types";
import {nullable} from "../../common/helpers";
import './index.scss'

const LocationSelector = ({
                            location,
                            onLocationChange,
                            defaultLocationName = translate("Указать на карте", "org.markOnMap"),
                            fallbackLocationName = translate('Показать на карте', 'app.showOnMap'),
                            render,
                            ...rest
                          }) => {
  const dispatch = useDispatch()
  const [locationName, setLocationName] = useState(defaultLocationName);
  const prevLocation = useRef(null)

  const fetchLocationName = useCallback(async location => {
      try {
        const res = await getLocationByCoords(location.latitude, location.longitude)
        if (res && res.success) {
          setLocationName(res.data.display_name)
        }

      } catch (e) {
        setLocationName(fallbackLocationName)
        console.error(e)
      }
    }
    , [fallbackLocationName]);

  const openMap = (props = {}) => dispatch(setViews({
    type: VIEW_TYPES.map,
    onChange: onLocationChange,
    location: location ? location : {latitude: null, longitude: null},
    ...props
  }))

  useEffect(() => {
    const prevLatitude = prevLocation.current?.latitude
    const prevLongitude = prevLocation.current?.longitude

    if (location && location.latitude !== prevLatitude && location.longitude !== prevLongitude) {
      void fetchLocationName(location)
    }
    prevLocation.current = location
  }, [fetchLocationName, location]);

  if (render) {
    return render(location, locationName, openMap)
  }

  return (
    <RowButton
      type={ROW_BUTTON_TYPES.button}
      label={
        <>
          {locationName}
          <LocationIcon style={{minWidth: 24}}/>
        </>
      }
      className="location-selector__map-button"
      onClick={() => openMap()}
      showArrow={false}
      {...rest}
    />
  );
};

LocationSelector.propTypes = {
  location: nullable(PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  })),
  onLocationChange: PropTypes.func,
  render: PropTypes.func,
}

export default memo(LocationSelector);