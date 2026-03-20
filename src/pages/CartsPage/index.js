// import React, { Component } from "react";
// import * as classnames from "classnames";
// import { connect } from "react-redux";
// import MobileTopHeader from "../../components/MobileTopHeader";
// import Preloader from "../../components/Preloader";
// import RowButton, { ROW_BUTTON_TYPES } from "../../components/UI/RowButton";
// import InfiniteScroll from "react-infinite-scroll-component";
// import { getCartsList, removeCart } from "../../store/actions/cartActions";
// import CartCard from "../../components/Cards/CartCard";
// import { MarketIcon, TrashIcon } from "../../components/UI/Icons";
// import MobileMenu from "../../components/MobileMenu";
// import { canGoBack } from "../../common/helpers";
// import { translate } from "../../locales/locales";
// import EmptyData from "./empty";
// import { getAllCartsTotalCount } from "../../store/actions/shopActions";
// import DialogContext from "../../components/UI/Dialog/DialogContext";
// import Notify from "../../components/Notification";
// import "./index.scss";

// class CartsPage extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       page: 1,
//       limit: 10,
//       hasMore: true,
//       selected: null,
//     };
//   }

//   componentDidMount() {
//     this.props.getCartsList(this.state);
//     this.props.getAllCartsTotal();
//   }

//   getNext = (totalPages) => {
//     if (this.state.page < totalPages) {
//       const nextPage = this.state.page + 1;
//       this.props.getCartsList(
//         {
//           ...this.state,
//           page: nextPage,
//         },
//         true
//       );

//       return this.setState({ ...this.state, hasMore: true, page: nextPage });
//     }
//     this.setState({ ...this.state, hasMore: false });
//   };

//   removeCart = async (id) => {
//     try {
//       await this.context.dialog.confirm({
//         title: translate("Удалить корзину", "shop.deleteCart"),
//         description: translate(
//           "Если вы удалите корзину магазина, то все товары в ней будут удалены. Вы уврены?",
//           "dialog.deleteCart"
//         ),
//         confirmTitle: (
//           <span style={{ color: "#D72C20" }}>
//             {translate("Удалить", "app.delete")}
//           </span>
//         ),
//         cancelTitle: (
//           <span style={{ color: "#4285F4" }}>
//             {translate("Отмена", "app.cancellation")}
//           </span>
//         ),
//       });
//       const res = await this.props.removeCart(id);

//       if (res && res.success) {
//         this.setState((prevState) => ({
//           ...prevState,
//           selected: null,
//         }));
//         Notify.success({
//           text: translate(
//             "Корзина успешно удалена",
//             "notify.deleteCartSuccess"
//           ),
//         });
//       }
//     } catch (e) {
//       if (e && "message" in e) {
//         Notify.error({ text: e.message });
//       }
//     }
//   };

//   render() {
//     const { page, selected } = this.state;
//     const { cartsList, history } = this.props;
//     const { data, loading } = cartsList;

//     return (
//       <div className="carts-page">
//         <MobileTopHeader
//           title={translate("Корзины", "shop.carts")}
//           onBack={() =>
//             canGoBack(history) ? history.goBack() : history.push(`/profile`)
//           }
//           style={{
//             borderRadius: "0 0 16px 16px",
//             background: "rgba(255, 255 ,255 , 0.9)",
//             backdropFilter: "blur(4px)",
//           }}
//         />
//         <div
//           className="carts-page__content"
//           style={{ maxWidth: "600px", margin: "0 auto" }}
//         >
//           <div className="container">
//             {page === 1 && loading ? (
//               <Preloader />
//             ) : !data || (data && !data.total_count) ? (
//               <EmptyData />
//             ) : (
//               <InfiniteScroll
//                 dataLength={Number(data.list.length) || 0}
//                 next={() => this.getNext(data.total_pages)}
//                 hasMore={this.state.hasMore}
//                 loader={null}
//               >
//                 {data.list.map((cart) => (
//                   <CartCard
//                     key={cart.id}
//                     cart={cart}
//                     onMenuClick={(id) =>
//                       this.setState((prevState) => ({
//                         ...prevState,
//                         selected: id,
//                       }))
//                     }
//                     className="carts-page__card"
//                   />
//                 ))}
//               </InfiniteScroll>
//             )}
//           </div>
//         </div>

//         <MobileMenu
//           isOpen={!!selected}
//           contentLabel={translate("Ещё", "app.more")}
//           onRequestClose={() =>
//             this.setState((prevState) => ({ ...prevState, selected: null }))
//           }
//         >
//           <div className={classnames("carts-page__menu")}>
//             <RowButton
//               type={ROW_BUTTON_TYPES.link}
//               label={translate("Купить", "shop.buy")}
//               showArrow={false}
//               to={`/carts/${selected}?to=checkout`}
//             >
//               <MarketIcon />
//             </RowButton>

//             <RowButton
//               type={ROW_BUTTON_TYPES.button}
//               label={translate("Удалить", "app.delete")}
//               showArrow={false}
//               className="carts-page__menu-remove"
//               onClick={() => this.removeCart(selected)}
//             >
//               <TrashIcon />
//             </RowButton>
//           </div>
//         </MobileMenu>
//       </div>
//     );
//   }
// }

// CartsPage.contextType = DialogContext;

// const mapStateToProps = (state) => ({
//   cartsList: state.cartStore.cartsList,
// });

// const mapDispatchToProps = (dispatch) => ({
//   getCartsList: (params, isNext) => dispatch(getCartsList(params, isNext)),
//   removeCart: (id) => dispatch(removeCart(id)),
//   getAllCartsTotal: () => dispatch(getAllCartsTotalCount()),
// });

// export default connect(mapStateToProps, mapDispatchToProps)(CartsPage);

