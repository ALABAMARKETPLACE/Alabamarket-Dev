const API_ADMIN = {
  BANNERS_LIST: "banner/all/", // GET
  BANNER_ADD: "banner/", // POST
  BANNER_EDIT: "banner/", // PUT
  BANNER_DELETE: "banner/", // DELETE
  BANNER_EXPORT: "", // GET
  BANNER_IMPORT: "", // POST
  BANNER_POSITION_UPDATE: "banner/position/", //update the banner position //put

  CATEGORY_LIST: "category/all", // GET all
  CATEGORY_UPDATE_POSITION: "category/position/", //put. update the category position

  SUBCATEGORY_LIST: "subCategory/all", // GET all
  SUB_CATEGORY_UPDATE_POSITION: "subCategory/position/", //UPDATE SUBACTEGORY POSITION PUT

  PRODUCTS_BYSTORE: "products/bystore", // GET all for a store
  PRODUCTS_GETONE_STORE: "products/seller/",
  PRODUCTS_UPDATE: "products/update/", //update
  PRODUCTS_DELETE_IMAGE: "products/delete_image/", //delete
  PRODUCTS_UPDATE_COVERIMAGE: "products/update_cover_img/", //delete
  PROUCTS_IMAGE_UPDATE: "products/update_image/", //update images
  PRODUCT_UPDATE_VARIANTS: "products/update/variant/",
  PRODUCT_VARIANT_ADD: "productvariant/add_variants", //add variants[]
  PRODUCT_VARIANT_DELETE: "productvariant/delete/", //delete variant

  ORDER_GET_BYSTORE: "order/store/",
  ORDER_DETAILS: "order/details/", //GET to get order details for seller and admin
  ORDER_STATUS_UPDATE: "order/update_status/", //put
  ORDER_GETONE_SELLER: "order/get_one/seller/", //get details of an order for seller.
  COMPLETE_PAYMENT: "order/update_payment/", //get update payment for seller only
  ORDER_BY_USER: "order/user/", //to get all orders for a user only for admin

  ENQUIRY_GET: "Enquiry/get",
  ENQUIRY_DELETE: "Enquiry/delete/",

  APP_USERS: "user", //
  USER_DETAILS: "user/details/", //to get all user info
  ADDRESS_GET: "address/all/",

  CORPORATE_STORE_GETALL: "coorporate_store/pgn/", //get
  CORPORATE_STORE_REQUEST_DOCUMENT: "coorporate_store/send_mail", //post
  CORPORATE_STORE_UPDATE_STATUS: "coorporate_store/status/", //put
  STORE_DEACTIVATE: "coorporate_store/deactivate/",

  INVOICE_GET_ALL: "invoice/all", // get all invoices

  INDIVIDUAL_STORE_GETALL: "individual_seller/pgn", //get
  INDIVIDUAL_SELLER_DETAILS: "individual_seller/", //getbyid
  INDIVIDUAL_STORE_UPDATE_STATUS: "individual_seller/status/", //put
  INDIVIDUAL_STORE_REQUEST_DOCUMENT: "individual_seller/send_mail", //post

  ADMIN_DASHBOARD: "coorporate_store/dashboard/admin", //getdasboard info for only admin

  STORE_INFO: "coorporate_store/details/", //get store details only for store owners
  STORE_UPDATE: "coorporate_store/update", // PUT
  STORE_INFO_ADMIN: "coorporate_store/sellerdetails/",

  BUSINESS_TYPE: "businesstype/", //POST,PUT,DELETE

  CATEGORY: "category/", //delete,put,post

  SUBCATEGORY: "subCategory/",

  OFFERS: "offers/",
  OFFERS_GETALL: "offers/auth",

  //SETTINGS,
  SETTINGS: "settings/",

  //STATES API
  STATES: "states/", //POST,PUT,DELETE

  //COUNTRIES API
  COUNTRIES: "countries/", //GET,POST,PUT,DELETE

  //NEW DISTANCE CHARGE API
  NEW_DISTANCE_CHARGE: "new-distance-charge/", //GET,POST,PUT,DELETE

  //DELIVERY_CHARGE
  DELIVERY_CHARGE: "deliverycharge/", //GET
  DISTANCE_CHARGE: "distancecharge/", //GET
  DELIVERY_CHARGE_UPSERT: "deliverycharge/upsert", //POST :- if id exist update exist record else create new record and delete non-existing ids
  DISTANCE_CHARGE_UPSERT: "distancecharge/upsert", //POST :- if id exist update exist record else create new record and delete non-existing ids

  DASHBOARD_COUNTS: "dashboard/count",
  DASHBOARD_STATISTICS: "dashboard/statistics",
  DASHBOARD_ORDER_STATISTICS: "dashboard/order_statistics",

  COORPORATE_SELLER_DASHBOARD_COUNT: "coorporate_store/dashboard/",

  SETTLEMENT_HISTORY: "settlements/history/", //to get settlement history of a store    get
  SETTLEMENT_SUMMARY: "settlements/summary/", //to get settlement history of a store    get
  SETTLEMENT_CREATE: "settlements/create", //only for admin

  AUTO_COMPLETE: "google-proxy/autocomplete", //GET
  GOOGLE_PLACEPICKER: "google-proxy/placepicker", //GET

  SIGNUP: "auth/signup", //POST
  USER_CHECK_PHONE: "auth/checkphone/", //check phone number exist for signup
  USER_CHECK_EMAIL: "auth/checkEmail/", //check email
  USER_FORGOT_PASSWORD: "auth/forgot-password", //post forgot password request

  //SUBSCRIPTION PLANS API
  SUBSCRIPTION_PLANS: "subscription-plans/", //GET,POST,PUT,DELETE
  SUBSCRIPTION_PLANS_FEATURED_POSITION: "subscription-plans/featured-position", //PUT - Update featured position

  //BOOST REQUESTS API
  BOOST_REQUESTS: "boost-requests/", //GET,POST,PUT,DELETE
  BOOST_REQUEST_APPROVE: "boost-requests/approve", //POST - Admin approve/reject
  BOOST_REQUEST_PRIORITY: "boost-requests/priority", //PUT - Admin update priority

  //DELIVERY PARTNER API
  DELIVERY_COMPANIES_ALL: "delivery/companies", //GET - All delivery companies
  DELIVERY_COMPANY_UPDATE_STATUS: "delivery/company/", //PUT - Update company status
  DRIVERS_ALL: "delivery/drivers", //GET - All drivers
  DRIVER_UPDATE_STATUS: "delivery/driver/", //PUT - Update driver status
} as const;
export default API_ADMIN;
