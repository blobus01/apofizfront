import React, {Component} from 'react';
import {connect} from 'react-redux';
import MobileTopHeader from '@components/MobileTopHeader';
import withScroll from '@hoc/withScroll';
import StandardSelect from '@components/UI/StandardSelect';
import {PRINTER_PAPERS} from '@common/constants';
import {setPrintPaperWidth} from '@store/actions/userActions';
import {translate} from '@locales/locales';
import {canGoBack} from '@common/helpers';
import {getAppDownloadLink} from '@common/utils';
import config from '../../config'
import './index.scss';


// NOTE: These printer settings are currently ineffective.
// A new printing method works better without specifying the size.
// I have kept the size settings for potential future use, but they can be removed.
// The same goes for assets/files/Apofiz_Print_Service_Installer.zip
class PrinterSettingsPage extends Component {
  render() {
    const {history, printPaperWidth, setPrintPaperWidth} = this.props;
    const mobileAppLink = getAppDownloadLink(config.appGooglePlayURL);

    return (
      <div className="printer-settings-page">
        <MobileTopHeader
          title={translate("Настройки принтера", "printer.settings")}
          onBack={() => canGoBack(history) ? history.goBack() : history.push('/profile/edit')}
        />
        <form className="printer-settings-page__content" onSubmit={e => e.preventDefault()}>
          <div className="container">
            <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M127.5 37.5V22.5C127.5 20.5109 126.71 18.6032 125.303 17.1967C123.897 15.7902 121.989 15 120 15H52.5C50.5109 15 48.6032 15.7902 47.1967 17.1967C45.7902 18.6032 45 20.5109 45 22.5V37.5C32.595 37.5 22.5 47.595 22.5 60V135C22.5 147.405 32.595 157.5 45 157.5H127.5C139.905 157.5 150 147.405 150 135V60C150 47.595 139.905 37.5 127.5 37.5ZM60 30H112.5V67.5H60V30ZM45 52.5V75C45 76.9891 45.7902 78.8968 47.1967 80.3033C48.6032 81.7098 50.5109 82.5 52.5 82.5H120C121.989 82.5 123.897 81.7098 125.303 80.3033C126.71 78.8968 127.5 76.9891 127.5 75V52.5C131.632 52.5 135 55.8675 135 60V78.75C135 84.9525 129.952 90 123.75 90H48.75C42.5475 90 37.5 84.9525 37.5 78.75V60C37.5 55.8675 40.8675 52.5 45 52.5ZM127.5 142.5H45C40.8675 142.5 37.5 139.132 37.5 135V93.6525C40.6425 96.0375 44.5125 97.5 48.75 97.5H123.75C127.988 97.5 131.857 96.0375 135 93.6525V135C135 139.132 131.632 142.5 127.5 142.5ZM101.25 52.5H71.25C70.2554 52.5 69.3016 52.8951 68.5983 53.5984C67.8951 54.3016 67.5 55.2554 67.5 56.25C67.5 57.2446 67.8951 58.1984 68.5983 58.9016C69.3016 59.6049 70.2554 60 71.25 60H101.25C102.245 60 103.198 59.6049 103.902 58.9016C104.605 58.1984 105 57.2446 105 56.25C105 55.2554 104.605 54.3016 103.902 53.5984C103.198 52.8951 102.245 52.5 101.25 52.5ZM112.5 120H60C59.0054 120 58.0516 120.395 57.3484 121.098C56.6451 121.802 56.25 122.755 56.25 123.75C56.25 124.745 56.6451 125.698 57.3484 126.402C58.0516 127.105 59.0054 127.5 60 127.5H112.5C113.495 127.5 114.448 127.105 115.152 126.402C115.855 125.698 116.25 124.745 116.25 123.75C116.25 122.755 115.855 121.802 115.152 121.098C114.448 120.395 113.495 120 112.5 120ZM101.25 37.5H71.25C70.2554 37.5 69.3016 37.8951 68.5983 38.5984C67.8951 39.3016 67.5 40.2554 67.5 41.25C67.5 42.2446 67.8951 43.1984 68.5983 43.9016C69.3016 44.6049 70.2554 45 71.25 45H101.25C102.245 45 103.198 44.6049 103.902 43.9016C104.605 43.1984 105 42.2446 105 41.25C105 40.2554 104.605 39.3016 103.902 38.5984C103.198 37.8951 102.245 37.5 101.25 37.5Z" fill="#34A853"/>
            </svg>

            <StandardSelect
              name="paper"
              options={PRINTER_PAPERS}
              label={translate("Настройки принтера", "printer.settings")}
              value={printPaperWidth}
              disableEmptyValue={true}
              onChange={e => e.target.value && setPrintPaperWidth(e.target.value)}
              className="printer-settings-page__paper"
            />

            <a href={mobileAppLink} target="_blank" rel="noopener noreferrer"  className="printer-settings-page__download">
              {translate("Скачать приложение", "printer.downloadApp")}
            </a>
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  printPaperWidth: state.userStore.printPaperWidth,
})

const mapDispatchToProps = dispatch => ({
  setPrintPaperWidth: size => dispatch(setPrintPaperWidth(size)),
})

export default connect(mapStateToProps, mapDispatchToProps)(withScroll(PrinterSettingsPage));