import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from "prop-types";
import classNames from "classnames";
import useCallbackState from "../../hooks/useCallbackState";
import TimeItemPropTypes from "../../prop-types/TimeItem";

const CustomTimeRangePicker = ({
                                 timeItems,
                                 renderTimeItem,
                                 onChange,
                                 defaultStartItemValue,
                                 defaultEndItemValue,
                                 className
                               }) => {
  const getTimeItemByIdx = useCallback((timeItemIdx) => {
    return timeItems[timeItemIdx] ?? null
  }, [timeItems]);

  const isTimeItemSelectable = useCallback(timeItemIdx => {
    const timeItem = getTimeItemByIdx(timeItemIdx)

    return timeItem?.is_available && timeItem?.is_booked === false
  }, [getTimeItemByIdx])

  const isRangeSelectable = useCallback((startIdx, endIdx) => {
    if (startIdx === null || endIdx === null) {
      return isTimeItemSelectable(startIdx) || isTimeItemSelectable(endIdx)
    }

    for (let i = startIdx; i < endIdx + 1; i++) {
      if (!isTimeItemSelectable(i)) return false
    }

    return true
  }, [isTimeItemSelectable])

  const defaultStartItemIdx = getTimeItemIdxByValue(defaultStartItemValue)
  const defaultEndItemIdx = getTimeItemIdxByValue(defaultEndItemValue)

  const isDefaultRangeSelectable = isRangeSelectable(defaultStartItemIdx, defaultEndItemIdx)

  const [currentStartIdx, setCurrentStartIdx] = useState(isDefaultRangeSelectable ? defaultStartItemIdx : null);
  const [currentEndIdx, setCurrentEndIdx] = useState(isDefaultRangeSelectable ? defaultEndItemIdx : null);
  const [failedToSelectUnselectableItems, _setFailedToSelectUnselectableItems] = useCallbackState([]);

  const setFailedToSelectUnselectableItems = newState => {
    _setFailedToSelectUnselectableItems([], () => _setFailedToSelectUnselectableItems(newState))
  }

  function isTimeItemSelected(timeItemIdx) {
    if (currentStartIdx === null || currentEndIdx === null) {
      return [currentStartIdx, currentEndIdx].includes(timeItemIdx)
    }
    return currentStartIdx <= timeItemIdx && timeItemIdx <= currentEndIdx
  }

  const selectTimeItem = (timeItemIdx) => {
    let newFailedToSelectItems = []

    let newStartIdx
    let newEndIdx

    if (!isTimeItemSelectable(timeItemIdx)) {
      newFailedToSelectItems.push(timeItemIdx)
    } else if (currentStartIdx === null) {
      newStartIdx = timeItemIdx
    } else if (currentStartIdx === timeItemIdx) {
      newStartIdx = null
      newEndIdx = null
    } else if (currentEndIdx === timeItemIdx) {
      newEndIdx = null
    } else if (timeItemIdx < currentStartIdx) {
      if (isRangeSelectable(timeItemIdx, currentStartIdx)) {
        newStartIdx = timeItemIdx
      } else {
        const rangeFailedToSelectUnselectableItems = getUnselectableItems(timeItemIdx, currentStartIdx)
        newFailedToSelectItems.push(...rangeFailedToSelectUnselectableItems)
      }
    } else if (currentStartIdx < timeItemIdx) {
      if (isRangeSelectable(currentStartIdx, timeItemIdx)) {
        newEndIdx = timeItemIdx
      } else {
        const rangeFailedToSelectUnselectableItems = getUnselectableItems(currentStartIdx, timeItemIdx)
        newFailedToSelectItems.push(...rangeFailedToSelectUnselectableItems)
      }
    }

    if (newStartIdx !== undefined || newEndIdx !== undefined) {
      newStartIdx !== undefined && setCurrentStartIdx(newStartIdx)
      newEndIdx !== undefined && setCurrentEndIdx(newEndIdx)
      onChange(
        getTimeItemByIdx(
          newStartIdx === undefined ?
            currentStartIdx :
            newStartIdx
        ),
        getTimeItemByIdx(
          newEndIdx === undefined ?
            currentEndIdx :
            newEndIdx,
        )
      )
    }

    setFailedToSelectUnselectableItems(newFailedToSelectItems)
  }

  const getUnselectableItems = (startIdx, endIdx) => {
    const rangeUnselectableItems = []
    for (let i = startIdx; i < endIdx + 1; i++) {
      if (!isTimeItemSelectable(i)) rangeUnselectableItems.push(i)
    }
    return rangeUnselectableItems
  }

  const isItemFailedToSelect = checkingTimeItemIdx => {
    return failedToSelectUnselectableItems.find(timeItemIdx => timeItemIdx === checkingTimeItemIdx) !== undefined
  }

  function getTimeItemIdxByValue(value) {
    const idx = timeItems.findIndex(TI => TI.value === value)
    return idx !== -1 ? idx : null
  }

  useEffect(() => {
    if (
      !isRangeSelectable(currentStartIdx, currentEndIdx)
      && (currentEndIdx !== null || currentStartIdx !== null)
    ) {
      setCurrentStartIdx(null)
      setCurrentEndIdx(null)
    }
  }, [currentEndIdx, currentStartIdx, isRangeSelectable]);

  return (
    <div className={classNames('custom-time-range-picker', className)}>
      {timeItems.map((timeItem, idx) => React.cloneElement(
        renderTimeItem({
          timeItem,
          select: () => selectTimeItem(idx),
          isSelected: isTimeItemSelected(idx),
          isFailedToSelect: isItemFailedToSelect(idx),
        }),
        {
          key: timeItem.value
        })
      )}
    </div>
  );
};


CustomTimeRangePicker.propTypes = {
  timeItems: PropTypes.arrayOf(TimeItemPropTypes).isRequired,
  renderTimeItem: PropTypes.func.isRequired,
  onChange: PropTypes.func,
}

export default CustomTimeRangePicker;