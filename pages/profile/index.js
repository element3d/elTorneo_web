import Head from 'next/head';
import { Profiler, useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import styles from '@/styles/Profile.module.css';
import { useRouter } from 'next/router';
import { SERVER_BASE_URL } from '@/js/Config';
import AppBar from '@/js/AppBar';
import BottomNavBar, { EPAGE_PROF } from '@/js/BottomNavBar';
import UserPanel from '@/js/UserPanel';
import MatchItemMobile from '@/js/MatchItemMobile';
import ProfileStatsPanel from '@/js/ProfileStatsPanel';
import ProfileMatchesPanel from '@/js/ProfileMatchesPanel';
const inter = Inter({ subsets: ['latin'] });
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { UAParser } from 'ua-parser-js';
import { useTranslation } from 'next-i18next';
import MatchPreviewDialog from '@/js/MatchPreviewDialog';

export async function getServerSideProps(context) {
    const { req } = context
    const { query } = context;
    const globalPage = query.page ? Number(query.page) : 1;
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

    let token = null
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
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

    const initialPredicts = await fetch(`${SERVER_BASE_URL}/api/v1/user/predicts?page=${globalPage}&user_id=${user.id}&league_id=${-1}`, {
        method: 'GET',
        headers: {},
    }).then(response => response.json());

    return {
        props: {
            user,
            globalPage,
            initialPredicts,
            isAndroid,
            isIOS,
            ...(await serverSideTranslations(locale)),
        },
    };
}


export default function Home({ isAndroid, isIOS, user, stats, globalPage, initialPredicts }) {
    const router = useRouter();
    const totalPredicts = initialPredicts.totalPredicts
    const [predicts, setPredicts] = useState(initialPredicts.predicts);
    const { t } = useTranslation()

    const [showPreview, setShowPreview] = useState(false)
    const [previewMatch, setPreviewMatch] = useState(null)

    useEffect(() => {
        return () => {
            setShowPreview(false)
            document.documentElement.style.overflow = ''; // Disable background scroll
        }
    }, [])

    useEffect(() => {
        const handleBackButton = (event) => {
            event.preventDefault();
            setShowPreview(false)
            document.documentElement.style.overflow = '';
        };

        window.onpopstate = handleBackButton;

        return () => {
            window.onpopstate = null; // Cleanup on unmount
        };
    }, []);

    function onPreview(m) {
        setShowPreview(true)
        setPreviewMatch(m)
        document.documentElement.style.overflow = 'hidden'; // Disable background scroll
    }

    function onPreviewClose() {
        setShowPreview(false)
        document.documentElement.style.overflow = '';
    }


    useEffect(() => {
        setPredicts(initialPredicts.predicts)
    }, [initialPredicts])

    return (
        <>
            <Head>
                <title>el Torneo</title>
                <meta name="description" content="World's biggest football fan tournament." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main} ${inter.className}`}>
                <AppBar router={router} title="el Torneo" />
                <UserPanel user={user} isMe={true} router={router} />
                <div className={styles.padding}>
                    {initialPredicts.allPredicts > 0 ? <ProfileStatsPanel stats={initialPredicts} /> : null}
                    <ProfileMatchesPanel onPreview={onPreview} isMe={true} router={router} globalPage={globalPage} user={user} predicts={predicts} setPredicts={setPredicts} totalPredicts={initialPredicts.allPredicts} />

                    {!predicts.length ? <span className={styles.no_preds}>{t('no_predicts')}</span> : null}
                </div>
                {showPreview ? <MatchPreviewDialog match={previewMatch} onClose={onPreviewClose} /> : null}
                <BottomNavBar me={user} isAndroid={isAndroid} isIOS={isIOS} router={router} page={EPAGE_PROF} />
            </main>
        </>
    );
}
