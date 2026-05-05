// export const BASE_URL =
//   "https://poultry-feed-management-software-3.onrender.com";

 export const BASE_URL = "http://localhost:5173";

//export const BASE_URL = "https://anand-erp.onrender.com";

export const API_PATHS = {
  AUTH: {
    LOGIN: (type) => `/api/${type}/login`,
    LOGOUT: (type) => `/api/${type}/logout`,
  },

  ADMIN: {
    REGISTER: "/api/admin/register",
    LOGIN: "/api/admin/login",

    SALESMAN: {
      ADD: "/api/admin/add_salesman",
      GET_ALL: "/api/admin/get_allSalesman",
      GET: (id) => `/api/admin/get_salesman/${id}`,
      UPDATE: (id) => `/api/admin/update_salesman/${id}`,
      DELETE: (id) => `/api/admin/delete_salesman/${id}`,
    },

    SALES_MANAGER: {
      ADD: "/api/admin/add_salesmanager",
      GET_ALL: "/api/admin/get_allsalesmanager",
      GET: (id) => `/api/admin/get_salesmanager/${id}`,
      UPDATE: (id) => `/api/admin/update_salesmanager/${id}`,
      DELETE: (id) => `/api/admin/delete_salesmanager/${id}`,
    },

    SALES_AUTHORIZER: {
      ADD: "/api/admin/add_salesauthorizer",
      GET_ALL: "/api/admin/get_allsalesauthorizer",
      GET: (id) => `/api/admin/get_salesauthorizer/${id}`,
      UPDATE: (id) => `/api/admin/update_salesauthorizer/${id}`,
      DELETE: (id) => `/api/admin/delete_salesauthorizer/${id}`,
    },

    PLANT_HEAD: {
      ADD: "/api/admin/add_planthead",
      GET_ALL: "/api/admin/get_allplantheads",
      GET: (id) => `/api/admin/get_planthead/${id}`,
      UPDATE: (id) => `/api/admin/update_planthead/${id}`,
      DELETE: (id) => `/api/admin/delete_planthead/${id}`,
    },

    ACCOUNTANT: {
      ADD: "/api/admin/add_accountant",
      GET_ALL: "/api/admin/get_allaccountants",
      GET: (id) => `/api/admin/get_accountant/${id}`,
      UPDATE: (id) => `/api/admin/update_accountant/${id}`,
      DELETE: (id) => `/api/admin/delete_accountant/${id}`,
    },

    PRODUCT: {
      ADD: "/api/admin/add_product",
      GET_ALL: "/api/admin/get_allproducts",
      UPDATE_PRICE: (productId) => `/api/admin/products/${productId}`,
      DELETE: (productId) => `/api/admin/delete_product/${productId}`,
    },

    WAREHOUSE: {
      ADD: "/api/admin/add_warehouse",
      GET_ALL: "/api/admin/get_allwarehouse",
      GET: (warehouseId) => `/api/admin/get_warehouse/${warehouseId}`,
      UPDATE: (warehouseId) => `/api/admin/update_warehouse/${warehouseId}`,
      DELETE: (warehouseId) => `/api/admin/delete_warehouse/${warehouseId}`,
      ADD_PRODUCT: (warehouseId) =>
        `/api/admin/warehouse/${warehouseId}/add_product`,
      GET_PRODUCTS: (warehouseId) => `/api/admin/${warehouseId}/products`,
      DELETE_PRODUCT: (warehouseId, productId) =>
        `/api/admin/${warehouseId}/products/${productId}`,
      GET_FILTERED_PRODUCTS: (category) =>
        `/api/admin/get-filtered-products/${category}`,
    },

    ORDERS: {
      GET_TO_APPROVE: "/api/admin/get_orders_to_approve",
      GET_ALL: "/api/admin/get_allorder",
      GET: (id) => `/api/admin/get_order/${id}`,
      CANCEL: (id) => `/api/admin/cancel_order/${id}`,
      APPROVE: "/api/admin/approve_warehouse",
    },

    PARTY: {
      GET_ALL_PARTIES: "/api/admin/get-all-parties",
      GET_APPROVED_PARTIES: "/api/admin/get-approved-parties",
      GET_REJECTED_PARTIES: "/api/admin/get-rejected-parties",
      GET_PARTIES_TO_APPROVE: "/api/admin/get-parties-to-approve",
      APPROVE: "/api/admin/approve-party",
      REJECT: "/api/admin/reject-party",
      UPDATE_PARTY: (partyId) => `/api/admin/update-party/${partyId}`,
    },
  },

  SALESMAN: {
    LOGIN: "/api/salesman/login",
    CREATE_ORDER: "/api/salesman/create_order",
    DELETE_ORDER: (orderId) => `/api/salesman/delete_order/${orderId}`,
    GET_ALL_ORDERS: "/api/salesman/get_allorder",
    GET_ORDER: (orderId) => `/api/salesman/orders/${orderId}`,
    GET_DUE_ORDERS: "/api/salesman/orders/due",
    UPDATE_PAYMENT: `/api/salesman/orders/pay`,
    CHANGE_ACTIVITY_STATUS: "/api/salesman/change-activity-status",
    CANCEL_ORDER: (orderId) => `/api/salesman/cancel_order/${orderId}`,
    ADD_PARTY: "/api/salesman/add-party",
    UPDATE_PARTY: (partyId) => `/api/salesman/update-party/${partyId}`,
    DELETE_PARTY: (partyId) => `/api/salesman/delete-party/${partyId}`,
    GET_ALL_PARTIES: "/api/salesman/get-all-parties",
    GET_APPROVED_PARTIES: "/api/salesman/get-approved-parties",
    GET_REJECTED_PARTIES: "/api/salesman/get-rejected-parties",
    APPROVE_PARTY: "/api/salesman/send-party-for-approval",
    DELIVER_ORDER: "api/salesman/deliver-order",
  },

  MANAGER: {
    LOGIN: "/api/manager/login",
    GET_ASSIGNED_ORDERS: "/api/manager/orders/getAll",
    GET_ORDER: (orderId) => `/api/manager/orders/${orderId}`,
    FORWARD_ORDER: (orderId) => `/api/manager/forward/${orderId}`,
    GET_FORWARDED_ORDERS: "/api/manager/orders/forwarded", //(History)
    CHANGE_ACTIVITY_STATUS: "/api/manager/change-activity-status",
    CANCEL_ORDER: (orderId) => `/api/manager/cancel_order/${orderId}`,
  },

  AUTHORIZER: {
    LOGIN: "/api/authorizer/login",
    GET_ASSIGNED_ORDERS: "/api/authorizer/orders/getAll",
    GET_ALL_WAREHOUSES: "/api/authorizer/get-all-warehouses",
    GET_ORDER: (orderId) => `/api/authorizer/orders/${orderId}`,
    ASSIGN_WAREHOUSE: (orderId) =>
      `/api/authorizer/assign-warehouse/${orderId}`,
    GET_ASSIGNMENT_HISTORY: "/api/authorizer/get-assignment-history",
    CHECK_WAREHOUSE_STATUS: (orderId) =>
      `/api/authorizer/warehouse-status/${orderId}`,
    CHANGE_ACTIVITY_STATUS: "/api/authorizer/change-activity-status",
    CANCEL_ORDER: (orderId) => `/api/authorizer/cancel_order/${orderId}`,
    APPROVE_WAREHOUSE: "/api/authorizer/approve_warehouse",
  },

  PLANT_HEAD: {
    LOGIN: "/api/planthead/login",
    GET_ALL_ORDERS: "/api/planthead/orders/getAll",
    GET_ORDER: (orderId) => `/api/planthead/orders/${orderId}`,
    GET_PRODUCTS: "/api/planthead/warehouse/products",
    UPDATE_PRODUCT_STOCK: (productId) =>
      `/api/planthead/warehouse/products/${productId}`,
    DISPATCH_ORDER: (orderId) => `/api/planthead/dispatch/${orderId}`,
    GET_DISPATCHED_ORDERS: "/api/planthead/dispatched-orders",
    CHANGE_ACTIVITY_STATUS: "/api/planthead/change-activity-status",
    CANCEL_ORDER: (orderId) => `/api/planthead/cancel_order/${orderId}`,
  },

  ACCOUNTANT: {
    LOGIN: "/api/accountant/login",
    GET_DISPATCHED_ORDERS: "/api/accountant/dispatched-orders",
    GET_ORDER: (orderId) => `/api/accountant/order/${orderId}`,
    GENERATE_INVOICE: (orderId) =>
      `/api/accountant/generate-invoice/${orderId}`,
    GENERATE_DUE_INVOICE: (orderId) =>
      `/api/accountant/generate-due-invoice/${orderId}`,
    GET_INVOICE: (orderId) => `/api/accountant/invoice/${orderId}`,
    CHANGE_ACTIVITY_STATUS: "/api/accountant/change-activity-status",
    GET_ORDERS_TO_APPROVE_PAYMENT: "/api/accountant/orders-to-approve-payment",
    GET_ORDERS_TO_APPROVE_DUE_PAYMENT:
      "/api/accountant/orders-to-approve-due-payment",
    APPROVE_ORDER: "/api/accountant/approve-advance-payment/",
    APPROVE_DUE_PAYMENT: "/api/accountant/approve-due-payment/",
  },

  ME: {
    GET: "/api/me",
  },

  MESSAGES: {
    GET_ALL_ADMINS: "/api/messages/get-all-admins",
  },
};
