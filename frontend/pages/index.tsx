import React from 'react'
import Layout from '../components/Layout'
import { PostProps } from '../components/Post'
import GoogleMapReact from 'google-map-react'


type Props = {
  feed: PostProps[]
}

const AnyReactComponent = ({ text }) => <div>{text}</div>;

const Blog : React.FC<Props> = props => {
    const defaultProps = {
        center: {
          lat: 51.5,
          lng: 0.0
        },
        zoom: 1
      };
  return (
    <Layout>
      <div className="page">
      </div>
      <div style={{ height: '100vh', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: ''}}
          defaultCenter={defaultProps.center}
          defaultZoom={defaultProps.zoom}
        >
          <AnyReactComponent
            text="My Marker"
          />
        </GoogleMapReact>
      </div>
      <style jsx>{`
        .post {
          background: white;
          transition: box-shadow 0.1s ease-in;
        }

        .post:hover {
          box-shadow: 1px 1px 3px #aaa;
        }

        .post + .post {
          margin-top: 2rem;
        }
      `}</style>
    </Layout>
  )
}


export default Blog
