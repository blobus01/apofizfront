import React from "react";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import { useFormikContext } from "formik";
import BorderedCheckbox from "../../../../components/BorderedCheckbox";
import { SEARCH_PARAMS } from "../../../../constants";
import classNames from "classnames";
import CategoryList from "../../../CategoryList";
import SubcategoryList from "../../../SubcategoryList";
import { prettyFloatMoney } from "@common/utils";
import { DEFAULT_FILTERS, ORDERING_OPTIONS } from "../../constants";
import borderedCheckboxClasses from "../../../../components/BorderedCheckbox/index.module.scss";
import GenderSelect from "@ui/GenderSelect";
import { isDeepEqual } from "../../helpers";
import WideButton, { WIDE_BUTTON_VARIANTS } from "@ui//WideButton";
import { title } from "../../index.module.scss";
import classes from "./index.module.scss";
import { FilterIcon } from "@components/UI/Icons";

const Main = ({ onClose, onCategorySelect, onSalaryOpen }) => {
  const { values, handleChange, setFieldValue, setValues } = useFormikContext();
  const salaryFrom = values[SEARCH_PARAMS.salary_from],
    salaryTo = values[SEARCH_PARAMS.salary_to],
    ordering = values[SEARCH_PARAMS.ordering];

  const isSalarySpecified = !!salaryFrom || !!salaryTo;
  const isSalaryFilterSpecified =
    isSalarySpecified || ordering !== ORDERING_OPTIONS.fresh.value;

  const { category, ...filters } = values;
  const canReset = !isDeepEqual(filters, DEFAULT_FILTERS);

  const handleReset = () => {
    setValues({
      ...values,
      ...DEFAULT_FILTERS,
    });
  };

  return (
    <>
      <MobileTopHeader
        onBack={onClose}
        title={translate("Фильтры", "shop.filters")}
        renderRight={() =>
          canReset && (
            <div>
              <button
                type="button"
                className={classes.errorText}
                onClick={handleReset}
              >
                <span>{translate("Очистить", "app.clear")}</span>
              </button>

            
            </div>
          )
        }
      />
      <div className="container">
        <GenderSelect
          value={values[SEARCH_PARAMS.gender]}
          onChange={(gender) => setFieldValue(SEARCH_PARAMS.gender, gender)}
          className={classes.gender}
        />

        <h3 className={classNames(title, classes.rootTitle)}>
          {translate("Фильтры по данным", "shop.filtersByData")}
        </h3>

        <div className={classes.checkboxes}>
          <BorderedCheckbox
            label={translate("Есть стаж работы", "resumes.hasWorkExperience")}
            name={SEARCH_PARAMS.has_work_experience}
            value={values[SEARCH_PARAMS.has_work_experience]}
            onChange={handleChange}
            className={classes.checkbox}
          />
          <BorderedCheckbox
            label={translate(
              "Есть стаж образования",
              "resumes.hasEducationExperience",
            )}
            name={SEARCH_PARAMS.has_education}
            value={values[SEARCH_PARAMS.has_education]}
            onChange={handleChange}
            className={classes.checkbox}
          />
          <button
            type="button"
            className={classNames(
              borderedCheckboxClasses.root,
              classes.checkbox,
              classes.checkboxButton,
              isSalaryFilterSpecified && classes.checkboxButtonChecked,
              isSalaryFilterSpecified && borderedCheckboxClasses.rootChecked,
            )}
            onClick={onSalaryOpen}
            style={{
              width: "100%",
              padding:
                isSalaryFilterSpecified && !isSalarySpecified ? "0.6em" : null,
            }}
          >
            {isSalaryFilterSpecified ? (
              <>
                {isSalarySpecified && (
                  <>
                    <span className="f-500">
                      {salaryTo &&
                        salaryFrom &&
                        `${prettyFloatMoney(salaryFrom)} - ${prettyFloatMoney(salaryTo)}`}
                      {!salaryTo &&
                        salaryFrom &&
                        `${translate("От", "app.from").toLowerCase()} ${prettyFloatMoney(salaryFrom)}`}
                      {salaryTo &&
                        !salaryFrom &&
                        translate("до {to}", "app.upTo", {
                          to: prettyFloatMoney(salaryTo),
                        }).toLowerCase()}
                    </span>
                    <br />
                  </>
                )}
                <span className={isSalarySpecified ? "f-12" : "f-16"}>
                  {
                    Object.values(ORDERING_OPTIONS).find(
                      (opt) => opt.value === ordering,
                    )?.label
                  }
                </span>
              </>
            ) : (
              <span>
                {translate("Выбор зарплаты", "resumes.salarySelection")}
              </span>
            )}
          </button>
        </div>

        {values[SEARCH_PARAMS.category] ? (
          <>
            <h3 className={classNames(title, classes.rootTitle)}>
              {translate(
                "Фильтры по подвидам вакансий",
                "resumes.filtersByVacanciesSubtypes",
              )}
            </h3>
            <SubcategoryList style={{ marginBottom: "1.5rem" }} />
          </>
        ) : (
          <>
            <h3 className={classNames(title, classes.rootTitle)}>
              {translate(
                "Фильтры по видам вакансий",
                "resumes.filtersByVacancies",
              )}
            </h3>
            <CategoryList
              selectedSubcategories={values[SEARCH_PARAMS.subcategories]}
              onSelect={onCategorySelect}
              style={{ marginBottom: "1.5rem" }}
            />
          </>
        )}

        <div className={classNames(classes.fixedControls)}>
          <WideButton type="submit" variant={WIDE_BUTTON_VARIANTS.ACCEPT}>
            {translate("Показать", "app.show")}
          </WideButton>
        </div>
      </div>
    </>
  );
};

export default Main;
