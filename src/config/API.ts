const API = {
  // BASE_URL: "https://alaba-server.semikolen.org/",

  BASE_URL: (process.env.NEXT_PUBLIC_BASE_URL ||
    "https://development.alabamarketplace.ng/backend/") as string,

  // BASE_URL: "http://localhost:8017/",
  //GOOGLE API
  AUTO_COMPLETE: "google-proxy/autocomplete", //GET
  GOOGLE_PLACEPICKER: "google-proxy/placepicker", //GET
  COLOR: "#a10244",
  CONTACT_MAIL: "contact@alabamarketplace.com",
  CONTACT_NUMBER: "+91 8848503902",
  LOGO: "https://bairuha-bucket.s3.ap-south-1.amazonaws.com/alabamarketplace/logoBox.png",
  NAME: " Alaba Marketplace",
  //APIS
  IMAGE_COMPRESS: "img_compress/compress",
  FILE_UPLOAD: "img_compress/file",
  VIDEO_UPLOAD: "img_compress/video",

  LOGIN_EMAIL: "auth/login", //POST
  USER_REFRESH_TOKEN: "auth/refresh-token", //POST..
  LOGIN_PHONE: "auth/phone-login", //POST
  LOGIN_GMAIL: "auth/google-login", //POST
  SIGNUP: "auth/signup", //POST

  VERIFY_MAIL: "Auth/verify/",
  RESEND_MAIL: "Auth/resend_verify/",
  REQUEST_RESET: "Auth/reset-password",

  // HOME SCREEN , CATEGORIES, SUB-CATEGORIES, BANNERS, OFFER-BANNERS
  GET_HOMESCREEN: "landing", // GET

  // PRODUCT SEARCH
  PRODUCT_SEARCH: "product_search/",
  PRODUCT_RECOMMENDATIONS: "store_search/all/products/recommend?",
  PRODUCT_SEARCH_MULTI: "product_search/search?type=multi&", //product search for multi
  PRODUCT_SEARCH_SINGLE: "product_search/search?type=single&", //product search for single

  // STORE SEARCH
  STORE_SEARCH_SEARCH: "store_search/search", //product search inside a single store
  STORE_SEARCH_GETINFO: "store_search/info/", //to get all details and subcategories of a store.
  STORE_SEARCH_GETALL: "store_search/all/", //to get all products in a store grouped by subcategory
  STORE_SEARCH_BYCATEGORY: "store_search/store/subcategory", //to get all products in a store for a single subcategory
  STORE_SEARCH_BYSUBCATEGORY: "store_search/subcategory", //get all products for a subc grouped by store
  STORE_SEARCH_BANNERS: "store_search/banner/", // to get all the banner of a single store
  STORE_SEARCH_PRODUCTS_ALL: "store_search/store/all/subcategory?", //to get all products in a store =======
  STORE_SEARCH_RECENT_PRODUCTS: "store_search/all/products/recent", //to get all products in a store =======
  // STORE PRODUCT BANNERS API
  BANNER_ALL: "banner/all/", //GET  page=page&take=pageSize
  BANNER: "banner/", //POST,PUT,DELETE
  BANNER_STATUS_UPDATE: "banner/status/", //uupdate the status show or hide banner on home
  BANNER_POSITION_UPDATE: "banner/position/", //update the banner position //put

  // BUSINESS TYPE API
  BUSINESS_TYPE: "businesstype/", //POST,PUT,DELETE

  //STATES API
  STATES: "states", //GET,POST,PUT,DELETE

  //COUNTRIES API
  COUNTRIES: "countries", //GET,POST,PUT,DELETE

  //NEW_ADDRESS API
  NEW_ADDRESS: "new-address/", //POST,PUT,DELETE with ID
  NEW_ADDRESS_ALL: "new-address", //GET all addresses

  //DELIVERY_CHARGE
  DELIVERY_CHARGE: "deliverycharge/", //POST,PUT,DELETE
  DISTANCE_CHARGE: "distancecharge/", //POST,PUT,DELETE
  WEIGHT_CHARGE: "weightcharge/", //POST,PUT,DELETE
  LBH_CHARGE: "lbhcharge/", //POST,PUT,DELETE

  // STORE PRODUCT CATEGORY API
  CATEGORY_ALL: "category/all", // GET all
  CATEGORY: "category/", //delete,put,post
  CATEGORY_UPDATE_POSITION: "category/position/", //put. update the category position
  SUB_CATEGORY: "subCategory/all", // GET all
  SUB_CATEGORY_EDIT: "subCategory/",
  SUB_CATEGORY_UPDATE_POSITION: "subCategory/position/", //UPDATE SUBACTEGORY POSITION PUT
  OFFERS: "offers/",
  CATEGORY_FEATURED: "category/featured",

  // PROFILE SETTINGS
  USER_CONFIG_USERS: "user", //
  USER_COINFIG_UPDATE: "user/role/update/",
  USER_DEACTIVATE: "user/deactivate/", //deactivate user's account
  USER_REACTIVATE: "user/reactivate/", //reactivate user's account
  USER_CHECK_IFEXIS: "user/check_user/validate", //post// check if a user exist with an email or phone
  USER_DEACTIVATE_EMAIL: "auth/deactivate-account/", //deactivate user's account using mail
  USER_CHANGE_PASSWORD: "user/update-password/", //to change user password
  USER_ADDNEW_PASSWORD: "user/add-password/", //to ADD NEW user password
  USER_PHOTO_UPDATE: "user/update-photo/", //to add new photo
  USER_DETAILS: "user/details/", //to get all user info
  USER_CONFIG_INVITE_MAIL: "menus/sendInvite",
  USER_VERIFY_EMAIL: "auth/verify-email", //POST verifies the token
  USER_FORGOT_PASSWORD: "auth/forgot-password", //post forgot password request
  USER_RESET_PASSWORD: "auth/reset-password", //POST verifies the token
  USER_CHECK_PHONE: "auth/checkphone/", //check phone number exist for signup
  USER_CHECK_EMAIL: "auth/checkEmail/", //check email
  USER_LOGOUT: "auth/signout/", //to signout.//GET
  USER_LOGOUTALL: "auth/signoutall/", //user will be signedout from all devices//GET

  SUBSCRIPTION_PLANS_ACTIVE: "subscription-plans/public/active", //GET

  CART_GET_ALL: "cart/all",
  CART: "cart/", //post,put,delete
  // CART_GET: "cart/user/", //get byuserID
  CART_CLEAR_ALL: "cart/clear-all/", //delete all items in cart
  ADDRESS: "address/", //post,put,delete
  ADDRESS_GET: "address/all/", //get all address for a user
  ADDRESS_SET_DEFAULT: "address/setdefault/", //SET DEFAULT ADDRESS
  WISHLIST: "wishlist/", //post,delete
  WISHLIST_GETALL: "wishlist/all", //get,post,put,
  PRODUCT_REVIEW: "productsReviews/",

  //SETTINGS,
  SETTINGS: "settings/",

  CORPORATE_STORE_CREATE: "coorporate_store/create", //post
  CORPORATE_STORE_CREATESELLER: "coorporate_store/createexist", //post to become a seller for an existing user
  CORPORATE_STORE_GETALL: "coorporate_store/pgn", //get
  CORPORATE_STORE_GETSELLERINFO: "coorporate_store/details/", //get store details only for store owners
  CORPORATE_STORE_GETSTOREINFO_ADMIN: "coorporate_store/sellerdetails/", //get store details only for store owners
  CORPORATE_STORE_CHECKSTORE: "coorporate_store/store_check/", //getbyid
  CORPORATE_STORE_ACCOUNT_DETAILS: "coorporate_store/account/details", //get, put
  CORPORATE_STORE_UPDATE_STATUS: "coorporate_store/status/", //put
  CORPORATE_STORE_REQUEST_DOCUMENT: "coorporate_store/send_mail", //post
  CORPORATE_STORE_GET_TOP_STORE: "coorporate_store/topstore", //get gets the top selling store in the location
  CORPORATE_SELLER_UPDATE: "coorporate_store/update", // PUT
  CORPORATE_STORE_DASHBOARD: "coorporate_store/dashboard/", // get dashboard info for store
  STORE_ADMIN_DASHBOARD: "coorporate_store/dashboard/admin", //getdasboard info for only admin
  STORE_DEACTIVATE: "coorporate_store/deactivate/", //to deactivate a seller only for admin

  INDIVIDUAL_STORE_CREATE: "individual_seller/create", //post
  INDIVIDUAL_STORE_GETALL: "individual_seller/pgn", //get
  INDIVIDUAL_STORE_GETBYID: "individual_seller/", //getbyid
  INDIVIDUAL_STORE_UPDATE_STATUS: "individual_seller/status/", //put
  INDIVIDUAL_STORE_REQUEST_DOCUMENT: "individual_seller/send_mail", //post
  STORE_CREATE: "store/create",

  // user--------------------------
  USER_EMAIL_UPDATE: "user/update-email", // update email/
  USER_PHONENUMBER_UPDATE: "user/update-Phone", //  update phone==
  USER_NAME_UPDATE: "user/update-name", // update name===
  USER_REFRESH: "user/refresh-user/", //get to refresh user details
  // get user----------------
  USER_EMAIL_VERIFY: "auth/email-verify", // verify email/
  USER_REQUEST_DEACTIVATE: "auth/request-deactivate", //post request deacitate via mail

  //orders
  ORDER: "order/", //post
  ORDER_GUEST: "order/guest", //POST - guest order (no auth required)
  ORDER_GET: "order/getall", //get all orders for a user and admin
  // ORDER_GETONE: "order/get_one/", //get one
  ORDER_GET_BYSTORE: "order/store/",
  ORDER_GET_USER: "order/user/", //to get all orders for a user only for admin
  ORDER_ITEMS_GET: "orderItems/all/",
  ORDER_STATUS_GET: "orderStatus/all/",
  ORDER_STATUS_UPDATE: "order/update_status/", //put
  ORDER_CANCEL: "order/cancel_order/", //put cancel order for user
  ORDER_GETONE_SELLER: "order/get_one/seller/", //get details of an order for seller.
  ORDER_GETONE_USER: "order/get_one/user/", //get details of an order for user.
  ORDER_GETONE_ADMIN: "order/details/", //get details of an order for admin.
  ORDER_GETCOUNT: "order/getall/", //get all orders count for a store only for seller
  ORDER_TRACK_GUEST: "order/track/", //GET track order by reference (no auth required)
  COMPLETE_PAYMENT: "order/update_payment/", //put update payment for seller only

  // STORE STATISTICS
  STORE_STATS: "store/stats",

  //PAYMENT_GET
  PAYMENT_GET: "payments/all/",
  //PRODUCTS
  PRODUCTS_BYSTORE: "products/bystore", // GET all for a store
  PRODUCTS_CREATE: "products/create", //create
  PRODUCTS_GETONE: "products/item/",
  PRODUCTS_GETONE_LOGIN: "products/items/", //to access product details only after login
  PRODUCTS_GETONE_STORE: "products/seller/",
  PRODUCTS_DELETE: "products/delete", //delete
  PRODUCTS_UPDATE: "products/update/", //update
  PROUCTS_IMAGE_UPDATE: "products/update_image/", //update images
  PROUCTS_COVERIMG_UPDATE: "products/update_cover_img/", //update images
  PRODUCT_STATUS_UPDATE: "products/update_status/", //update status
  PRODUCT_UPDATE_VARIANTS: "products/update/variant/",
  PRODUCT_VARIANT_ADD: "productvariant/add_variants", //add variants[]
  PRODUCT_VARIANT_DELETE: "productvariant/delete/", //delete variant
  PRODUCT_DELETE: "products/delete/", //to detle product //Delete
  PRODUCT_UPLOAD_EXCEL: "products/upload/", //post upload
  PRODUCT_UPLOAD_IMAGES: "products/upload/files/", //post upload
  // ENQUIRY ------------
  ENQUIRY_CREATE: "Enquiry/post", // Post
  ENQUIRY_GET: "Enquiry/get",

  //ROLES AND MENUS
  ROLES: "roles", //GET,POST,PUT,DELETE
  MENUS: "menus", //GET,POST,PUT,DELETE

  //INVOICES
  INVOICE_GET_ONE: "invoice/get/", //get one invoice with token
  INVOICE_GET: "invoice/", //get one invoice
  INVOICE: "invoice/create", // post create a new invoice
  INVOICE_UPDATE: "invoice/",
  INVOICE_GET_ALL: "invoice/all", // get all invoices

  //PAYMENT GATEWAY - PAYSTACK
  PAYSTACK_INITIALIZE: "paystack/initialize", //POST to initialize payment
  PAYSTACK_INITIALIZE_SPLIT: "paystack/initialize-split", //POST to initialize split payment (5% admin, 95% seller)
  PAYSTACK_VERIFY: "paystack/verify", //GET|POST to verify payment
  PAYSTACK_WEBHOOK: "paystack/webhook", //POST webhook endpoint
  PAYSTACK_PUBLIC_KEY: "paystack/public-key", //GET public key for frontend
  PAYSTACK_REFUND: "paystack/refund", //POST to process refunds
  PAYSTACK_TRANSACTION: "paystack/transaction", //GET transaction details
  PAYSTACK_TRANSACTIONS: "paystack/transactions", //GET transaction list
  PAYSTACK_SUCCESS: "paystack/success", //GET payment success callback
  PAYSTACK_CANCEL: "paystack/cancel", //GET payment cancellation callback
  PAYSTACK_FAILED: "paystack/failed", //GET payment failure callback
  PAYSTACK_BANKS: "paystack-subaccounts/banks/supported", //GET supported banks list
  PAYSTACK_RESOLVE_ACCOUNT: "paystack-subaccounts/banks/validate", //GET account verification

  // GUEST CHECKOUT (Guide-specific)
  GUEST_CALCULATE_DELIVERY_CHARGE: "calculate-delivery-charge", //POST for guest delivery calculation
  PAYSTACK_INITIALIZE_GUEST: "paystack/initialize-guest", //POST initialize guest payment
  PAYSTACK_VERIFY_GUEST: "paystack/verify-guest", //POST verify guest payment
  ORDER_GUEST_ORDERS: "order/guest-orders", //GET guest orders by email

  //PAYMENT SPLITS
  PAYMENT_SPLITS_STORE: "payment-splits/store", //GET payment splits for store
  PAYMENT_SPLITS_ADMIN_SUMMARY: "payment-splits/admin/summary", //GET admin payment splits summary

  CALCULATE_DELIVERY_CHARGE: "calculate_delivery", //POST to get delivery charge of total (OLD - lat/long based)
  NEW_CALCULATE_DELIVERY_CHARGE: "calculate_delivery/new", //POST to get delivery charge by weight and location
  PUBLIC_CALCULATE_DELIVERY_CHARGE: "calculate_delivery/public", //POST for guest checkout delivery calculation

  SETTLEMENT_DETAILS: "settlements/details/", //get total orders, total charges..etc of a store  get
  SETTLEMENT_DETAILS_HISTORY: "settlements/history/", //to get settlement history of a store    get
  SETTLEMENT_DETAILS_SUMMARY: "settlements/summary/", //to get settlement history of a store    get
  SETTLEMENT_DETAILS_CREATE: "settlements/create", //to add a settlement amount for admin //post
  SETTLEMENT_DETAILS_STORE: "settlements/store/", //get settlemet details,order details.. onnly for admin
  SETTLEMENT_DETAILS_UPDATE: "settlements/update/", //to update settlement sttus
  SETTLEMENT_SELLER: "settlements/seller/", //to get all settlement history for a store

  NEWS_AND_BLOGS_GETPGN: "newsandblogs/pgn",
  NEWS_AND_BLOGS: "newsandblogs/",

  USER_HISTORY: "userhistory/all", //post to add new product to user's history
  STORE_REVIEW_CREATE: "storereview/create", //to add rating for store

  PAYMENT_LOG: "paymentlog", //to add payment log history//post

  PRODUCT_SEARCH_NEW_SINGLE: "product_search/single",
  PRODUCT_SEARCH_NEW_MULTI: "product_search/multi",
  PRODUCT_SEARCH_DETAILS: "product_search/details/",
  PRODUCT_SEARCH_ALL_CATEGORIES: "product_search/store_items/",
  PRODUCT_SEARCH_ITEM: "product_search/store/",
  PRODUCT_SEARCH_AUTOCOMPLETE: "product_search/autocomplete",
  PRODUCT_SEARCH_TOPSTORE: "product_search/store_top/",
  PRODUCT_SEARCH_BOOSTED_CATEGORY: "product_search/boosted-category",

  //FEATURED PRODUCTS (Rotating Boosted Products)
  FEATURED_POSITION_1: "featured-products/position/1", //GET - Top section
  FEATURED_POSITION_2: "featured-products/position/2", //GET - Middle section
  FEATURED_POSITION_3: "featured-products/position/3", //GET - Lower section
  FEATURED_POSITION_4: "featured-products/position/4", //GET - Discounted section
  FEATURED_POSITION_PRODUCTS: "featured-products/position", //GET - All products for a specific position
  FEATURED_ALL_PRODUCTS: "featured-products/products", //GET - All products with filters

  //product image
  PRODUCT_IMAGE_UPDATE: "productimage/update/",

  //NOTIFICATIONS

  USER_NOTIFICATIONS: "notifications/all",
  USER_NOTIFICATION_MARK_READ: "notifications/read/",

  ORDER_SUBSTITUTION: "substitution/create", //POST
  ORDER_SUBSTITUTION_GETALL: "substitution/details/", //GET
  ORDER_SUBSTITUTION_SUBSTITUTE: "substitution/substitute/", //TO SUBSTITUTE ORDER USER PUT
  ORDER_SUBSTITUTION_UPDATEORDER: "substitution/update_order/", //TO SUBSTITUTE ORDER USER PUT

  //DELIVERY PARTNERS
  DELIVERY_COMPANY_REGISTER: "delivery/company/register", //POST
  DRIVER_REGISTER: "delivery/driver/register", //POST
  DELIVERY_COMPANIES_ALL: "delivery/companies", //GET
  DELIVERY_COMPANIES_APPROVED: "delivery/companies/approved", //GET - Only approved companies
  DELIVERY_COMPANY_DETAILS: "delivery/company/", //GET
  DELIVERY_COMPANY_UPDATE_STATUS: "delivery/company/:id/status", //PUT
  DRIVERS_ALL: "delivery/drivers", //GET
  DRIVER_DETAILS: "delivery/driver/", //GET
  DRIVER_UPDATE_STATUS: "delivery/driver/:id/status", //PUT
  INVITATION_SEND: "delivery/invitation/send", //POST
  INVITATION_ACCEPT: "delivery/invitation/", //POST - Accept invitation
  INVITATION_REJECT: "delivery/invitation/", //POST - Reject invitation
  INVITATION_DRIVER: "delivery/invitation/driver/", //GET - Get driver invitations
  INVITATION_COMPANY: "delivery/invitation/company/", //GET - Get company invitations
  DELIVERY_ORDERS_AVAILABLE: "delivery/orders/available", //GET - Available orders
  DELIVERY_ORDER_ACCEPT: "delivery/order/", //POST - Accept order
  DELIVERY_COMPANY_DRIVERS: "delivery/company/", //GET - Get company drivers
  DELIVERY_COMPANY_DRIVERS_AVAILABLE: "delivery/company/", //GET - Available drivers for invitation
  DELIVERY_COMPANY_ORDERS: "delivery/company/", //GET - Get company orders
  DELIVERY_COMPANY_ORDERS_ACCEPTED: "delivery/company/", //GET - Get accepted orders
  DELIVERY_COMPANY_ORDERS_ACCEPTED_WITH_DRIVERS: "delivery/company/", //GET - Get accepted orders with driver assignments
  DELIVERY_ORDER_PICKUP: "delivery/order/", //POST - Confirm pickup
  DELIVERY_DRIVER_ORDERS: "delivery/driver/", //GET - Get driver orders
  DELIVERY_DRIVER_PENDING_ORDERS: "delivery/driver/", //GET - Get driver pending orders
  DELIVERY_DRIVER_COMPLETED_ORDERS: "delivery/driver/", //GET - Get driver completed orders
  DELIVERY_DRIVER_AVAILABLE_ORDERS: "delivery/driver/", //GET - Get driver available orders
  DELIVERY_DRIVER_SELECT_ORDER: "delivery/driver/", //POST - Driver select order
  DELIVERY_ORDER_DELIVER: "delivery/order/", //POST - Confirm delivery
  DELIVERY_ORDERS_ALL: "delivery/orders/all", //GET - Get all orders
} as const;
export default API;
