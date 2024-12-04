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

export async function getServerSideProps(context) {
    const { params } = context;
    const { id } = params;
    const { req } = context;
    const { locale } = context;
    
    const token = null
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    const { query } = context;
    const { view } = query;

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

        me = await fetch(`${SERVER_BASE_URL}/api/v1/me`, prequestOptions)
            .then(response => {
                if (response.status !== 200) {
                    return;
                }
                return response.json()
            })

        me.token = token
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

    if (v == '') {
        summary = await fetch(`${SERVER_BASE_URL}/api/v1/match/predicts?match_id=${data[0].id}`, {
            method: 'GET',
        })
            .then(response => response.json())

        predicts = await fetch(`${SERVER_BASE_URL}/api/v1/match/predicts/top3?match_id=${data[0].id}`, {
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
    } else if (v == 'table') {
        table = await fetch(`${SERVER_BASE_URL}/api/v1/league/table?league_id=${data[0].league}&league_index=${data[0].team1.league_index}`, {
            method: 'GET',
            // headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
    } else if (v == 'events') {
        events = await fetch(`${SERVER_BASE_URL}/api/v1/match/events?match_id=${id}`, {
            method: 'GET',
            // headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
    } else if (v == 'stats') {
        stats = await fetch(`${SERVER_BASE_URL}/api/v1/match/statistics?match_id=${id}`, {
            method: 'GET',
            // headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
    } else if (v == 'lineups') {
        lineups = await fetch(`${SERVER_BASE_URL}/api/v1/match/lineups?match_id=${id}`, {
            method: 'GET',
            // headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
    }

    return {
        props: {
            match: data.length ? data[0] : null,
            h2hMatches: h2hMatches,
            top20Predicts: v == '' ? predicts.predicts : [],
            summary,
            view: view || '',
            table: table,
            predict,
            events,
            stats,
            lineups,
            header,
            me,
            isAndroid,
            isIOS,
            ...(await serverSideTranslations(locale)),
        },
    };
}

function Chip({ ref, title, selected, onClick }) {
    return <div ref={ref} className={selected ? styles.chip_sel : styles.chip} onClick={onClick}>
        <span>{title}</span>
    </div>
}


export default function Home({ isAndroid, isIOS, me, match, predict, view, top20Predicts, summary, h2hMatches, table, events, stats, lineups, header }) {
    const { t } = useTranslation()
    const [matches, setMatches] = useState([])
    const today = moment();
    const [date, setDate] = useState(today.format('YYYY-MM-DD'))
    const router = useRouter()
    const [teamIndex, setTeamIndex] = useState(0)

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

    function onNavPredicts() {
        router.push(`/match/${match.id}`)
    }

    function onNavTable() {
        router.push(`/match/${match.id}?view=table`)
    }

    function onNavEvents() {
        router.push(`/match/${match.id}?view=events`)
    }

    function onNavStats() {
        router.push(`/match/${match.id}?view=stats`)
    }

    function onNavLineups() {
        router.push(`/match/${match.id}?view=lineups`)
    }

    function renderPredictsView() {
        if (!top20Predicts.length) {
            return <span className={styles.no_predicts}>{t('no_predicts')}</span>
        }

        return <div className={styles.padding}>
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

    function renderH2HView() {
        return <div className={styles.padding}>
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
                        <MatchItemMobile onPreview={onPreview} router={router} match={m} showLeague={true} />
                    </div>
                })
            }
        </div>
    }

    function renderTableView() {
        return <div className={styles.padding_top}>
            <LeagueTablePanel league={match.league} table={table} group={match.team1.group_index} />
        </div>
    }

    function onBack() {
        router.back()
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
                    <span>{match.leagueName}</span>
                    <div className={styles.back} style={{ opacity: 0 }}>

                    </div>
                </div>
                <MatchPanel me={me} router={router} match={match} predict={predict} />

                <div ref={containerRef} className={styles.view_row} >
                    <Chip title={t('predictions2')} selected={view == ''} onClick={onNavPredicts}></Chip>
                    <Chip title={'H2H'} selected={view == 'h2h'} onClick={onNavH2H}></Chip>
                    <Chip title={t('table')} selected={view == 'table'} onClick={onNavTable}></Chip>
                    {header.statistics ? <Chip title={t('statistics')} selected={view == 'stats'} onClick={onNavStats}></Chip> : null}
                    {header.events ? <Chip title={t('events')} selected={view == 'events'} onClick={onNavEvents}></Chip> : null}
                    {header.lineups ? <Chip ref={viewsRef} title={t('lineups')} selected={view == 'lineups'} onClick={onNavLineups}></Chip> : null}

                </div>

                {view == '' ? renderPredictsView() : null}
                {view == 'h2h' ? renderH2HView() : null}
                {view == 'table' ? renderTableView() : null}
                {view == 'events' ? <MatchEventsPanel events={events} /> : null}
                {view == 'stats' ? <MatchStatsPanel stats={stats} /> : null}
                {view == 'lineups' ? <MatchLineupsPanel match={match} lineups={lineups} /> : null}

                {isAndroid ? <InstallPanel hasBg={false} hasMargin={false} /> : null}
                {showPreview ? <MatchPreviewDialog match={previewMatch} onClose={onPreviewClose} /> : null}

                <BottomNavBar me={me} isAndroid={isAndroid} isIOS={isIOS} router={router} />
            </main>
        </>
    );
}
