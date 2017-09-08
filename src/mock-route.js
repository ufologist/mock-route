var fs = require('fs');

var stripJsonComments = require('strip-json-comments');
var Mock = require('mockjs');

var validateRequest = require('./validate-request');
var util = require('./util');

/**
 * 读取 _mockserver.json 配置文件
 * 
 * @param {string} mockConfigFile
 * @return {object}
 */
function getMockConfig(mockConfigFile) {
    // 不使用 require('./_mockserver.json') 因为他会缓存文件的内容, 并不是每次都重新读取
    var mockConfigContent = fs.readFileSync(mockConfigFile, {encoding: 'utf-8'});
    // 通过 stripJsonComments 让 JSON 文件中可以使用注释
    return JSON.parse(stripJsonComments(mockConfigContent));
}

/**
 * 生成 puer route 配置
 */
function generateRouteConfig(mockConfig) {
    var routeConfig = {};

    var apiMockConifg = mockConfig.api;
    for (var routeKey in apiMockConifg) {
        var mock = apiMockConifg[routeKey];

        if (mock.disabled) {
            console.info(routeKey + ' disabled');
        } else {
            // 注意要使用闭包固定住 apiMockConifg 中的数据
            routeConfig[routeKey] = (function(mock) {
                return function(request, response, next) {
                    validateRequest(request, response, mock.request, function() {
                        sendMockData(request, response, mock.response);
                    });
                };
            })(mock);

            // addOptionRoute(routeConfig, routeKey);
        }
    }

    return routeConfig;
}

/**
 * 发送接口假数据
 */
function sendMockData(request, response, mockResponse) {
    var mockResponseData = Mock.mock(mockResponse);

    enableCors(request, response);
    response.jsonp(mockResponseData);
}

/**
 * enable CORS
 * https://github.com/expressjs/cors
 * 由于跨域的 PUT, DELETE 请求需要回应一个 OPTIONS 做 preflight 请求,
 * 但是没有配置这样的路由, 如果确实有需要, 可以使用 addOptionRoute 方法
 */
function enableCors(request, response) {
    response.set(util.getCorsHeader(request));
}

/**
 * 为每一个 mock route 添加 options 路由来允许跨域请求
 * 
 * XXX 这个有必要吗? 先实现在这里吧, 感觉没那么必要
 */
function addOptionRoute(routeConfig, routeKey) {
    var tmp = routeKey.split(/\s+/);
    var path = '';
    if (tmp.length > 1) {
        path = tmp[1];
    } else {
        path = routeKey;
    }

    routeConfig['options ' + path] = function(request, response, next) {
        enableCors(request, response);
        response.sendStatus(200);
    };
}

/**
 * 将 mock 配置按照 module 进行分组
 * 
 * @param {object} mockConfig
 * @return {object}
 */
function groupApiByModuleName(mockConfig) {
    // clone mockConfig
    var _mockConfig = JSON.parse(JSON.stringify(mockConfig));

    var apiMockConifg = _mockConfig.api;
    for (var routeKey in apiMockConifg) {
        var mock = apiMockConifg[routeKey];
        // 分组了就不需要原来的属性了
        delete apiMockConifg[routeKey];

        var moduleName = '';
        if (mock.info && mock.info.module) {
            moduleName = mock.info.module;
        }
        if (!apiMockConifg[moduleName]) {
            apiMockConifg[moduleName] = {};
        }

        apiMockConifg[moduleName][routeKey] = mock;
    }

    return _mockConfig;
}

module.exports = {
    getMockConfig: getMockConfig,
    generateRouteConfig: generateRouteConfig,
    groupApiByModuleName: groupApiByModuleName,
    enableCors: enableCors
};