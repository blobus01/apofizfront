import React, { useCallback, useEffect, useRef, useState } from "react";
import FullHeightContainer from "../../../../components/FullHeightContainer";
import MapContainer from "../../components/MapContainer";
import OrganizationMenu from "../../components/OrganizationMenu";
import Controls from "../../components/Controls";
import useDebounce from "../../../../hooks/useDebounce";

const MapView = ({
  region,
  isLoading,
  search,
  serviceID,
  categories,
  onCLose,
}) => {
  const [type, setType] = useState(null);
  const debouncedSearch = useDebounce(search);

  const [orgIDForMenu, setOrgIDForMenu] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    setType(null);
  }, [region]);

  const handleTypeSelect = (type) => {
    setType(type);
  };

  const openOrgMenuWithID = useCallback((id, coords) => {
    setOrgIDForMenu({ id, coords });
  }, []);

  return (
    <FullHeightContainer
      className="organization-map-module__map-view"
      includeHeader
    >
      <Controls
        region={region}
        selectedCategory={type}
        onCategorySelect={handleTypeSelect}
        categories={categories}
      />

      <MapContainer
        onOrganizationClick={openOrgMenuWithID}
        regionService={region}
        type={type}
        isLoading={isLoading}
        debouncedSearch={debouncedSearch}
        serviceID={serviceID}
        categories={categories}
        mapRef={mapRef}
      />

      <OrganizationMenu
        orgID={orgIDForMenu?.id}
        coords={orgIDForMenu?.coords}
        onClose={() => {
          setOrgIDForMenu(null);
        }}
        onCLoseView={onCLose}
        className="organization-map-module__org-menu"
        mapRef={mapRef}
      />
    </FullHeightContainer>
  );
};

export default MapView;
