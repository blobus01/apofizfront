import React from 'react';
import MobileMenu from "../../../../components/MobileMenu";
import {translate} from "../../../../locales/locales";
import RowButton, {ROW_BUTTON_TYPES} from "../../../../components/UI/RowButton";
import {EditIcon, ResumeIcon, ShareIcon} from "../../../../components/UI/Icons";
import config from "../../../../config";
import {copyTextToClipboard} from "../../../../common/utils";
import Notify from "../../../../components/Notification";

const ResumeMenu = ({resume, onClose, onActivateResume, onHideResume, ...rest}) => {
  const isOpen = !!resume

  const shareResume = async () => {
    const shareUrl = `${config.baseURL}/resumes/${resume.id}`

    const sharePayload = {
      title: resume.name,
      text: resume.description || '',
      url: shareUrl,
    }

    copyTextToClipboard(
      shareUrl,
      () => {
        Notify.copyLinkSuccess({text: translate('Ссылка скопирована', "dialog.linkCopySuccess")})
      });

    if ('share' in navigator) {
      await navigator.share(sharePayload);
    }
    onClose()
  }

  return (
    <MobileMenu
      isOpen={isOpen}
      contentLabel={translate('Настройки', 'app.settings')}
      onRequestClose={onClose}
      {...rest}
    >
      <RowButton
        type={ROW_BUTTON_TYPES.link}
        label={translate('Редактировать', 'app.toEdit')}
        showArrow={false}
        to={resume && resume.organization.permissions.can_edit_own_resume ? `/organizations/${resume.organization.id}/resumes/${resume.id}/edit` : '#'}
      >
        <EditIcon/>
      </RowButton>

      <RowButton
        type={ROW_BUTTON_TYPES.button}
        onClick={shareResume}
        label={translate('Поделиться', 'app.share')}
        showArrow={false}
      >
        <ShareIcon/>
      </RowButton>

      {resume?.organization?.permissions?.can_edit_own_resume && (resume?.is_published ? (
        <RowButton
          type={ROW_BUTTON_TYPES.button}
          onClick={onHideResume}
          label={translate('Скрыть вакансию', 'resumes.hideVacancy')}
          showArrow={false}
          className="my-resumes__inactive-text"
        >
          <ResumeIcon className="my-resumes__inactive-icon"/>
        </RowButton>
      ) : (
        <RowButton
          type={ROW_BUTTON_TYPES.button}
          onClick={onActivateResume}
          label={translate('Активировать вакансию', 'resumes.activateVacancy')}
          showArrow={false}
          className="my-resumes__active-text"
        >
          <ResumeIcon className="my-resumes__active-icon"/>
        </RowButton>
      ))}


    </MobileMenu>
  );
};

export default ResumeMenu;