import React, {useEffect, useState} from 'react';
import {CategoryOption} from "../../CategoryOption";
import {translate} from "../../../locales/locales";
import {useHistory} from "react-router-dom";
import {checkOrganizationsWithEditRight} from "../../../store/services/userServices";
import Preloader from "../../Preloader";
import UserIcon from "../../UI/Icons/UserIcon";
import BuildingsIcon from "../../UI/Icons/BuildingIcon";
import {useDispatch} from "react-redux";
import {setGlobalMenu} from "../../../store/actions/commonActions";
import {MENU_TYPES} from "../../GlobalMenu";
import "./index.scss"

const ResumeRequestMenu = ({onClose, resumeID, orgID}) => {
  const history = useHistory()
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(true);
  const [hasOrganizationsToRequestFrom, setHasOrganizationsToRequestFrom] = useState(false);

  const onRequestFromUser = () => {
    history.push(`/organizations/${orgID}/resumes/${resumeID}/requests/create`)
    onClose()
  }

  const onRequestFromOrganization = () => {
    dispatch(setGlobalMenu({
      type: MENU_TYPES.organizations_menu,
      menuLabel: translate('Ваши организации', 'app.yourOrganizations'),
      onSelect: onOrganizationSelect,
    }))
  }

  const onOrganizationSelect = selectedOrg => {
    history.push(`/organizations/${orgID}/resumes/${resumeID}/requests/create?org_from=${selectedOrg.id}`)
    dispatch(setGlobalMenu(null))
  }

  useEffect(() => {
    checkOrganizationsWithEditRight()
      .then(res => {
        if (res && res.success) {
          setHasOrganizationsToRequestFrom(res.data.has_organizations)
        }
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }, []);

  return (
    <div className="resume-request-menu">
      {loading ? (
        <Preloader/>
      ) : (
        <div className="container">
          <CategoryOption
            icon={<UserIcon/>}
            label={translate('Запрос от пользователя', 'post.requestFromUser')}
            onClick={onRequestFromUser}
            className="resume-request-menu__option"
          />

          {hasOrganizationsToRequestFrom && (
            <CategoryOption
              icon={<BuildingsIcon/>}
              label={translate('Запрос от организации', 'post.requestFromOrganization')}
              onClick={onRequestFromOrganization}
              className="resume-request-menu__option"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeRequestMenu;