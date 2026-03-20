import React, { useCallback, useEffect, useState, useRef } from "react";
import FullHeightContainer from "../../../../components/FullHeightContainer";
import MapContainer from "../../components/MapContainer";
import OrganizationMenu from "../../components/OrganizationMenu";
import Controls from "../../components/Controls";
import useDebounce from "../../../../hooks/useDebounce";

const MapView = ({ region, isLoading, search, setSearch }) => {
  const [type, setType] = useState(null);
  const debouncedSearch = useDebounce(search);

  const [orgMenuData, setOrgMenuData] = useState(null);

  const mapRef = useRef(null);

  useEffect(() => {
    setType(null);
  }, [region]);

  const handleTypeSelect = (type) => {
    setType(type);
  };

  const openOrgMenuWithID = useCallback((id, coords) => {
    setOrgMenuData({ id, coords });
  }, []);

  return (
    <FullHeightContainer
      className="organization-map-module__map-view"
      includeHeader
    >
      <Controls
        region={region}
        selectedCategory={type}
        search={search}
        setSearch={setSearch}
        onCategorySelect={handleTypeSelect}
      />

      <MapContainer
        onOrganizationClick={openOrgMenuWithID}
        region={region}
        type={type}
        isLoading={isLoading}
        debouncedSearch={debouncedSearch}
        mapRef={mapRef}
      />

      <OrganizationMenu
        orgID={orgMenuData?.id}
        coords={orgMenuData?.coords}
        mapRef={mapRef}
        onClose={() => {
          setOrgMenuData(null);
        }}
        className="organization-map-module__org-menu"
      />
    </FullHeightContainer>
  );
};

export default MapView;
