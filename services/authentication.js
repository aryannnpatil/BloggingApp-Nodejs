const JWT = require("jsonwebtoken")
const secretKey= "Thor_GodOfThunder"


function createTokenForUser(user) {
    const payload={
        _id: user._id,
        email: user.email,
        profileImageURL:user.profileImageURL,
        role: user.role,

    };

    const token= JWT.sign(payload,secretKey);
    return token;
}


function validateToken(token) {
    try {
        return JWT.verify(token, secretKey);
    } catch (err) {
        return null;   // prevent crash
    }
}


module.exports={
    createTokenForUser,
    validateToken
}