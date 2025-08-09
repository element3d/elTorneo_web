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
import DesktopAppBar from '@/js/DesktopAppBar';
import DesktopMenuPanel from '@/js/DesktopMenuPanel';
import MatchLiveItem from '@/js/MatchLiveItem';
import LangPanel from '@/js/LangPanel';
import LinkAccountPanel from '@/js/LinkAccountPanel';
import authManager from '@/js/AuthManager';
import CompleteAccountPanel from '@/js/CompleteAccountPanel';
import LoginPanel from '@/js/LoginPanel';
import RegisterPanel from '@/js/RegisterPanel';
import Switch from '@/js/Switch';

export async function getServerSideProps(context) {
    const { req } = context
    const { query } = context;
    const globalPage = query.page ? Number(query.page) : 1;
    const { locale } = context;
    const { view } = query;

    let leagues = null;
    const isMobile = /Mobile|Android|iOS/i.test(req.headers['user-agent']);
    if (!isMobile) {
        leagues = await fetch(`${SERVER_BASE_URL}/api/v1/leagues`, {
            method: 'GET',
        })
            .then(response => response.json())
    }

    let isAndroid = false;
    let isIOS = false
    const userAgent = context.req.headers['user-agent'];
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();
    const osName = uaResult.os.name || 'Unknown';
    isAndroid = osName == 'Android'
    isIOS = osName == 'iOS'

    let token = null
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    let guestUsername = null
    if (req.cookies?.guest_username) {
        guestUsername = req.cookies.guest_username;
    }

    if (!token && !guestUsername) {
        let userOs = 'Web';
        userOs += " - " + uaResult.os.name + ' - ' + uaResult.device.type + ' - ' + uaResult.browser.name + ' - ' + 'profile';
        try {
            token = await authManager.createGuestUser(userOs);
        } catch (e) {
            console.log("Error create user: " + e);
        }
    }
    let user = null;
    if (token) {
        user = await authManager.getMe(token)
        // context.res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; Max-Age=${365 * 100 * 24 * 60 * 60}`);
    }

    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false, // This indicates that the redirect is temporary
            },
        };
    }

    // const requestOptions = {
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authentication': token
    //     },
    // };

    // const user = await fetch(`${SERVER_BASE_URL}/api/v1/me`, requestOptions)
    //     .then(response => {
    //         if (response.status === 200) return response.json();
    //         return null;
    //     });

    let initialPredicts = null;
    let initialBets = null;
    if (view != 'bets') {
        initialPredicts = await fetch(`${SERVER_BASE_URL}/api/v1/user/predicts?page=${globalPage}&user_id=${user.id}&league_id=${-1}`, {
            method: 'GET',
            headers: {},
        }).then(response => response.json());


    } else {
        initialBets = await fetch(`${SERVER_BASE_URL}/api/v1/user/bets?page=${globalPage}&user_id=${user.id}&league_id=${-1}`, {
            method: 'GET',
            headers: {},
        }).then(response => response.json());
    }

    const url = `${SERVER_BASE_URL}/api/v1/matches/live`
    let matches = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authentication': token ? token : ''
        },
    })
        .then(response => response.json())

    if (!matches.length) {
        const url = `${SERVER_BASE_URL}/api/v1/matches/upcoming`
        matches = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authentication': token ? token : ''
            },
        })
            .then(response => response.json())
    }

    return {
        props: {
            user,
            globalPage,
            view: view ? view : '',
            initialPredicts,
            initialBets,
            isAndroid,
            isIOS,
            isMobile,
            locale,
            leagues,
            matches,
            ...(await serverSideTranslations(locale)),
        },
    };
}


