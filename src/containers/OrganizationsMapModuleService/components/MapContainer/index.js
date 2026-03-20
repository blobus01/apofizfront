import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { notifyQueryResult, nullable } from "../../../../common/helpers";
import { getOrganizationsOnMap } from "../../../../store/services/organizationServices";
import { Map, Marker, TileLayer } from "react-leaflet";
import useSearchParams from "../../../../hooks/useSearchParams";
import { useDispatch, useSelector } from "react-redux";
import { debounce, getClientLocation } from "../../../../common/utils";
import Notify from "../../../../components/Notification";
import { translate } from "../../../../locales/locales";
import { getUserLocation } from "../../../../store/actions/userActions";
import Preloader from "../../../../components/Preloader";
import { useHistory } from "react-router-dom";
import ClusteredOrganizationsMarkers from "../ClusteredOrganizationsMarkers";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import { connect } from "react-redux";
import {
  getServiceCategories,
  getServiceOrganizations,
} from "../../../../store/actions/commonActions";
import moment from "moment";
import {
  DATE_FORMAT_YYYY_MM_DD,
  DEFAULT_LIMIT,
  TIME_FORMAT_HH_MM,
} from "../../../../common/constants";
import Button from "@components/UI/Button";

const MapContainer = (props) => {
  const {
    onOrganizationClick,
    type,
    region,
    regionService,
    isLoading,
    debouncedSearch,
    serviceID,
    getServiceOrganizations,
    getServiceCategories,
    categories,
  } = props;
  const DEFAULT_ZOOM = 17;
  const ZOOM_TO_SHOW_AVERAGE_CHECK = 18;
  const { serviceOrganizations, serviceCategories } = useSelector(
    (state) => state.commonStore
  );

  const dispatch = useDispatch();
  const history = useHistory();

  const userLocationFromStore = useSelector(
    (state) => state.userStore.userLocation
  );

  const [searchParams, setSearchParams] = useSearchParams({
    latitude: userLocationFromStore?.lat,
    longitude: userLocationFromStore?.lon,
    zoom: DEFAULT_ZOOM,
  });

  const params = useMemo(() => {
    const { latitude, longitude, zoom } = searchParams;
    return {
      latitude,
      longitude,
      zoom: Math.ceil(Number(zoom)),
    };
  }, [searchParams]);

  const { latitude, longitude, zoom } = params;
  const hasLocation = !!(
    latitude &&
    longitude &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  );

  const [organizations, setOrganizations] = useState([]);
  const [mapCenter, setMapCenter] = useState(
    hasLocation ? [latitude, longitude] : null
  );
  const [userPosition, setUserPosition] = useState(
    userLocationFromStore
      ? [userLocationFromStore.lat, userLocationFromStore.lon]
      : null
  );

  const [loading, setLoading] = useState(!hasLocation);
  const initialZoom = useRef(zoom);
  const isFirstMount = useRef(true);
  const userPositionRef = useRef(userPosition);

  const ref = useRef(null);

  // Add state for service data
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);
  const [country, setCountry] = useState(
    region && (region.country_code || region.code)
  );
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");

  const updateSearchParams = useCallback(
    (params) => {
      setSearchParams(params, {
        replace: true,
      });
    },
    [setSearchParams]
  );

  // Add service data fetching functions
  const getServiceItems = useCallback(
    (isNext, extraParams = {}) => {
      const params = {
        country,
        current_timestamp_lt: `${moment().format(
          DATE_FORMAT_YYYY_MM_DD
        )}T${moment().format(TIME_FORMAT_HH_MM)}:00`,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(type ? { subcategory: type } : {}),
        ...extraParams,
      };

      getServiceOrganizations(serviceID, params, isNext);
    },
    [
      page,
      limit,
      country,
      debouncedSearch,
      serviceID,
      getServiceOrganizations,
      type,
    ]
  );

  const getNextServiceItems = useCallback(
    (totalPages) => {
      if (page < totalPages) {
        const nextPage = page + 1;
        setPage(nextPage);
        getServiceItems(true, { page: nextPage });
      } else {
        setHasMore(false);
      }
    },
    [page, getServiceItems]
  );

  const onServiceCategorySelect = useCallback(
    (category) => {
      setPage(1);
      setSelectedCategory(category);
      getServiceItems(false, { subcategory: category && category.id });
    },
    [getServiceItems]
  );

  // Add useEffect for initial data loading
  useEffect(() => {
    if (serviceID) {
      getServiceItems(false);
      getServiceCategories(serviceID, { country });
    }
  }, [serviceID, country, getServiceItems, getServiceCategories]);

  const getApproximateLocation = useCallback(
    async (notifyError = true) => {
      const res = await dispatch(getUserLocation(true));
      if (!res) {
        notifyError &&
          Notify.error({
            text: translate(
              "Не удалось определить ваше местоположение.",
              "notify.failedToDetectLocation"
            ),
          });
        return null;
      } else {
        return [res.lat, res.lon];
      }
    },
    [dispatch]
  );

  const getLocation = useCallback(
    async (notifyError = true) => {
      try {
        const location = await getClientLocation();
        const { latitude, longitude } = location.coords;
        return [latitude, longitude];
      } catch (e) {
        if (e.code === 1) {
          notifyError &&
            Notify.error({
              text: translate(
                "Не удалось определить ваше точное местоположение. Убедитесь, что сайту предоставлено разрешение к вашему местоположению.",
                "notify.failedToDetectExactLocationCheckPermissions"
              ),
            });
        } else {
          notifyError &&
            Notify.error({
              text: translate(
                "Не удалось определить ваше точное местоположение.",
                "notify.failedToDetectExactLocation"
              ),
            });
        }
        return await getApproximateLocation(notifyError);
      }
    },
    [getApproximateLocation]
  );

  const handleMapUpdate = useMemo(
    () =>
      debounce((e) => {
        const target = e.target;
        const { lat: latitude, lng: longitude } = target.getCenter() ?? {};
        const zoom = target.getZoom();

        updateSearchParams((prevParams) => ({
          latitude: latitude ?? prevParams.latitude,
          longitude: longitude ?? prevParams.longitude,
          zoom: Math.ceil(zoom),
        }));
      }, 250),
    [updateSearchParams]
  );

  const updateUserLocation = useCallback(() => {
    getLocation(false).then((location) => {
      if (location) {
        setUserPosition(location);
      }
    });
  }, [getLocation]);

  useEffect(() => {
    userPositionRef.current = userPosition;
  }, [userPosition]);

  useEffect(() => {
    !hasLocation &&
      getLocation()
        .then((location) => {
          if (location) {
            setMapCenter(location);
            updateSearchParams({
              latitude: location[0],
              longitude: location[1],
            });
          } else {
            history.goBack();
          }
        })
        .finally(() => setLoading(false));
  }, [getLocation, hasLocation, history, updateSearchParams]);

  useEffect(() => {
    const interval = setInterval(updateUserLocation, 3000);
    return () => {
      clearInterval(interval);
    };
  }, [updateUserLocation]);

  useEffect(() => {
    const cleanupCallback = () => {
      isFirstMount.current = false;
    };

    if (isFirstMount.current) return cleanupCallback;

    const map = props.mapRef.current?.leafletElement;
    const boundingBox = regionService?.boundingBox;
    const latitude = regionService?.latitude;
    const longitude = regionService?.longitude;
    const isPlanet = regionService?.isPlanet;

    if (!map) return cleanupCallback;

    if (boundingBox?.length) {
      const bounds = [
        [boundingBox[0], boundingBox[2]],
        [boundingBox[1], boundingBox[3]],
      ];

      map.fitBounds(bounds, { padding: [20, 20], maxzoom: 15 });
    } else if (latitude && longitude) {
      map.setView([latitude, longitude], 8);
    } else if (isPlanet) {
      map.setView(userPositionRef.current, 15);
    }

    return cleanupCallback;
  }, [regionService]);

  const movedToUserOnce = useRef(false);

  useEffect(() => {
    const map = props.mapRef.current?.leafletElement;
    if (!map || !userPosition) return;

    // Если уже перемещали — выходим
    if (movedToUserOnce.current) return;

    map.setView(userPosition, 15); // или map.flyTo(userPosition, 15);
    movedToUserOnce.current = true;
  }, [userPosition]);

  const goToUserPosition = useCallback(() => {
    const map = props.mapRef.current?.leafletElement;
    if (!map || !userPosition) return;

    map.setView(userPosition, 15); // можно заменить на map.flyTo(userPosition, 15) для анимации
  }, [props.mapRef, userPosition]);

  if (loading || !mapCenter) return <Preloader style={{ marginTop: 70 }} />;

  return (
    <>
      {isLoading && <Preloader className="organization-map-module__loader" />}
      <button
        className="organization-map-module__user-location-button"
        onClick={goToUserPosition}
        disabled={!userPosition}
        style={{
          fontSize: "19px",
          lineHeight: "24px",
          fontWeight: 400,
          wordWrap: "break-word",
          position: "absolute",
          background: "#ffffff",
          height: "50px",
          width: "50px",
          cursor: "pointer",
          color: "#262626",
          borderBottom: "1px solid #e6e6e6",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          border: "1px solid #e6e6e6",
          zIndex: 1000,
          bottom: 80,
          right: 20,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="38"
          height="38"
          viewBox="0 0 32 32"
        >
          <path
            fill="rgb(0, 122, 255)"
            d="M17.89 26.27l-2.7-9.46-9.46-2.7 18.92-6.76zm-5.62-12.38l4.54 1.3 1.3 4.54 3.24-9.08z"
          ></path>
        </svg>
      </button>
      <MapComponent
        center={mapCenter}
        zoom={initialZoom.current}
        onZoomEnd={handleMapUpdate}
        onMoveEnd={handleMapUpdate}
        userPosition={userPosition}
        organizations={serviceOrganizations?.data || []}
        onOrganizationClick={(id, coords) => onOrganizationClick(id, coords)}
        showAverageCheck={zoom >= ZOOM_TO_SHOW_AVERAGE_CHECK}
        isLoading={isLoading}
        mapRef={props.mapRef}
        categories={serviceCategories.data || categories}
      />
    </>
  );
};

MapContainer.propTypes = {
  region: PropTypes.object,
  onOrganizationClick: PropTypes.func.isRequired,
  type: nullable(PropTypes.number),
  serviceID: PropTypes.string,
  getServiceOrganizations: PropTypes.func.isRequired,
  getServiceCategories: PropTypes.func.isRequired,
  serviceOrganizations: PropTypes.object,
  serviceCategories: PropTypes.object,
};

let defaultMarkerIcon = L.icon({
  iconUrl: icon,
  iconSize: L.point(18, 26),
  iconAnchor: [9, 26],
  className: "organization-map-module__user-location-icon",
});

const MapComponent = memo(
  ({
    organizations,
    onOrganizationClick,
    showAverageCheck,
    userPosition,
    mapRef,
    ...rest
  }) => {
    const organizationsList =
      organizations?.data?.list ||
      organizations.data ||
      organizations.list ||
      organizations ||
      [];

    return (
      <Map
        scrollWheelZoom
        zoomControl={false}
        ref={mapRef}
        className="organization-map-module__map"
        {...rest}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userPosition && (
          <Marker position={userPosition} icon={defaultMarkerIcon} />
        )}
        <ClusteredOrganizationsMarkers
          organizations={organizationsList?.filter(
            (org) =>
              org.full_location &&
              typeof org.full_location.latitude === "number" &&
              typeof org.full_location.longitude === "number"
          )}
          onOrganizationClick={(id, coords) => onOrganizationClick(id, coords)}
          showAverageCheck={showAverageCheck}
        />
      </Map>
    );
  }
);

const mapStateToProps = (state) => ({
  serviceOrganizations: state.commonStore.serviceOrganizations,
  serviceCategories: state.commonStore.serviceCategories,
  region: state.userStore.region,
});

const mapDispatchToProps = {
  getServiceOrganizations,
  getServiceCategories,
};

export default connect(mapStateToProps, mapDispatchToProps)(MapContainer);
