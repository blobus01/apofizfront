import React, {useEffect, useState} from 'react'
import Lottie from "react-lottie"
import {translate} from "@locales/locales"
import classNames from "classnames"
import {BubbleComment} from "@ui/Icons"
import classes from "./index.module.scss"

const AssistantTypingAnimation = ({options, ...rest}) => {
  const [animationData, setAnimationData] = useState(null)

  useEffect(() => {
    import('@assets/animations/assistant_typing.json').then(res => setAnimationData(res))
  }, [])

  return (
    <div {...rest} className={classNames('dfc', classes.root, rest.className)}>
      <div className={classes.animationWrap}>
        <Lottie
          options={{
            autoplay: true,
            animationData,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid slice',
            },
            ...options
          }}
          width={68}
          height={68}
          style={{margin: 0}}
        />
      </div>
      <p className={classNames(classes.text, 'f-15')}>
        <BubbleComment
          className={classes.bubbleIcon}
        />
        {translate('Ассистент печатает', 'org.aiAssistant.isTyping')}
        {' '}
        <span className={classes.dots}>
          <span className={classes.dot}>.</span>
          <span className={classes.dot}>.</span>
          <span className={classes.dot}>.</span>
        </span>
      </p>
    </div>
  )
}

export default AssistantTypingAnimation