export default function Home({ locale, isAndroid, isIOS, user, stats, globalPage, view, initialPredicts, initialBets, isMobile, leagues, matches }) {
    const router = useRouter();
    const [predicts, setPredicts] = useState(initialPredicts ? initialPredicts.predicts : []);
    const [bets, setBets] = useState(initialBets ? initialBets.bets : [])
    const { t } = useTranslation()

    const [showPreview, setShowPreview] = useState(false)
    const [previewMatch, setPreviewMatch] = useState(null)
    const [showLang, setShowLang] = useState(0)
    const [showCompleteAccount, setShowCompleteAccount] = useState(0)
    const [showSignIn, setShowSignIn] = useState(false)
    const [logOrReg, setLogOrReg] = useState(0)

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
        if (view != 'bets')
            setPredicts(initialPredicts.predicts)
    }, [initialPredicts])

    useEffect(() => {
        if (view == 'bets')
            setBets(initialBets.bets)
    }, [initialBets])


    function onShowLang() {
        setShowLang(1)
        setShowSignIn(0)
        setShowCompleteAccount(0)
    }

    function onCompleteAccountClick() {
        setShowCompleteAccount(true)
    }

    function onNavLogin() {
        setLogOrReg(0)
        setShowSignIn(true)
    }

    function onNavRegister() {
        setLogOrReg(1)
    }

    function renderDesktopRightPanel() {
        if (showSignIn) {
            return <div className={styles.desktop_right_cont_login}>
                {logOrReg == 0 ?
                    <LoginPanel router={router} onNavRegister={onNavRegister} /> :
                    <RegisterPanel onNavSignin={onNavLogin} />}
            </div>
        } else if (showLang) {
            return <div className={styles.desktop_right_cont}>
                <LangPanel router={router} locale={locale} />
            </div>
        } else if (showCompleteAccount) {
            return <div className={styles.desktop_right_cont_login}>
                <CompleteAccountPanel router={router} onNavSignin={onNavLogin} />
            </div>
        }

        return <div className={styles.desktop_right_cont_live}>
            {user?.isGuest ? <LinkAccountPanel onCompleteAccount={onCompleteAccountClick} /> : null}
            {matches.map((m, i) => {
                if (i > 5) return
                return <MatchLiveItem key={`match_${m.id}`} router={router} match={m} leagueName={m.league_name} />
            })}
        </div>
    }

    function onSetTab(t) {
        let vv = view
        if (!vv) vv = 'predicts'
        let tv = 'predicts';
        if (t == 2) tv = 'bets'

        if (vv == tv
            || (!vv && tv == 'predicts')
        ) return;

        if (tv == 'bets') {
            router.push(`/profile?view=bets`)
            return
        }

        router.push(`/profile`)
    }

    function renderPredicts(t) {
        return predicts.length > 0 ? <ProfileMatchesPanel onPreview={onPreview} isMe={true} router={router} globalPage={globalPage} user={user} predicts={predicts} setPredicts={setPredicts} totalPredicts={initialPredicts.allPredicts} />
            : <span className={styles.no_preds}>{t('no_predicts')}</span>
    }

    function renderBets(t) {
        return bets.length > 0 ? <ProfileMatchesPanel view={view} onPreview={onPreview} isMe={true} router={router} globalPage={globalPage} user={user} predicts={bets} setPredicts={setBets} totalPredicts={initialBets.allBets} />
            : <span className={styles.no_preds}>{t('no_bets')}</span>
    }

    function renderDesktop() {
        return <>
            <Head>
                <title>el Torneo</title>
                <meta name="description" content="Worlds biggest football fan tournament." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main} ${inter.className}`}>

                <DesktopAppBar locale={locale} router={router} me={user} isMe={true} onShowLang={onShowLang} />
                <div className={styles.desktop_panels_cont}>
                    <DesktopMenuPanel leagues={leagues} router={router} />
                    <div className={styles.desktop_middle_cont}>
                        <UserPanel user={user} isMobile={false} />
                        <ProfileStatsPanel view={view} isMobile={isMobile} stats={view != 'bets' ? initialPredicts : initialBets} />
                        <Switch title1={t('predictions2')} title2={t('bets')} selected={view == 'bets' ? 2 : 1} onSelect={onSetTab} />

                        {view != 'bets' ? renderPredicts(t) : renderBets(t)}
                    </div>

                    {renderDesktopRightPanel()}
                </div>
            </main>
        </>
    }

    if (!isMobile) {
        return renderDesktop()
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
                <AppBar router={router} title="el Torneo" />
                <UserPanel user={user} isMe={true} router={router} />
                <div className={styles.padding}>
                    <Switch title1={t('predictions2')} title2={t('bets')} selected={view == 'bets' ? 2 : 1} onSelect={onSetTab} />
                    <ProfileStatsPanel view={view} isMobile={true} stats={view != 'bets' ? initialPredicts : initialBets} />
                    <div className={styles.height20}></div>
                    {view != 'bets' ? renderPredicts(t) : renderBets(t)}
                </div>
                {showPreview ? <MatchPreviewDialog match={previewMatch} onClose={onPreviewClose} /> : null}
                <BottomNavBar me={user} isAndroid={isAndroid} isIOS={isIOS} router={router} page={EPAGE_PROF} />
            </main>
        </>
    );
}
