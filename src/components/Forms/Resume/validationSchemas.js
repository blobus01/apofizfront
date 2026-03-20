import * as Yup from "yup";
import {translate} from "../../../locales/locales";

const baseSchema = Yup.object().shape({
  title: Yup.string().required(translate('Укажите название', 'app.specifyName')),
  currency: Yup
    .string()
    .nullable()
    .required(translate('Это поле обязательное', 'app.fieldRequired')),
  salaryFrom: Yup.number()
    .integer(translate('Число должно быть целочисленным', 'hint.integer'))
    .positive(translate('Число должно быть целочисленным', 'hint.integer'))
    .required(translate('Это поле обязательное', 'app.fieldRequired')),
  salaryTo: Yup.number()
    .integer(translate('Число должно быть целочисленным', 'hint.integer'))
    .positive(translate('Число должно быть целочисленным', 'hint.integer'))
    .when('salaryFrom', (salaryFrom, field) => {
      if (!salaryFrom) return field

      return Yup.number()
        .integer(translate('Число должно быть целочисленным', 'hint.integer'))
        .positive(translate('Число должно быть целочисленным', 'hint.integer'))
        .min(salaryFrom, translate('Неверное значение', 'hint.wrongValue'))
    })
})

export const creationSchema = baseSchema.concat(Yup.object().shape({
  images: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.string().required(),
        original: Yup.string().required(translate('Отсутствует файл', 'app.missingFile')),
      })
    )
    .required(translate('Это поле обязательное', 'app.fieldRequired')),
}))

export const editSchema = baseSchema.concat(Yup.object().shape({
  videos: Yup.array(),
  images: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.string().required(),
      })
    )
    .when('videos', {
      is: videos => videos.length === 0,
      then: Yup.array().required(translate('Отсутствует файл', 'app.missingFile')),
    }),
}))