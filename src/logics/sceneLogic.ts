import { kea } from 'kea'
import { lazy, LazyExoticComponent } from 'react'
import type { sceneLogicType } from './sceneLogicType'

type ParamsType = Record<string, any>

export enum Scene {
    Error404 = 'notFound',
    Home = 'home',
    Welcome = 'welcome',
    Trips = 'trips',
}

export const urls = {
    default: () => '/',
    welcome: () => '/welcome',
    trips: () => '/trips',
    notFound: () => '/404',
}

export const routes: Record<string, Scene> = {
    [urls.default()]: Scene.Home,
    [urls.welcome()]: Scene.Welcome,
    [urls.trips()]: Scene.Trips,
    [urls.notFound()]: Scene.Error404,
}

export const scenes: Record<Scene, LazyExoticComponent<() => JSX.Element> | (() => JSX.Element)> = {
    home: lazy(() => import('../scenes/Home')),
    welcome: lazy(() => import('../scenes/Welcome')),
    trips: lazy(() => import('../scenes/Trips/Trips')),
    notFound: lazy(() => import('../scenes/NotFound')),
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
