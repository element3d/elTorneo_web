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
    const [code, setCode] = useState('')
    const [error, setError] = useState(null)

    function onCodeChange(e) {
        setCode(e.target.value)
    }

    function navToBot() {
        window.location.href = 'tg://resolve?domain=elTorneoBot';
    }

    function onSignIn() {
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify({
                tg_code: Number.parseInt(code),
            })
        };
        return fetch(`${SERVER_BASE_URL}/api/v1/signin/tgcode`, requestOptions)
            .then(response => {
                if (response.status == 200)
                    return response.text()
                if (response.status == 403) {
                    setError(t('incorrect_code'))
                }
                // setError(t('incorrect_login'))
                return null
            })
            .then((token) => {
                if (!token) return

                Cookies.set('token', token)
                router.replace('/profile')
                // router.reload()
            })
    }

    return (
        <>
            <Head>
                <title>el Torneo</title>
                <meta name="description" content="World's biggest football fan tournament." />
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
                    <img className={styles.ticon_big} src={`${SERVER_BASE_URL}/data/icons/telegram.svg`} />
                    <h1 className={styles.title_tg}>{t('signin_tg_title')}</h1>
                    <button className={styles.bot_button} onClick={navToBot}>@elTorneoBot</button>
                    <p className={styles.desc}>{t('signin_tg_msg')}</p>

                    <input type='tel' maxLength={6} placeholder={t('code')} className={styles.tinput} value={code} onChange={onCodeChange} />
                    <span className={styles.error}>{error}</span>

                    <button disabled={code.length != 6} className={styles.install_button} onClick={onSignIn} style={{
                        opacity: code.length == 6 ? 1 : .6
                    }}>{t('signin')}</button>
                </div>
                {/* <InstallPanel hasMargin={true} /> */}
                <BottomNavBar isAndroid={isAndroid} isIOS={isIOS} router={router} />
            </main>
        </>
    );
}
