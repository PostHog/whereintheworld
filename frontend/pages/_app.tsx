import React from 'react'
import '../styles.scss'
import { resetContext, Provider } from 'kea'
import { loadersPlugin } from 'kea-loaders'

let hostname = 'http://localhost:3001'
if (typeof window !== 'undefined') {
    if(window.location.origin.indexOf('localhost') > -1) {
        hostname = 'http://localhost:3001'
    } else {
        hostname = window.location.origin
    }
 }

export const API = hostname

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
