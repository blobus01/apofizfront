import React from 'react'
import {getAppDownloadLink} from '@common/utils'
import {QRCodeSVG} from 'qrcode.react'
import config from '@/config'
import {translate} from '@locales/locales'
import classNames from 'classnames'
import {Helmet} from 'react-helmet'
import classes from './index.module.scss'


const ReceiptToPrint = ({data, className}) => {
	const {
		id,
		currency,
		final_amount,
		created_at,
		organization,
		cart,
		booking,
		original_amount,
	} = data

	const formatDate = (dateString) => {
		const date = new Date(dateString)
		return date.toLocaleString('ru-RU', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		})
	}

	const appDownloadLink = getAppDownloadLink(config.domain)

	const finalSavings = data.savings + data.from_cashback

	return (
		<>
			<Helmet>
				<title></title>
			</Helmet>

			<div className={classNames(classes.receipt, className)}>
				<h1 className={classes.title}>
					{organization ? organization.title : 'Apofiz'}
				</h1>
				<p className={classes.number}>№ {id}</p>
				<p className={classes.datetime}>{translate('Дата / время', 'receipts.date')}: {formatDate(created_at)}</p>
				{organization?.address && (
					<p className={classes.address}>Адрес: {organization.address}</p>
				)}

				{!!cart?.items && cart.items.length > 0 && (
					<ul className={classes.items}>
						{cart.items.map((item) => (
							<li key={item.id} className={classes.item}>
								<span className={classes.itemName}>
									{item.count}x {item.item.name}
								</span>
								<span className={classes.itemPrice}>
									{item.item.price.toFixed(2)} {currency}
								</span>
							</li>
						))}
					</ul>
				)}

				{booking && booking.item && (
					<div className={classes.item}>
						<span className={classes.itemName}>
							{booking.item.name}
						</span>
						<span className={classes.itemPrice}>
							{original_amount.toFixed(2)} {currency}
						</span>
					</div>
				)}

				{!!finalSavings && (
					<>
						<hr className={classes.hr}/>

						<ul className={classes.items}>
							{!!data.discount_percent && (
								<li className={classes.item}>
									<span className={classes.itemName}>
										{translate('Скидка', 'receipts.discount')}
									</span>
									<span className={classes.itemPrice}>
										{data.discount_percent}%
									</span>
								</li>
							)}

							{!!data.from_cashback && (
								<li className={classes.item}>
									<span className={classes.itemName}>
										{translate('Снято с кешбэка', 'receipts.disFromCashback')}
									</span>
									<span className={classes.itemPrice}>
										{data.from_cashback.toFixed(2)} {currency}
									</span>
								</li>
							)}

							{!!data.to_cashback && (
								<li className={classes.item}>
									<span className={classes.itemName}>
										{translate('Кешбэк', 'receipts.cashback')}
									</span>
									<span className={classes.itemPrice}>
										{data.to_cashback.toFixed(2)} {currency}
									</span>
								</li>
							)}

							{!!finalSavings && (
								<li className={classes.item}>
									<span className={classes.itemName}>
										{translate('Экономия', 'receipts.savings')}
									</span>
									<span className={classes.itemPrice}>
										{finalSavings.toFixed(2)} {currency}
									</span>
								</li>
							)}
						</ul>
					</>
				)}

				<p className={classes.total}>
					<span className={classes.totalLabel}>{translate('Итого', 'receipts.total')}:
					</span>
					<span className={classes.totalAmount}>
						{final_amount.toFixed(2)} {currency}
					</span>
				</p>

				<p className={classes.thankYou}>{translate('Спасибо за покупку!', 'shop.thanksForPurchase')}</p>

				<div className={classes.qrCode}>
					<QRCodeSVG
						value={appDownloadLink}
						width={100}
						height={100}
					/>
				</div>

				<p className={classes.website}>apofiz.com</p>
			</div>
		</>
	)
}

export default ReceiptToPrint