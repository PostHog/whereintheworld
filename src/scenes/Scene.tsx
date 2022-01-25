import { useValues } from 'kea'
import { sceneLogic, scenes } from 'logics/sceneLogic'
import React, { Suspense } from 'react'
import { Navigation } from './_Navigation'

export function Scene(): JSX.Element {
    const { scene, params } = useValues(sceneLogic)

    const Scene = scenes[scene] || scenes.notFound

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Navigation />
            <div className="main-layout">
                <Scene {...params} />
            </div>
        </Suspense>
    )
}
