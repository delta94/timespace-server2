import { Resolvers } from "../../../types/resolvers";
import { EmailSignUpResponse } from "../../../types/graph";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { defaultResolver } from "../../../utils/resolverFuncWrapper";
import { UserModel } from "../../../models/User";
import { ObjectId } from "mongodb";
import { CountryInfoModel } from "../../../models/CountryInfo";
import { ApolloError } from "apollo-server";

const resolvers: Resolvers = {
    Mutation: {
        EmailSignUp: defaultResolver(
            async (
                { parent, args: { param } },
                logArr: any[]
            ): Promise<EmailSignUpResponse> => {
                try {
                    const {
                        username,
                        email,
                        password,
                        phoneNumber,
                        timezone
                    } = param;

                    const countryInfo = await CountryInfoModel.findOne({
                        "timezones.name": timezone
                    });

                    if (!countryInfo) {
                        throw new ApolloError(
                            "UNDEFINED_COUNTRYINFO",
                            "Timezone 설정이 잘못되었습니다.",
                            {
                                timezone
                            }
                        );
                    }

                    const cognito = new CognitoIdentityServiceProvider();
                    const tz = countryInfo.timezones.find(
                        tz => tz.name === timezone
                    );
                    const zoneinfo = {
                        name: countryInfo.countryName,
                        tz: tz?.name,
                        code: countryInfo.countryCode,
                        offset: tz?.offset,
                        callingCode: countryInfo.callingCode
                    };
                    const result = await cognito
                        .signUp({
                            ClientId: process.env.COGNITO_CLIENT_ID || "",
                            Username: email,
                            Password: password,
                            UserAttributes: [
                                {
                                    Name: "name",
                                    Value: username
                                },
                                {
                                    Name: "email",
                                    Value: email
                                },
                                {
                                    Name: "phone_number",
                                    Value: phoneNumber
                                },
                                {
                                    Name: "zoneinfo",
                                    // name, offset 으로 구성된 아이임 ㅎㅎ
                                    Value: JSON.stringify(zoneinfo)
                                }
                            ]
                        })
                        .promise();
                    await UserModel.create({
                        _id: new ObjectId(),
                        sub: result.UserSub,
                        zoneinfo,
                        loginInfos: []
                    });
                    return {
                        ok: true,
                        error: null,
                        data: {
                            CodeDeliveryDetails:
                                (result.CodeDeliveryDetails && {
                                    AttributeName:
                                        result.CodeDeliveryDetails
                                            .AttributeName || null,
                                    DeliveryMedium:
                                        result.CodeDeliveryDetails
                                            .DeliveryMedium || null,
                                    Destination:
                                        result.CodeDeliveryDetails
                                            .Destination || null
                                }) ||
                                null,
                            UserConfirmed: result.UserConfirmed,
                            UserSub: result.UserSub
                        }
                    };
                } catch (error) {
                    return {
                        ok: false,
                        error: {
                            msg: error.message,
                            code: error.code || error.extensions.code
                        },
                        data: null
                    };
                }
            }
        )
    }
};
export default resolvers;
