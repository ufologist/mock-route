var fs = require('fs');
var path = require('path');

var stripJsonComments = require('strip-json-comments');
var JSON5 = require('json5');
var Mock = require('mockjs');
var httpProxy = require('http-proxy');

var validateRequest = require('./validate-request');
var util = require('./util');

/**
 * 读取 _mockserver.json 或者 _mockserver.js 配置文件
 * 
 * @param {string} mockConfigFilePath
 * @return {object}
 */
function getMockConfig(mockConfigFilePath) {
    var mockConfig = {};

    var ext = path.extname(mockConfigFilePath);
    if (ext == '.json') {
        try {
            var mockConfigContent = fs.readFileSync(mockConfigFilePath, {encoding: 'utf-8'});
            // 通过 stripJsonComments 让 JSON 文件中可以使用注释
            // 先通过标准的 JSON 库来解析, 如果有异常再使用 JSON5 库来解析增强容错性
            mockConfig = JSON.parse(stripJsonComments(mockConfigContent));
        } catch (error) {
            try {
                mockConfig = JSON5.parse(mockConfigContent);
            } catch (error) {
                console.error('HTTP 接口的 Mock 数据配置有问题', mockConfigFilePath);
                console.error(error);
            }
        }
    } else if (ext == '.js') {
        try {
            mockConfigFilePath = path.resolve(mockConfigFilePath);
            // https://nodejs.org/api/modules.html#modules_require_cache
            delete require.cache[mockConfigFilePath];
            mockConfig = require(mockConfigFilePath);
        } catch (error) {
            console.error('HTTP 接口的 Mock 数据配置有问题', mockConfigFilePath);
            console.error(error);
        }
    }

    return mockConfig;
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
                if (mock.proxy) { // 代理接口
                    return function(request, response, next) {
                        // 必须每个 Mock 请求都使用一个新的 proxy
                        // 不然其他 mock 配置的 proxy 选项会影响到整个 proxy 实例
                        var proxy = httpProxy.createProxyServer({
                            // changes the host header to the target URL
                            changeOrigin: true
                        });

                        var proxyOption = typeof mock.proxy == 'string' ? {
                            target: mock.proxy
                        } : mock.proxy;

                        // 使用 http-proxy 来实现代理功能,
                        // 也可以使用 axio 来代理请求
                        proxy.web(request, response, proxyOption, function(error) {
                            response.send(error);
                        });
                    }
                } else { // Mock 接口
                    return function(request, response, next) {
                        validateRequest(request, response, mock.request, function() {
                            sendMockData(request, response, mock.response);
                        });
                    };
                }
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