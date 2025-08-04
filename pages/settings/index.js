import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import styles from '@/styles/Lang.module.css';
import { useRouter } from 'next/router';
import { SERVER_BASE_URL } from '@/js/Config';
import AppBar from '@/js/AppBar';

import BottomNavBar, { EPAGE_CAL } from '@/js/BottomNavBar';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Cookies from 'js-cookie';
const inter = Inter({ subsets: ['latin'] });
import { UAParser } from 'ua-parser-js';


export async function getServerSideProps(context) {
    const { query } = context;
    const { locale } = context;
    const { req } = context

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

    let token = null
    let guestUername = null
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    if (req.cookies?.guest_username) {
        guestUername = req.cookies.guest_username;
    }

    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false, // This indicates that the redirect is temporary
            },
        };
    }

    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authentication': token
        },
    };

    const user = await fetch(`${SERVER_BASE_URL}/api/v1/me`, requestOptions)
        .then(response => {
            if (response.status === 200) return response.json();
            return null;
        });

    return {
        props: {
            locale,
            me: user,
            token,
            isAndroid,
            isIOS,
            ...(await serverSideTranslations(locale)),
        },
    };
}

export default function Home({ isAndroid, isIOS, me, token, locale }) {
    const router = useRouter()
    const [name, setName] = useState(me.name)
    const { t } = useTranslation()
    const [newAva, setNewAva] = useState(null)


    function onNameChange(e) {
        setName(e.target.value)
    }

    function onLogout() {
        Cookies.remove('token');
        Cookies.set('guest_username', 'temp_username');
        router.push('/')
    }

    function load(callback) {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = "image/*"
        input.multiple = false
        input.style.display = 'none';
        // Define a function to handle the onchange event
        function handleChange(e) {
            // Remove the input element from the DOM
            document.body.removeChild(input);
            callback([e.target.files[0]]);
        }

        input.addEventListener('change', handleChange);
        document.body.appendChild(input);
        input.click();
    }


    function onUploadAva() {
        load((img) => {
            const url = URL.createObjectURL(img[0])
            setNewAva(url)

            const data = new FormData();
            data.append('image_file', img[0]);

            const requestOptions = {
                method: 'PUT',
                headers: {  /*accept: 'application/json',*/
                    'Authentication': token
                },
                //  'Content-Type': 'multipart/form-data' },
                body: data
            };
            fetch(`${SERVER_BASE_URL}/api/v1/me/avatar`, requestOptions)
                .then()
                .catch()
        })
    }

    function onDeleteAva() {
        const requestOptions = {
            method: 'DELETE',
            headers: {
                'Authentication': token
            },
        };

        fetch(`${SERVER_BASE_URL}/api/v1/me/avatar`, requestOptions)
            .then((u) => {
                setNewAva(null)
                router.reload()
            })
            .catch()
    }

    function onSaveName() {
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authentication': token
            },
            body: JSON.stringify({
                name: name
            })
        };

        fetch(`${SERVER_BASE_URL}/api/v1/me/name`, requestOptions)
            .then(response => {
                if (response.status == 200) {
                    return response.text()
                }
                return null
            })
            .then(data => {
                // if (!data) return    
                // unsub()       
            });
    }

    function getAva() {
        if (newAva) return newAva
        return `${SERVER_BASE_URL}/${me.avatar}`
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
                <AppBar title={'el Torneo'} router={router} />
                <div className={styles.ava_panel}>
                    <div className={styles.ava_cont}>
                        {me.avatar.length || newAva ? <img className={styles.ava} src={getAva()} />
                            : <img className={styles.ava_blank} src={`${SERVER_BASE_URL}/data/icons/profile_blank.svg`} />}
                    </div>
                    <button className={styles.mini_button} style={{ left: '-8px' }}>
                        <img src={`${SERVER_BASE_URL}/data/icons/trash.svg`} className={styles.edit_icon} onClick={onDeleteAva} />

                    </button>
                    <button className={styles.mini_button} style={{ right: '-8px' }}>
                        <img src={`${SERVER_BASE_URL}/data/icons/pen.svg`} className={styles.edit_icon} onClick={onUploadAva} />

                    </button>
                </div>

                <div className={styles.padding}>
                    <div className={styles.input_cont}>
                        <input maxLength={40} className={styles.input} type='text' value={name} onChange={onNameChange} />
                        <button className={styles.save} onClick={onSaveName}>{t('save')}</button>
                    </div>
                    <span className={styles.email}>{me.email}</span>

                    {me.authType != 'telegram' ? <>
                        <button className={styles.text_button} onClick={onLogout}>{t('signout')}</button>
                        <button className={styles.text_button}>{t('delete_acc')}</button>
                    </> : null}
                </div>

                <BottomNavBar isAndroid={isAndroid} isIOS={isIOS} router={router} page={EPAGE_CAL} />
            </main>
        </>
    );
}
