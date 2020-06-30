export type Minute = number;
export type DaysNum = number;
export type Second = number;
export type Hour = number;

export enum ERROR_CODES {
    UNDERDEVELOPMENT = "UNDERDEVELOPMENT",
    ACCESS_DENY_USER = "ACCESS_DENY_USER",
    ACCESS_DENY_STORE = "ACCESS_DENY_STORE",
    ACCESS_DENY_ITEM = "ACCESS_DENY_ITEM",
    ACCESS_DENY_PRODUCT = "ACCESS_DENY_PRODUCT",
    UNAUTHORIZED_USER = "UNAUTHORIZED_USER",
    UNEXIST_STORE = "UNEXIST_STORE",
    UNEXIST_PRODUCT = "UNEXIST_PRODUCT",
    UNEXIST_GROUP = "UNEXIST_GROUP",
    UNEXIST_USER = "UNEXIST_USER",
    UNDEFINED_JWK = "UNDEFINED_JWK",
    DATETIMERANGE_UNIT_ERROR = "DATETIMERANGE_UNIT_ERROR",
    VALUE_ERROR = "VALUE_ERROR",
    UNAVAILABLE_SOLD_OUT = "UNAVAILABLE_SOLD_OUT",
    UNAVAILABLE_BUSINESSHOURS = "UNAVAILABLE_BUSINESSHOURS",
    UNEXIST_ITEM = "UNEXIST_ITEM",
    UNAVAILABLE_QUERY_DATE = "UNAVAILABLE_QUERY_DATE",
    INVALID_USER_SUB = "INVALID_USER_SUB",
    ALREADY_CANCELED_ITEM = "ALREADY_CANCELED_ITEM",
    ALREADY_PERMITTED_ITEM = "ALREADY_PERMITTED_ITEM",
    IMPOSIBLE_CHANGE_ITEM_STATUS = "IMPOSIBLE_CHANGE_ITEM_STATUS",
    UNDEFINED_COUNTRYINFO = "UNDEFINED_COUNTRYINFO",
    FALCY_TIMEZONE = "FALCY_TIMEZONE",
    INVALID_VALUES = "INVALID_VALUES",
    UNINCLUDED_BOOKING_DATERANGE = "UNINCLUDED_BOOKING_DATERANGE",
    TOKEN_REFRESH_FAIL = "TOKEN_REFRESH_FAIL",
    SMS_SEND_FAIL = "SMS_SEND_FAIL",
    INVALID_PARAMETERS = "INVALID_PARAMETERS",
    ALREADY_REGISTERED_SENDER = "ALREADY_REGISTERED_SENDER",
    PASSWORD_COMPARE_ERROR = "PASSWORD_COMPARE_ERROR",
    DELETED_STORE = "DELETED_STORE",
    ITEM_VALIDATION_ERROR = "ITEM_VALIDATION_ERROR",
    UNEXIST_SMS_KEY = "UNEXIST_SMS_KEY",
    ACCESS_DENY_STORE_GROUP = "ACCESS_DENY_STORE_GROUP",
    FAIL_TO_SIGNOUT = "FAIL_TO_SIGNOUT",
    UNEXIST_STORE_CODE = "UNEXIST_STORE_CODE",
    UNEXIST_STORE_USER = "UNEXIST_STORE_USER",
    INVALID_USER_INFO = "INVALID_USER_INFO"
}

export enum DayEnum {
    SUN = 0b0000001,
    MON = 0b0000010,
    TUE = 0b0000100,
    WED = 0b0001000,
    THU = 0b0010000,
    FRI = 0b0100000,
    SAT = 0b1000000
}

export const DB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

export const DEFAULT_STORE_COLOR = "#32297d";
