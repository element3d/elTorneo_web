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
import RegisterPanel from '@/js/RegisterPanel';

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
    const router = useRouter()

 

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

                <RegisterPanel onNavSignin={onNavSignin}/>
                {/* <InstallPanel hasMargin={true} /> */}
                <BottomNavBar isAndroid={isAndroid} isIOS={isIOS} router={router} />
            </main>
        </>
    );
}
