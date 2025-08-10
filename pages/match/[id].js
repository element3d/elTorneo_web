import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { Inter } from 'next/font/google';
import styles from '@/styles/Match.module.css';
import { useRouter } from 'next/router';
import { SERVER_BASE_URL } from '@/js/Config';
import AppBar from '@/js/AppBar';
import LeaguesPanel from '@/js/LeaguesPanel';
import Switch from '@/js/Switch';
import HomeMatchesPanel from '@/js/HomeMatchesPanel';
import BottomNavBar from '@/js/BottomNavBar';
import moment from 'moment';
import Calendar from '@/js/Calendar';
import MatchPanel from '@/js/MatchPanel';
import MatchSummaryPanel from '@/js/MatchSummaryPanel';
import MatchTop20Panel from '@/js/MatchTop20Panel';
import { MatchItem } from '@/js/MatchItem';
import MatchItemMobile from '@/js/MatchItemMobile';
import LeagueTablePanel from '@/js/LeagueTablePanel';
const inter = Inter({ subsets: ['latin'] });
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { UAParser } from 'ua-parser-js';
import MatchEventsPanel from '@/js/MatchEventsPanel';
import MatchStatsPanel from '@/js/MatchStatsPanel';
import MatchLineupsPanel from '@/js/MatchLineupsPanel';
import InstallPanel from '@/js/InstallPanel';
import MatchPreviewDialog from '@/js/MatchPreviewDialog';
import DesktopAppBar from '@/js/DesktopAppBar';
import DesktopMenuPanel from '@/js/DesktopMenuPanel';
import DesktopRightPanel from '@/js/DesktopRightPanel';
import LoginPanel from '@/js/LoginPanel';
import RegisterPanel from '@/js/RegisterPanel';
import LangPanel from '@/js/LangPanel';
import authManager from '@/js/AuthManager';
import LinkAccountPanel from '@/js/LinkAccountPanel';
import CompleteAccountPanel from '@/js/CompleteAccountPanel';
import Cookies from 'js-cookie';
import MatchUtils from '@/js/MatchUtils';
import BetWarningPanel from '@/js/BetWarningPanel';

