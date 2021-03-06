"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phoneNumberVerification = exports.startStoreUserVerification = void 0;
const smsFunction_1 = require("../../utils/smsFunction");
exports.startStoreUserVerification = async (storeUser, target, session) => {
    switch (target) {
        case "PHONE": {
            // 인증문자 전송
            const code = Math.floor(Math.random() * 1000000)
                .toString()
                .padStart(6, "0");
            storeUser.phoneVerificationCode = code;
            await storeUser.save({ session });
            await smsFunction_1.sendSMS({
                receivers: storeUser.phoneNumber,
                msg: `회원가입 인증코드는 [${code}] 입니다.`
            });
            return code;
        }
        case "EMAIL": {
            // TODO: Email 인증 미완성. Email 전송 로직이 없음
            const code = Math.random()
                .toString(36)
                .substr(2)
                .slice(0, 7)
                .toUpperCase();
            return code;
        }
        default: {
            throw new Error("VerificationTarget 값 에러");
        }
    }
};
exports.phoneNumberVerification = () => { };
//# sourceMappingURL=storeUserFunc.js.map