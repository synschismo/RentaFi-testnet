import '../styles/globals.css';
import { MoralisProvider } from 'react-moralis';
import GoogleAnalytics from '../components/atoms/GoogleAnalytics';

function MyApp({ Component, pageProps }) {
  // usePageView();
  return (
    <>
      <GoogleAnalytics />
      <MoralisProvider
        appId={process.env.NEXT_PUBLIC_ID}
        serverUrl={process.env.NEXT_PUBLIC_SERVER}
      >
        <Component {...pageProps} />
      </MoralisProvider>
    </>
  );
}

export default MyApp;
