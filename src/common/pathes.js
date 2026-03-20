import config from "../config";

export default class Pathes {
  static Auth = class {
    static authenticate = "register_auth/";
    static verifyCode = "verify_code/";
    static resendCode = "resend_code/";
    static login = "login/";
    static logout = "logout/";
    static setPassword = "set_password/";
    static changePassword = "users/doChangePassword/";
    static forgotPassword = "users/forgot_password/";
    static validateOldNumber = "users/doValidateOldNumber/";
    static sendCodeToNewNumber = "users/doSendCode/";
    static doChangeAndVerifyNewNumber = "users/doChangeAndVerifyNewNumber/";
    static getUserEmailByNumber = "users/get_email/";
  };

  static Profile = class {
    static update = "init_profile/";
    static get = "users/me/";
    static deactivate = `users/deactivate/`;
    static phones = (user_id) => `users/${user_id}/phone_numbers/`;
    static setPhones = "users/phone_numbers/";
    static socials = (user_id) => `users/${user_id}/social_networks/`;
    static setSocials = "users/social_networks/";
    static device = (deviceID) => `users/get_or_deactivate_token/${deviceID}/`;
    static devices = "users/get_active_devices/";
    static authHistory = "users/authorisation_history/";
    static deactivateTokens = "users/deactivate_all_tokens/";
    static tokenExpiredTime = (deviceID) =>
      `users/change_token_expired_time/${deviceID}/`;
    static checkSmsService = "users/check_sms_service/";
    static hasOrganizations = "users/has_organizations/";
    static deliveryAddresses = "users/delivery_addresses/";
    static deliveryAddress = (id) => `users/delivery_addresses/${id}/`;
    static defaultAddress = "users/delivery_addresses/default/";
  };

