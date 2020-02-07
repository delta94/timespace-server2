import {
    getModelForClass,
    modelOptions,
    prop,
    DocumentType
} from "@typegoose/typegoose";
import { getCollectionName, ModelName } from "./__collectionNames";
import { ObjectId } from "mongodb";
import { ApolloError } from "apollo-server";
import { BaseSchema, createSchemaOptions } from "../abs/BaseSchema";

export type LoggedInInfo = {
    idToken: string;
    accessToken: string;
    expiryDate: number;
    ip: string;
    os: string;
};

@modelOptions(createSchemaOptions(getCollectionName(ModelName.USER)))
export class UserCls extends BaseSchema {
    static findBySub = async (sub: string): Promise<DocumentType<UserCls>> => {
        const user = await UserModel.findOne({
            sub
        });
        if (!user) {
            throw new ApolloError(
                "존재하지 않는 UserSub입니다",
                "INVALID_USER_SUB",
                { userSub: sub }
            );
        }
        return user;
    };
    @prop()
    _id: ObjectId;

    @prop()
    sub: string;

    @prop()
    refreshToken: string;

    @prop()
    refreshTokenLastUpdate: Date;

    // Zoneinfo from graph.d.ts
    @prop()
    zoneinfo: any;

    @prop()
    loginInfos: LoggedInInfo[];

    @prop({ default: [] })
    stores: ObjectId[];
}

export const UserModel = getModelForClass(UserCls);
