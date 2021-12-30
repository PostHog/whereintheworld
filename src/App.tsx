import { useValues } from 'kea'
import React from 'react'
import { Home } from 'scenes/Home'
import 'styles.scss'
import { authLogic } from './logics/authLogic'

export function App(): JSX.Element {
    const { userLoading, user } = useValues(authLogic)
    if (!user && userLoading) {
        // TODO: Nicer loading state
        return <>Loading ...</>
    }
    return <Home />
}
