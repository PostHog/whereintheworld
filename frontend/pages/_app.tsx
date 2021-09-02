import React from 'react'
import '../styles.scss'
import { resetContext, Provider } from 'kea'
import { loadersPlugin } from 'kea-loaders'

export const API = `http://localhost:3001`

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
