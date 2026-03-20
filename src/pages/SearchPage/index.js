import React from 'react';
import MobileSearchHeader from '../../components/MobileSearchHeader';
import OrganizationSearch from "../../components/OrganizationSearch";
import {RegionInfo} from '../../components/UI/RegionInfo';
import {translate} from '../../locales/locales';
import './index.scss';

class SearchPage extends React.Component {
  state = {
    search: ''
  };

  onSearchChange = e => {
    const { value } = e.target;

    if (value !== this.state.search) {
      this.setState({search: value});
    }
  }

  render() {
    return (
      <div className="search-page">
        <MobileSearchHeader
          onBack={() => this.props.history.push('/home/discounts')}
          defaultState={true}
          searchValue={this.state.search}
          onSearchChange={this.onSearchChange}
          onSearchCancel={() => this.props.history.push('/home/discounts')}
          title={translate('Поиск', 'app.search')}
        />

        <div className="container">
          <RegionInfo className="search-page__region" />
        </div>

        <OrganizationSearch search={this.state.search} />
      </div>
    );
  }
}

export default SearchPage;