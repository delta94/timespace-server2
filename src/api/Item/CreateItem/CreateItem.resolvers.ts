import { ApolloError } from "apollo-server";
import { mongoose } from "@typegoose/typegoose";
import { errorReturn } from "../../../utils/utils";
import { Resolvers } from "../../../types/resolvers";
import { CreateItemResponse, CreateItemMutationArgs } from "GraphType";
import {
    defaultResolver,
    privateResolver
} from "../../../utils/resolverFuncWrapper";
import { ERROR_CODES } from "../../../types/values";
import { ProductModel } from "../../../models/Product/Product";
import { ItemModel } from "../../../models/Item/Item";
import { ONE_MINUTE } from "../../../utils/dateFuncs";
import { ObjectId } from "mongodb";
import { DateTimeRangeCls } from "../../../utils/DateTimeRange";
import { StoreModel } from "../../../models/Store/Store";
import { UserModel } from "../../../models/User";
import { uploadFile } from "../../../utils/s3Funcs";
import { CustomFieldCls } from "../../../types/types";

const resolvers: Resolvers = {
    Mutation: {
        CreateItem: defaultResolver(
            privateResolver(
                async (
                    { args, context: { req } },
                    stack
                ): Promise<CreateItemResponse> => {
                    const session = await mongoose.startSession();
                    session.startTransaction();
                    try {
                        const { cognitoUser } = req;
                        const { param } = args as CreateItemMutationArgs;
                        const now = new Date();
                        const product = await ProductModel.findById(
                            param.productId
                        );
                        if (!product) {
                            throw new ApolloError(
                                "존재하지 않는 Product",
                                ERROR_CODES.UNEXIST_PRODUCT
                            );
                        }
                        const item = new ItemModel();
                        if (param.name && param.phoneNumber) {
                            item.memo = `${param.name} / ${param.phoneNumber}`;
                        }
                        if (param.dateTimeRange) {
                            const { from, to } = param.dateTimeRange;
                            item.dateTimeRange = {
                                from,
                                to,
                                interval: Math.floor(
                                    (to.getTime() - from.getTime()) / ONE_MINUTE
                                )
                            };
                        }
                        const store = await StoreModel.findById(
                            product.storeId
                        );
                        if (!store) {
                            throw new ApolloError(
                                "존재하지 않는 StoreId",
                                ERROR_CODES.UNEXIST_STORE
                            );
                        }

                        item.productId = product._id;
                        item.storeId = product.storeId;
                        item.userId = new ObjectId(cognitoUser._id);
                        await item
                            .applyStatus("PERMITTED", {
                                workerId: new ObjectId(cognitoUser._id)
                            })
                            .save({ session });
                        await item.setCode(product.code, now);

                        const customFieldDef = store.customFields;
                        const customFieldValues = param.customFieldValues;
                        const findField = (
                            fields: CustomFieldCls[],
                            key: ObjectId
                        ): CustomFieldCls | undefined => {
                            return fields.find(f => f.key.equals(key));
                        };
                        for (const fieldName in param) {
                            if (fieldName === "customFieldValues") {
                                item[fieldName] = (
                                    await Promise.all(
                                        customFieldValues.map(async f => {
                                            const ff = findField(
                                                customFieldDef,
                                                new ObjectId(f.key)
                                            );
                                            if (!ff) {
                                                return undefined;
                                            }
                                            let url: string | null = null;
                                            if (f.file && ff.type === "FILE") {
                                                const file = await f.file;
                                                url = (
                                                    await uploadFile(file, {
                                                        dir: `buyer/${item.code}`
                                                    })
                                                ).url;
                                            }
                                            return {
                                                key: new ObjectId(f.key),
                                                label: ff.label,
                                                type: ff.type,
                                                value: f.value || url
                                            };
                                        })
                                    )
                                ).filter(t => t) as any;
                            } else {
                                const element = param[fieldName];
                                item[fieldName] = element;
                            }
                        }

                        // validation 필요함!
                        // needConfirm
                        const dateTimeRange = param.dateTimeRange;
                        if (dateTimeRange) {
                            const list = await product.getSegmentSchedules(
                                new DateTimeRangeCls(dateTimeRange)
                            );
                            if (list.length === 0) {
                                throw new ApolloError(
                                    "이용 가능한 시간이 아닙니다.",
                                    ERROR_CODES.UNAVAILABLE_BUSINESSHOURS
                                );
                            }

                            const isAvailable =
                                list.map(l => !l.soldOut).filter(t => t)
                                    .length === list.length;
                            if (!isAvailable) {
                                throw new ApolloError(
                                    "SoldOut인 Segment가 존재합니다.",
                                    ERROR_CODES.UNAVAILABLE_SOLD_OUT,
                                    {
                                        segment: list
                                    }
                                );
                            }
                        }

                        const seller = await UserModel.findById(product.userId);
                        if (!seller) {
                            throw new ApolloError(
                                "존재하지 않는 UserId",
                                ERROR_CODES.UNEXIST_USER,
                                {
                                    errorInfo: "Product객체에 UserId 에러임"
                                }
                            );
                        }

                        // TODO 2020-05-17: 해당 시간에 예약이 가능한지 확인해야됨 ㅎ

                        // TODO 2020-05-17: Trigger를 이용한 문자 전송

                        await item.save({ session });
                        await session.commitTransaction();
                        session.endSession();
                        return {
                            ok: true,
                            error: null,
                            data: item as any
                        };
                    } catch (error) {
                        return await errorReturn(error, session);
                    }
                }
            )
        )
    }
};

export default resolvers;