  static Organization = class {
    static orgTitle = (orgID) => `organizations/${orgID}/getOrganizationTitle/`;
    static create = "organizations/";
    static createFromGoogleMaps = "/organizations/google_maps/create/";
    static createFrom2Gis = "organizations/two_gis/create/";
    static getByPost = (postID) => `/get_organization_category_list/${postID}`;
    static list = "organizations/";
    static get = (orgID) => `organizations/${orgID}/`;
    static clientDetails = (orgID, userID) =>
      `organizations/${orgID}/clients/${userID}/`;
    static clientBooking = "transactions/booking/user/";
    static activateClientBooking = "transactions/booking/activate/";
    static edit = (orgID) => `organizations/${orgID}/`;
    static setPhones = (orgID) => `organizations/${orgID}/phone_numbers/`;
    static setSocials = (orgID) => `organizations/${orgID}/social_networks/`;
    static types = "organization_types/";
    static subTypes = "organization_all_types/";
    static discounts = "discounts/";
    static createDiscount = "discounts/";
    static bulkUpdateDiscounts = "discounts/doBulkUpdate/";
    static bulkDeleteDiscounts = "discounts/doBulkDelete/";
    static cardBackgrounds = "discount_backgrounds/";
    static discountImage = (cardID) => `discounts/${cardID}/`;
    static subscribe = `subscriptions/`;
    static instagramLink = (orgID) =>
      `/organizations/${orgID}/instagramIntegration/`;
    static instagramUpdate = (orgID) =>
      `/organizations/${orgID}/instagramUpdate/`;
    static deactivate = (orgID) => `/organizations/${orgID}/deactivate/`;
    static reactivate = (orgID) => `/organizations/${orgID}/reactivate/`;
    static resetPurchaseID = (orgID) =>
      `/organizations/${orgID}/resetPurchaseID/`;
    static orgUserLimits = "/organizations/user_limits/";
    static deliverySettings = (orgID) =>
      `/organizations/${orgID}/delivery_settings/`;
    static hotlinks = "/hotlinks/";
    static selectedCollectionSubcategories = (hotlinkID) =>
      `/hotlinks/${hotlinkID}/selected_subcategories/`;
    static hotlinkDetail = (id) => `/hotlinks/${id}/`;
    static promotion = (orgID) => `/organizations/${orgID}/promo/`;
    static collectionItems = (orgID) =>
      `/organizations/${orgID}/collection_items/`;
    static collectionSubcategories = (orgID) =>
      `/organizations/${orgID}/collection_subcategories/`;
    static promotions = "/promos/";
    static promoStats = (orgID) => `/organizations/${orgID}/promo_stats/`;
    static shadowBanStatus = (orgID) => `/shadow_ban_status/${orgID}/`;
    static requestFromShadowBan = (orgID) =>
      `/request_from_shadow_ban/${orgID}/`;
    static verificationOrganization = (orgID) =>
      `/organization/${orgID}/verifications/`;
    static followers = (id) => `/organizations/${id}/followers/`;
    static followerDetails = (orgID, userID) =>
      `organizations/${orgID}/followers/${userID}/`;
    static acceptAllFollowers = (orgID) =>
      `/organizations/${orgID}/accept_all_followers/`;
    static acceptFollower = () => "/accept_follower/";
    static complainAbout = "/organizations/complaints/";
    static blacklist = "/organizations/blacklist/";
    static deleteFromBlacklist = (orgID) =>
      `/organizations/blacklist/delete/${orgID}/`;
    static blockUser = "/organizations/block_user/";
    static unblockUser = (user, org) =>
      `/organizations/unblock_user/${user}/${org}/`;
    static paymentSystems = "/organizations/payment_systems/";
    static paymentSystemConnection = (orgID) =>
      `/organizations/${orgID}/payment_systems/confirmation/`;
    static connectedPaymentSystems = (orgID) =>
      `/organizations/${orgID}/payment_systems/`;
    static paymentSystemsActivation = (orgID) =>
      `/organizations/${orgID}/payment_systems/activation/`;
    static paymentSystemsActivationDetail = (orgID) =>
      `/organizations/${orgID}/payment_systems/activation/detail/`;
    static wholesaleConfirmation = (orgID) =>
      `/organizations/${orgID}/wholesale/confirmation/`;
    static organizationsOnMap = "/organizations/maps/";
    static typesOnMap = "/organizations/maps/types/";
    static my = "/organizations/my/";
    static blockedUsers = (id) => `/organizations/${id}/blocked_users/`;
    static assistantDetail = (id) => `/organizations/assistant/${id}/`;
    static assistant = "/organizations/assistant/";
    static assistantQuestions = "/organizations/assistant/questions/";
    static assistantAnswer = "/organizations/assistant/questions/answer/";
    static assistantAnswerDetail = (id) =>
      `/organizations/assistant/questions/answer/${id}/`;
    static assistantPlans = (id) => `/organizations/assistant/${id}/plans/`;
    static assistantAnswerFile =
      "/organizations/assistant/questions/answer/file/";
    static assistantPurchase = "/organizations/assistant/purchase/";
    static assistantChat = "/organizations/assistant/chat/";
    static assistantChatMessages = (chatID) => `/comments/chat/${chatID}/`;
    static assistantChats = (assistantID) =>
      `/organizations/assistant/${assistantID}/chats/`;
    static readAssistantChatMessages = (chatID) =>
      `/organizations/assistant/chat/${chatID}/read_messages/`;
    static assistantChatStatus = `/organizations/assistant/chat/by_org_user/`;
    static toggleAssistant = "/organizations/assistant/toggle_assistant/";
  };

  static Chat = class {
    static ws = (chatID) => `/ws/chat/${chatID}/`;
  };

  static ChatList = class {
    static ws = () => `/ws/messenger/chats/`;
    static wsUnread = () => `/ws/messenger/chats/unread/`;
  };

  static Messenger = class {
    static ws = (chatID) => `/ws/messenger/chat/${chatID}/`;
  };

  static Subscriptions = class {
    static getList = "/subscriptions/";
    static subscribeToPartners = "/subscriptions/subscribe_to_partners/";
  };

