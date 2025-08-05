import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import styles from '@/styles/Table.module.css';
import { useRouter } from 'next/router';
import { SERVER_BASE_URL } from '@/js/Config';
import AppBar from '@/js/AppBar';
import LeaguesPanel from '@/js/LeaguesPanel';
import Switch from '@/js/Switch';
import HomeMatchesPanel from '@/js/HomeMatchesPanel';
import BottomNavBar, { EPAGE_TAB } from '@/js/BottomNavBar';
import moment from 'moment';
import Calendar from '@/js/Calendar';
import AwardsPanel from '@/js/AwardsPanel';
import { useTranslation } from 'next-i18next';
const inter = Inter({ subsets: ['latin'] });
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { UAParser } from 'ua-parser-js';
import InstallPanel from '@/js/InstallPanel';
import DesktopAppBar, { EPAGE_ELTORNEO } from '@/js/DesktopAppBar';
import DesktopMenuPanel from '@/js/DesktopMenuPanel';
import DesktopRightPanel from '@/js/DesktopRightPanel';
import DesktopTablePanel from '@/js/DesktopTablePanel';
import LeagueChip from '@/js/LeagueChip';
import TableItem from '@/js/TableItem';
import Chip from '@/js/Chip';
import LoginPanel from '@/js/LoginPanel';
import RegisterPanel from '@/js/RegisterPanel';
import MatchLiveItem from '@/js/MatchLiveItem';
import LangPanel from '@/js/LangPanel';
import authManager from '@/js/AuthManager';
import LinkAccountPanel from '@/js/LinkAccountPanel';
import CompleteAccountPanel from '@/js/CompleteAccountPanel';

