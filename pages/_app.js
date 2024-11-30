import { SERVER_BASE_URL } from "@/js/Config";
import "@/styles/globals.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Cookies from "js-cookie";
import { appWithTranslation } from 'next-i18next'
import { useRouter } from "next/router";
import Script from 'next/script';
import { useEffect } from "react";

export async function getServerSideProps(context) {
  const { req } = context;   
  const token = req.cookies.token;
  let me = null
  if (token) {
    me = await fetch(`${SERVER_BASE_URL}/api/v1/me`, prequestOptions)
    .then(response => {
        if (response.status !== 200) {
            return;
        }
        return response.json()
    })
  }

  return {
    props: {
        me,
        ...(await serverSideTranslations(locale)),
    },
};
}

function App({ Component, pageProps, me }) {
  const router = useRouter()
  console.log('====================')
  console.log(pageProps)
  console.log('======== 00000000000 ============')

  if (!pageProps.me) Cookies.remove('token')

  useEffect(() => {

    alert('use effect')
    const token = Cookies.get('token')
    alert(token)

    console.log("======================== TG")
    console.log(token)
    if (token) { 
      console.log("========= HAS TOKEN =============== TG")

      return
    }

    if (window.Telegram) {
      const tg = window.Telegram.WebApp;
      if (tg) {
        console.log(tg)
        tg.ready();
        let user = null
        const initData = tg.initData;
        const urlParams = new URLSearchParams(initData);
        const userJson = urlParams.get('user'); // Contains encoded user information
        if (userJson) {
          user = JSON.parse(userJson);
          console.log("User information:", user);
          alert('Telegram user found')

        } else {
          alert('Telegram not found')
          console.error("User information not found in initData");
        }
        // tg.disableVerticalSwipes();
        // tg.lockOrientation();
        // tg.requestFullScreen?.()
        // tg.enableClosingConfirmation()

        if (user) {
          // alert(token)

          alert(user.username)

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
              Cookies.set('token', token)
              // router.reload()
            })
        } else {
          alert('Telegram not TG user found')

        }
      } else {
        alert('Telegram not TG found')
      }

    } else {
      alert('Telegram window not TG found')

    }

    return () => {

    };
  }, []);

  return <>
    <Script
      src="https://telegram.org/js/telegram-web-app.js"
      strategy="beforeInteractive"
    />
    {/* <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=pub-7041403371220271`}
    /> */}
    <GoogleOAuthProvider clientId="854989049861-uc8rajtci5vgrobdd65m4ig8vtbsec5s.apps.googleusercontent.com"> <Component {...pageProps} /></GoogleOAuthProvider>
  </>;
}

export default appWithTranslation(App)
