import { ONE_MINUTE, ONE_HOUR, ONE_DAY } from "./dateFuncs";
import { ClientSession } from "mongoose";

export const getIP = (req: any): string[] => {
    const ips: string[] = (
        req.headers["x-forwarded-for"] ||
        req.headers["X-Forwarded-For"] ||
        req.ip
    )
        .split(",")
        .map((ip: string) => ip.trim());
    return ips;
};

export const getLocalDate = (date: Date, offsetHour?: number) => {
    return new Date(
        date.getTime() +
            (offsetHour !== undefined
                ? offsetHour * ONE_HOUR
                : -date.getTimezoneOffset() * ONE_MINUTE)
    );
};

export const dateToMinutes = (date: Date) => {
    return (date.getTime() % ONE_DAY) / ONE_MINUTE;
};

export const daysToNumber = (days: any[]) => {
    return days.reduce((d1, d2) => d1 + d2);
};

export const daysNumToArr = (day: number, criteria = 64): number[] => {
    if (criteria === 0) {
        return [];
    }
    if (day >= criteria) {
        const v = daysNumToArr(day - criteria, criteria >> 1);
        v.push(criteria);
        return v;
    } else {
        return daysNumToArr(day, criteria >> 1);
    }
};

export const errorReturn = async (error: any, dbSession?: ClientSession) => {
    if (dbSession) {
        await dbSession.abortTransaction();
        dbSession.endSession();
    }
    console.log({
        error0: error
    });
    return {
        ok: false,
        error: {
            code: error.code || error.extensions.code,
            msg: error.message
        },
        data: null
    };
};