  static Delivery = class {
    static deliveryItemsCount = "/delivery/deliveryItemsCount/";
    static availableOrders = "/delivery/ordersForDelivery/";
    static historyOrders = "/delivery/history/";
    static acceptOrder = (deliveryInfoID) =>
      `/delivery/${deliveryInfoID}/acceptForDeliveryByCourier/`;
    static rejectOrder = (deliveryInfoID) =>
      `/delivery/${deliveryInfoID}/rejectDeliveryByCourier/`;
    static orderDelivered = (deliveryInfoID) =>
      `/delivery/${deliveryInfoID}/delivered/`;
  };

  static Common = class {
    static currency = "countries/";
    static myLocation = "extreme-ip/";
    static citiesAndCountries = "countries_and_cities/";
    static youtubeLinkDetail = (videoID) =>
      `/youtube_embed/?url=http://www.youtube.com/watch?v=${videoID}`;
    static dictionary = (locale) =>
      `/${
        locale +
        (config.localizationVersion ? `_${config.localizationVersion}` : "_")
      }.json`;
    static languages = "/languages/";
    static currencyConversion = (from, to, amount) =>
      `/currency_conversion/?from_currency=${from}&to_currency=${to}&amount=${amount}`;
    static imageToBase64 = "/image_to_base64/";
    static fileToBase64 = "/file_to_base64/";
  };

  static File = class {
    static upload = "files/";
    static watermarkedUpload = "watermarked_images/";
    static imageURL = "/save_image_from_url/";
    static videoURL = "/save_video_from_url/";
  };

  static Discount = class {
    static preprocess = "transactions/preprocess/";
    static preprocessBooking = (rendID) =>
      `transactions/preprocess/booking/${rendID}/`;
    static completeTransaction = "transactions/complete/";
    static completeCashBoxTransaction = "transactions/complete/cashier/";
    static completeRentTransaction = "transactions/complete/booking/";
  };

  static Home = class {
    static partnersList = "homepage/ordered_partners/";
    static homePartners = "homepage/partners/";
    static homeOrganizations = "homepage/organizations/";
    static orgsByCategories = "categorized_organizations/";
    static localBanners = "homepage/banner_info/";
    static getCategoryDetail = (id) => `categories/${id}/`;
    static searchPartners = "homepage/search/partners";
    static search = "homepage/search/";
    static searchSuggest = "search/item/";
  };

  static Statistics = class {
    static userTotals = "statistics/totals/";
    static userSaleTotals = "statistics/saleTotals/";
    static orgGeneralStatistics = (orgID) => `/statistics/${orgID}/totals/`;
    static orderStatistics = "statistics/organizations/";
    static saleStatistics = "statistics/saleOrganizations/";
    static unprocessedTranCount = "/statistics/unprocessedTranCount/";

    static summary = "statistics/totals/";
    static partnerStatistics = (orgID) =>
      `statistics/${orgID}/partners_totals/`;

    // rent
    static userRentPurchaseTotals = "statistics/totals/rental/";
    static userRentSaleTotals = "statistics/saleTotals/rental/";
    static rentSaleStatistics = "statistics/saleOrganizations/rental/";
    static rentOrderStatistics = "statistics/organizations/rental/";
    static organizationRentSaleTotals = "statistics/saleTotals/rental/";
    static rentDetailSaleTotals = "statistics/saleTotals/rental/";
    static rentUnprocessedTranCount =
      "/statistics/unprocessedTranCount/rental/";

    // event
    static eventUnprocessedTranCount =
      "/statistics/unprocessedTranCount/ticket/";
    static userEventSaleTotals = "statistics/saleTotals/ticket/";
    static userEventPurchaseTotals = "statistics/totals/ticket/";
  };

