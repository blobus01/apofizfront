import React, { useState } from "react";
import "./index.scss";
import { translate } from "@locales/locales";
import Notify from "@components/Notification";
import axiosV2 from "../../axois-v2";
import { useSelector } from "react-redux";
import { setSearchState } from "@store/actions/userActions";

const AiPromptButton = ({
  show = true,
  label = "Generate",
  descType = "item_description",
  text = "",
  images = [],
  onResult = () => {},
  id
}) => {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!text && images.length === 0) {
      Notify?.error?.({ text: "Введите текст или загрузите фото" });
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();

      if (text) fd.append("text", text);

      // добавляем изображения
      if (images.length > 0) {
        images.forEach((img) => {
          const file =
            img?.original instanceof File
              ? img.original
              : img?.file instanceof File
              ? img.file
              : null;

          if (file) {
            fd.append("images", file, file.name);
          }
        });
      }

      // ⚠ axios-v2 уже имеет baseURL = https://test.apofiz.com/api/v2
      // поэтому путь пишем только начиная со /gemini
      const endpoint = `/gemini/generate/prompt?desc_type=${encodeURIComponent(
        descType
      )}&organization_id=${id}`;

      

      // ✨ axios запрос
      const res = await axiosV2.post(endpoint, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // axios сразу возвращает JSON → res.data
      const data = res.data;
      const value = data.result || data.prompt;

      if (!value) throw new Error("No result");

      onResult(value);
      setSearchState(false);
    } catch (err) {
      console.error("AXIOS ERROR:", err);
      Notify?.error?.({ text: "Ошибка генерации" });
    } finally {
      setLoading(false);
      setSearchState(false);
    }
  };

  const tariffStatus = useSelector((state) => state.tariffStatus);

  return (
    <>
      {tariffStatus?.tariff?.tariff_type !== null ? (
        <div className="ai-create__generate-btn-wrap">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={` ai-create__generate-btn-prompt ${
              show ? "visible" : "hidden"
            }`}
          >
            {loading ? (
              <>
                {translate("Генерация", "app.generation")}
                <span className="ai-create__loader"></span>
              </>
            ) : (
              label
            )}
          </button>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default AiPromptButton;
