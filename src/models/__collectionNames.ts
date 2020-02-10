const prefix = "dev_";
export enum ModelName {
    USER = "UserList",
    STORE = "StoreList",
    GROUP = "GroupList",
    PRODUCT = "ProductList",
    SALES = "SalesList",
    ZONE_INFO = "CountryInfoList",
    NOTIFICATION = "Notifications",
    PAYMETHOD = "PayMethodList",
    PAYMENT_HISTORY = "PaymentHistory"
}

export const getCollectionName = (modelName: ModelName): string =>
    `${prefix}${modelName}`;
