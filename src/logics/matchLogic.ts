import { kea } from 'kea'
import api from 'lib/api'
import { MatchType } from '~/types'
import type { matchLogicType } from './matchLogicType'

export const matchLogic = kea<matchLogicType>({
    loaders: {
        matches: [
            [] as MatchType[],
            {
                loadMatches: async () => {
                    const response = await api.get('matches')
                    return response.results as MatchType[]
                },
            },
        ],
    },
    events: ({ actions }) => ({
        afterMount: [actions.loadMatches],
    }),
})
