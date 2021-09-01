import React from 'react'
import GoogleMapReact from 'google-map-react'
import { MapPin } from '../components/MapPin'
import { MainOverlay } from '../components/MainOverlay'

function Home(): JSX.Element {
    const defaultProps = {
        center: {
            lat: 51.5,
            lng: 0.0,
        },
        zoom: 1,
    }
    return (
        <div className="map-container">
            <MainOverlay />
            <GoogleMapReact
                bootstrapURLKeys={{ key: '' }}
                defaultCenter={defaultProps.center}
                defaultZoom={defaultProps.zoom}
            >
                <MapPin
                    lat={51.50460015249271}
                    lng={-0.08650000172720783}
                    imageUrl="https://ca.slack-edge.com/TSS5W8YQZ-UT2B67BA4-88a6594579ca-72"
                    travelState="away"
                />
                <MapPin
                    lat={58.37169235205909}
                    lng={26.72945371754314}
                    imageUrl="https://ca.slack-edge.com/TSS5W8YQZ-U015ZLK65AQ-g0402ff51a64-72"
                    travelState="home"
                />
            </GoogleMapReact>
        </div>
    )
}

export default Home