export async function getServerSideProps(context) {
    const { query } = context;
    const { locale } = context;
    const { req } = context;

    let token = null
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    let guestUsername = null
    if (req.cookies?.guest_username) {
        guestUsername = req.cookies.guest_username;
    }

    let isAndroid = false;
    let isIOS = false
    const userAgent = context.req.headers['user-agent'];
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();
    const osName = uaResult.os.name || 'Unknown';
    isAndroid = osName == 'Android'
    isIOS = osName == 'iOS'

    let leagues = []
    const isMobile = /Mobile|Android|iOS/i.test(req.headers['user-agent']);
    if (!isMobile) {
        leagues = await fetch(`${SERVER_BASE_URL}/api/v1/leagues`, {
            method: 'GET',
        })
            .then(response => response.json())
    }

    // Check if the 'date' query parameter exists, otherwise use today's date
    const page = query.page ? Number(query.page) : 1;
    const league = query.league ? Number(query.league) : 1;
    const season = query.season ? query.season : '25/26';

    let me = null
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const table = await fetch(`${SERVER_BASE_URL}/api/v1/table/points?page=${page}&league=${league}&season=${season}`, requestOptions)
        .then(response => {
            if (response.status == 200)
                return response.json()

            return null
        })

    if (!token && !guestUsername) {
        let userOs = 'Web';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const ress = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await ress.json();
        userOs += " - " + uaResult.os.name + ' - ' + uaResult.device.type + ' - ' + data.country_name + ' - ' + data.city;
        token = await authManager.createGuestUser(userOs);
    }
    if (token) {
        me = await authManager.getMe(token)
        const guestUser = 'temp_username';
        context.res.setHeader('Set-Cookie', [
            `guest_username=${guestUser}; Path=/; Max-Age=${365 * 100 * 24 * 60 * 60}`,
            `token=${token}; Path=/; Max-Age=${365 * 100 * 24 * 60 * 60}`
        ]);
    }

    let settings = null
    {
        settings = await fetch(`${SERVER_BASE_URL}/api/v1/settings`, requestOptions)
            .then(response => {
                if (response.status == 200)
                    return response.json()

                return null
            })
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

    // settings[0].numLevels = 4
    return {
        props: {
            table,
            isAndroid,
            isIOS,
            me,
            settings: settings[0],
            isMobile,
            leagues,
            season,
            locale,
            matches,
            league: Number.parseInt(league),
            page: Number.parseInt(page),
            ...(await serverSideTranslations(locale)),
        },
    };
}


export default function Home({ locale, me, isAndroid, isIOS, table, page, league, isMobile, leagues, settings, season, matches }) {
    const router = useRouter()
    const { t } = useTranslation()
    const [showSignIn, setShowSignIn] = useState(false)
    const [logOrReg, setLogOrReg] = useState(0)
    const [showLang, setShowLang] = useState(0)
    const [showCompleteAccount, setShowCompleteAccount] = useState(0)

    const showPrev = page > 1
    const showNext = table.length >= 20

    function onNext() {
        router.push(`/table?page=${page + 1}&league=${league}`)
    }

    function onPrev() {
        router.push(`/table?page=${page - 1}&league=${league}`)
    }

    function onNavLeague1() {
        if (league == 1) return

        router.push(`/table?page=${1}&league=${1}&season=${season}`)
    }

    function onNavLeague2() {
        if (league == 2) return

        router.push(`/table?page=${1}&league=${2}&season=${season}`)
    }

    function onNavLeague3() {
        if (league == 3) return

        router.push(`/table?page=${1}&league=${3}&season=${season}`)
    }

    function onNavLeague4() {
        if (league == 4) return

        router.push(`/table?page=${1}&league=${4}&season=${season}`)
    }

    function onNavProfile(id) {
        router.push(`/profile/${id}`)
    }

    function onNavInfo() {
        router.push('/info')
    }


    function isShowMoveToLeague() {
        if (!me) return false
        if (me.league == 3) return false
        if (me.league == 2) return true
        if (me.points > 20) return false

        return true
    }

    function onSignIn() {
        setShowSignIn(true)
    }

    function onNavRegister() {
        setLogOrReg(1)
    }

    function onNavLogin() {
        setLogOrReg(0)
        setShowSignIn(true)
        setShowCompleteAccount(false)
    }

    async function onLogin() {
        me = await fetch(`${SERVER_BASE_URL}/api/v1/me`, requestOptions1)
            .then(response => {
                if (response.status === 200) return response.json();
                return null;
            });
        setShowSignIn(false)
    }

    function onShowLang() {
        setShowLang(1)
        setShowSignIn(0)
    }

    function onCompleteAccountClick() {
        setShowCompleteAccount(true)
    }

    function renderDesktopRightPanel() {
        if (showSignIn) {
            return <div className={styles.desktop_right_cont_login}>
                {logOrReg == 0 ?
                    <LoginPanel router={router} onNavRegister={onNavRegister} onLogin={onLogin} /> :
                    <RegisterPanel onNavSignin={onNavLogin} />}
            </div>
        } else if (showLang) {
            return <div className={styles.desktop_right_cont_login}>
                <LangPanel router={router} locale={locale} />
            </div>
        } else if (showCompleteAccount) {
            return <div className={styles.desktop_right_cont_login}>
                <CompleteAccountPanel router={router} onNavSignin={onNavLogin} />
            </div>
        } else {
            return <div className={styles.desktop_right_cont_live}>
                {me?.isGuest ? <LinkAccountPanel onCompleteAccount={onCompleteAccountClick} /> : null}
                {matches.map((m, i) => {
                    if (i > 5) return
                    return <MatchLiveItem key={`match_${m.id}`} router={router} match={m} leagueName={m.league_name} />
                })}
            </div>
        }
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

                <DesktopAppBar locale={locale} router={router} onSignIn={onSignIn} onShowLang={onShowLang} pageEnum={EPAGE_ELTORNEO} me={me} />
                <div className={styles.desktop_panels_cont}>
                    <DesktopMenuPanel leagues={leagues} router={router} />
                    <DesktopTablePanel settings={settings} season={season} league={league} router={router} me={me} table={table} page={page} showNext={showNext} showPrev={showPrev} onNext={onNext} onPrev={onPrev} onNavProfile={onNavProfile} onNavLeague1={onNavLeague1} onNavLeague2={onNavLeague2} onNavLeague3={onNavLeague3} onNavLeague4={onNavLeague4} />
                    {renderDesktopRightPanel()}
                </div>
            </main>
        </>
    }

    if (!isMobile) {
        return renderDesktop()
    }

    function onSeason2024() {
        if (season == '24/25') return

        router.push(`/table?page=${1}&league=${1}&season=24/25`)
    }

    function onSeason2025() {
        if (season == '25/26') return

        router.push(`/table?page=${1}&league=${1}&season=25/26`)
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
                <AppBar title={'el Torneo'} />
                <div className={`${styles.flexRow} ${styles.mt20}`}>
                    <Chip title={`${t('season')} 2024/25`} selected={season == '24/25'} onClick={onSeason2024}></Chip>
                    <Chip title={`${t('season')} 2025/26`} selected={season == '25/26'} onClick={onSeason2025}></Chip>
                </div>
                <div className={styles.award_panel_cont}>
                    <AwardsPanel league={league} season={season} showLeague={true} router={router} />
                </div>

                <div className={styles.leagues_cont}>
                    <LeagueChip selected={league == 1} onClick={onNavLeague1} league={1} isMy={me?.league == 1} />
                    {settings.numLevels >= 2 || season != settings.season ? <LeagueChip selected={league == 2} onClick={onNavLeague2} league={2} isMy={me?.league == 2} /> : null}
                    {settings.numLevels >= 3 || season != settings.season ? <LeagueChip selected={league == 3} onClick={onNavLeague3} league={3} isMy={me?.league == 3} /> : null}
                    {settings.numLevels >= 4 || season != settings.season ? <LeagueChip selected={league == 4} onClick={onNavLeague4} league={4} isMy={me?.league == 4} /> : null}

                    <button onClick={onNavInfo} className={styles.info_button}>i</button>
                </div>
                {/* {isShowMoveToLeague() ? <div className={styles.leagues_cont} style={{ marginTop: '10px' }}>
                    <button onClick={onNavInfo} className={styles.move_league}>{t('move_to_league')} {me.league == 1 ? 2 : 1}</button>
                </div> : null} */}

                <div className={styles.table_cont}>
                    <div className={styles.table_header}>
                        <span className={styles.table_number}>{'Pos'}</span>
                        <span className={styles.table_player_name}>{t('player')}</span>
                        <span className={styles.table_number}>{'Tp'}</span>
                        <span className={styles.table_number}>{'Pts'}</span>
                    </div>

                    {table.map((u, i) => {
                        return <TableItem key={`${u.id}_${u.name}`} isMe={me?.id == u.id} pos={(page - 1) * 20 + i + 1} player={u} onClick={() => onNavProfile(u.id)} />
                    })}
                </div>

                <div className={styles.prev_next_cont}>
                    {showPrev ? <span onClick={onPrev} className={`${styles.prev} ${showNext ? null : styles.text_center}`}>{'< ' + t('prev')}</span> : null}
                    {showNext ? <span onClick={onNext} className={`${styles.next} ${showPrev ? null : styles.text_center}`}>{t('next') + ' >'}</span> : null}
                </div>

                {isAndroid ? <InstallPanel hasBg={false} hasMargin={true} /> : null}

                <BottomNavBar me={me} isAndroid={isAndroid} isIOS={isIOS} router={router} page={EPAGE_TAB} />
            </main>
        </>
    );
}