import React, { useState, useEffect, useContext } from "react";
import classNames, * as classnames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";

import MobileTopHeader from "../../components/MobileTopHeader";
import Preloader from "../../components/Preloader";
import RowButton, { ROW_BUTTON_TYPES } from "../../components/UI/RowButton";
import CartCard from "../../components/Cards/CartCard";
import { MarketIcon, TrashIcon } from "../../components/UI/Icons";
import MobileMenu from "../../components/MobileMenu";
import EmptyData from "./empty";

import { getCartsList, removeCart } from "../../store/actions/cartActions";
import { getAllCartsTotalCount } from "../../store/actions/shopActions";
import { canGoBack } from "../../common/helpers";
import { translate } from "../../locales/locales";
import DialogContext from "../../components/UI/Dialog/DialogContext";
import Notify from "../../components/Notification";

import "./index.scss";
import { DarkTheme, LightTheme } from "@components/MobileTopHeader/icons";
import { setDarkThemeRT } from "@store/actions/themeDark";

const CartsPage = ({ history }) => {
  const dispatch = useDispatch();

  // Достаем данные из Redux Store
  const cartsList = useSelector((state) => state.cartStore.cartsList);
  const { data, loading } = cartsList;

  // Достаем контекст диалога
  const dialogContext = useContext(DialogContext);

  // Локальный стейт
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // В классовом компоненте limit был в стейте, оставляем так же
  const [hasMore, setHasMore] = useState(true);
  const [selected, setSelected] = useState(null);

  // Аналог componentDidMount
  useEffect(() => {
    // Передаем параметры, эмулируя объект state из классового компонента,
    // так как экшн getCartsList скорее всего ожидает объект с параметрами
    dispatch(getCartsList({ page: 1, limit, hasMore: true, selected: null }));
    dispatch(getAllCartsTotalCount());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNext = (totalPages) => {
    if (page < totalPages) {
      const nextPage = page + 1;

      dispatch(
        getCartsList(
          {
            page: nextPage,
            limit,
            hasMore: true,
            selected,
          },
          true,
        ),
      );

      setPage(nextPage);
      setHasMore(true);
    } else {
      setHasMore(false);
    }
  };

  const handleRemoveCart = async (id) => {
    try {
      await dialogContext.dialog.confirm({
        title: translate("Удалить корзину", "shop.deleteCart"),
        description: translate(
          "Если вы удалите корзину магазина, то все товары в ней будут удалены. Вы уврены?",
          "dialog.deleteCart",
        ),
        confirmTitle: (
          <span style={{ color: "#D72C20" }}>
            {translate("Удалить", "app.delete")}
          </span>
        ),
        cancelTitle: (
          <span style={{ color: "#4285F4" }}>
            {translate("Отмена", "app.cancellation")}
          </span>
        ),
      });

      // Вызываем экшн удаления
      const res = await dispatch(removeCart(id));

      if (res && res.success) {
        setSelected(null);
        Notify.success({
          text: translate(
            "Корзина успешно удалена",
            "notify.deleteCartSuccess",
          ),
        });
      }
    } catch (e) {
      if (e && "message" in e) {
        Notify.error({ text: e.message });
      }
    }
  };

  // const handleBack = () => {
  //   if (canGoBack(history)) {
  //     history.goBack();
  //   }
  // };

  const darkTheme = useSelector((state) => state.theme.darkTheme);

  return (
    <div
      className={classNames("carts-page", {
        dark: darkTheme,
      })}
    >
      <MobileTopHeader
        title={translate("Корзины", "shop.carts")}
        onBack={() => history.goBack()}
        style={{
          borderRadius: "0 0 16px 16px",
          background: darkTheme ? "#090027" : "rgba(255, 255 ,255 , 0.9)",
          backdropFilter: "blur(4px)",
        }}
        darkTheme={darkTheme}
        renderRight={() => (
          <span
            style={{ marginLeft: "20px" }}
            className="theme-toggle"
            onClick={() => dispatch(setDarkThemeRT(!darkTheme))}
          >
            <div
              key={darkTheme ? "dark" : "light"}
              className="theme-toggle__icon"
            >
              {darkTheme ? <DarkTheme /> : <LightTheme />}
            </div>
          </span>
        )}
      />
      <div
        className="carts-page__content"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        <div className="container">
          {page === 1 && loading ? (
            <Preloader />
          ) : !data || (data && !data.total_count) ? (
            <EmptyData darkTheme={darkTheme} />
          ) : (
            <InfiniteScroll
              dataLength={Number(data.list.length) || 0}
              next={() => getNext(data.total_pages)}
              hasMore={hasMore}
              loader={null}
            >
              {data.list.map((cart) => (
                <CartCard
                  key={cart.id}
                  cart={cart}
                  onMenuClick={(id) => setSelected(id)}
                  className="carts-page__card"
                />
              ))}
            </InfiniteScroll>
          )}
        </div>
      </div>

      <MobileMenu
        isOpen={!!selected}
        contentLabel={translate("Ещё", "app.more")}
        onRequestClose={() => setSelected(null)}
      >
        <div className={classnames("carts-page__menu")}>
          <RowButton
            type={ROW_BUTTON_TYPES.link}
            label={translate("Купить", "shop.buy")}
            showArrow={false}
            to={`/carts/${selected}?to=checkout`}
          >
            <MarketIcon />
          </RowButton>

          <RowButton
            type={ROW_BUTTON_TYPES.button}
            label={translate("Удалить", "app.delete")}
            showArrow={false}
            className="carts-page__menu-remove"
            onClick={() => handleRemoveCart(selected)}
          >
            <TrashIcon />
          </RowButton>
        </div>
      </MobileMenu>
    </div>
  );
};

export default CartsPage;
