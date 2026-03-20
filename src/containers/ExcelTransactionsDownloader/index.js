import {useState} from 'react';
import PropTypes from "prop-types";
import {downloadFile} from "../../common/utils";
import Notify from "../../components/Notification";
import {translate} from "../../locales/locales";

const ExcelTransactionsDownloader = ({onDownload, onError, fileName, render}) => {
  const FALLBACK_FILE_NAME = 'transactions.xlsx'

  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      const res = await onDownload()

      if (!res.data) {
        throw new Error('There\'s no "data" in response')
      }

      if (!res.data.blob) {
        throw new Error('There\'s no "blob" in response.data')
      }

      downloadFile(
        res.data.blob,
        fileName ?? res.data.serverFileName ?? FALLBACK_FILE_NAME
      )
    } catch (e) {
      onError ?
        onError(e) :
        Notify.error({
          text: translate('Не удалось скачать файл', 'notify.downloadFileFailure')
        })
      setError(e.message)
      console.error(e)
    } finally {
      setIsDownloading(false)
    }
  }

  return render({
    download: handleDownload,
    isDownloading,
    error
  })
};

ExcelTransactionsDownloader.propTypes = {
  render: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  fileName: PropTypes.string
}

export default ExcelTransactionsDownloader;