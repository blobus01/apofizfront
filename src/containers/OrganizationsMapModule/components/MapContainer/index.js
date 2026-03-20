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

const MapContainer = (props) => {
  const { onOrganizationClick, type, region, isLoading, debouncedSearch } =
    props;
  const DEFAULT_ZOOM = 17;
  const ZOOM_TO_SHOW_AVERAGE_CHECK = 14;

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

  const updateSearchParams = useCallback(
    (params) => {
      setSearchParams(params, {
        replace: true,
      });
    },
    [setSearchParams]
  );

  const getOrganizations = useCallback(async (params) => {
    const res = await notifyQueryResult(getOrganizationsOnMap(params));
    if (res && res.success) {
      setOrganizations(res.data);
    }
  }, []);

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
    void getOrganizations({ search: debouncedSearch });
  }, [getOrganizations, debouncedSearch]);

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
    const boundingBox = region?.boundingBox;
    const latitude = region?.latitude;
    const longitude = region?.longitude;
    const isPlanet = region?.isPlanet;

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
  }, [region]);

  const movedToUserOnce = useRef(false);

  useEffect(() => {
    const map = props.mapRef.current?.leafletElement;
    if (!map || !userPosition) return;

    // Если уже перемещали — выходим
    if (movedToUserOnce.current) return;

    map.setView(userPosition, 15); // или map.flyTo(userPosition, 15);
    movedToUserOnce.current = true;
    return () => {
      console.log("movedToUserOnce", movedToUserOnce.current);
    };
  }, [userPosition]);

  const goToUserPosition = useCallback(() => {
    const map = props.mapRef.current?.leafletElement;
    if (!map || !userPosition) return;

    map.setView(userPosition, 15); // можно заменить на map.flyTo(userPosition, 15) для анимации
  }, [props.mapRef, userPosition]);

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      return org.is_show_on_map && (type === null || org.types.includes(type));
    });
  }, [organizations, type]);

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
        organizations={filteredOrganizations}
        onOrganizationClick={(id, coords) =>
          props.onOrganizationClick(id, coords)
        }
        showAverageCheck={zoom >= ZOOM_TO_SHOW_AVERAGE_CHECK}
        isLoading={isLoading}
        mapRef={props.mapRef}
      />
    </>
  );
};

MapContainer.propTypes = {
  region: PropTypes.object,
  onOrganizationClick: PropTypes.func.isRequired,
  type: nullable(PropTypes.number),
  mapRef: PropTypes.object,
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
          organizations={organizations}
          onOrganizationClick={(id, coords) => onOrganizationClick(id, coords)}
          showAverageCheck={showAverageCheck}
        />
      </Map>
    );
  }
);

export default MapContainer;
