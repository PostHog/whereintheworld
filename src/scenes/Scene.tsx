import { useValues } from 'kea'
import { sceneLogic, scenes } from 'logics/sceneLogic'
import React, { Suspense } from 'react'

export function Scene(): JSX.Element {
    const { scene, params } = useValues(sceneLogic)

    const Scene = scenes[scene] || scenes.error404

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Scene {...params} />
        </Suspense>
    )
}
