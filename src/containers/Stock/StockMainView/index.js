import React from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import IconProductsCount from "../../../assets/icons/icon_products_count.svg";
import IconProductRelations from "../../../assets/icons/icon_product_relations.svg";

import classNames from "classnames";
import { useSelector } from "react-redux";
import { CategoryOption } from "../../../components/CategoryOption";
import MobileTopHeader from "../../../components/MobileTopHeader";
import Preloader from "../../../components/Preloader";
import { InfoTitle } from "../../../components/UI/InfoTitle";
import { translate } from "../../../locales/locales";
import {
  deleteStockDetail,
  getStockDetail,
} from "../../../store/actions/stockActions";
import Button from "../../../components/UI/Button";
import useDialog from "../../../components/UI/Dialog/useDialog";
import Skeleton from "../../../components/UI/Skeleton";

import "./index.scss";

function StockMainView({ onBack, onSubmit, open, productID, mode, className }) {
  const dispatch = useDispatch();
  const { confirm } = useDialog();

  useEffect(() => {
    dispatch(getStockDetail(productID));
  }, [dispatch, productID]);

  const { data: stockDetail, loading } = useSelector(
    (state) => state.stockStore.stockDetail
  );

  const deleteStock = async () => {
    try {
      await confirm({
        title: translate("Отменить склад", "stock.deleteStock"),
        description: (
          <>
            {translate(
              "Если  отменить склад, все количество товаров и связей будут удаленны, это не отразится на товаре",
              "stock.deleteStockModalDesc"
            )}
            <br />
            {translate("Вы уверены", "app.areYouSure") + "?"}
          </>
        ),
        confirmTitle: translate("Да", "app.yes"),
        cancelTitle: translate("Нет", "app.no"),
      });
      const res = await dispatch(deleteStockDetail(productID));
      if (res?.success) {
        dispatch(getStockDetail(productID));
      }
    } catch (error) {}
  };

  const isStockEmpty = Boolean(
    stockDetail &&
      !stockDetail?.available_sizes.length &&
      stockDetail.collection_items_quantity === 0 &&
      !stockDetail.item_quantity
  );

  return (
    <>
      <MobileTopHeader
        title={translate("Склад", "stock.stock")}
        onBack={onBack}
        onNext={onSubmit}
        nextLabel={translate("Готово", "app.done")}
        className="stock-main-view__header"
      />
      <div className={classNames("stock-main-view", className)}>
        <div className="container">
          {stockDetail && !loading ? (
            <>
              <InfoTitle
                title={translate("Примечание:", "printer.note")}
                className="stock-main-view__info-title"
              />
              <p className="stock-main-view__desc">
                <i>
                  {translate(
                    "Добавление и создание товаров на складе не является обязательным. Хорошо увеличивает доходность и контроль за товарами.",
                    "stock.note"
                  )}
                </i>
              </p>

              {stockDetail?.criteria_subcategory && (
                <CategoryOption
                  label={stockDetail.criteria_subcategory.name}
                  icon={stockDetail.criteria_subcategory.icon}
                  description={stockDetail.available_sizes
                    .map((size) => size.size)
                    .join(", ")}
                  onClick={() => open("format")}
                  descPosition="underLabel"
                  className="stock-main-view__category-option"
                />
              )}
              <CategoryOption
                label={translate(
                  "Добавить связи с товаром",
                  "stock.addConnections"
                )}
                icon={{ file: IconProductRelations }}
                description={
                  stockDetail.collection_items_quantity
                    ? translate(
                        "Добавлено связей на товары: ",
                        "stock.relationsAdded",
                        { count: stockDetail.collection_items_quantity }
                      )
                    : undefined
                }
                descPosition="underLabel"
                onClick={() => open("relationships-selection")}
                className="stock-main-view__category-option"
              />
              <CategoryOption
                label={translate(
                  "Количество на складе",
                  "stock.quantityInStock"
                )}
                icon={{ file: IconProductsCount }}
                descPosition="underLabel"
                description={
                  stockDetail.item_quantity
                    ? translate("Есть товар", "stock.hasProducts")
                    : undefined
                }
                className="stock-main-view__category-option"
                onClick={() => open("productNumber")}
              />

              {mode === "editing" && !isStockEmpty && (
                <Button
                  onClick={deleteStock}
                  label={translate(
                    "Не использовать склад",
                    "stock.dontUseStock"
                  )}
                  className="stock-main-view__delete-btn button-danger"
                />
              )}
            </>
          ) : (
            <>
              <Skeleton height={10} marginBottom={9} width="28%" />
              <Skeleton height={10} marginBottom={7} />
              <Skeleton height={10} marginBottom={7} />
              <Skeleton height={10} marginBottom={14} />

              <Skeleton height={52} marginBottom={10} borderRadius="80px" />
              <Skeleton height={52} marginBottom={10} borderRadius="80px" />
              <Skeleton height={52} borderRadius="80px" />
            </>
          )}
        </div>
      </div>
    </>
  );
}

StockMainView.propTypes = {
  onBack: PropTypes.func,
  onSubmit: PropTypes.func,
  viewerBag: PropTypes.shape({
    open: PropTypes.func,
    viewProps: PropTypes.shape({}),
  }),
  mode: PropTypes.oneOf(["creation", "editing"]),
  className: PropTypes.string,
};

StockMainView.defaultProps = {
  mode: "creation",
};

export default StockMainView;
