import t0 from "@assets/images/comment_themes/0.svg"
import t1 from "@assets/images/comment_themes/1.svg"
import t2 from "@assets/images/comment_themes/2.svg"
import t3 from "@assets/images/comment_themes/3.svg"
import t4 from "@assets/images/comment_themes/4.svg"
import t5 from "@assets/images/comment_themes/5.svg"
import t6 from "@assets/images/comment_themes/6.svg"

import b0 from "@assets/images/comment_themes/b0.svg"
import b1 from "@assets/images/comment_themes/b1.svg"
import b2 from "@assets/images/comment_themes/b2.svg"
import b3 from "@assets/images/comment_themes/b3.svg"
import b4 from "@assets/images/comment_themes/b4.svg"
import b5 from "@assets/images/comment_themes/b5.svg"
import b6 from "@assets/images/comment_themes/b6.svg"

import {
  CatIcon,
  CupIcon,
  GamepadIcon,
  LoveIcon,
  MoneyIcon,
  RobotIcon,
  WhiteGamepadIcon
} from "@pages/CommentsPage/icons";

const COMMENT_THEMES = [
  {
    id: 1,
    url: t0,
    bgUrl: b0,
    icon: props => <CupIcon {...props} />,
  },
  {
    id: 2,
    url: t1,
    bgUrl: b1,
    icon: props => <CatIcon {...props} />,
  },
  {
    id: 3,
    url: t2,
    bgUrl: b2,
    icon: props => <MoneyIcon {...props} />,
  },
  {
    id: 4,
    url: t3,
    bgUrl: b3,
    icon: props => <LoveIcon {...props} />,
  },
  {
    id: 5,
    url: t4,
    bgUrl: b4,
    icon: props => <RobotIcon {...props} />,
  },
  {
    id: 6,
    url: t5,
    bgUrl: b5,
    icon: props => <GamepadIcon {...props} />,
  },
  {
    id: 7,
    url: t6,
    bgUrl: b6,
    icon: props => <WhiteGamepadIcon {...props} />,
  },
]



export default COMMENT_THEMES