  static Receipts = class {
    static transactions = "transactions/";
    static transaction = (id) => `transactions/${id}/`;
    static bookingTransaction = (id) => `transactions/${id}/booking/`;
    static completeOfflineDscTransaction = "transactions/complete/offline/";
    static acceptOrderPayment = "/transactions/order/payment/accept/";
    static receipts = "statistics/transactions/";
    static receiptDetail = (id) => `statistics/transactions/${id}/`;
    static acceptReceipt = "/onlineTransactions/complete/";
    static acceptOnlinePaymentReceipt = "/onlinePaymentTransactions/complete/";
    static acceptBookingReceipt = "/onlineBookingTransactions/complete/";
    static cartOfflineCheckout = (cartID) =>
      `/carts/${cartID}/offline_checkout/`;
    static transactionsUsers = (orgID) =>
      `transactions/organizations/${orgID}/users/`;
    static rentTransactionsUsers = (rentID) =>
      `transactions/organizations/rental/${rentID}/users/`;
    static rentSaleTransactions = "statistics/saleTransactions/rental/";
    static rentOrderTransactions = "statistics/transactions/rental/";
    static rentDetailOrderTransactions = (rentID) =>
      `statistics/transactions/rental/${rentID}/`;
    static rentDetailSale = (rentID) =>
      `statistics/saleTransactions/rental/${rentID}/`;
    static rentDetailTransactionsUsers = (rentID) =>
      `/transactions/organizations/rental/${rentID}/customers/`;
    static excelFile = (orgID) => `/download_org_delivery_info/${orgID}/`;
    static initializePayment = (paymentSystemID) =>
      `/transactions/pay/${paymentSystemID}/`;
    static initializePaysyPayment = "/transactions/pay/paysy/";
    static acceptPayment = `/transactions/payment/accept/`;
    static rejectRentalPayment = (id) => `/transactions/${id}/reject/`;
    static rejectProductPayment = (id) => `/transactions/${id}/order/reject/`;
    static rentExcelFile = (orgID) => `/download_org_rental_info/${orgID}/`;
    static rentDetailExcelFile = (rentID) => `/download_rental_info/${rentID}/`;

    static eventSalesExcelFile = (eventID) =>
      `/download_ticket_info/${eventID}/`;
    static organizationEventSalesExcelFile = (orgID) =>
      `/download_org_ticket_info/${orgID}/`;
  };

  static Notifications = class {
    static notifications = "notifications/";
    static settings = "notifications/settings/";
    static count = "notifications/statistics/";
    static FCM = "devices/";
    static FCMSettings = "devicesSettings/";
  };

  static Employees = class {
    static list = "employees/";
    static info = (id) => `employees/user_info/${id}/`;
    static roles = "roles/";
    static roleDetail = (id) => `roles/${id}/`;
    static addEmployee = "employees/";
    static employee = (id) => `employees/${id}/`;
    static transferOwnership = "employees/doTransferOwnership/";
  };

  static Messages = class {
    static organization = (orgID) => `organizations/${orgID}/messages/`;
    static subscriptionMSG = "messages/";
    static orgFollowersCount = (orgID) =>
      `organizations/${orgID}/getFollowersCount/`;
    static orgPartnerFollowersCount = (orgID) =>
      `organizations/${orgID}/getPartnersFollowersCount/`;
    static orgPartnerMembersCount = (orgID) =>
      `organizations/${orgID}/getPartnersCount/`;
  };

  static Partners = class {
    static partners = (id) => `organizations/${id}/partners/`;
    static partnersPosts = (id) => `partner_shop_items/${id}/`;
    static partnersCategories = (id) =>
      `shop/non_empty_partner_categories/${id}/`;
    static partnersSearch = (id) => `organizations/${id}/partners/`;
    static partnerships = (id) => `organizations/${id}/partnerships/`;
    static partnershipDetail = (id) => `partnerships/${id}/`;
    static createPartnership = "partnerships/";
  };

  static Services = class {
    static list = "/services/";
    static organizationByService = (serviceID) =>
      `/service/${serviceID}/organizations/`;
    static serviceCategories = (serviceID) =>
      `/services/${serviceID}/item_categories/`;
  };

  static Attendance = class {
    static global = "/global_attendance/";
    static info = "attendance/user_info/";
    static attendance = "attendance/";
    static receipts = "/orgTransactions/calendar/";
    static stats = (employeeID) => `employees/${employeeID}/attendance/`;
  };

  static Banner = class {
    static banners = "banners/";
    static detail = (id) => `banners/${id}/`;
  };

  static Carts = class {
    static list = "carts/";
    static cart = (cartID) => `carts/${cartID}/`;
    static delivery = (cartID) => `/carts/${cartID}/delivery/`;
    static onlinePayment = (cartID) => `/carts/${cartID}/online_payment/`;
    static pickup = (cartID) => `/carts/${cartID}/selfPickup/`;
    static whoPays = (cartID) => `/carts/${cartID}/updateDelivery/`;
    static countChange = "/carts/doChangeItemCount/";
  };

