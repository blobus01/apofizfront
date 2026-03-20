import React from 'react';
import MobileTopHeader from '../../components/MobileTopHeader';
import {connect} from 'react-redux';
import {getCurrencies} from '../../store/actions/commonActions';
import CurrencyCard from '../../components/Cards/CurrencyCard';
import Preloader from '../../components/Preloader';
import {translate} from '../../locales/locales';
import './index.scss';

class CurrencyView extends React.Component {
  componentDidMount() {
    this.props.getCurrencies();
  }

  render() {
    const {data, loading} = this.props.currency;
    const {onBack, title, onChange, currentCode, selected = []} = this.props;

    return (
      <div className="currency-view">
        <MobileTopHeader
          onBack={onBack}
          title={title}
        />
        <div className="container">
          {!data && loading && <Preloader/>}
          {data && data.map(country => <CurrencyCard
            key={country.code}
            country={country}
            onClick={() => {
              onChange(country);
              onBack()
            }}
            selected={selected.includes(country.code) ||
              (currentCode && currentCode === country.currency.code)}
          />)}
        </div>
      </div>
    )
  }
}

CurrencyView.defaultProps = {
  title: translate("Выбрать валюту", "org.selectCurrency")
}

const mapStateToProps = state => ({
  currency: state.commonStore.currency
});

const mapDispatchToProps = dispatch => ({
  getCurrencies: () => dispatch(getCurrencies())
});

export default connect(mapStateToProps, mapDispatchToProps)(CurrencyView);