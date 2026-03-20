import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { FieldArray, Formik } from "formik";
import { shallowEqual, useDispatch, useSelector } from "react-redux"; // Используем хук вместо connect
import MobileTopHeader from "../../MobileTopHeader";
import { InputTextField } from "../../UI/InputTextField";
import { setViews } from "../../../store/actions/commonActions";
import { ALLOWED_FORMATS } from "../../../common/constants";
import { VIEW_TYPES } from "../../GlobalLayer";
import Button from "../../UI/Button";
import { getRandom, POST_LINK_REGEX } from "../../../common/helpers";
import { translate } from "../../../locales/locales";
import { ButtonWithDescription } from "../../UI/ButtonWithDescription";
import CollectionItems from "../../../containers/HotlinkCollections/products";
import CollectionSubcategories from "../../../containers/HotlinkCollections/subcategories";
import "./index.scss";
import { FilterIcon, SearchIcon } from "@components/UI/Icons";
import CategoryFilterPost from "@components/CategoryFilterPost/CategoryFilterPost";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios-api";
import classNames from "classnames";

const getValidationSchema = Yup.object().shape({
  file: Yup.object().required(" "),
  link: Yup.string().required(" "),
  links: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      url: Yup.string().matches(POST_LINK_REGEX, " "),
    }),
  ),
});

const ORDERING_OPTIONS = [
  { value: null, label: "Новое", translation: "shop.new" },
  { value: "-price", label: "Дороже", translation: "shop.expensive" },
  { value: "price", label: "Дешевле", translation: "shop.cheaper" },
];

