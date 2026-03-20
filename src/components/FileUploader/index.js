import React, {useState} from 'react';
import PropTypes from "prop-types";
import classNames from "classnames";
import {translate} from "@locales/locales";
import Truncate from "react-truncate";
import {TrashIcon} from "@ui/Icons";
import DownloadIcon from "./icons/DownloadIcon";
import {getFileExtension, notifyQueryResult} from "@common/helpers";
import {getFile} from "@store/services/commonServices";
import PdfIcon from "./icons/PdfIcon";
import ExcelIcon from "./icons/ExcelIcon";
import WordIcon from "./icons/WordIcon";
import ImageIcon from "./icons/ImageIcon";
import PlusIcon from "./icons/PlusIcon";
import Loader from "@ui/Loader";

import "./index.scss"

export const DEFAULT_ACCEPTABLE_FORMATS = [
  {
    name: 'PDF',
    extensions: ['pdf'],
    icon: <PdfIcon/>
  },
  {
    name: 'XLS',
    extensions: [
      'xls',
      'xlt',
      'xlm',
      'xll_',
      'xla_',
      'xla5',
      'xla8',
      'xlsx',
      'xlsm',
      'xltx',
      'xltm',
      'xlsb',
      'xla',
      'xlam',
      'xll',
      'xlw',
    ],
    icon: <ExcelIcon/>
  },
  {
    name: 'DOC',
    extensions: ['doc', 'dot', 'wbk', 'docx', 'docm', 'dotx', 'dotm', 'docb', 'wll', 'wwl'],
    icon: <WordIcon/>,
  },
  {
    name: 'JPG',
    extensions: ['jpg', 'jpeg'],
    icon: <ImageIcon/>
  },
  {
    name: 'PNG',
    extensions: ['png'],
    icon: <ImageIcon/>
  },
  {
    name: 'BMP',
    extensions: ['bmp', 'dib', 'rle'],
    icon: <ImageIcon/>
  },
]

const FileUploader = ({
                        disabled = false,
                        onChange,
                        onFileDelete,
                        acceptableFormats,
                        value,
                        className,
                        ...rest
                      }) => {
  const [loadingFiles, setLoadingFiles] = useState([]);

  const downloadFile = async file => {
    if (loadingFiles.includes(file.name)) return

    setLoadingFiles(prevState => [...prevState, file.name])

    const res = await notifyQueryResult(getFile({file_url: file.file}), {
      errorMsg: translate('Не удалось скачать файл', 'notify.downloadFileFailure')
    })
    if (res && res.success) {
      const base64File = res.data.base64_image
      const a = document.createElement('a')
      a.href = 'data:image/png;base64,' + base64File
      a.download = file.name
      a.click()
    }

    setLoadingFiles(prevState => prevState.filter(fileName => fileName !== file.name))
  }

  return (
    <div className={classNames('file-uploader', className)}>
      <Input
        acceptableFormats={acceptableFormats}
        disabled={disabled}
        onChange={e => onChange(Array.from(e.target.files))}
        {...rest}
      />
      <FileList
        files={value}
        generateProps={(file) => {
          const format = acceptableFormats.find(format => format.extensions.includes(getFileExtension(file.name?.toLowerCase() ?? '')))
          return {
            renderIcon: format?.icon ? () => format?.icon : undefined,
            name: file.name,
            typeName: format?.name,
            href: file.file,
            onDownload: disabled ? () => downloadFile(file) : null,
            onDelete: disabled || !onFileDelete ? null : () => onFileDelete(file.name),
            loading: loadingFiles.includes(file.name)
          }
        }}
      />
    </div>
  );
};

FileUploader.defaultProps = {
  acceptableFormats: DEFAULT_ACCEPTABLE_FORMATS
}

FileUploader.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.array,
  acceptableFormats: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    extensions: PropTypes.arrayOf(PropTypes.string).isRequired,
    icon: PropTypes.element
  })).isRequired
}

const Input = ({id: idProp, name, allowedFormatsNames = [], className, disabled, acceptableFormats, ...rest}) => {
  const id = idProp ?? name
  const accept = acceptableFormats
    .reduce((arr, {extensions}) => arr.concat(extensions), [])
    .map(extension => '.' + extension)

  return (
    <div className={classNames('file-uploader__input', disabled && 'file-uploader__input--disabled', className)}>
      <div>
        <label htmlFor={id} className="file-uploader__input-label file-uploader__icon-container dfc justify-center">
          <PlusIcon/>
        </label>
      </div>

      <label htmlFor={id} className="file-uploader__input-label file-uploader__input-right">
        <span className="file-uploader__description-text f-14">
          {translate('Формат', 'app.format')}: {acceptableFormats.map(format => format.name).join(', ')}
        </span>
        <br/>

        <span className="file-uploader__light-text f-17">
          {translate('Прикрепите файл', 'app.attachFile')}
        </span>
      </label>

      <input id={id} name={name} type="file" className="file-uploader__input-element" multiple {...rest}
             disabled={disabled} accept={accept}/>
    </div>
  );
};

const FileList = ({files, generateProps}) => {
  return (
    <div className="file-uploader__file-list">
      {files.map((file, idx) => {
        const props = typeof generateProps === 'function' ? generateProps(file, idx) : {}
        return <File {...props} key={file.name}/>
      })}
    </div>
  );
};

const File = ({name, typeName, href, loading, renderIcon, onDelete, onDownload}) => {
  return (
    <div className="file-uploader__file-list-item">
      {renderIcon && (
        <div className="file-uploader__file-list-item-left">
          <div className="file-uploader__icon-container">
            {renderIcon()}
          </div>
        </div>
      )}

      <div className="file-uploader__file-list-item-content">
        <p className="file-uploader__description-text f-14">{typeName}</p>
        <a href={href} onClick={e => !href && e.preventDefault()}
           className="file-uploader__file-list-item__link file-uploader__light-text f-17">
          <Truncate lines={2} ellipsis="...">
            {name}
          </Truncate>
        </a>
      </div>

      <div className="file-uploader__file-list-item-controls">
        {onDelete && (
          <button type="button" onClick={onDelete}>
            <TrashIcon/>
          </button>
        )}
        {onDownload && !loading && (
          <button type="button" onClick={onDownload}>
            <DownloadIcon/>
          </button>
        )}
        {loading && (
          <Loader/>
        )}
      </div>
    </div>
  )
}


export default FileUploader;