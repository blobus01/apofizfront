import React, { useEffect, useState } from "react";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import TextareaField from "@components/UI/TextareaField";

import "./textEdit.scss";

const TextEditModal = ({
  value,
  onClose,
  handleChange,
  name,
  onSubmit,
  second,
  title,
  placeholder,
  debugContent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsOpen(true));
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);

      if (second) {
        handleClose();
        return;
      }

      if (onSubmit) {
        await onSubmit(value);
      }

      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      onClose(false);
    }, 300);
  };

  return (
    <div className={`modal-overlay ${isOpen ? "open" : ""}`}>
      <div className="modal-content">
        <MobileTopHeader
          title={title || translate("Описание", "app.description")}
          onBack={handleClose}
          onClick={handleClose}
          onNext={handleSave}
          nextLabel={
            loading
              ? translate("Сохранение", "app.saving")
              : translate("Готово", "app.ready")
          }
          disabled={loading}
        />

     

        <div className="container containerMax" style={{ margin: "20px auto" }}>
          <TextareaField
            placeholder={
              placeholder ||
              translate(
                "В данном поле опишите подробнее",
                "resumes.workExperience.description",
              )
            }
            name={name}
            autoFocus
            value={value}
            onChange={handleChange}
            minRows={10}
            className="text-input-view__textarea"
          />
             {debugContent && (
          <pre className="text-edit-modal__debug">{debugContent}</pre>
        )}
        </div>
      </div>
    </div>
  );
};

export default TextEditModal;
