import "@/styles/globals.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { appWithTranslation } from 'next-i18next'
import Script from 'next/script';

function App({ Component, pageProps }) {
  return <>
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=pub-7041403371220271`}
    />
    <GoogleOAuthProvider clientId="854989049861-uc8rajtci5vgrobdd65m4ig8vtbsec5s.apps.googleusercontent.com"> <Component {...pageProps} /></GoogleOAuthProvider>
  </>;
}

export default appWithTranslation(App)
