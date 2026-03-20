import React from 'react';
import {SearchIcon} from '../Icons';
import { useIntl } from 'react-intl';
import './index.scss'

const SearchField = ({ name, value, placeholder, onSubmit, onChange, disableForm, autoComplete=false }) => {
  const intl = useIntl();

  const content = (
    <React.Fragment>
      <button type="submit" onSubmit={onSubmit} style={{width: '24px', height: '24px'}}>
        <SearchIcon />
      </button>

      {/*NOTE: Just to disable auto complete. Did not find any other solution*/}
      {!autoComplete && (
        <input autoComplete="false" name="hidden" type="text" style={{display: 'none'}}/>
      )}

      <input
        type="text"
        name={name || 'search'}
        value={value}
        onChange={onChange}
        placeholder={placeholder || intl.formatMessage({ id: 'app.search', defaultMessage: 'Поиск' })}
        className="search-field__input"
      />
    </React.Fragment>
  )

  return disableForm ? (
    <div className="search-field">
      {content}
    </div>
  ) : (
    <form className="search-field" onSubmit={onSubmit ? onSubmit : e => e.preventDefault()}>
      {content}
    </form>
  )
};

export default SearchField;