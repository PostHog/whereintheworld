import React from 'react'
import ReactDOM from 'react-dom'
import 'styles.scss'
import reportWebVitals from './reportWebVitals'
import { resetContext, Provider } from 'kea'
import { loadersPlugin } from 'kea-loaders'

let hostname = 'http://localhost:8000'
if (typeof window !== 'undefined') {
    if (window.location.origin.indexOf('localhost') > -1) {
        hostname = 'http://localhost:8000'
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

ReactDOM.render(
    <React.StrictMode>
        <Provider>Hello there!</Provider>
    </React.StrictMode>,
    document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
