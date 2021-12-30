/* config-overrides.js */
module.exports = {
    webpack: function (config, env) {
        // ...add your webpack config
        config.output.publicPath = '/static/'
        return config
    },
    devServer: function (configFunction) {
        return function (proxy, allowedHost) {
            const config = configFunction(proxy, allowedHost)
            config.devMiddleware.writeToDisk = true
            return config
        }
    },
}
