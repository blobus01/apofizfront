import React, { createRef } from 'react';
import {connect} from 'react-redux';
import {Map, TileLayer, Marker, Popup} from 'react-leaflet'
import MobileTopHeader from '../../components/MobileTopHeader';
import Button from '../../components/UI/Button';
import {translate} from '../../locales/locales';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {getClientLocation} from "../../common/utils";
import Notify from "../../components/Notification";
import {createLinkOnMap} from "../../common/helpers";
import Preloader from "../../components/Preloader";

import 'leaflet/dist/leaflet.css';
import './index.scss';


let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

class MapView extends React.Component {
  mapRef = createRef();

  constructor(props) {
    super(props);
    const {location, userGEO} = props;
    const lat = location.latitude || (userGEO ? userGEO.lat : 0)
    const lng = location.longitude || (userGEO ? userGEO.ltd : 0)
    this.state = {
      hasLocation: false,
      lat,
      lng,
      zoom: 50,
      loading: !location.latitude && !location.longitude
    }
  }
  // if lat and lng not passed, detect them. If detection failed, use userGEO prop
  async componentDidMount() {
    if (this.state.loading) {
      try {
        const location = await getClientLocation()
        const {latitude: lat, longitude: lng} = location.coords
        this.setState({
          loading: false,
          lat,
          lng
        })
      } catch (e) {
        this.setState({
          loading: false
        })
        Notify.error({text: translate('Не удалось получить доступ к местоположению.', 'notify.getClientLocationFailure')})
        console.error(e.message)
      }
    }
  }

  onMapClick = (e) => {
    e.stopPropagation();
    const {lat, lng} = this.state;
    this.props.onChange && this.props.onChange({lat, lng});
    this.props.onBack();
  }

  handleClick = (e) => {
    const map = this.mapRef.current
    if (map != null && this.props.onChange) {
     this.setState(prevState => ({...prevState, ...e.latlng}));
     map.leafletElement.locate();
    }
  }

  handleLocationFound = (e) => {
    if (!this.state.hasLocation && !this.props.location) {
      this.setState(prevState => ({
        ...prevState,
        hasLocation: true,
        ...e.latlng
      }));
    }
  }

  render() {
    const {lat, lng, zoom, loading} = this.state;
    const {buttonLabel, onClick, onBack, onChange} = this.props;
    const position = [lat, lng];
    const marker = (lat && lng) ? (
      <Marker position={position}>
        <Popup>You are here</Popup>
      </Marker>
    ) : null

    const mapLink = createLinkOnMap(this.state.lat, this.state.lng)

    return (
      <div className="map-view">
        <MobileTopHeader
          title={translate("На карте", "app.onMap")}
          onBack={onBack}
          renderRight={() => (
            <a className="map-view__map-link f-14 f-500" href={mapLink} target="_blank" rel="noreferrer">
              {translate('Открыть', 'app.open')}
            </a>
          )}
        />
        {loading ? (
          <Preloader/>
        ) : (
          <>
            <div className="map-view__map">
              <Map
                center={position}
                zoom={zoom}
                style={{width: '100%', height: '100%'}}
                onLocationfound={this.handleLocationFound}
                onClick={this.handleClick}
                ref={this.mapRef}
              >
                <TileLayer
                  attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {marker}
              </Map>
            </div>

            {onChange && (
              <div className="map-view__bottom">
                <div className="container">
                  <Button
                    onClick={onClick || this.onMapClick}
                    label={buttonLabel || translate("Отметить на карте", "org.markOnMap")}
                    className="map-view__button"
                    type="button"
                  />
                </div>
              </div>
            )}
          </>)}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  userGEO: state.commonStore.userGEO,
})

export default connect(mapStateToProps)(MapView);