import React, { useRef, useState } from "react";
import MobileMenu from "@components/MobileMenu";
import { translate } from "@locales/locales";
import COMMENT_THEMES from "@pages/CommentsPage/themes";
import DivButton from "@components/DivButton";
import classNames from "classnames";
import { ShockedIcon } from "@pages/CommentsPage/icons";
import classes from "./index.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  getComments,
  getPostCommentsRequest,
  setPostCommentsTheme,
} from "@store/actions/postActions";
import ScrollContainer from "react-indiana-drag-scroll";
import { changeCommentsTheme } from "@store/services/postServices";
import RowButton from "@components/UI/RowButton";
import { ChoiceForTheme } from "./icons";

import axios from "axios-api";
import { setViews } from "@store/actions/commonActions";
import { VIEW_TYPES } from "@components/GlobalLayer";
import useDialog from "@components/UI/Dialog/useDialog";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import {
  CLEAR_POST_COMMENTS,
  GET_POST_COMMENTS,
} from "@store/actionTypes/postTypes";
import { getChat } from "@store/services/aiServices";
import useSearchParam from "@hooks/useSearchParam";
import { notifyQueryResult } from "@common/helpers";

const ThemeMenu = ({
  onSave,
  fetchChatAndMessages,
  chatID,
  chatIdReq,
  ...props
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { confirm } = useDialog();
  const params = useParams();

  const select = async (theme) => {
    try {
      await changeCommentsTheme({
        theme_type: theme !== null ? "predefined" : "default",
        theme_id: theme !== null ? theme : null,
      });
      if (fetchChatAndMessages) fetchChatAndMessages();
    } catch (e) {
      console.error(e);
    }
    dispatch(setPostCommentsTheme(theme));
  };

  const handleAddTheme = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".png,.jpg,.jpeg";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const currentView = {
        type: VIEW_TYPES.image_theme_crop,
        onSave,
      };

      dispatch(
        setViews([
          {
            type: VIEW_TYPES.image_theme_crop,
            uploads: [file],
            onSave: async (images) => {
              if (!images?.length) {
                dispatch(setViews([]));
                return;
              }

              setLoading(true);

              try {
                const formFile = new FormData();
                formFile.append("file", images[0].original);
                formFile.append("is_watermarked", false);

                const response = await axios.post("/files/", formFile);

                const formData = new FormData();
                formData.append("theme_type", "custom");
                formData.append("image_id", response?.data?.id);

                await axios.post(
                  "/comments/change/upload_theme_image/",
                  formData,
                );

                if (chatIdReq !== null) {
                  const { data } = await axios.get(
                    `/comments/chat/${chatIdReq}/`,
                  );

                  dispatch({
                    type: GET_POST_COMMENTS.SUCCESS,
                    payload: data,
                  });
                } else {
                  dispatch(getComments(params.id, { limit: 21 }));
                }
              } catch (err) {
                confirm({
                  title: translate("Ошибка", "common.error"),
                  description: translate("Не удалось загрузить тему"),
                  confirmTitle: translate("OK", "common.ok"),
                });
              } finally {
                setLoading(false);
                dispatch(setViews([])); // ⬅️ закрываем crop
              }
            },
            onBack: () => dispatch(setViews([])),
          },
        ]),
      );
    };

    input.click();
  };

  const currentTheme = useSelector(
    (state) => state.postStore.postComments.data?.wallpapers,
  );

  return (
    <>
      <MobileMenu
        contentLabel={translate("Выбрать тему", "comment.selectTheme")}
        {...props}
      >
        <ScrollContainer>
          <div className={classes.scrollContainer} style={{ marginBottom: 20 }}>
            <DivButton
              onClick={() => select(null)}
              className={classNames(
                classes.item,
                currentTheme?.theme_id === null && classes.item_selected,
                classes.item_default,
              )}
            >
              {translate("Без темы", "comment.withoutTheme")}
              <ShockedIcon />
            </DivButton>
            {COMMENT_THEMES.map((theme) => (
              <DivButton
                style={{
                  backgroundImage: `url(${theme.url}), url(${theme.bgUrl})`,
                }}
                className={classNames(
                  classes.item,
                  currentTheme?.theme_id === theme.id && classes.item_selected,
                )}
                onClick={() => select(theme.id)}
                key={theme.id}
              >
                <div className={classes.skeleton}>
                  <div className={classes.skeletonAvatar} />
                  <div className={classes.skeletonMessage} />
                </div>

                <div className={classes.skeleton}>
                  <div className={classes.skeletonMessage} />
                  <div className={classes.skeletonAvatar} />
                </div>
                {theme.icon({ className: classes.itemIcon })}
              </DivButton>
            ))}
          </div>
        </ScrollContainer>
        <div
          className=""
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <button
            style={{
              marginBottom: 20,
              color: "#4285F4",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
            onClick={() => handleAddTheme()}
          >
            {translate("Выбрать из галереи", "choice.fromGallery")}
            <ChoiceForTheme />
          </button>
        </div>
      </MobileMenu>
    </>
  );
};

export default ThemeMenu;
