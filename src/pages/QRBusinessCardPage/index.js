import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {canGoBack, getUrlExtension, removeObjectsWithDuplicateProperty} from "../../common/helpers";
import {getPhoneNumbers, getSocials} from "../../store/actions/profileActions";
import AnimatedQr from "../../components/Animated/AnimatedQr";
import {QRCodeSVG} from "qrcode.react";
import {translate} from "../../locales/locales";
import {ContainedCloseIcon, ShareIcon} from "../../components/UI/Icons";
import {downloadFile} from "../../common/utils";
import vCardsJS from "vcards-js";
import {getImageByURL} from "../../store/services/commonServices";
import {Link} from "react-router-dom";
import locationIcon from './location.png'
import "./index.scss"

const QRBusinessCardPage = ({history, user}) => {
  const PHONE_NUMBERS_MAX_NUM_IN_QR = 3
  const SOCIAL_NETWORKS_MAX_NUM_IN_QR = 3

  const dispatch = useDispatch()
  const [isInitialAnimationCompleted, setIsInitialAnimationCompleted] = useState(false);
  const [isLoadingVCardImage, setIsLoadingVCardImage] = useState(false);

  const phoneNumbers = useSelector(state => state.profileStore.phoneNumbers.data)
  const socialNetworks = useSelector(state => state.profileStore.socialNetworks.data)

  const onBusinessCardQRClose = () => {
    canGoBack(history) ? history.goBack() : history.push(`/profile`)
  }

  const getAdditionalUserData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(getPhoneNumbers()),
        dispatch(getSocials())
      ])
    } catch (e) {
      console.error(e)
    }
  }, [dispatch])

  const getPhonesInVCardFormat = phoneNumbers => {
    let resultString = ''

    if (phoneNumbers && phoneNumbers.length > 0) {
      removeObjectsWithDuplicateProperty(phoneNumbers, 'phone_number').forEach((phoneNumber, idx) => {
        const lastIdx = phoneNumber.length - 1
        resultString += `TEL;TYPE=WORK:${phoneNumber.phone_number}` + (idx !== lastIdx ? '\n' : '')
      })
    }
    return resultString
  }

  const getSocialNetworksInVCardFormat = socialNetworks => {
    let resultString = ''

    if (socialNetworks && socialNetworks.length > 0) {
      removeObjectsWithDuplicateProperty(socialNetworks, 'url')
        .forEach((socialNetwork, idx) => {
          const lastIdx = socialNetworks.length - 1
          resultString += `item${idx + 1}.URL:${socialNetwork.url}\n` +
            `item${idx + 1}.X-ABLabel:_$!<HomePage>!$_` +
            (idx !== lastIdx ? '\n' : '')
        })
    }
    return resultString
  }

  const getVCard = async () => {
    const vCard = vCardsJS();

    // receiving org image in base 64
    try {
      if (user.avatar && user.avatar.medium) {
        setIsLoadingVCardImage(true)
        const res = await getImageByURL(user.avatar.medium)

        const imageType = getUrlExtension(user.avatar.medium)

        vCard.photo.embedFromString(res.data.base64_image, imageType);
        vCard.logo.embedFromString(res.data.base64_image, imageType);
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingVCardImage(false)
    }

    vCard.firstName = user.full_name
    vCard.workPhone = phoneNumbers ? phoneNumbers.map(PH => PH.phone_number) : null
    vCard.email = user.email
    vCard.url = socialNetworks?.map(SN => SN.url)
    return vCard
  }

  const handleShare = async () => {
    if (isLoadingVCardImage) return
    const vCard = await getVCard()
    const blob = new Blob([vCard.getFormattedString()], {type: 'text/vcard'})
    downloadFile(blob, user.full_name)
  }

  useEffect(() => {
    void getAdditionalUserData()

    adjustHeight()
  }, [getAdditionalUserData]);

  const adjustHeight = () => {
    let vh = window.innerHeight * 0.01;
    document.querySelector(':root').style
      .setProperty('--vh', `${vh}px`);
  }

  const QRCodeValues = [
    `FN:${user.full_name}`,
    user.email ? `EMAIL:${user.email}` : null,
    getPhonesInVCardFormat(phoneNumbers?.slice(0, PHONE_NUMBERS_MAX_NUM_IN_QR)),
    getSocialNetworksInVCardFormat(socialNetworks?.slice(0, SOCIAL_NETWORKS_MAX_NUM_IN_QR)),
  ].filter(val => !!val)

  const formattedQRCodeValues = "BEGIN:VCARD\nVERSION:3.0+\n" + QRCodeValues.join('\n') + '\nEND:VCARD'

  return (
    <div className="qr-business-card-page">
      <div className="container qr-business-card-page__container">
        <div className="qr-business-card-page__content">
          <div className="qr-business-card-page__avatar" style={{backgroundImage: `url(${user.avatar && user.avatar.large})`}}>
          </div>

          <div className="qr-business-card-page__info">
            <div className="qr-business-card-page__header dfc">
              <button type="button" onClick={onBusinessCardQRClose} className="qr-business-card-page__btn-close">
                <ContainedCloseIcon/>
              </button>
              <h2 className="qr-business-card-page__user-fullname">{user.full_name}</h2>
              <button type="button" onClick={handleShare} className="qr-business-card-page__btn-share">
                <ShareIcon style={{width: 24, height: 24}} />
              </button>
              <Link to="/delivery-addresses/" className="qr-business-card-page__link">
                <img
                  src={locationIcon}
                  alt="location"
                />
              </Link>
            </div>
            <div className="qr-business-card-page__info-container">
              <div
                className="qr-business-card-page__code-wrap"
              >
                <div
                  className="qr-business-card-page__code"
                >
                  {!isInitialAnimationCompleted && (
                    <AnimatedQr
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        right: 0,
                      }}
                      eventListeners={[
                        {
                          eventName: 'complete',
                          callback: () => setIsInitialAnimationCompleted(true),
                        },
                      ]}
                      options={{loop: false}}
                      className="qr-business-card-page__code-animation"
                    />
                  )}
                  <QRCodeSVG
                    bgColor="#FFFFFF"
                    fgColor="#000"
                    style={{transition: "width 1s"}}
                    className="qr-business-card-page
                    __qr-code"
                    width={163}
                    height={163}
                    level="H"
                    value={formattedQRCodeValues}
                  />
                </div>

                <p className="qr-business-card-page__desc container f-14">
                  {translate('<b>QR Визитка</b> - Сканируйте для добавления в Ваши контакты ', 'profile.qrDesc', {
                    b: text => <span className="f-500">{text}</span>
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default QRBusinessCardPage;