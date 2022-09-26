const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const AES_METHOD = 'aes-256-cbc';

const encrypt = function (text, targetPublicKey, myPrivateKey, myPassphrase) {

    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(AES_METHOD, Buffer.from(key), iv);

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const encryptedkey = encryptStringWithRsaPublicKey(key.toString('hex'), targetPublicKey);

    const signedSignature = signWithRsaPrivateKey(encryptedkey, myPrivateKey, myPassphrase);

    return { key: encryptedkey, encryptedData: iv.toString('hex') + encrypted.toString('hex'), signature: signedSignature };
}

const decrypt = function (payload, targetPublicKey, myPrivateKey, myPassphrase) {

    if (verifyWithRsaPublicKey(payload.key, payload.signature, targetPublicKey)) {

        const decryptedkey = decryptStringWithRsaPrivateKey(payload.key, myPrivateKey, myPassphrase);

        const key = Buffer.from(decryptedkey, 'hex');
        const iv = Buffer.from(payload.encryptedData.substring(0, 32), 'hex');
        const encryptedText = Buffer.from(payload.encryptedData.substring(32), 'hex');

        const decipher = crypto.createDecipheriv(AES_METHOD, key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    }
    else
        return "Bad Signature";
}


const encryptStringWithRsaPublicKey = function (toEncrypt, relativeOrAbsolutePathToPublicKey) {
    const absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
    const publicKey = fs.readFileSync(absolutePath, "utf8");
    const buffer = Buffer.from(toEncrypt);
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString("hex");
};

const decryptStringWithRsaPrivateKey = function (toDecrypt, relativeOrAbsolutePathtoPrivateKey, passphrase) {
    const absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey);
    const encodedPrivateKeyString = fs.readFileSync(absolutePath, "utf8");
    const buffer = Buffer.from(toDecrypt, "hex");

    const decrypted = crypto.privateDecrypt({
        'key': encodedPrivateKeyString,
        'passphrase': passphrase
    }, buffer);
    return decrypted.toString("utf8");
};

const signWithRsaPrivateKey = function (data, relativeOrAbsolutePathtoPrivateKey, passphrase) {
    const absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey);
    const encodedPrivateKeyString = fs.readFileSync(absolutePath, "utf8");

    const sign = crypto.createSign('SHA256');
    sign.write(data);
    sign.end();

    return signature = sign.sign({
        'key': encodedPrivateKeyString,
        'passphrase': passphrase
    }, 'hex');
}

const verifyWithRsaPublicKey = function (data, signature, relativeOrAbsolutePathToPublicKey) {
    const absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
    const publicKey = fs.readFileSync(absolutePath, "utf8");

    const verify = crypto.createVerify('SHA256');
    verify.write(data);
    verify.end();
    return verify.verify(publicKey, signature, 'hex');
};

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt
}