import React from 'react';
import './index.scss'

import MobileTopHeader from '@components/MobileTopHeader';
import { translate } from '@locales/locales';

import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import {
    clearCompanyInvoiceData,
    clearInvoiceData,
    clearInvoiceNumb,
    clearOwnerInvoiceData,
    setInvoiceDialog
} from "@store/actions/invoiceActions";

import Dialog from '@components/UI/Dialog/Dialog';
import { setSearchState } from '@store/actions/userActions';

const InvoicePage = () => {

    const history = useHistory();
    const { id } = useParams();
    const dispatch = useDispatch();

    const invoiceData = useSelector(state => state.invoice.invoiceData);
    const invoiceDialog = useSelector(state => state.invoice.invoiceDialogOpen);
    const pdfUrl = invoiceData?.data.invoice_pdf;
    const downloadPdf = invoiceData?.data.invoice_download

    dispatch(setSearchState(true))

    console.log(invoiceData);

    const handleDownloadAndPay = () => {
        if (!pdfUrl) return;

        dispatch(setSearchState(false));
        
        const link = document.createElement("a");
        link.href = downloadPdf;
        link.download = "";
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        dispatch(clearCompanyInvoiceData());
        dispatch(clearInvoiceData());
        dispatch(clearOwnerInvoiceData());
        dispatch(clearInvoiceNumb());
        
        setTimeout(() => {
            history.push(`/organizations/${id}/`);
            dispatch(setInvoiceDialog(true));
            dispatch(setSearchState(false))
        }, 400); // 300–500ms оптимально
    };

    console.log(pdfUrl);
    
    return (
        <div className="container" style={{ position: "relative" }}>
            <div className="invoice-page">

                <MobileTopHeader
                    onBack={() => history.goBack()}
                    title={translate("Инвойс PDF", "referral.invoice")}
                    nextLabel={translate("Информация", "app.information")}
                    onNext={() => {
                        dispatch(setInvoiceDialog(true))
                        dispatch(setSearchState(false))
                    }}
                    className="invoice-page__header"
                />

                <div className="invoice-viewer">
                    <iframe
                        src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`}
                        className="invoice-frame"
                        title="invoice"
                    />
                </div>

                <div className="invoice-footer">
                    <div className="invoice-footer__inner">
                        <button className="invoice-pay-btn" onClick={handleDownloadAndPay}>
                            {translate("Скачать и оплатить", "invoice.download")}
                        </button>
                    </div>
                </div>

                {invoiceDialog && (
                    <Dialog
                        open={invoiceDialog}
                        title={translate("Оплата инвойса", "app.paymentInvoice")}
                        description={translate(
                            "💳 Как оплатить инвойс и уведомить об оплате:\n\n" +
                            "• Оплатите инвойс по указанным реквизитам через банк.\n" +
                            "• Сохраните квитанцию или скриншот перевода.\n" +
                            '• Отправьте подтверждение (скрин/чек) на e-mail: apofizpay@gmail.com\n' +
                            '   с фразой: “Invoice number, Payment completed. Please confirm receipt.”',
                            "invoice.howPay"
                )}
                        buttons={[
                            {
                                title: translate("Ок", "common.ok"),
                                onClick: () => dispatch(setInvoiceDialog(false)),
                            }
                        ]}
                    />
                )}
            </div>
        </div>
    );
};

export default InvoicePage;
