import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import styles from '@/styles/Lang.module.css';
import { useRouter } from 'next/router';
import { SERVER_BASE_URL } from '@/js/Config';
import AppBar from '@/js/AppBar';
import LeaguesPanel from '@/js/LeaguesPanel';
import Switch from '@/js/Switch';
import HomeMatchesPanel from '@/js/HomeMatchesPanel';
import BottomNavBar, { EPAGE_CAL } from '@/js/BottomNavBar';
import moment from 'moment';
import Calendar from '@/js/Calendar';
import MatchItemMobile from '@/js/MatchItemMobile';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
const inter = Inter({ subsets: ['latin'] });
import { UAParser } from 'ua-parser-js';
import LangPanel from '@/js/LangPanel';

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
            locale,
            isAndroid,
            isIOS,
            ...(await serverSideTranslations(locale)),
        },
    };
}

export default function Home({ isAndroid, isIOS, locale }) {
    const router = useRouter()

    return (
        <>
            <Head>
                <title>el Torneo</title>
                <meta name="description" content="World's biggest football fan tournament." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main} ${inter.className}`}>
                <AppBar title={'el Torneo'} router={router}/>
                <LangPanel router={router} locale={locale}/>
                <BottomNavBar isAndroid={isAndroid} isIOS={isIOS} router={router} page={EPAGE_CAL} />
            </main>
        </>
    );
}
