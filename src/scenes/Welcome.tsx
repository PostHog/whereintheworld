import { useActions } from 'kea'
import { Button } from 'lib/components/Button'
import { CitySelector } from 'lib/components/CitySelector'
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
        <div className="scene welcome-scene">
            <div className="welcome-inner">
                <h1>Welcome to WITW!</h1>
                <p className="text-center">
                    #whereintheworld is the best way to connect with your teammates. Just a few details to get started.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="card" style={{ paddingTop: 32, paddingBottom: 32 }}>
                        <div className="form-group">
                            <label>What is your home city?</label>
                            <CitySelector
                                onValueSelect={(city) => setHomeCity(city?.id ?? null)}
                                errored={formErrored}
                                autoFocus
                            />
                        </div>

                        <div className="text-right">
                            <Button type="submit" size="lg" disabled={formErrored} block>
                                Save and continue
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
