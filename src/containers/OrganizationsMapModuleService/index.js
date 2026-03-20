import React, { useState } from "react";
import { translate } from "../../locales/locales";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import SearchView from "./views/SearchView";
import { LocationIcon, SocialIcon } from "../../components/UI/Icons";
import {
  setOrganizationsMapRegion,
  setViews,
} from "../../store/actions/commonActions";
import { VIEW_TYPES } from "../../components/GlobalLayer";
import { useDispatch, useSelector } from "react-redux";
import MapView from "./views/MapView";
import {
  getCountryByCountryCode,
  getGeoObjects,
} from "../../store/services/geoServices";

import "leaflet/dist/leaflet.css";
import "../HomePostsModule/index.scss";
import "./index.scss";

const OrganizationsMapModuleService = ({
  onBack,
  serviceID,
  categories,
  onCloseMap,
}) => {
  const REGION_TYPES = Object.freeze({
    countries: "countries",
    cities: "cities",
  });

  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [isRegionGeoLoading, setIsRegionGeoLoading] = useState(false);
  const views = useSelector((state) => state.commonStore.views);

  const region = useSelector(
    (state) => state.commonStore.organizationsMapRegion
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const searchInput = form.querySelector('input[name="search"]');

    if (searchInput) {
      searchInput.blur();
    }
  };

  const onRegionClick = () => {
    dispatch(
      setViews({
        type: VIEW_TYPES.region_select,
        value: region,
        onSelect: selectRegion,
      })
    );
  };

  const selectRegion = async (selectedRegion) => {
    dispatch(
      setViews(views.filter((view) => view.type !== VIEW_TYPES.region_select))
    );

    if (selectedRegion) {
      setIsRegionGeoLoading(true);

      const regionGeo = await getGeoOf(selectedRegion);
      if (regionGeo) {
        const latitude = Number(regionGeo.lat);
        const longitude = Number(regionGeo.lon);
        const boundingBox = regionGeo.boundingbox;

        dispatch(
          setOrganizationsMapRegion({
            ...selectedRegion,
            latitude,
            longitude,
            boundingBox,
          })
        );
        setIsRegionGeoLoading(false);
      }
    } else {
      dispatch(setOrganizationsMapRegion({ isPlanet: true }));
    }
  };

  const getGeoOf = async (region) => {
    const { type, name, code, country_code } = region;

    if (type === REGION_TYPES.countries) {
      return await getCountryGeo(code, name);
    } else {
      const cityGeo = await getCityGeo(name);
      if (cityGeo) {
        return cityGeo;
      } else {
        return await getCountryGeo(country_code, name);
      }
    }
  };

  const getCountryGeo = async (code, name) => {
    let country;
    try {
      const res = await getCountryByCountryCode(code);
      country = res.data?.[0];
    } catch (e) {
      console.error(e);
    }

    try {
      let countryGeo;
      if (country) {
        const countryGeoDataRes = await getGeoObjects({
          country: country.name.common,
        });
        countryGeo = countryGeoDataRes.data?.[0];
      } else if (name) {
        const countryGeoDataRes = await getGeoObjects({ country: name });
        countryGeo = countryGeoDataRes.data?.[0];
      }
      if (countryGeo) {
        return countryGeo;
      } else {
        return {
          lat: country?.latlng[0],
          lon: country?.latlng[1],
        };
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getCityGeo = async (name) => {
    const res = await getGeoObjects({ city: name });
    return res.data?.[0];
  };

  const showSearchView = !!search;

  return (
    <div className="organization-map-module">
      <MobileSearchHeader
        onSearchChange={(e) => setSearch(e.target.value)}
        onSearchSubmit={handleSearchSubmit}
        onSearchCancel={() => setSearch("")}
        defaultState={!!search}
        searchValue={search}
        onBack={() => {
          onBack();
          onCloseMap();
        }}
        renderHeader={() => (
          <div
            className="home-posts-module-header__region"
            onClick={onRegionClick}
          >
            {region ? (
              <img
                src={"https://apofiz.com" + region.flag}
                className="home-posts-module-header__region-location"
              />
            ) : (
              <SocialIcon />
            )}
            <p className="home-posts-module-header__region-title f-16 f-600 tl">
              {region?.name ?? translate("Планета Земля", "app.planetEarth")}
            </p>
            <svg
              className="home-posts-module-header__region-arrow"
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.45442 0.691051C1.06285 0.384877 0.497225 0.454099 0.19105 0.845663C-0.115124 1.23723 -0.0459015 1.80286 0.345663 2.10903L4.4423 5.3123C4.76791 5.5669 5.22507 5.56699 5.55078 5.31252L9.65074 2.10925C10.0424 1.80323 10.1119 1.23763 9.80585 0.845942C9.49983 0.454257 8.93423 0.384813 8.54255 0.690833L4.99691 3.46101L1.45442 0.691051Z"
                fill="#4285F4"
              />
            </svg>
          </div>
        )}
      />
      <MapView
        region={region}
        search={search}
        serviceID={serviceID}
        isLoading={isRegionGeoLoading}
        categories={categories}
        onCLose={onBack}
      />
      {/* {showSearchView ? (
        <SearchView search={search} />
      ) : (
        <MapView
          region={region}
          search={search}
          isLoading={isRegionGeoLoading}
        />
      )} */}
    </div>
  );
};

export default OrganizationsMapModuleService;
