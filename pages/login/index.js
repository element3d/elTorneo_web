import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import styles from '@/styles/Login.module.css';
import { useRouter } from 'next/router';
import { SERVER_BASE_URL } from '@/js/Config';
import AppBar from '@/js/AppBar';

import BottomNavBar, { EPAGE_CAL } from '@/js/BottomNavBar';
import moment from 'moment';
import AwardsPanel from '@/js/AwardsPanel';
const inter = Inter({ subsets: ['latin'] });
import { useGoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

import { UAParser } from 'ua-parser-js';
import InstallPanel from '@/js/InstallPanel';

export async function getServerSideProps(context) {
    const { query } = context;
    const { locale } = context;

    let isAndroid = false;
    let isIOS = false
    {
        const userAgent = context.req.headers['user-agent'];
        const parser = new UAParser(userAgent);
        const uaResult = parser.getResult();
        const osName = uaResult.os.name || 'Unknown';
        isAndroid = osName == 'Android'
        isIOS = osName == 'iOS'
    }

    return {
        props: {
            isAndroid,
            isIOS,
            ...(await serverSideTranslations(locale)),
        },
    };
}

export default function Home({ isAndroid, isIOS }) {
    const { t } = useTranslation()
    const router = useRouter()

    function signinGoogle(email, name) {
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                name: name
            })
        };
        return fetch(`${SERVER_BASE_URL}/api/v1/signin/googlemail`, requestOptions)
            .then(response => {
                if (response.status == 200)
                    return response.text()

                // setError(t('incorrect_login'))
                return null
            })
    }

    const onSuccess = async (tokenResponse) => {
        try {
            // Extract the access token from the tokenResponse
            const accessToken = tokenResponse.access_token;

            // Fetch user information from Google's API
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const userInfo = await response.json();

            // You can access user's email and name like this:
            const email = userInfo.email;
            const name = userInfo.name;

            signinGoogle(email, name)
                .then((token) => {
                    Cookies.set('token', token);
                    router.replace('/profile')
                })
                .catch((err) => {
                    console.error(err)
                })
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    }

    const login = useGoogleLogin({
        onSuccess,
        clientId: '854989049861-uc8rajtci5vgrobdd65m4ig8vtbsec5s.apps.googleusercontent.com', // Replace with your Google API client ID
        isSignedIn: true,
        accessType: 'offline',
        fetchBasicProfile: true,
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',

    });

    function navTelegram() {
        router.push('/telegram')
    }

    return (
        <>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main} ${inter.className}`}>
                <div className={styles.appbar}>
                    <div className={styles.back_button}>
                        <img className={styles.back_icon} src={`${SERVER_BASE_URL}/data/icons/back.svg`} />
                    </div>
                </div>

                <div className={styles.cont}>
                    <h1 className={styles.title}>el Torneo</h1>
                    <p className={styles.desc}>{t('login_desc')}</p>

                    <div className={styles.award_panel}>
                        <AwardsPanel router={router} />
                    </div>

                    <div className={styles.buttons_cont}>
                        <div className={styles.line}></div>
                        <span className={styles.join_text}>{t('join_now')}</span>
                        <div className={styles.line}></div>
                    </div>

                    <div className={styles.buttons_row}>
                        <button className={styles.button_compact} onClick={login}>
                            <img className={styles.gicon} src={`${SERVER_BASE_URL}/data/icons/google.svg`} />
                        </button>
                        <button className={styles.button_compact} onClick={navTelegram}>
                            <img className={styles.ticon} src={`${SERVER_BASE_URL}/data/icons/telegram.svg`} />
                        </button>
                    </div>

                    {/* <button className={styles.button} onClick={login}>
                        <span>{t('join_now')}</span>
                        <div className={styles.gcont}>
                            <img className={styles.gicon} src={`${SERVER_BASE_URL}/data/icons/google.svg`} />
                        </div>
                    </button> */}
                    {/* curl -X POST "https://api.telegram.org/bot7617197735:AAEv15rEm0sGbj9FAcyoO73fi_mELR1OU30/sendMessage" -H "Content-Type: application/json" -d "{\"chat_id\":\"660322879\",\"text\":\"Click the button below to start el Torneo:\",\"reply_markup\":{\"inline_keyboard\":[[{\"text\":\"Start el Torneo\",\"web_app\":{\"url\":\"https://eltorneo.am\"}}]]}}" */}

                    {/* 7617197735:AAEv15rEm0sGbj9FAcyoO73fi_mELR1OU30 */}

                </div>
                <InstallPanel hasMargin={true} />
                <BottomNavBar isAndroid={isAndroid} isIOS={isIOS} router={router} />
            </main>
        </>
    );
}
