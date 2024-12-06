import { SERVER_BASE_URL } from "@/js/Config";
import "@/styles/globals.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Cookies from "js-cookie";
import { appWithTranslation } from 'next-i18next'
import { useRouter } from "next/router";
import Script from 'next/script';
import { useEffect } from "react";

function App({ Component, pageProps }) {
  const router = useRouter()
  
  useEffect(() => {
    // Cookies.set('token')

    // (window.adsbygoogle = window.adsbygoogle || []).push({});

    // if (typeof window !== 'undefined' && window.adsbygoogle) {
    //   try {
    //     (window.adsbygoogle = window.adsbygoogle || []).push({});
    //   } catch (err) {
    //     console.error('AdSense Error:', err);
    //   }
    // }

    alert("use effect")
    
    if (window.Telegram) {
      const tg = window.Telegram.WebApp;
      if (tg) {
        tg.ready();
        let user = null
        const initData = tg.initData;
        const urlParams = new URLSearchParams(initData);
        const userJson = urlParams.get('user'); // Contains encoded user information
        if (userJson) {
          alert("has user")

          user = JSON.parse(userJson);
        } else {
          alert("no user")

        }
        // tg.setHeaderColor('#0a0909')
        tg.BackButton.show()
        tg.disableVerticalSwipes?.();
        tg.lockOrientation?.();
        tg.BackButton.onClick(() => {
          router.back()
        }) 
        // tg.requestFullScreen?.()
        // tg.enableClosingConfirmation()

        const token = Cookies.get('token')
        if (token?.length > 20) { 
          alert("has token")
          alert(token)

          return
        } else {
          Cookies.remove('token')
        }

        if (user) {
          alert("get user")

          const requestOptions = {
            method: 'POST',
            body: JSON.stringify({
              tg_username: user.username,
              name: `${user.first_name} ${user.last_name}`,
              tg_id: user.id
            })
          };
          return fetch(`${SERVER_BASE_URL}/api/v1/signin/tgbot`, requestOptions)
            .then(response => {
              if (response.status == 200)
                return response.text()

              // setError(t('incorrect_login'))
              return null
            })
            .then((token) => {
              alert("set token")
              alert(token)
              Cookies.set('token', token)
              // router.reload()
            })
        } else {
          alert("else 1")

        }
      } else {
        alert("else 2")

      }

    } else {
      alert("else 3")

    }

    return () => {

    };
  }, []);

  return <>
    {/* <Script
      src="https://telegram.org/js/telegram-web-app.js"
      strategy="beforeInteractive"
    />
  */}
    <GoogleOAuthProvider clientId="854989049861-uc8rajtci5vgrobdd65m4ig8vtbsec5s.apps.googleusercontent.com"> <Component {...pageProps} /></GoogleOAuthProvider>
  </>;
}

export default appWithTranslation(App)
