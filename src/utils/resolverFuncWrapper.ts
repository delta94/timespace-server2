import { fmtLog } from "../logger";
import { ApolloError } from "apollo-server";
import { getIP, getLocalDate, errorReturn } from "./utils";
import { ResolverFunction } from "../types/resolvers";
import { BaseResponse } from "GraphType";
import { ERROR_CODES } from "../types/values";
import { StoreModel } from "../models/Store/Store";
import { StoreUserModel } from "../models/StoreUser";
import { ObjectId } from "mongodb";

export const hexDecode = function(str) {
    var j;
    var hexes = str.match(/.{1,4}/g) || [];
    var back = "";
    for (j = 0; j < hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }
    return back;
};
/**
 * 리솔버 로거... 로그 찍어주는 아이 ㅎㅎ
 * @param resolverFunction
 */
export const defaultResolver = (resolverFunction: ResolverFunction) => async (
    parent: any,
    args: any,
    context: any,
    info: any
) => {
    const startTime = new Date();
    const stack: any[] = [];
    const { headers, body, cognitoUser, cognitoBuyer } = context.req;
    const ips = getIP(context.req);
    let result: any;
    try {
        result = await resolverFunction({ parent, args, context, info }, stack);
    } catch (error) {
        result = {
            ok: false,
            error: {
                code: error.code,
                msg: error.message,
                origin: error
            },
            data: null
        };
    }

    const user = cognitoUser || cognitoBuyer;
    const offset =
        (user && user.zoneinfo && parseInt(user.zoneinfo.offset)) || undefined;

    fmtLog(result.error ? "err" : "info", {
        when: {
            utc: startTime.toISOString(),
            localTime: getLocalDate(startTime, offset).toISOString()
        },
        who: {
            ...headers,
            ip: {
                clientIP: ips[0],
                proxys: ips.slice(1)
            },
            "X-JWT": headers["X-JWT"] || headers["x-jwt"],
            "X-JWT-B": headers["X-JWT-B"] || headers["x-jwt-b"],
            "user-agent": headers["user-agent"],
            user: user && {
                sub: user.sub,
                email: user.email,
                // eslint-disable-next-line @typescript-eslint/camelcase
                phone_number: user.phone_number,
                name: user.name,
                exp: user.exp
            }
        },
        where: info.fieldName,
        data: {
            resTime: `${new Date().getTime() - startTime.getTime()} ms`,
            body,
            input: args,
            stack,
            output: result
        }
    });
    return result;
};

export const privateResolver = (resolverFunction: ResolverFunction) => async (
    { parent, args, context, info },
    stack: any[]
): Promise<BaseResponse & { data: any | null }> => {
    try {
        if (!context.req.cognitoUser) {
            const token: string | undefined =
                context.req.session.seller?.idToken;
            console.log({
                token
            });
            if (token === "TokenExpiredError") {
                throw new ApolloError(
                    "만료된 토큰입니다. 다시 로그인 해주세요",
                    "TOKEN_EXPIRED_ERROR",
                    {
                        headers: context.req.headers
                    }
                );
            }
            throw new ApolloError(
                "Unauthorized",
                ERROR_CODES.UNAUTHORIZED_USER,
                {
                    jwt: context.req.headers.jwt
                }
            );
        }
        return await resolverFunction({ parent, args, context, info }, stack);
    } catch (error) {
        return await errorReturn(error);
    }
};

export const privateResolverForBuyer = (
    resolverFunction: ResolverFunction
) => async (
    { parent, args, context, info },
    stack: any[]
): Promise<BaseResponse & { data: any | null }> => {
    try {
        if (!context.req.cognitoBuyer) {
            const token: string | undefined =
                context.req.session.buyer?.idToken;
            if (token === "TokenExpiredError") {
                throw new ApolloError(
                    "만료된 토큰입니다. 다시 로그인 해주세요",
                    "TOKEN_EXPIRED_ERROR",
                    {
                        headers: context.req.headers
                    }
                );
            }
            throw new ApolloError(
                "Unauthorized",
                ERROR_CODES.UNAUTHORIZED_USER,
                {
                    jwt: context.req.headers.jwt
                }
            );
        }
        return await resolverFunction({ parent, args, context, info }, stack);
    } catch (error) {
        return await errorReturn(error);
    }
};

export const privateResolverForStore = (
    resolverFunction: ResolverFunction
) => async (
    { parent, args, context, info },
    stack: any[]
): Promise<BaseResponse & { data: any | null }> => {
    try {
        const storeCode: string | undefined = context.req.storeCode;
        if (!storeCode) {
            throw new ApolloError(
                "존재하지 않는 StoreCode 입니다.",
                ERROR_CODES.UNEXIST_STORE_CODE
            );
        }
        const store = await StoreModel.findByCode(storeCode);
        context.req.store = store;
        if (!store) {
            throw new ApolloError(
                "store 인증 에러",
                ERROR_CODES.UNEXIST_STORE_CODE
            );
        }
        return await resolverFunction({ parent, args, context, info }, stack);
    } catch (error) {
        return await errorReturn(error);
    }
};

export const privateResolverForStoreUser = (
    resolverFunction: ResolverFunction
) => async (
    { parent, args, context, info },
    stack: any[]
): Promise<BaseResponse & { data: any | null }> => {
    try {
        const storeCode: string | undefined = context.req.storeCode;
        if (!storeCode) {
            throw new ApolloError(
                "존재하지 않는 StoreCode 입니다.",
                ERROR_CODES.UNEXIST_STORE_CODE
            );
        }
        const storeUser = context.req.session?.storeUsers?.[storeCode];
        if (!storeUser) {
            throw new ApolloError(
                "인증되지 않았습니다.",
                ERROR_CODES.UNAUTHORIZED_USER
            );
        }
        // update여부 체크 ㄱㄱ
        const updatedStoreUser = await StoreUserModel.findOne({
            _id: new ObjectId(storeUser._id),
            updatedAt: {
                $gt: new Date(storeUser.updatedAt)
            }
        }).exec();
        if (updatedStoreUser) {
            context.req.session.storeUsers[
                storeCode
            ] = updatedStoreUser.toObject();
            context.req.session.save((err: any) => {
                if (err) {
                    throw new err();
                }
            });
            context.req.storeUser = updatedStoreUser.toObject();
        } else {
            context.req.storeUser = storeUser;
        }

        return await resolverFunction({ parent, args, context, info }, stack);
    } catch (error) {
        return await errorReturn(error);
    }
};
