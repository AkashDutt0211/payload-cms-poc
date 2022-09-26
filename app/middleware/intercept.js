
const crypt = require('./crypt')

const decrypt = function (req, res, next) {

    let payload_decrypted;

    try {
        payload_decrypted = crypt.decrypt(req.body, `./app/keys/${req.headers.client_id}-public.pem`, `./app/keys/private.pem`, process.env.PRIVATE_PHRASE);
    } catch (error) {
        return res.json({
            status: "Failed",
            statusCode: "N",
            error: "Not Authorized"
        });
    }

    let payload;

    try {
        payload = JSON.parse(payload_decrypted);
    } catch (error) {
        return res.json({
            status: "Failed",
            statusCode: "N",
            error: payload_decrypted
        });
    }
    req.body = payload;
    next();
}
module.exports = {
    decrypt: decrypt
}