export async function getServerSideProps(context) {
    const { params } = context;
    const { id } = params;
    const { req } = context;
    const { locale } = context;

    let token = null
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    let guestUsername = null
    if (req.cookies?.guest_username) {
        guestUsername = req.cookies.guest_username;
    }

    const { query } = context;
    const { view } = query;
    let { view2 } = query;

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


    const requestOptions = {
        method: 'GET',
    };

    const data = await fetch(`${SERVER_BASE_URL}/api/v1/match?match_id=${id}`, requestOptions)
        .then(response => {
            if (response.status !== 200) {
                return;
            }

            return response.json();
        })

    let predict = null
    let me = null
    if (!token && !guestUsername) {
        let userOs = 'Web';
        userOs += " - " + uaResult.os.name + ' - ' + uaResult.device.type + ' - ' + uaResult.browser.name + ' - ' + 'match';
        try {
            token = await authManager.createGuestUser(userOs);
        } catch (e) {
            console.log("Error create user: " + e);
        }
    }
    if (token) {
        const prequestOptions = {
            method: 'GET',
            headers: {
                'Authentication': token
            },
        };
        predict = await fetch(`${SERVER_BASE_URL}/api/v1/user/predict?match_id=${id}`, prequestOptions)
            .then(response => {
                if (response.status !== 200) {

                    return null;
                }

                return response.json();
            })

        if (!Object.keys(predict).length) predict = null

        me = await authManager.getMe(token)
        if (me) {
            const guestUser = 'temp_username';
            context.res.setHeader('Set-Cookie', [
                `guest_username=${guestUser}; Path=/; Max-Age=${365 * 100 * 24 * 60 * 60}`,
                `token=${token}; Path=/; Max-Age=${365 * 100 * 24 * 60 * 60}`
            ]);
            me.token = token
        }
    }

    const header = await fetch(`${SERVER_BASE_URL}/api/v1/match/header?match_id=${id}`, {
        method: 'GET',
    })
        .then(response => response.json())

    const v = view || ''
    let predicts = []
    let summary = {}
    let h2hMatches = []
    let table = []
    let events = []
    let stats = []
    let lineups = []
    let odds = null

    if (v == '') {
        summary = await fetch(`${SERVER_BASE_URL}/api/v1/match/predicts?match_id=${data[0].id}&season=${data[0].season}`, {
            method: 'GET',
        })
            .then(response => response.json())

        predicts = await fetch(`${SERVER_BASE_URL}/api/v1/match/predicts/top3?match_id=${data[0].id}&season=${data[0].season}`, {
            method: 'GET',
        })
            .then(response => response.json())
    } else if (v == 'h2h') {
        let url = `${SERVER_BASE_URL}/api/v1/team/matches?team_id=${data[0].team1.id}`
        const t1Matches = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authentication': token ? token : ''

                // 'Authentication': authManager.getToken() ? authManager.getToken() : ''
            },
        })
            .then(response => response.json())

        url = `${SERVER_BASE_URL}/api/v1/team/matches?team_id=${data[0].team2.id}`
        const t2Matches = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authentication': token ? token : ''
                // 'Authentication': authManager.getToken() ? authManager.getToken() : ''
            },
        })
            .then(response => response.json())

        h2hMatches.push(t1Matches)
        h2hMatches.push(t2Matches)
    } else if (v == 'bet') {
        odds = await fetch(`${SERVER_BASE_URL}/api/v1/match/odds?match_id=${data[0].id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authentication': token ? token : ''
            },
        })
            .then(response => response.json())
    }
    if (v == 'table' || !isMobile) {
        table = await fetch(`${SERVER_BASE_URL}/api/v1/league/table?league_id=${data[0].league}&league_index=${data[0].team1.league_index}`, {
            method: 'GET',
            // headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
    }
    if (v == 'events' || !isMobile) {
        events = await fetch(`${SERVER_BASE_URL}/api/v1/match/events?match_id=${id}`, {
            method: 'GET',
            // headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
    }
    if (v == 'stats' || !isMobile) {
        stats = await fetch(`${SERVER_BASE_URL}/api/v1/match/statistics?match_id=${id}`, {
            method: 'GET',
            // headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
    }
    if (v == 'lineups' || !isMobile) {
        lineups = await fetch(`${SERVER_BASE_URL}/api/v1/match/lineups?match_id=${id}`, {
            method: 'GET',
            // headers: { 'Content-Type': 'application/json' },
        })
            .then(response => {
                if (response.status != 404)
                    return response.json()

                return []
            })
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

    if (!view2) {
        if (stats?.length) view2 = 'stats'
        else if (events?.length) view2 = 'events'
        else if (lineups?.length) view2 = 'lineups'
        else view2 = 'table'
    }

    return {
        props: {
            match: data.length ? data[0] : null,
            h2hMatches: h2hMatches,
            top20Predicts: v == '' ? predicts.predicts : [],
            summary,
            view: view || '',
            view2: view2 || '',
            table: table,
            predict,
            events,
            stats,
            lineups,
            header,
            settings,
            me,
            odds,
            locale,
            isMobile,
            isAndroid,
            browserName: uaResult?.browser?.name,
            isIOS,
            leagues,
            ...(await serverSideTranslations(locale)),
        },
    };
}

function Chip({ ref, title, selected, onClick, isBet = false }) {
    function getStyle() {
        if (isBet && !selected) {
            return {
                backgroundColor: '#37003C',
                color: 'white'
            }
        }

        return null
    }

    return <div ref={ref} className={selected ? styles.chip_sel : styles.chip} onClick={onClick} style={getStyle()}>
        {isBet ? <img className={styles.bbicon} src={`${SERVER_BASE_URL}/data/icons/bbicon.svg`}></img> : null}
        <span>{title}</span>
    </div>
}

function OddView({ disabled, type, odd, marginRight, marginLeft, onClick, selected }) {
    return <div onClick={disabled ? null : onClick} className={`${styles.odd_item} ${selected ? styles.odd_item_sel : ''}`} style={{ marginRight: marginRight, marginLeft: marginLeft }}>
        <span>{type}</span>
        <span className={styles.odd_text}>{odd}</span>
    </div>
}

export default function Home({ browserName, leagues, locale, isMobile, isAndroid, isIOS, me, match, predict, odds, view, view2, top20Predicts, summary, h2hMatches, table, events, stats, lineups, header, settings }) {

    const { t } = useTranslation()
    const [matches, setMatches] = useState([])
    const today = moment();
    const [date, setDate] = useState(today.format('YYYY-MM-DD'))
    const router = useRouter()
    const [teamIndex, setTeamIndex] = useState(0)
    const [showSignIn, setShowSignIn] = useState(false)
    const [logOrReg, setLogOrReg] = useState(0)
    const [showLang, setShowLang] = useState(0)
    const [showCompleteAccount, setShowCompleteAccount] = useState(0)
    const [userBet, setUserBet] = useState(odds?.bet ? odds.bet : null)
    const [odd, setOdd] = useState(odds?.bet ? odds.bet.bet : '')
    const [amount, setAmount] = useState('')

    const [showPreview, setShowPreview] = useState(false)
    const [previewMatch, setPreviewMatch] = useState(null)
    const viewsRef = useRef()
    const containerRef = useRef(null);

    useEffect(() => {
        if (view == 'events' || view == 'stats' || view == 'lineups') {
            if (containerRef?.current) {
                containerRef.current.scrollLeft = containerRef.current.scrollWidth;
                // viewsRef.current.scrollIntoView({ behavior: 'smooth', inline: 'end' });
            }
        }

        return () => {
            setShowPreview(false)
            document.documentElement.style.overflow = ''; // Disable background scroll
        }
    }, [])

    useEffect(() => {
        if (!odds) return

        setUserBet(odds.bet)
        if (odds.bet)
            setOdd(odds.bet.bet)
    }, [odds])

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
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.log(err);
        }
        // const installGoogleAds = () => {
        //     const elem = document.createElement("script");
        //     elem.src =
        //       "//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
        //     elem.async = true;
        //     elem.defer = true;
        //     document.body.insertBefore(elem, document.body.firstChild);
        //   };
        //   installGoogleAds();
        //   (window.adsbygoogle = window.adsbygoogle || []).push({});

        // try {
        //     (window.adsbygoogle = window.adsbygoogle || []).push({});
        // } catch (err) {
        //     console.error(err);
        // }
    }, []);

    function onNavH2H() {
        router.push(`/match/${match.id}?view=h2h`)
    }

    function onNavBet() {
        router.push(`/match/${match.id}?view=bet`)
    }

    function onNavPredicts() {
        router.push(`/match/${match.id}`)
    }

    function onNavTable() {
        router.push(`/match/${match.id}?view=table`)
    }

    function onNavEvents() {
        router.push(`/match/${match.id}?view=events`)
    }

    function onNavEventsDesktop() {
        router.push(`/match/${match.id}?view=${view}&view2=events`)
    }

    function onNavStats() {
        router.push(`/match/${match.id}?view=stats`)
    }
    function onNavStatsDesktop() {
        router.push(`/match/${match.id}?view=${view}&view2=stats`)
    }

    function onNavLineups() {
        router.push(`/match/${match.id}?view=lineups`)
    }

    function onNavLineupsDekstop() {
        router.push(`/match/${match.id}?view=${view}&view2=lineups`)
    }

    function renderPredictsView() {
        if (!top20Predicts.length) {
            return <span className={styles.no_predicts}>{t('no_predicts')}</span>
        }

        return <div className={isMobile ? styles.padding : styles.padding_desktop}>
            <MatchSummaryPanel match={match} summary={summary} />

            {/* <ins
                className="adsbygoogle"
                style={{ display: 'block',height: '400px' }}
                data-ad-client="pub-7041403371220271"
                data-ad-slot="6978928230"
                data-ad-format="auto"
                data-full-width-responsive="true"
            ></ins> */}
            {/* <ins className="adsbygoogle"
        style={{ display: "block", height: "400px" }}
        data-ad-client="ca-pub-7041403371220271"
     data-ad-slot="6978928230"
     data-ad-format="auto"
    //  data-adtest="on"
     data-full-width-responsive="true"></ins> */}

            <MatchTop20Panel router={router} match={match} predicts={top20Predicts} />
        </div>
    }

    let currMatchDate = null;

    const isSameDay = (date1, date2) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    function onTeamSelect(i) {
        setTeamIndex(i - 1)
    }

    function renderBetView() {

        function onBet() {
            const token = Cookies.get('token')
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication': token
                },
                body: JSON.stringify({
                    match: match.id,
                    bet: odd,
                    amount: Number.parseInt(amount)
                })
            };

            fetch(`${SERVER_BASE_URL}/api/v1/bet`, requestOptions)
                .then(response => {
                    return response.json()
                })
                .then(data => {
                    setUserBet({
                        id: data.bet_id,
                        bet: odd,
                        odd: odds[odd],
                        amount: amount
                    })
                    return null
                })
                .catch((e) => {

                });
        }

        function isBetDisabled() {
            return !odd || !amount || amount < 10 || amount > 20;
        }

        function onChangeAmount(e) {
            setAmount(Number.parseInt(e.target.value))
        }

        function onDeleteBet() {
            const token = Cookies.get('token')
            const requestOptions = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication': token
                }
            };

            fetch(`${SERVER_BASE_URL}/api/v1/bet?bet_id=${userBet.id}`, requestOptions)
                .then(response => {
                    if (response.status == 200)
                        setUserBet(null)
                    return null
                })
                .catch((e) => {

                });
        }

        function areOddsDisabled() {
            return !MatchUtils.isNotStarted(match) || !!userBet
        }

        return <div className={isMobile ? styles.bet_panel_mobile : styles.bet_panel}>
            <span className={styles.bet_title}>{t('match_winner')}</span>
            <div className={styles.odd_row}>
                <OddView disabled={areOddsDisabled()} selected={odd == 'w1'} type={'W1'} odd={odds.w1.toFixed(2)} marginRight={10} onClick={() => { setOdd('w1') }}></OddView>
                <OddView disabled={areOddsDisabled()} selected={odd == 'x'} type={'X'} odd={odds.x.toFixed(2)} marginRight={10} onClick={() => { setOdd('x') }}></OddView>
                <OddView disabled={areOddsDisabled()} selected={odd == 'w2'} type={'W2'} odd={odds.w2.toFixed(2)} onClick={() => { setOdd('w2') }}></OddView>
            </div>
            <span className={styles.bet_title}>{t('double_chance')}</span>
            <div className={styles.odd_row}>
                <OddView disabled={areOddsDisabled()} selected={odd == 'x1'} type={'1X'} odd={odds.x1.toFixed(2)} marginRight={10} onClick={() => { setOdd('x1') }}></OddView>
                <OddView disabled={areOddsDisabled()} selected={odd == 'x12'} type={'12'} odd={odds.x12.toFixed(2)} marginRight={10} onClick={() => { setOdd('x12') }}></OddView>
                <OddView disabled={areOddsDisabled()} selected={odd == 'x2'} type={'2X'} odd={odds.x2.toFixed(2)} onClick={() => { setOdd('x2') }}></OddView>
            </div>

            <div>
                {!userBet && MatchUtils.isNotStarted(match) ? <div className={styles.bet_button_wrap}>
                    <div className={styles.bet_button_cont}>
                        <div className={styles.bet_input_cont}>
                            <input type='text' onChange={onChangeAmount} className={styles.bet_input} />
                            <div className={styles.bet_sign}>$</div>
                        </div>

                        <button disabled={isBetDisabled()} className={`${styles.bet_button} ${isBetDisabled() ? styles.bet_button_dis : ''}`} onClick={onBet}>
                            <img className={styles.bet_icon} src={`${SERVER_BASE_URL}/data/icons/bbicon.svg`}></img>
                        </button>
                    </div>
                    <span className={styles.bet_min_max}>Min - 10$, Max - 20$</span>
                </div> : null}

                {userBet ? <div className={styles.bet_button_wrap}>
                    <div className={styles.user_bet_cont}>
                        <div className={styles.user_bet_item}>
                            <img className={styles.bet_icon} src={`${SERVER_BASE_URL}/data/icons/bbicon.svg`}></img>
                            <span className={styles.user_bet_bet}>{MatchUtils.getBetText(userBet.bet)}</span>
                            <span className={styles.user_bet_odd}>({userBet.odd.toFixed(2)})</span>
                            <span>{userBet.amount}$</span>
                        </div>

                        <button className={styles.user_bet_delele_button} onClick={onDeleteBet}>x</button>
                    </div>
                    <span className={styles.bet_min_max}>{t('possible_win')} {(userBet.amount * userBet.odd).toFixed(2)}$</span>
                </div> : null}

                <BetWarningPanel />
            </div>
        </div>
    }

    function renderH2HView() {
        return <div className={isMobile ? styles.padding : styles.padding_desktop}>
            <Switch title1={match.team1.shortName} title2={match.team2.shortName} selected={teamIndex + 1} onSelect={onTeamSelect} />
            {
                h2hMatches[teamIndex].map((m, i) => {

                    let renderTime = false;

                    if (currMatchDate == null || !isSameDay(new Date(currMatchDate), new Date(m.date))) {
                        renderTime = true;
                        currMatchDate = m.date;
                    }
                    m.week_type = m.weekType

                    return <div key={`match_${m.id}`}>
                        {renderTime ? <div className={`${styles.date_cont} ${i === 0 ? styles.mt_0 : ''}`} >
                            <img className={styles.cal_icon} src={`${SERVER_BASE_URL}/data/icons/calendar_black.svg`} />
                            <span className={styles.date}>{moment(currMatchDate).format('DD')} {t(moment(currMatchDate).format('MMM').toLowerCase())} {moment(currMatchDate).format('YYYY')}</span>
                        </div> : null}
                        <MatchItemMobile settings={settings} onPreview={onPreview} router={router} match={m} showLeague={true} />
                    </div>
                })
            }
        </div>
    }

    function renderTableView() {
        return <div className={isMobile ? styles.padding_top : styles.padding_desktop}>
            <LeagueTablePanel league={match.league} table={table} group={match.team1.group_index} isMobile={isMobile} />
        </div>
    }

    function onBack() {
        router.back()
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
    }

    function onCompleteAccountClick() {
        setShowCompleteAccount(true)
    }

    function renderDesktopRightPanel() {
        if (showSignIn) {
            return <div className={styles.desktop_right_cont_login}>
                {logOrReg == 0 ?
                    <LoginPanel router={router} onNavRegister={onNavRegister} /> :
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
        }

        return <div className={styles.desktop_right_cont}>
            {me?.isGuest ? <LinkAccountPanel onCompleteAccount={onCompleteAccountClick} /> : null}
            {view2 != 'table' ? <div className={styles.row}>
                {header.statistics ? <Chip title={t('statistics')} selected={view2 == 'stats'} onClick={onNavStatsDesktop}></Chip> : null}
                {header.events ? <Chip title={t('events')} selected={view2 == 'events'} onClick={onNavEventsDesktop}></Chip> : null}
                {header.lineups ? <Chip ref={viewsRef} title={t('lineups')} selected={view2 == 'lineups'} onClick={onNavLineupsDekstop}></Chip> : null}
            </div> : null}
            {view2 == 'events' ? <MatchEventsPanel events={events} isMobile={isMobile} /> : null}
            {view2 == 'stats' ? <MatchStatsPanel stats={stats} isMobile={isMobile} /> : null}
            {view2 == 'lineups' ? <MatchLineupsPanel isMobile={false} match={match} lineups={lineups} /> : null}
            {view2 == 'table' ? <LeagueTablePanel league={match.league} table={table} group={match.team1.group_index} isMobile={isMobile} /> : null}
        </div>
    }

    function onShowLang() {
        setShowLang(1)
    }

    function renderDesktop() {
        return <>
            <Head>
                <title>el Torneo - Calendar</title>
                <meta name="description" content="Worlds biggest football fan tournament." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main} ${inter.className}`}>

                <DesktopAppBar locale={locale} router={router} me={me} onSignIn={onSignIn} onShowLang={onShowLang} />
                <div className={styles.desktop_panels_cont}>
                    <DesktopMenuPanel leagues={leagues} router={router} />
                    <div className={styles.desktop_middle_cont}>
                        <MatchPanel browserName={browserName} isAndroid={isAndroid} me={me} router={router} match={match} predict={predict} isMobile={isMobile} onLogin={onSignIn} />

                        <div className={`${styles.row} ${styles.mt20}`}>
                            <Chip title={t('predictions2')} selected={view == ''} onClick={onNavPredicts}></Chip>
                            {header.odds ? <Chip title={t('bet')} isBet={true} selected={view == 'bet'} onClick={onNavBet}></Chip> : null}
                            <Chip title={'H2H'} selected={view == 'h2h'} onClick={onNavH2H}></Chip>
                            {view2 != 'table' ? <Chip title={t('table')} selected={view == 'table'} onClick={onNavTable}></Chip> : null}
                        </div>
                        {view == '' ? renderPredictsView() : null}
                        {view == 'bet' ? renderBetView() : null}
                        {view == 'h2h' ? renderH2HView() : null}
                        {view == 'table' ? renderTableView() : null}
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
                <title>{match.team1.shortName} - {match.team2.shortName}</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main} ${inter.className}`}>
                <div className={styles.league_banner}>
                    <img className={styles.banner_img} src={`${SERVER_BASE_URL}/data/leagues/${match.leagueName}_banner.png`} />
                </div>
                <div className={styles.app_bar}>
                    <div className={styles.back} onClick={onBack}>
                        <img className={styles.back_icon} src={`${SERVER_BASE_URL}/data/icons/back_white.svg`} />
                    </div>
                    <div className={styles.title_cont}>
                        <span>{match.leagueName}</span>
                        <span className={styles.wwwtitle}>www.eltorneo.app</span>
                    </div>
                    <div className={styles.back} style={{ opacity: 0 }}>
                    </div>
                </div>
                <MatchPanel browserName={browserName} isAndroid={isAndroid} me={me} router={router} match={match} predict={predict} isMobile={true} />

                <div ref={containerRef} className={styles.view_row} >
                    <Chip title={t('predictions2')} selected={view == ''} onClick={onNavPredicts}></Chip>
                    {header.odds ? <Chip title={t('bet')} isBet={true} selected={view == 'bet'} onClick={onNavBet}></Chip> : null}
                    <Chip title={'H2H'} selected={view == 'h2h'} onClick={onNavH2H}></Chip>
                    <Chip title={t('table')} selected={view == 'table'} onClick={onNavTable}></Chip>
                    {header.statistics ? <Chip title={t('statistics')} selected={view == 'stats'} onClick={onNavStats}></Chip> : null}
                    {header.events ? <Chip title={t('events')} selected={view == 'events'} onClick={onNavEvents}></Chip> : null}
                    {header.lineups ? <Chip ref={viewsRef} title={t('lineups')} selected={view == 'lineups'} onClick={onNavLineups}></Chip> : null}

                </div>

                {view == '' ? renderPredictsView() : null}
                {view == 'bet' ? renderBetView() : null}
                {view == 'h2h' ? renderH2HView() : null}
                {view == 'table' ? renderTableView() : null}
                {view == 'events' ? <MatchEventsPanel events={events} /> : null}
                {view == 'stats' ? <MatchStatsPanel stats={stats} /> : null}
                {view == 'lineups' ? <MatchLineupsPanel isMobile={true} match={match} lineups={lineups} /> : null}

                {/* {isAndroid ? <InstallPanel hasBg={false} hasMargin={false} /> : null} */}
                {showPreview ? <MatchPreviewDialog match={previewMatch} onClose={onPreviewClose} /> : null}

                <BottomNavBar me={me} isAndroid={isAndroid} isIOS={isIOS} router={router} />
            </main>
        </>
    );
}