const HotlinkCollectionForm = ({ orgID, data, onBack, onRemove, onSubmit }) => {
  const dispatch = useDispatch();

  const [searchValue, setSearchValue] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState();

  const [filters, setFilters] = useState({
    categories: [], // массив
    ordering: null,
  });

  const handleImageUpload = (e, formikBag) => {
    const { values, setValues } = formikBag;
    const image = e.target.files[0];

    if (image && ALLOWED_FORMATS.includes(image.type)) {
      dispatch(
        setViews({
          type: VIEW_TYPES.image_crop,
          onBack: () => dispatch(setViews([])),
          onSave: (images) => {
            setValues({ ...values, file: images[0] });
            dispatch(setViews([]));
          },
          uploads: [image],
        }),
      );
    }
  };

  // Подготовка начальных значений вынесена в переменную для чистоты кода
  const initialValues = {
    file: data ? data.image : null,
    link: data ? data.content : "",
    links:
      data && data.collection_links && !!data.collection_links.length
        ? data.collection_links.map((url, idx) => ({ id: idx, url }))
        : [{ id: getRandom(400, 999), url: "" }],
    selectedItems:
      data && data.collection_items
        ? data.collection_items.reduce((acc, id) => {
            acc[id] = true;
            return acc;
          }, {})
        : {},
    selectedSubcategories:
      data && data.collection_subcategories
        ? data.collection_subcategories.reduce((acc, id) => {
            acc[id] = true;
            return acc;
          }, {})
        : {},
    step: 0,
    decription: data ? data?.decription : "",
  };

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get(
          `/organizations/${orgID}/collection_subcategories/?page=1&limit=100`,
        );
        setCategories(res.data.list ?? []);
      } catch (err) {
        console.error("Ошибка загрузки категорий:", err);
      }
    };
    loadCategories();
  }, [orgID]);
  return (
    <Formik
      validationSchema={getValidationSchema}
      onSubmit={onSubmit}
      initialValues={initialValues}
    >
      {(formikBag) => {
        const {
          values,
          errors,
          touched,
          isSubmitting,
          setFieldValue,
          setValues,
          handleChange,
          handleSubmit,
        } = formikBag;

        return (
          <form onSubmit={handleSubmit} className="hotlink-collection-form">
            {values.step === 0 && (
              <>
                <MobileTopHeader
                  title={translate("Быстрая ссылка", "hotlink.hotlink")}
                  onSubmit={data && handleSubmit}
                  submitLabel={
                    isSubmitting
                      ? translate("Сохранение", "app.saving")
                      : translate("Сохранить", "app.save")
                  }
                  disabled={isSubmitting}
                  onBack={onBack}
                />
                <div className="hotlink-collection-form__content">
                  <div className="hotlink-collection-form__main">
                    <div className="container">
                      {values.file ? (
                        <div className="hotlink-collection-form__preview">
                          <div className="hotlink-collection-form__preview-image">
                            <img
                              src={
                                values.file && values.file.id
                                  ? values.file.file
                                  : values.file
                              }
                              alt="Preview"
                            />
                          </div>
                          <label
                            htmlFor="image"
                            className="hotlink-collection-form__preview-label"
                          >
                            {translate("Изменить", "app.change")}
                          </label>
                        </div>
                      ) : (
                        <label
                          htmlFor="image"
                          className="hotlink-collection-form__image-label"
                        >
                          <div className="hotlink-collection-form__image-content">
                            <svg
                              width="48"
                              height="48"
                              viewBox="0 0 48 48"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M8 10H34V24H38V10C38 7.794 36.206 6 34 6H8C5.794 6 4 7.794 4 10V34C4 36.206 5.794 38 8 38H24V34H8V10Z"
                                fill="#818C99"
                              />
                              <path
                                d="M16 22L10 30H32L24 18L18 26L16 22Z"
                                fill="#818C99"
                              />
                              <path
                                d="M38 28H34V34H28V38H34V44H38V38H44V34H38V28Z"
                                fill="#818C99"
                              />
                            </svg>
                            <p
                              className={classNames(
                                "f-14 f-400",
                                !values.file && "hotlink-required",
                              )}
                            >
                              {translate(
                                "Загрузить изображение",
                                "app.uploadImage",
                              )}
                            </p>
                            <p className="f-14 f-400">
                              {translate(
                                "Рекомендуемый размер 4*5",
                                "app.recommendedSize45",
                              )}
                            </p>
                          </div>
                        </label>
                      )}

                      <input
                        id="image"
                        name="image"
                        type="file"
                        onChange={(e) => handleImageUpload(e, formikBag)}
                        className="hotlink-collection-form__image-input"
                      />

                      <InputTextField
                        name="link"
                        onChange={handleChange}
                        value={values.link}
                        label={translate(
                          "Название подборки",
                          "hotlink.hotlinkName",
                        )}
                        className={classNames(
                          "hotlink-collection-form__input",
                          !values.link && "is-empty",
                        )}
                        error={errors.link && touched.link && errors.link}
                      />
                      <div className="hotlink-collection-form__textarea-wrap">
                        <textarea
                          name="decription"
                          value={values.decription || ""}
                          onChange={handleChange}
                          maxLength={1000}
                          placeholder="Описание подборки"
                          className="hotlink-collection-form__input-desc"
                        />

                        <div className="hotlink-collection-form__counter">
                          {values?.decription?.length} / 1000
                        </div>
                      </div>

                      {/* Оставил лог, как в оригинале, для отладки, можно удалить если не нужен */}
                      {console.log("ButtonWithDescription props", {
                        label: translate(
                          "Добавить из товаров",
                          "hotlink.addItems",
                        ),
                        valuesCount: Object.keys(values.selectedItems).length,
                      })}

                      <div className="hotlink-collection-form__menu">
                        <ButtonWithDescription
                          label={translate(
                            "Добавить из товаров",
                            "hotlink.addItems",
                          )}
                          description={
                            !!Object.keys(values.selectedItems).length &&
                            translate(
                              "Добавлено несколько товаров",
                              "hotlink.addItemsCount",
                              {
                                count: Object.keys(values.selectedItems).filter(
                                  (key) => values.selectedItems[key],
                                ).length,
                              },
                            )
                          }
                          onClick={() => setFieldValue("step", 1)}
                        />
                        <ButtonWithDescription
                          label={translate(
                            "Добавить ссылку на товар",
                            "hotlink.addLinks",
                          )}
                          description={
                            !!values.links.filter(
                              (urlObject) => !!urlObject.url,
                            ).length &&
                            translate(
                              "Добавлено несколько ссылок на товар",
                              "hotlink.addLinksCount",
                              {
                                count: values.links.filter(
                                  (urlObject) => !!urlObject.url,
                                ).length,
                              },
                            )
                          }
                          onClick={() => setFieldValue("step", 2)}
                        />
                        <ButtonWithDescription
                          label={translate(
                            "Добавить категорию",
                            "hotlink.addCategory",
                          )}
                          description={
                            !!Object.keys(values.selectedSubcategories)
                              .length &&
                            translate(
                              "Добавлено несколько категорий",
                              "hotlink.addCategoryCount",
                              {
                                count: Object.keys(
                                  values.selectedSubcategories,
                                ).filter(
                                  (key) => values.selectedSubcategories[key],
                                ).length,
                              },
                            )
                          }
                          onClick={() => setFieldValue("step", 3)}
                        />
                      </div>

                      <div className="hotlink-collection-form__note">
                        <b>{translate("Примечание:", "printer.note")}</b>{" "}
                        <i>
                          {translate(
                            "Добавляйте ваши товаровы, категории или ссылки на товары из apofiz.com",
                            "hotlink.collectionNote",
                          )}
                        </i>
                      </div>
                    </div>

                    <div className="container">
                      {data ? (
                        <Button
                          type="button"
                          label={translate("Удалить", "app.delete")}
                          onClick={onRemove}
                          className="hotlink-collection-form__delete button-danger"
                        />
                      ) : (
                        <Button
                          type="submit"
                          label={translate("Создать", "app.create")}
                          onSubmit={handleSubmit}
                          disabled={
                            isSubmitting || !values.file || !values.link
                          }
                          className="hotlink-collection-form__submit"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {values.step === 1 && (
              <>
                {isSearchOpen && (
                  <div className="posts-view__search-overlay">
                    <div className="posts-view__search-wrapper">
                      <div className="posts-view__search-wrapper-input">
                        <SearchIcon />
                        <input
                          type="text"
                          placeholder="Поиск..."
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <button
                        type="button"
                        style={{ color: "#007aff", fontSize: "14px" }}
                        onClick={() => {
                          setSearchValue("");
                          setIsSearchOpen(false);
                        }}
                      >
                        {translate("Закрыть", "app.close")}
                      </button>
                    </div>
                  </div>
                )}
                <MobileTopHeader
                  title={translate(
                    "Выбрать из товаров",
                    "hotlink.chooseFromItems",
                  )}
                  renderRight={() => (
                    <div className="post-header__buttons">
                      <button
                        onClick={() => setIsSearchOpen(true)}
                        type="button"
                      >
                        <SearchIcon />
                      </button>
                      <button
                        onClick={() => setIsFilterOpen(true)}
                        type="button"
                        style={{
                          display: "flex",
                          color: "#007AFF",
                          alignItems: "center",
                          position: "relative",
                        }}
                      >
                        <FilterIcon />
                      </button>
                    </div>
                  )}
                  onBack={() => setFieldValue("step", 0)}
                  onNext={() => setFieldValue("step", 0)}
                  nextLabel={translate("Сохранить", "app.save")}
                />

                {isFilterOpen && (
                  <CategoryFilterPost
                    categoryList={categories}
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    filters={filters}
                    setFilters={setFilters}
                    onApply={() => setIsFilterOpen(false)}
                    orderingOptions={ORDERING_OPTIONS}
                  />
                )}

                <CollectionItems
                  orgID={orgID}
                  categories={categories}
                  setIsFilterOpen={setIsFilterOpen}
                  formikBag={formikBag}
                  searchValue={searchValue}
                  setFilters={setFilters}
                  selectedSubcategory={filters.categories}
                  ordering={filters.ordering}
                />
              </>
            )}

            {values.step === 2 && (
              <>
                <MobileTopHeader
                  title={translate("Ссылки на товары", "hotlink.linkToItems")}
                  onBack={() =>
                    setValues({
                      ...values,
                      step: 0,
                      links:
                        data &&
                        data.collection_links &&
                        !!data.collection_links.length
                          ? data.collection_links.map((url, idx) => ({
                              id: idx,
                              url,
                            }))
                          : [{ id: getRandom(400, 999), url: "" }],
                    })
                  }
                  onNext={() => {
                    !errors.links && setFieldValue("step", 0);
                  }}
                  nextLabel={translate("Сохранить", "app.save")}
                  className={errors.links && "disabled"}
                />

                <div className="hotlink-collection-form__content">
                  <div className="container">
                    <FieldArray
                      name="links"
                      render={(arrayHelpers) => (
                        <React.Fragment>
                          {values.links &&
                            values.links.length > 0 &&
                            values.links.map((soc, index) => (
                              <InputTextField
                                key={soc.id}
                                name={`links[${index}].id`}
                                label={translate(
                                  "Ссылка на товар",
                                  "hotlink.linkToItem",
                                )}
                                value={soc.url}
                                onChange={(e) =>
                                  setFieldValue(
                                    `links[${index}].url`,
                                    e.target.value,
                                  )
                                }
                                onRemove={() => arrayHelpers.remove(index)}
                                error={
                                  errors.links &&
                                  errors.links[index] &&
                                  errors.links[index].url
                                }
                                className="hotlink-collection-form__url-input"
                              />
                            ))}
                          <button
                            className="hotlink-collection-form__url-add f-14"
                            type="button"
                            onClick={() =>
                              arrayHelpers.push({
                                id: getRandom(400, 999),
                                url: "",
                              })
                            }
                          >
                            {translate(
                              "Добавить дополнительную ссылку",
                              "org.addExtraLink",
                            )}
                          </button>
                        </React.Fragment>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            {values.step === 3 && (
              <>
                <MobileTopHeader
                  title={translate("Выбор категории", "hotlink.chooseCategory")}
                  onBack={() => setFieldValue("step", 0)}
                  onNext={() => setFieldValue("step", 0)}
                  nextLabel={translate("Сохранить", "app.save")}
                />

                <div className="hotlink-collection-form__content">
                  <div className="container">
                    <CollectionSubcategories
                      orgID={orgID}
                      formikBag={formikBag}
                    />
                  </div>
                </div>
              </>
            )}
          </form>
        );
      }}
    </Formik>
  );
};

export default HotlinkCollectionForm;
