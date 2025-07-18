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

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [showPass, setShowPass] = useState(false)

    function toggleShowPass() {
        setShowPass(!showPass)
    }

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

    function onNavRegister() {
        router.push('/register')
    }

    function isValidUsername(username) {
        // Check if the username is at least 6 characters long
        if (username.length < 6) {
            return false;
        }
    
        // Check if the username contains any spaces or line endings
        if (/\s/.test(username)) {
            return false;
        }
    
        return true;
    }

    function onSignIn() {
        if (username.length < 6) {
            setError(t('err_username_len'))
            return
        }
        if (!isValidUsername(username)) {
            setError(t('err_username'))
            return
        }

        if (password.length < 6) {
            setError(t('err_password_len'))
            return
        }
        if (!isValidUsername(password)) {
            setError(t('err_password'))
            return
        }

        setError(null)
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify({
                username: username,
                password: password
            })
        };
        return fetch(`${SERVER_BASE_URL}/api/v1/signin`, requestOptions)
            .then(response => {
                if (response.status == 200)
                    return response.text()
                if (response.status == 404) {
                    setError(t('err_user_not_found'))
                }
                if (response.status == 403) {
                    setError(t('err_incorrect_password'))
                }
                // setError(t('incorrect_login'))
                return null
            })
            .then((token) => {
                if (!token) return

                Cookies.set('token', token);
                router.replace('/profile')
            })
    }

    function onUsernameChange(e) {
        setUsername(e.target.value)
    }

    function onPasswordChange(e) {
        setPassword(e.target.value)
    }

    return (
        <>
            <Head>
                <title>el Torneo - {t('signin')}</title>
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
                    <h1 className={styles.title}>el Torneo</h1>
                    <p className={styles.desc}>{t('login_desc')}</p>

                    {/* <div className={styles.award_panel}>
                        <AwardsPanel router={router} />
                    </div> */}

                    <div className={styles.buttons_row} style={{marginTop: '0px'}}>
                        <button className={styles.button_compact} onClick={login}>
                            <img className={styles.gicon} src={`${SERVER_BASE_URL}/data/icons/google.svg`} />
                            {t('signin_google')}
                        </button>
                        {/* <button className={styles.button_compact} onClick={navTelegram}>
                            <img className={styles.ticon} src={`${SERVER_BASE_URL}/data/icons/telegram.svg`} />
                            {t('signin_telegram')}
                        </button> */}
                    </div>

                    <div className={styles.buttons_cont}>
                        <div className={styles.line}></div>
                        <span className={styles.join_text}>{t('or')}</span>
                        <div className={styles.line}></div>
                    </div>

                    <div className={styles.login_cont}>
                        <div className={styles.input_cont}>
                            <span className={styles.placeholder}>{t('username')}</span>
                            <input className={styles.login_input} type='text' value={username} onChange={onUsernameChange} />
                        </div>

                        <div className={styles.input_cont}>
                            <span className={styles.placeholder}>{t('password')}</span>
                            <input className={styles.login_input} type={!showPass ? 'password' : 'text'} value={password} onChange={onPasswordChange} />
                            <div className={styles.eye} onClick={toggleShowPass}>
                                <img className={styles.eye_icon} src={`${SERVER_BASE_URL}/data/icons/eye.svg`}/>
                            </div>
                        </div>
                        <span className={styles.error}>{error}</span>
                        <button className={styles.login_button} onClick={onSignIn}>
                            {t('signin')}
                        </button>

                        <div className={styles.dont_cont}>
                            <span>{t('dont_have_acc')}</span>
                            <button className={styles.dont_button} onClick={onNavRegister}>{t('register')}</button>
                        </div>
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
                {/* <InstallPanel hasMargin={true} /> */}
                <BottomNavBar isAndroid={isAndroid} isIOS={isIOS} router={router} />
            </main>
        </>
    );
}
