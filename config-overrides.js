/* config-overrides.js */
module.exports = {
    webpack: function (config, env) {
        // We append /static as Django serves files from /static
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
