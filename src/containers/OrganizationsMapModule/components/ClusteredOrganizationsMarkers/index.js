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
      return organizations.find((org) => {
        const loc = org.full_location;
        if (!org.is_show_on_map) return false;
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
            ?.map((org) => org.image.small)}
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

    return organizations.map((org) => {
      const location = org.full_location;
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
          onOrganizationClick && onOrganizationClick(org.id, org.full_location)
      );
    });
  }, [organizations, showAverageCheck]);

  const addOrganizationMarkers = useCallback(() => {
    const cluster = clusterRef.current;
    if (cluster) {
      const markers = createMarkers();
      cluster.addLayers(markers);
    }
  }, [createMarkers]);

  const onOrganizationClickCBRef = useRef(onOrganizationClick);

  useEffect(() => {
    createCluster();
    addOrganizationMarkers();
  }, [addOrganizationMarkers, createCluster]);

  return null;
};

ClusteredOrganizationsMarkers.propTypes = {
  organizations: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ClusteredOrganizationsMarkers;
