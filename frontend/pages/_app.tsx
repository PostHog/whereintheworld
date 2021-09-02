import React from 'react'
import '../styles.scss'
import { resetContext, Provider } from 'kea'
import { loadersPlugin } from 'kea-loaders'

resetContext({
    createStore: {
        // options for redux (e.g. middleware, reducers, ...)
    },
    plugins: [loadersPlugin({})],
})

export default function App({ Component, pageProps }) {
    return (
        <Provider>
            <Component {...pageProps} />
        </Provider>
    )
}
