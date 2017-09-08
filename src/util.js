/**
 * 支持跨域的 header 设置
 */
function getCorsHeader(request) {
    var origin = request.get('origin');
    var accessControlRequestHeaders = request.get('Access-Control-Request-Headers');

    var header = {
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'Access-Control-Allow-Credentials': 'true'
    };
    header['Access-Control-Allow-Origin'] = origin ? origin : '*';

    if (accessControlRequestHeaders) {
        header['Access-Control-Allow-Headers'] = accessControlRequestHeaders;
    }

    return header;
}

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
    getCorsHeader: getCorsHeader,
    isEmptyObject: isEmptyObject
};