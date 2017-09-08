# mock-route

[![NPM version][npm-image]][npm-url] [![changelog][changelog-image]][changelog-url] [![license][license-image]][license-url]

[npm-image]: https://img.shields.io/npm/v/mock-route.svg?style=flat-square
[npm-url]: https://npmjs.org/package/mock-route
[license-image]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square
[license-url]: https://github.com/ufologist/mock-route/blob/master/LICENSE
[changelog-image]: https://img.shields.io/badge/CHANGE-LOG-blue.svg?style=flat-square
[changelog-url]: https://github.com/ufologist/mock-route/blob/master/CHANGELOG.md

读取 [_mockserver](https://github.com/ufologist/puer-mock#config).json(或者.js) 配置文件, 生成 puer 的 [route config](https://github.com/leeluolee/puer#mock-request).

## Usage

```javascript
var mockRoute = require('mock-route');

// read _mockserver.json config file
var mockConfig = mockRoute.getMockConfig('./_mockserver.json');
// or read _mockserver.js config file
// var mockConfig = mockRoute.getMockConfig('./_mockserver.js');

// generate puer route config
var routeConfig = mockRoute.generateRouteConfig(mockConfig);
```