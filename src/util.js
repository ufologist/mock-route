/**
 * 支持跨域的 header 设置
 */
var CORS_HEADER = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type',
    'Access-Control-Allow-Credentials': 'true'
};

/**
 * 借用 jQuery.isEmptyObject
 * 
 * @param {object} obj
 * @return {boolean}
 */
function isEmptyObject(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
}

module.exports = {
    CORS_HEADER: CORS_HEADER,
    isEmptyObject: isEmptyObject
};