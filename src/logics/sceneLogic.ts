import { kea } from 'kea'
import { lazy } from 'react'
import type { sceneLogicType } from './sceneLogicType'

type ParamsType = Record<string, any>

export enum Scene {
    Error404 = '404',
    Home = 'home',
    Me = 'me',
}

export const urls = {
    default: () => '/',
    me: () => '/me',
    notFound: () => '/404',
}

export const routes: Record<string, Scene> = {
    [urls.default()]: Scene.Home,
    [urls.me()]: Scene.Me,
    [urls.notFound()]: Scene.Error404,
}

export const scenes = {
    error404: () => 'Not Found',
    home: lazy(() => import('../scenes/Home')),
    me: () => 'Hello',
}

export const sceneLogic = kea<sceneLogicType<ParamsType, Scene>>({
    actions: {
        setScene: (scene: Scene, params: ParamsType) => ({ scene, params }),
    },
    reducers: {
        scene: [
            Scene.Home as Scene,
            {
                setScene: (_, payload) => payload.scene,
            },
        ],
        params: [
            {} as ParamsType,
            {
                setScene: (_, payload) => payload.params || {},
            },
        ],
    },
    urlToAction: ({ actions }) => {
        const parsedRoutes = Object.fromEntries(
            Object.entries(routes).map(([path, scene]) => [
                path,
                (params: ParamsType) => actions.setScene(scene, params),
            ])
        )
        parsedRoutes['/*'] = (params: ParamsType) => actions.setScene(Scene.Error404, params)
        return parsedRoutes
    },
})
