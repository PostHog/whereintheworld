import { useActions } from 'kea'
import { Button } from 'lib/components/Button'
import { CitySelector } from 'lib/components/CitySelector'
import { WhoAmI } from 'lib/components/WhoAmI'
import { authLogic } from 'logics/authLogic'
import React, { useState } from 'react'
import './Welcome.scss'

export default function Welcome(): JSX.Element {
    const [homeCity, setHomeCity] = useState(null as number | null)
    const [formState, setFormState] = useState('untouched' as 'untouched' | 'submitted')
    const { updateUser } = useActions(authLogic)
    const formErrored = formState === 'submitted' && !homeCity
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setFormState('submitted')
        if (homeCity) {
            updateUser({ home_city: homeCity })
        }
    }

    return (
        <div className="welcome-scene">
            <WhoAmI />
            <div className="welcome-inner">
                <h1>Welcome to #whereintheworld!</h1>
                <p>Select your home location to get started</p>
                <form onSubmit={handleSubmit}>
                    <CitySelector onValueSelect={(city) => setHomeCity(city?.id ?? null)} errored={formErrored} />

                    <Button type="submit" size="lg" disabled={formErrored}>
                        Save
                    </Button>
                </form>
            </div>
        </div>
    )
}
