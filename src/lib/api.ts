import { API } from 'const'

async function getJSONOrThrow(response: Response): Promise<any> {
    try {
        return await response.json()
    } catch (e) {
        return { statusText: response.statusText }
    }
}

const normalize_url = (url: string): string => {
    if (url.indexOf('http') !== 0) {
        if (!url.startsWith('/')) {
            url = '/' + url
        }

        url = API + url
    }
    return url
}

const api = {
    async get(url: string, signal?: AbortSignal): Promise<any> {
        url = normalize_url(url)
        let response
        const startTime = new Date().getTime()
        try {
            response = await fetch(url, { signal })
        } catch (e) {
            throw { status: 0, message: e }
        }

        if (!response.ok) {
            reportError('GET', url, response, startTime)
            const data = await getJSONOrThrow(response)
            throw { status: response.status, ...data }
        }
        return await getJSONOrThrow(response)
    },

    async update(url: string, data: any): Promise<any> {
        url = normalize_url(url)
        const isFormData = data instanceof FormData
        const startTime = new Date().getTime()
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            },
            body: isFormData ? data : JSON.stringify(data),
        })

        if (!response.ok) {
            reportError('PATCH', url, response, startTime)
            const jsonData = await getJSONOrThrow(response)
            if (Array.isArray(jsonData)) {
                throw jsonData
            }
            throw { status: response.status, ...jsonData }
        }
        return await getJSONOrThrow(response)
    },

    async create(url: string, data?: any): Promise<any> {
        url = normalize_url(url)
        const isFormData = data instanceof FormData
        const startTime = new Date().getTime()
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            },
            body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
        })

        if (!response.ok) {
            reportError('POST', url, response, startTime)
            const jsonData = await getJSONOrThrow(response)
            if (Array.isArray(jsonData)) {
                throw jsonData
            }
            throw { status: response.status, ...jsonData }
        }
        return await getJSONOrThrow(response)
    },

    async delete(url: string): Promise<any> {
        url = normalize_url(url)
        const startTime = new Date().getTime()
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            reportError('DELETE', url, response, startTime)
            const data = await getJSONOrThrow(response)
            throw { status: response.status, ...data }
        }
        return response
    },
}

function reportError(method: string, url: string, response: Response, startTime: number): void {
    const duration = new Date().getTime() - startTime
    const pathname = new URL(url, window.location.origin).pathname
    // TODO: Use posthog-js
    console.log('client_request_failure', { pathname, method, duration, status: response.status })
}

export default api
