import React, { useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import { useLeaflet } from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { OrgMarkerView } from "../OrgMarker";
import ClusterMarker from "../ClusterMarker";

import "leaflet.markercluster/dist/leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const ClusteredOrganizationsMarkers = ({
  organizations,
  showAverageCheck,
  onOrganizationClick,
}) => {
  const { map } = useLeaflet();
  const clusterRef = useRef(null);

  const getOrganizationByCoords = useCallback(
    (coords) => {
      return organizations?.find((org) => {
        const loc = org.full_location || {
          latitude: org.latitude,
          longitude: org.longitude,
        };
        return loc.latitude === coords.lat && loc.longitude === coords.lng;
      });
    },
    [organizations]
  );

  const getOrganizationsFromMarkers = useCallback(
    (markers) => {
      const foundOrganizations = [];

      markers.forEach((marker) => {
        const coords = marker.getLatLng();
        const org = getOrganizationByCoords(coords);
        if (org) {
          foundOrganizations.push(org);
        }
      });
      return foundOrganizations;
    },
    [getOrganizationByCoords]
  );

  const createClusterIcon = useCallback(
    (cluster) => {
      const childCount = cluster.getChildCount();
      const markers = cluster.getAllChildMarkers();
      const clusterOrganizations = getOrganizationsFromMarkers(markers);

      const iconMarkup = renderToStaticMarkup(
        <ClusterMarker
          images={clusterOrganizations
            ?.slice(0, 3)
            ?.map((org) => org.image?.small || org.image?.file)}
          count={childCount}
        />
      );

      return L.divIcon({
        html: iconMarkup,
        iconSize: L.point(42, 46),
        iconAnchor: [21, 46],
        className: "organization-map-module__marker-div-icon",
      });
    },
    [getOrganizationsFromMarkers]
  );

  const createCluster = useCallback(() => {
    const currentCluster = clusterRef.current;
    if (!map) return;
    if (currentCluster) {
      map.removeLayer(currentCluster);
    }

    const newCluster = L.markerClusterGroup({
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      chunkedLoading: true,
      iconCreateFunction: createClusterIcon,
      disableClusteringAtZoom: 18,
    });

    clusterRef.current = newCluster;
    map.addLayer(newCluster);
  }, [createClusterIcon, map]);

  const createMarkers = useCallback(() => {
    const onOrganizationClick = onOrganizationClickCBRef.current;

    return organizations
      ?.map((org) => {
        const location = org.full_location || {
          latitude: org.latitude,
          longitude: org.longitude,
        };
        if (!location || !location.latitude || !location.longitude) return null;

        const iconMarkup = renderToStaticMarkup(
          <OrgMarkerView org={org} showAverageCheck={showAverageCheck} />
        );
        const customMarker = L.divIcon({
          html: iconMarkup,
          iconSize: L.point(42, 46),
          iconAnchor: [21, 46],
          className: "organization-map-module__marker-div-icon",
        });
        return L.marker(new L.LatLng(location.latitude, location.longitude), {
          icon: customMarker,
        }).on(
          "click",
          () =>
            onOrganizationClick &&
            onOrganizationClick(org.id, org.full_location)
        );
      })
      .filter(Boolean);
  }, [organizations, showAverageCheck]);

  const addOrganizationMarkers = useCallback(() => {
    const cluster = clusterRef.current;
    if (cluster) {
      const markers = createMarkers();
      cluster.addLayers(markers);
    }
  }, [createMarkers]);

  const onOrganizationClickCBRef = useRef(onOrganizationClick);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    createCluster();
    addOrganizationMarkers();

    return () => {
      isMounted.current = false;
      const cluster = clusterRef.current;
      if (cluster && map) {
        map.removeLayer(cluster);
      }
    };
  }, [addOrganizationMarkers, createCluster, map]);

  return null;
};

ClusteredOrganizationsMarkers.propTypes = {
  organizations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      full_location: PropTypes.shape({
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
      }),
      latitude: PropTypes.number,
      longitude: PropTypes.number,
      image: PropTypes.shape({
        small: PropTypes.string,
        file: PropTypes.string,
        medium: PropTypes.string,
        large: PropTypes.string,
      }),
      avg_check: PropTypes.number,
      currency: PropTypes.string,
      opens_at: PropTypes.string,
      closes_at: PropTypes.string,
      time_working: PropTypes.string,
      types: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number,
          title: PropTypes.string,
        })
      ),
      verification_status: PropTypes.string,
    })
  ).isRequired,
  showAverageCheck: PropTypes.bool,
  onOrganizationClick: PropTypes.func,
};

export default ClusteredOrganizationsMarkers;
