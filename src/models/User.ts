import {
    getModelForClass,
    modelOptions,
    prop,
    DocumentType
} from "@typegoose/typegoose";
import { getCollectionName, ModelName } from "./__collectionNames";
import { User } from "../types/graph";
import { ErrCls } from "./Err";
import { ObjectId } from "mongodb";

export type LoggedInInfo = {
    refreshToken: string;
    idToken: string;
    accessToken: string;
    expiryDate: number;
    ip: string;
    os: string;
};

@modelOptions({
    schemaOptions: {
        _id: true,
        collection: getCollectionName(ModelName.USER),
        timestamps: true
    }
})
export class UserCls {
    static findBySub = async (sub: string): Promise<DocumentType<UserCls>> => {
        const user = await UserModel.findOne({
            sub
        });
        if (!user) {
            throw ErrCls.makeErr("201", "존재하지 않는 UserId");
        }
        return user;
    };
    @prop()
    _id: ObjectId;

    @prop()
    sub: string;

    @prop()
    loginInfos: LoggedInInfo[];
}

export const migrateCognitoUser = (user: any): User => {
    return {
        _id: user.sub,
        tokenExpiry: user.exp,
        ...user
    };
};

export const UserModel = getModelForClass(UserCls);
