import React from 'react'
import { GetServerSideProps } from 'next'
import Layout from '../components/Layout'
import Post, { PostProps } from '../components/Post'
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
            lat={51.955413}
            lng={0.337844}
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

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch('http://localhost:3001/feed')
  const feed = await res.json()
  return {
    props: { feed },
  }
}

export default Blog
