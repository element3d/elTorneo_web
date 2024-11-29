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

export async function getServerSideProps(context) {
    const { query } = context;
    const { locale } = context;
    const { req } = context;

    const token = req.cookies.token;

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

    // Check if the 'date' query parameter exists, otherwise use today's date
    const page = query.page ? Number(query.page) : 1;
    const league = query.league ? Number(query.league) : 1;

    let me = null
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const table = await fetch(`${SERVER_BASE_URL}/api/v1/table/points?page=${page}&league=${league}`, requestOptions)
        .then(response => {
            if (response.status == 200)
                return response.json()

            return null
        })

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
            table,
            isAndroid,
            isIOS,
            me,
            league: Number.parseInt(league),
            page: Number.parseInt(page),
            ...(await serverSideTranslations(locale)),
        },
    };
}


function TableItem({ isMe, pos, player, onClick }) {
    return <div className={styles.table_item} style={{ backgroundColor: `${isMe ? 'white' : 'transparent'}` }} onClick={onClick}>
        {pos == 1 ? <img className={styles.trophy} src={`${SERVER_BASE_URL}/data/icons/trophy.svg`} /> : <span className={styles.table_number}>{pos}</span>}
        <span className={styles.table_player_name}>{player.name}</span>
        <span className={styles.table_number}>{player.totalPredictions}</span>
        <span className={styles.table_number}>{player.predictions}</span>
    </div>
}

function LeagueChip({ league, selected, isMy, onClick }) {
    const { t } = useTranslation()

    return <div onClick={onClick} className={selected ? styles.league_chip_sel : styles.league_chip}>
        <span>{t('league')} {league}</span>
        {isMy ? <span className={styles.chip_subtitle}>{t('your_league')}</span> : null}
    </div>
}

export default function Home({ me, isAndroid, isIOS, table, page, league }) {
    const router = useRouter()
    const { t } = useTranslation()

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

        router.push(`/table?page=${1}&league=${1}`)
    }

    function onNavLeague2() {
        if (league == 2) return

        router.push(`/table?page=${1}&league=${2}`)
    }

    function onNavProfile(id) {
        router.push(`/profile/${id}`)
    }

    function onNavInfo() {
        router.push('/info')
    }

    function isShowMoveToLeague() {
        if (!me) return false
        if (me.league == 2) return true
        if (me.points > 20) return false

        return true
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
                <div className={styles.award_panel_cont}>
                    <AwardsPanel league={league} showLeague={true} router={router} />
                </div>

                <div className={styles.leagues_cont}>
                    <LeagueChip selected={league == 1} onClick={onNavLeague1} league={1} isMy={me?.league == 1} />
                    <LeagueChip selected={league == 2} onClick={onNavLeague2} league={2} isMy={me?.league == 2} />
                    <button onClick={onNavInfo} className={styles.info_button}>i</button>
                </div>
                {isShowMoveToLeague() ? <div className={styles.leagues_cont} style={{ marginTop: '10px' }}>
                    <button onClick={onNavInfo} className={styles.move_league}>{t('move_to_league')} {me.league == 1 ? 2 : 1}</button>
                </div> : null}

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

                {isAndroid ? <InstallPanel hasBg={false} hasMargin={true}/> : null }

                <BottomNavBar me={me} isAndroid={isAndroid} isIOS={isIOS} router={router} page={EPAGE_TAB} />
            </main>
        </>
    );
}