  static Product = class {
    static subcategories = "/shop/subcategories/";
    static subcategoryUpdate = (id) => `/shop/subcategories/${id}/`;
  };

  static Shop = class {
    static orgFeed = "shop/organization_items/";
    static orgSubcategories = (orgID) => `/shop/${orgID}/subcategories/`;
    static postDetail = (id) => `/shop/items/${id}/`;
    static posts = "/shop/items/";
    static rentals = "/shop/rentals/";
    static events = "/shop/events/";
    static totalUserItemsCount = "/carts/totalUserItemsCount/";
    static subscribedPosts = "/shop/subscription_items/";
    static liked = "/shop/likes/";
    static categories = "/shop/categories/";
    static subCategories = (catID) =>
      `/shop/categories/${catID}/all_subcategories/`;
    static rentCategories = "/shop/rentals/categories/";
    static nonEmptyCategories = "/shop/non_empty_categories/";
    static likes = "/shop/likes/";
    static bookmarks = "/shop/bookmarks/";
    static deleteBookmarks = "/shop/bookmarks/delete/";
    static feed = "/shop/feed/";
    static publishStatus = "/shop/doChangeItemPublishedStatus/";
    static subcategories = (id) => `/shop/subcategories/${id}/`;
    static categoryDetail = (categoryID) => `/shop/categories/${categoryID}/`;
    static selectedCollectionItems = (hotlinkID) =>
      `/shop/hotlink_items/${hotlinkID}/`;
    static postComplain = "/shop/complaints/";
    static postTranslate = (code) => `/shop/translateItemText/?lang=${code}`;
    static organizationRentals = "/shop/organization_rentals/";
  };

  static Comments = class {
    static postComments = (postID) => `/comments/item/${postID}/`;
    static commentLike = "/comments/like/";
    static deleteComment = (commentID) => `/comments/${commentID}/`;
    static commentedItem = `/commented/items/`;
    static report = `/comments/complaints/`;
    static toggle = "/comments/change/comments_disabled/";
    static changeTheme = "/comments/change/upload_theme_image/";
    static ws = (chatID) => `/ws/assistant-response/${chatID}/`;
  };

  static Stock = class {
    static get = (productID) => `/get_stock/${productID}/`;
    static delete = (productID) => `/delete_stock/${productID}/`;
    static criteria_by_subcategory = (subcategoryID) =>
      `/criteria_by_subcategory/${subcategoryID}/`;
    static format = (criteriaID) => `/format_by_criteria/${criteriaID}/`;
    static formatSizes = (formatID) => `/size_by_format/${formatID}/`;
    static availableSizes = (productID) =>
      `/available_sizes/shop_items/${productID}/`;
    static notChosenSizes = (productID) =>
      `/get_not_choosen_sizes/${productID}/`;

    static getRelatedPosts = (productID) =>
      `/get_organization_shop_items_in_set/${productID}/`;
    static getSelectedPosts = (productID) =>
      `/get_shop_item_set_ids/${productID}/`;
    static addRelatedPosts = (productID) => `/add_shop_items_set/${productID}/`;

    static getLinkSet = (productID) => `/get_shop_item_link_set/${productID}/`;
    static getItemByLink = `/get_shop_item_by_link/`;
    static addLinks = (productID) => `/add_shop_link_items_set/${productID}/`;

    static sizeCounts = (productID) => `/shop_item_size_count/${productID}/`;
    static deleteSizeCount = (sizeCountID) =>
      `/delete_shop_item_size/${sizeCountID}/`;

    static postsSelection = (productID) => `/get_stock_set_items/${productID}/`;
  };

  static Nominatim = class {
    static reverse = "/reverse";
    static search = "/search";
  };

