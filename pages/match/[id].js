import Head from 'next/head';
import { useEffect, useState } from 'react';
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

export async function getServerSideProps(context) {
    const { params } = context;
    const { id } = params;
    const { req } = context;
    const { locale } = context;
    const token = req.cookies.token;

    const { query } = context;
    const { view } = query;

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

    const v = view || ''
    let predicts = []
    let summary = {}
    let h2hMatches = []
    let table = []
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
                // 'Authentication': authManager.getToken() ? authManager.getToken() : ''
            },
        })
            .then(response => response.json())

        url = `${SERVER_BASE_URL}/api/v1/team/matches?team_id=${data[0].team2.id}`
        const t2Matches = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
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
            me,
            ...(await serverSideTranslations(locale)),
        },
    };
}

function Chip({ title, selected, onClick }) {
    return <div className={selected ? styles.chip_sel : styles.chip} onClick={onClick}>
        <span>{title}</span>
    </div>
}


export default function Home({ me, match, predict, view, top20Predicts, summary, h2hMatches, table }) {
    const { t } = useTranslation()
    const [matches, setMatches] = useState([])
    const today = moment();
    const [date, setDate] = useState(today.format('YYYY-MM-DD'))
    const router = useRouter()
    const [teamIndex, setTeamIndex] = useState(0)

    // useEffect(() => {
    //     try {
    //         (window.adsbygoogle = window.adsbygoogle || []).push({});
    //     } catch (err) {
    //         console.error(err);
    //     }
    // }, []);

    function onNavH2H() {
        router.push(`/match/${match.id}?view=h2h`)
    }

    function onNavPredicts() {
        router.push(`/match/${match.id}`)
    }

    function onNavTable() {
        router.push(`/match/${match.id}?view=table`)
    }

    function renderPredictsView() {
        if (!top20Predicts.length) {
            return <span className={styles.no_predicts}>{t('no_predicts')}</span>
        }

        return <div className={styles.padding}>
            <MatchSummaryPanel match={match} summary={summary} />

            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="pub-7041403371220271"
                data-ad-slot="xxxxxxxxxx"
                data-ad-format="auto"
                data-full-width-responsive="true"
            ></ins>

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
        console.log(i)
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

                    return <div>
                        {renderTime ? <div className={`${styles.date_cont} ${i === 0 ? styles.mt_0 : ''}`} >
                            <img className={styles.cal_icon} src={`${SERVER_BASE_URL}/data/icons/calendar_black.svg`} />
                            <span className={styles.date}>{moment(currMatchDate).format('DD')} {t(moment(currMatchDate).format('MMM').toLowerCase())} {moment(currMatchDate).format('YYYY')}</span>
                        </div> : null}
                        <MatchItemMobile router={router} match={m} showLeague={true} />
                    </div>
                })
            }
        </div>
    }

    function renderTableView() {
        console.log(match)
        return <div className={styles.padding_top}>
            <LeagueTablePanel league={match.league} table={table} group={match.team1.group_index} />
        </div>
        return <div className={styles.padding}>
            {table.map((t, i) => {
                return <div className={styles.table_row}>
                    <span className={styles.table_number}>{i + 1}</span>
                    <div className={styles.table_team_cont}>
                        <img className={styles.table_img} src={`${SERVER_BASE_URL}/data/teams/150x150/${t.team.name}.png`} />
                        <span>{t.team.short_name}</span>
                    </div>
                    <span className={styles.table_number}>{t.matches_played}</span>
                    <span className={styles.table_number}>{t.goal_difference}</span>
                    <span className={styles.table_number}>{t.points}</span>
                </div>
            })}
        </div>
    }

    function onBack() {
        router.back()
    }

    return (
        <>
            <Head>
                <title>Create Next App</title>
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

                <div className={styles.view_row}>
                    <Chip title={t('predictions2')} selected={view == ''} onClick={onNavPredicts}></Chip>
                    <Chip title={'H2H'} selected={view == 'h2h'} onClick={onNavH2H}></Chip>
                    <Chip title={t('table')} selected={view == 'table'} onClick={onNavTable}></Chip>
                </div>

                {view == '' ? renderPredictsView() : null}
                {view == 'h2h' ? renderH2HView() : null}
                {view == 'table' ? renderTableView() : null}

                <BottomNavBar router={router} />
            </main>
        </>
    );
}
