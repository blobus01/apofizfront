export const ENVIRONMENTS = {
  DEV: 'development',
  PROD: 'production',
}
export const GENDER = {
  male: 'male',
  female: 'female',
  not_specified: null,
}
export const CONTACT_EMAIL = 'info@apofiz.com';
export const DEFAULT_CURRENCY = 'KGS';
export const DATE_FORMAT_YYYY_MM_DD = 'YYYY-MM-DD';
export const DATE_FORMAT_DD_MM_YYYY_HH_MM = 'DD.MM.YYYY HH:mm';
export const DATE_FORMAT_HH_MM_DD_MM_YYYY = 'HH:mm DD.MM.YYYY';
export const DATE_FORMAT_DD_MM_YYYY = 'DD.MM.YYYY';
export const DATE_FORMAT_DD_MMMM_YYYY = 'DD MMMM YYYY';
export const DATE_FORMAT_MMMM_YYYY = 'MMMM YYYY';
export const DATE_FORMAT_YYYY_MM = 'YYYY-MM';
export const DATE_FORMAT_S_DD_MM_YYYY = 'DD/MM/YYYY';
export const TIME_FORMAT_HH_MM = 'HH:mm';
export const DATE_FORMAT_YYYY_MM_T_HH_MM_SS = 'YYYY-MM-DDTHH:mm:ss';

export const ALLOWED_FORMATS = ['image/png', 'image/jpg', 'image/jpeg'];
export const DISCOUNT_TYPES = {
  cumulative: 'cumulative',
  fixed: 'fixed',
  cashback: 'cashback',
}
export const RESEND_TYPES = {
  registration: 'register_auth_type',
  changeAuth: 'auth_number_type',
  changeAuthEmail: 'email_auth_type',
  changeAuthWhatsApp: 'whatsapp_auth_type',

}
export const LINK_TYPES = {
  phone: 'phone',
  web: 'web',
  mail: 'mail'
}
export const HOTLINK_TYPES = {
  link: 'link',
  contact: 'contact',
  collection: 'collection',
  partners: 'partners',
}

export const DEFAULT_EMPTY = 'empty';
export const DEFAULT_LANGUAGE = 'en';
export const QR_PREFIX = 'UID';
export const QR_ORG_PREFIX = 'OID';
export const BANNER_BACKGROUNDS = [
  'linear-gradient(136.21deg, #0061FF 0%, #4DC9E6 100%)',
  'linear-gradient(136.21deg, #30C67C 0%, #82F4B1 100%)',
  'linear-gradient(136.21deg, #FF0000 0%, #FF9E69 100%)',
  'linear-gradient(135.66deg, #F99A0C 0%, #FBBC05 54.92%)',
];

export const DEFAULT_LIMIT = 21;

export const SLIDE_TYPES = {
  image: 'image',
  video: 'video',
  youtube_video: 'youtube_video',
  instagram_video: 'instagram_video',
  instagram_image: 'instagram_image',
}

export const RECEIPT_STATUSES = {
  accepted: 'accepted',
  rejected: 'rejected',
  in_progress: 'in_progress',
}

export const DELIVERY_TYPES = {
  cash_courier: "cash_courier",
  self_pickup: "self_pickup",
  cart_checkout: "cart_checkout",
  online_payment: "online_payment",
}

export const PRINTER_PAPERS = [
  {label: '80 mm', value: 80},
  {label: '60 mm', value: 60},
]

export const WHO_PAYS_DELIVERY_OPTIONS = {
  organization: 'organization',
  client: 'client',
}

export const RECEIPT_FOR = {
  organization: 'organization',
  client: 'client',
  courier: 'courier',
}

export const DELIVERY_STATUSES = {
  delivery_status_taken_for_delivery: 'delivery_status_taken_for_delivery',
  delivery_status_set_for_delivery: 'delivery_status_set_for_delivery',
  delivery_status_rejected_by_delivery_service: 'delivery_status_rejected_by_delivery_service',
  delivery_status_delivered: 'delivery_status_delivered',
}

export const WORKING_TIME_STATUSES = {
  "around_the_clock": "around_the_clock",
  "open": "open",
  "closed": "close",
}

export const MESSAGE_CHAR_LIMIT = 2000;

export const REQUEST_ACTION_PREFIXES = ['REQUEST', 'SUCCESS', 'FAILURE'] 

export const DEFINED_OSes = {
  WEB: 'web',
  iOS: 'ios',
  ANDROID: 'android',
};

export const POSTS_VIEWS = {
  FEED: 'FEED',
  GRID: 'GRID'
}

export const PURCHASE_TYPES = {
  product: 'product',
  rent: 'rent',
  ticket: 'ticket',
  resume: 'resume',
}

export const RENT_TIME_TYPES = {
  minute: 'minute',
  hour: 'hour',
  day: 'day',
  month: 'month',
  year: 'year',
}

export const RENT_PAYMENT_METHODS = {
  online: 'online',
  offline: 'offline'
}

export const PAYMENT_STATUSES = {
  accepted: 'accepted',
  rejected: 'rejected',
  in_progress: 'in_progress',
  refunded: 'refunded'
}

export const CONTACTS = {
  phone: '+996555924242',
  email: 'info@apofiz.com',
  tg: 'https://t.me/apofizglobal',
  insta: 'https://www.instagram.com/apofiz_app',
}