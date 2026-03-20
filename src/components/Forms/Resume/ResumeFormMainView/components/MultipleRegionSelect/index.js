import React from 'react';
import classNames from "classnames";

const MultipleRegionSelect = ({regions, selected = [], onSelect}) => {
  const handleSelect = region => {
    const idx = selected.findIndex(reg => reg.id === region.id)

    if (idx === -1) {
      return onSelect([...selected, region])
    } else {
      return onSelect(selected.filter(reg => reg.id !== region.id))
    }
  }

  return (
    <div className="resume-form-main-view__multiple-region-select">
      {regions.map(region => {
        return (
          <Region
            data={region}
            selected={!!selected.find(selectedRegion => selectedRegion.id === region.id)}
            key={region.id}
            onClick={() => handleSelect(region)}
          />
        )
      })}
    </div>
  );
};

const Region = ({data, selected, onClick}) => {

  return (
    <button type="button" onClick={onClick}
            className={classNames('resume-form-main-view__multiple-region-select-option', selected && 'resume-form-main-view__multiple-region-select-option--active')}>
      <span className="resume-form-main-view__multiple-region-select-option-name">
        {data.name}
      </span>
      {data.flag && (
        <img src={'https://apofiz.com' + data.flag} alt={data.name}
             className="resume-form-main-view__multiple-region-select-option-image"/>
      )}
      {data.postal && (
        <span className="resume-form-main-view__multiple-region-select-option-postal">
          {data.postal}
        </span>
      )}
    </button>
  )
}

export default MultipleRegionSelect;