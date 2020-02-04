import { Resolvers } from "../../../types/resolvers";
import { defaultResolver } from "../../../utils/resolverFuncWrapper";
import { ApolloError } from "apollo-server";
import { refreshToken } from "../../../utils/refreshToken";
import { RefreshTokenResponse } from "../../../types/graph";
import { UserModel } from "../../../models/User";

const resolvers: Resolvers = {
    Mutation: {
        RefreshToken: defaultResolver(
            async (
                stack: any[],
                parent,
                args,
                { req }
            ): Promise<RefreshTokenResponse> => {
                const token: string | undefined = req.get("X-JWT");
                const { user: cognitoUser } = req;
                if (!token) {
                    throw new ApolloError(
                        "UNDEFINED_TOKEN",
                        "토큰값이 존재하지 않습니다.",
                        { token }
                    );
                }
                if (token === "TokenExpiredError") {
                    throw new ApolloError(
                        "TOKEN_EXPIRED_ERROR",
                        "만료된 토큰입니다. 다시 로그인 해주세요"
                    );
                }
                const user = await UserModel.findBySub(cognitoUser.sub);

                const authResult = await refreshToken(user.refreshToken);
                if (!authResult.ok || !authResult.data) {
                    throw authResult.error;
                }
                user.refreshToken = authResult.data.refreshToken;
                stack.push({
                    refreshToken: user.refreshToken,
                    authResult
                });
                return {
                    ok: true,
                    error: null,
                    token: authResult.data.idToken || ""
                };
            }
        )
    }
};
export default resolvers;