const axios = require('axios')
const qs = require('qs');

const sendHttpRequest = async (service, path, type, params, headers) => {
    try {

        params = (type === "GET" && typeof (params) === "object") ? qs.stringify(params) : params;

        params = (type === "POST" && headers && headers["content-type"] === "application/x-www-form-urlencoded") ? qs.stringify(params) : params;

        let response = await axios({
            method: type,
            url: service + (type === "GET" ? (path + "?" + params) : path),
            data: (type != "GET" ? params : null),
            headers: headers
        })

        return response;

    } catch (error) {
        error.payload = params;
        //console.error(error);
        return error;
    }

}

// function jsonToQueryString(json) {
//     return '?' +
//         Object.keys(json).map(function (key) {
//             return encodeURIComponent(key) + '=' +
//                 encodeURIComponent(json[key]);
//         }).join('&');
// }

module.exports = {
    sendHttpRequest: sendHttpRequest
}