  static Rent = class {
    static detail = (rentID) => `/shop/rentals/${rentID}/`;
    static book = (rentID) => `/shop/rentals/${rentID}/booking/`;
    static bookOffline = (rentID) =>
      `/shop/rentals/${rentID}/booking/offline_checkout/`;
    static delete = (rentID) => `/delete_stock_and_rental_period/${rentID}/`;
    static getStock = (rentID) => `/get_rental_stock/${rentID}/`;
    static addRentalPeriod = (rentID) => `/add_rental_period/${rentID}/`;
    static getRentPeriod = (rentID) => `/get_rental_period/${rentID}/`;

    static years = (rentID) => `/shop/rentals/${rentID}/years/`;
    static months = (rentID) => `/shop/rentals/${rentID}/months/`;
    static days = (rentID) => `/shop/rentals/${rentID}/days/`;
    static hours = (rentID) => `/shop/rentals/${rentID}/hours/`;
    static minutes = (rentID) => `/shop/rentals/${rentID}/minutes/`;
  };

  static Collections = class {
    static collections = "/shop/collections/";
    static collectionDetail = (collectionID) =>
      `/shop/collections/${collectionID}/`;
    static collectionDetailUpdate = (collectionID) =>
      `/shop/collections/${collectionID}/update/`;
  };

  static Events = class {
    static tickets = "/shop/tickets/";
    static categories = "/shop/tickets/categories/";
    static period = (eventID) => `/shop/tickets/${eventID}/ticket_period/`;
    static saleOrganizations = "/statistics/saleOrganizations/ticket/";
    static purchaseOrganizations = "/statistics/organizations/ticket/";
    static organizationEvents = "/shop/organization_tickets/";
    static checkUserOfEvent = "/transactions/ticket/check_user/";
    static ticketsOfEvent = "/transactions/ticket/user/";
    static activateTicket = "/transactions/ticket/activate/";
    static clients = (eventID) =>
      `/transactions/organizations/ticket/${eventID}/users/`;
    static eventReceipts = (eventID) =>
      `/statistics/saleTransactions/ticket/${eventID}/`;
    static ticketBuyers = (eventID) =>
      `/transactions/organizations/ticket/${eventID}/customers/`;
    static purchasedEvents = "/shop/organization_tickets/own/";
    static organizationEventReceipts = "/statistics/saleTransactions/ticket/";
    static boughtTickets = "/transactions/ticket/own/";
    static eventTransaction = "/transactions/ticket/";
    static organizationPurchaseEventReceipts =
      "/statistics/transactions/ticket/";
  };

  static Resumes = class {
    static resumes = "/shop/resumes/";
    static info = "/shop/resumes/info/";
    static resumeInfo = (id) => `/shop/resumes/${id}/info/`;
    static detailInfo = "/shop/resumes/detail_info/";
    static resumeDetailInfo = (id) => `/shop/resumes/${id}/detail_info/`;
    static workExperiences = "/shop/resumes/work_experiences/";
    static resumeWorkExperiences = (id) =>
      `/shop/resumes/${id}/work_experiences/`;
    static educationExperiences = "/shop/resumes/educations/";
    static resumeEducationExperiences = (id) =>
      `/shop/resumes/${id}/educations/`;
    static files = "/shop/resumes/files/";
    static educations = "/shop/educations/";
    static phoneNumbers = "/shop/resumes/phone_numbers/";
    static resumePhoneNumbers = (id) => `/shop/resumes/${id}/phone_numbers/`;
    static socials = "/shop/resumes/social_networks/";
    static resumeSocials = (id) => `/shop/resumes/${id}/social_networks/`;
    static userRequest = "/shop/resume/user/request/";
    static userRequestDetail = (id) => `/shop/resume/user/request/${id}/`;
    static userRequestAccept = "/shop/resume/user/accept/";
    static userRequestDecline = "/shop/resume/user/decline/";
    static organizationRequest = "/shop/resume/organization/request/";
    static organizationRequestDetail = (id) =>
      `/shop/resume/organization/request/${id}/`;
    static organizationRequestAccept = "/shop/resume/organization/accept/";
    static organizationRequestDecline = "/shop/resume/organization/decline/";
    static userResumes = "/shop/resumes/user_resumes/";
    static search = "/search/resumes/";
  };
}
