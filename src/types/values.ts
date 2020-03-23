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
    ALREADY_REGISTERED_SENDER = "ALREADY_REGISTERED_SENDER"
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
