# CHANGELOG

* v1.5.0 2019-1-3

  * [feat] 新增 `function` 类型的 mock 配置, 用于实现完全自定义 mock

    例如

    ```javascript
    // 必须使用 js 类型的 mock 文件, 例如 news.js
    "GET /api/new/:id": function(request, response, next) {
        // 可以返回对象, 达到动态组装 mock 数据的目的
        return {
            id: request.params.id,
            name: '@cname'
        };
    }
    ```

* v1.4.1 2018-3-30

  * [fix] 使用 `JSON5` 来解析 mock 数据配置文件, 增强配置的容错性

* v1.4.0 2017-10-12

  * [feat] 新增 `proxy` 配置项来支持代理接口

* v1.3.1 2017-9-8

  * [fix] `.js` 的 mock 配置文件应该使用绝对路径来 `require`

* v1.3.0 2017-9-8

  * [feat] 新增支持 `.js` 的 mock 配置文件

* v1.2.0 2017-9-8

  增强跨域请求的设置

* v1.1.0 2017-9-8

  将 `groupApiByModuleName` 方法也从 [puer-mock](https://github.com/ufologist/puer-mock) 项目中移过来

* v1.0.0 2017-9-8

  初始版本, 原来是放在 [puer-mock](https://github.com/ufologist/puer-mock) 项目中的 route-config.js, 现在单独提取出来作为一个模块.