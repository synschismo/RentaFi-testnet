import Script from 'next/script';
const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '';

const GoogleAnalytics = () => (
  <>
    <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}></Script>
    <Script id='google-analytics' strategy='afterInteractive'>
      {`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${GA_ID}');
    `}
    </Script>
  </>
);

export default GoogleAnalytics;
