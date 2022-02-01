import { useActions, useValues } from 'kea'
import { Avatar } from 'lib/components/Avatar/Avatar'
import { Button } from 'lib/components/Button'
import { CitySelector } from 'lib/components/CitySelector'
import { FlagAvatar } from 'lib/components/Flags/FlagAvatar'
import { authLogic, UserUpdatePayload } from 'logics/authLogic'
import React, { useState } from 'react'
import './Profile.scss'

export default function Profile(): JSX.Element {
    const { user, userLoading } = useValues(authLogic)
    const [formValues, setFormValues] = useState({} as UserUpdatePayload)
    const { updateUser } = useActions(authLogic)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateUser(formValues)
    }
    return (
        <div className="scene profile-scene">
            <h1 className="flex-center">My profile</h1>
            <div style={{ marginBottom: 32 }}>A cool quote is coming here soon.</div>
            <div className="grid" style={{ maxWidth: 1080, margin: '0 auto' }}>
                <div className="col-12">
                    <div className="card" style={{ height: '100%' }}>
                        <h2>About you</h2>
                        <div className="flex-center">
                            <div style={{ marginRight: 32 }}>
                                <Avatar avatarUrl={user.avatar_url} />
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <div className="form-group">
                                    <label>Your name</label>
                                    <input type="text" disabled value={user.first_name} />
                                </div>
                                <div className="form-group">
                                    <label>Your email</label>
                                    <input type="text" value={user.email} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12">
                    <div className="card" style={{ height: '100%' }}>
                        <h2>Your work preferences</h2>
                        <div className="flex-center">
                            <div style={{ marginRight: 32 }}>
                                <FlagAvatar country={user.home_city?.country.code} />
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label>Your home city</label>
                                        <CitySelector
                                            onValueSelect={(city) => city && setFormValues({ home_city: city.id })}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Your usual work hours</label>
                                        <input type="text" />
                                    </div>
                                    <div>
                                        <Button type="submit" block disabled={userLoading}>
                                            Save preferences
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
