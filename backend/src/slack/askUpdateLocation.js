function askUpdateLocation(app, member) {
    let text = 'Hey, looks like you are in timezone ' + member.tz + ' but your location is still listed as X. Do you want to update your location?';
         app.client.chat.postMessage({
             'channel': member.id,
             blocks: [{"type": "section", "text": {"type": "plain_text", text}},
             {
                "type": "input",
                "element": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select a city",
                        "emoji": true
                    },
                    "options": [
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "London, GB",
                                "emoji": true
                            },
                            "value": "value-0"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "San Francisco, CA, USA",
                                "emoji": true
                            },
                            "value": "value-1"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "New York, NY, USA",
                                "emoji": true
                            },
                            "value": "value-2"
                        }
                    ],
                    "action_id": "static_select-action"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Select your current location",
                    "emoji": true
                }
            }, 
            {
                "type": "input",
                "element": {
                    "type": "datepicker",
                    "initial_date": new Date().toISOString().split('T')[0],
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select a date",
                        "emoji": true
                    },
                    "action_id": "datepicker-action"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Until when are you going to be there?",
                    "emoji": true
                }
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "emoji": true,
                            "text": "Update location"
                        },
                        "style": "primary",
                        "value": "click_me_123"
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "emoji": true,
                            "text": "I don't want to update my location"
                        },
                        "style": "danger",
                        "value": "click_me_123"
                    }
                ]
            }
            
            ],
             'text': text
        })
    }