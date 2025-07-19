import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import styles from '@/styles/About.module.css';
import { useRouter } from 'next/router';
import { SERVER_BASE_URL } from '@/js/Config';
import AppBar from '@/js/AppBar';
import BottomNavBar, { EPAGE_CAL } from '@/js/BottomNavBar';
const inter = Inter({ subsets: ['latin'] });
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { UAParser } from 'ua-parser-js';
import InstallPanel from '@/js/InstallPanel';

export async function getServerSideProps(context) {
    const { locale } = context;

    const { req } = context
    let token = null
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

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

    let me = null
    if (token) {
        const requestOptions1 = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authentication': token
            },
        };

        me = await fetch(`${SERVER_BASE_URL}/api/v1/me`, requestOptions1)
            .then(response => {
                if (response.status === 200) return response.json();
                return null;
            });
    }

    return {
        props: {
            isAndroid,
            isIOS,
            me,
            token,
            ...(await serverSideTranslations(locale)),
        },
    };
}

export default function Home({ me, token, isAndroid, isIOS }) {
    const { t } = useTranslation()
    const router = useRouter()

    const onMoveToLeague = () => {
        const league = me.league == 1 ? 2 : 1

        fetch(`${SERVER_BASE_URL}/api/v1/me/movetoleague`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authentication': token
            },
            body: JSON.stringify({
                league: league
            })
        })
            .then(response => {
                if (response.status != 200) {
                    return
                    // throw new Error('Network response was not ok');
                }
                router.push(`/table?league=${league}`)
            })
            .catch(error => {
                // Handle errors here
                console.error('There was a problem with the fetch operation:', error);
            });
    };

    function isShowMoveToLeague() {
        return false;
        return me && (me.points <= 20 || me.league == 2)
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

                <div className={styles.padding}>
                    <h3 className={styles.title}>{t('learn_more')}</h3>
                    <span className={styles.text}>{t('leagues_msg')}</span>

                    <div className={styles.league_item}>
                        <span className={styles.league_title}>{t('legend')}:</span>
                        <span className={styles.league_msg}>{t('legend_msg')}</span>
                    </div>
                    <div className={styles.league_item}>
                        <span className={styles.league_title}>{t('pro')}:</span>
                        <span className={styles.league_msg}>{t('pro_msg')}</span>
                    </div>
                    <div className={styles.league_item}>
                        <span className={styles.league_title}>{t('amateur')}:</span>
                        <span className={styles.league_msg}>{t('amateur_msg')}</span>
                    </div>
                    <div className={styles.league_item}>
                        <span className={styles.league_title}>{t('beginner')}:</span>
                        <span className={styles.league_msg}>{t('beginner_msg')}</span>
                    </div>

                    {isShowMoveToLeague() ?
                        <button onClick={onMoveToLeague} className={styles.move_button}>{t('move_to_league')}</button> : null}

                    {/* {isAndroid ? <InstallPanel /> : null} */}
                </div>

                <BottomNavBar me={me} isAndroid={isAndroid} isIOS={isIOS} router={router} />
            </main>
        </>
    );
}
