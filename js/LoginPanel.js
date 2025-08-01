import styles from '@/styles/Login.module.css';
import { useTranslation } from 'next-i18next';
import { useGoogleLogin } from '@react-oauth/google';
import { SERVER_BASE_URL } from './Config';
import { useState } from 'react';
import Cookies from 'js-cookie';


export default function LoginPanel({router, onLogin, onNavRegister}) {
    const { t } = useTranslation()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [showPass, setShowPass] = useState(false)

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
                    Cookies.set('token', token, { expires: 365 * 100 });
                    if (onLogin) onLogin()
                    else router.replace('/profile')
                })
                .catch((err) => {
                    console.error(err)
                })
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    }

    function onUsernameChange(e) {
        setUsername(e.target.value)
    }

    function onPasswordChange(e) {
        setPassword(e.target.value)
    }

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

                Cookies.set('token', token, { expires: 365 * 100 });
                router.replace('/profile')
            })
    }

    const login = useGoogleLogin({
        onSuccess,
        clientId: '854989049861-uc8rajtci5vgrobdd65m4ig8vtbsec5s.apps.googleusercontent.com', // Replace with your Google API client ID
        isSignedIn: true,
        accessType: 'offline',
        fetchBasicProfile: true,
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',

    });

    return (
        <div className={styles.cont}>
            <h1 className={styles.title}>el Torneo</h1>
            <p className={styles.desc}>{t('login_desc')}</p>

            {/* <div className={styles.award_panel}>
                        <AwardsPanel router={router} />
                    </div> */}

            <div className={styles.buttons_row} style={{ marginTop: '0px' }}>
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
                        <img className={styles.eye_icon} src={`${SERVER_BASE_URL}/data/icons/eye.svg`} />
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
    )
}