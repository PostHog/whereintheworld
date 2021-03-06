import React from 'react'
import ReactDOM from 'react-dom'
import reportWebVitals from './reportWebVitals'
import { resetContext, Provider } from 'kea'
import { loadersPlugin } from 'kea-loaders'
import { routerPlugin } from 'kea-router'
import { App } from './App'
import posthog from 'posthog-js'

posthog.init('phc_EJzNlXWFR9fCwwv9hOTMZooUs0UnnlLLwla07KKXvOi', { api_host: 'https://app.posthog.com' })

resetContext({
    createStore: {
        // options for redux (e.g. middleware, reducers, ...)
    },
    plugins: [loadersPlugin({}), routerPlugin({})],
})

ReactDOM.render(
    <React.StrictMode>
        <Provider>
            <App />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
