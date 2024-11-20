import "@/styles/globals.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { appWithTranslation } from 'next-i18next'
import Script from 'next/script';
import { useEffect } from "react";

function App({ Component, pageProps }) {

    useEffect(() => {
      if (window.Telegram) {
        const tg = window.Telegram.WebApp;
        tg.ready();

        // Retrieve user data
        const user = tg.initDataUnsafe.user;
        console.log('User:', user);
        alert('uraaaaaaaa telegram')

      } else {
        alert('no telegram')
        console.log('No telegram =============')
      }
      // Adjust theme based on Telegram settings
      // document.body.style.backgroundColor = tg.themeParams.bg_color || '#FFFFFF';
      // document.body.style.color = tg.themeParams.text_color || '#000000';

      // Handle events
      // tg.onEvent('themeChanged', () => {
      //   // Update theme when the user changes it in Telegram
      //   // document.body.style.backgroundColor = tg.themeParams.bg_color || '#FFFFFF';
      //   // document.body.style.color = tg.themeParams.text_color || '#000000';
      // });

      return () => {
        // tg.offEvent('themeChanged', () => { });
      };
    }, []);

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
