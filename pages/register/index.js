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
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [showPass, setShowPass] = useState(false)

    function toggleShowPass() {
        setShowPass(!showPass)
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

    function onRegister() {
        if (username.length < 6) {
            setError(t('err_username_len'))
            return
        }
        if (!isValidUsername(username)) {
            setError(t('err_username'))
            return
        }

        if (name.length < 2) {
            setError(t('err_name_len'))
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


        const requestOptions = {
            method: 'POST',
            body: JSON.stringify({
                username: username,
                name: name,
                password, password
            })
        };
        return fetch(`${SERVER_BASE_URL}/api/v1/signup`, requestOptions)
            .then(response => {
                if (response.status == 200)
                    return response.text()

                if (response.status == 403) {
                    setError(t('err_user_exists'))
                }
                // setError(t('incorrect_login'))
                return null
            })
            .then((token) => {
                Cookies.set('token', token);
                router.replace('/profile')
            })
    }

    function onNameChange(e) {
        setName(e.target.value)
    }

    function onUsernameChange(e) {
        setUsername(e.target.value)
    }

    function onPasswordChange(e) {
        setPassword(e.target.value)
    }

    function onNavSignin() {
        router.push('/login')
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
                    <h1 className={styles.title}>el Torneo</h1>
                    <p className={styles.desc}>{t('login_desc')}</p>

                    {/* <div className={styles.award_panel}>
                        <AwardsPanel router={router} />
                    </div> */}

                    <div className={styles.login_cont}>
                        <div className={styles.input_cont}>
                            <span className={styles.placeholder}>{t('username')}</span>
                            <input className={styles.login_input} type='text' value={username} onChange={onUsernameChange}/>
                        </div>

                        <div className={styles.input_cont}>
                            <span className={styles.placeholder}>{t('name')}</span>
                            <input className={styles.login_input} type='text' value={name} onChange={onNameChange}/>
                        </div>

                        <div className={styles.input_cont}>
                            <span className={styles.placeholder}>{t('password')}</span>
                            <input className={styles.login_input} type={!showPass ? 'password' : 'text'} value={password} onChange={onPasswordChange}/>
                            <div className={styles.eye} onClick={toggleShowPass}>
                                <img className={styles.eye_icon} src={`${SERVER_BASE_URL}/data/icons/eye.svg`}/>
                            </div>
                        </div>

                        <span className={styles.error}>{error}</span>

                        <button className={styles.login_button} onClick={onRegister}>
                        {t('register')}
                        </button>
                        
                        <div className={styles.dont_cont}>
                            <span>{t('already_have_acc')}</span>
                            <button className={styles.dont_button} onClick={onNavSignin}>{t('signin')}</button>
                        </div>
                    </div>

                </div>
                {/* <InstallPanel hasMargin={true} /> */}
                <BottomNavBar isAndroid={isAndroid} isIOS={isIOS} router={router} />
            </main>
        </>
    );
}
