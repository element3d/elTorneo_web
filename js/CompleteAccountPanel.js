import styles from '@/styles/Login.module.css';
import { SERVER_BASE_URL } from '@/js/Config';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useGoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';


export default function CompleteAccountPanel({ onNavSignin, router }) {
    const { t } = useTranslation()

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

    function onCompleteAccount() {
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

        const token = Cookies.get('token');
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authentication': token ? token : ''
            },
            body: JSON.stringify({
                username: username,
                name: name,
                password: password
            })
        };
        return fetch(`${SERVER_BASE_URL}/api/v1/link/username`, requestOptions)
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
                if (!token) return

                Cookies.set('token', token, { expires: 365 * 100 });
                router.push('/profile')
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

    function signinGoogle(email, name) {
        const token = Cookies.get('token');

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authentication': token ? token : ''
            },
            body: JSON.stringify({
                email: email,
                name: name
            })
        };
        return fetch(`${SERVER_BASE_URL}/api/v1/link/googlemail`, requestOptions)
            .then(response => {
                if (response.status == 200)
                    return response.text()

                // setError(t('incorrect_login'))
                return null
            })
    }

    const onCompleteAccountGoogleSuccess = async (tokenResponse) => {
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
                    router.replace('/profile')
                })
                .catch((err) => {
                    console.error(err)
                })
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    }

    // function onCompleteAccountGoogle() {
    //     signinGoogle('narekhovhannisyanim3@gmail.com', 'name')
    //         .then((token) => {
    //             Cookies.set('token', token, { expires: 365 * 100 });
    //             router.replace('/profile')
    //         })
    //         .catch((err) => {
    //             console.error(err)
    //         })
    // }

    const onCompleteAccountGoogle = useGoogleLogin({
        onCompleteAccountGoogleSuccess,
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

            <div className={styles.login_cont}>
                <div className={styles.buttons_row} style={{ marginTop: '0px' }}>
                    <button className={styles.button_compact} onClick={onCompleteAccountGoogle}>
                        <img className={styles.gicon} src={`${SERVER_BASE_URL}/data/icons/google.svg`} />
                        {t('complete_account')}
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

                <div className={styles.input_cont}>
                    <span className={styles.placeholder}>{t('username')}</span>
                    <input className={styles.login_input} type='text' value={username} onChange={onUsernameChange} />
                </div>

                <div className={styles.input_cont}>
                    <span className={styles.placeholder}>{t('name')}</span>
                    <input className={styles.login_input} type='text' value={name} onChange={onNameChange} />
                </div>

                <div className={styles.input_cont}>
                    <span className={styles.placeholder}>{t('password')}</span>
                    <input className={styles.login_input} type={!showPass ? 'password' : 'text'} value={password} onChange={onPasswordChange} />
                    <div className={styles.eye} onClick={toggleShowPass}>
                        <img className={styles.eye_icon} src={`${SERVER_BASE_URL}/data/icons/eye.svg`} />
                    </div>
                </div>

                <span className={styles.error}>{error}</span>

                <button className={styles.login_button} onClick={onCompleteAccount}>
                    {t('complete_account')}
                </button>

                <div className={styles.dont_cont}>
                    <span>{t('already_have_acc')}</span>
                    <button className={styles.dont_button} onClick={onNavSignin}>{t('signin')}</button>
                </div>
            </div>

        </div>
    )
}