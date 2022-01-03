import { useValues } from 'kea'
import React from 'react'
import 'styles.scss'
import { authLogic } from './logics/authLogic'
import { Scene } from 'scenes/Scene'

export function App(): JSX.Element {
    const { userLoading, user } = useValues(authLogic)
    if (!user && userLoading) {
        // TODO: Nicer loading state
        return <>Loading ...</>
    }
    return <Scene />
}
