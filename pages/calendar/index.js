import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import styles from '@/styles/Calendar.module.css';
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
const inter = Inter({ subsets: ['latin'] });
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { UAParser } from 'ua-parser-js';
import InstallPanel from '@/js/InstallPanel';
import MatchPreviewDialog from '@/js/MatchPreviewDialog';
import DesktopAppBar from '@/js/DesktopAppBar';
import DesktopMenuPanel from '@/js/DesktopMenuPanel';
import DesktopCalendarPanel from '@/js/DesktopCalendarPanel';
import DesktopRightPanel from '@/js/DesktopRightPanel';

export async function getServerSideProps(context) {
  const { query } = context;
  const timestamp = query.date ? Number(query.date) : new Date(moment().format('YYYY-MM-DD')).getTime();
  const { locale } = context;

  const { req } = context
  let token = null
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  let leagues = []
  const isMobile = /Mobile|Android|iOS/i.test(req.headers['user-agent']);
  if (!isMobile) {
    leagues = await fetch(`${SERVER_BASE_URL}/api/v1/leagues`, {
      method: 'GET',
    })
      .then(response => response.json())
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

  const url = `${SERVER_BASE_URL}/api/v1/matches/day?timestamp=${timestamp}&lang=${locale}`
  const matches = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authentication': token ? token : ''
    },
  })
    .then(response => response.json())

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
      matches: matches,
      isAndroid,
      isIOS,
      isMobile,
      me,
      leagues,
      date: moment(timestamp).format('YYYY-MM-DD'),
      ...(await serverSideTranslations(locale)),
    },
  };
}

export default function Home({ me, isAndroid, isIOS, matches, date, isMobile, leagues }) {
  const { t } = useTranslation()
  const router = useRouter()
  let currentLeague = null
  const [showPreview, setShowPreview] = useState(false)
  const [previewMatch, setPreviewMatch] = useState(null)

  useEffect(() => {
    return () => {
      setShowPreview(false)
      document.documentElement.style.overflow = ''; // Disable background scroll
    }
  }, [date])

  function onPreview(m) {
    setShowPreview(true)
    setPreviewMatch(m)
    document.documentElement.style.overflow = 'hidden'; // Disable background scroll
  }

  function onPreviewClose() {
    setShowPreview(false)
    document.documentElement.style.overflow = '';
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

        <DesktopAppBar router={router} />
        <div className={styles.desktop_panels_cont}>
          <DesktopMenuPanel leagues={leagues} router={router} />
          <DesktopCalendarPanel router={router} date={date} matches={matches}/>
          <DesktopRightPanel />
          {/* <DesktopLeaguesMiddlePanel league={league} matches={matches} matchOfDay={matchOfDay} router={router} leagueName={serverLeague.name} /> */}
          {/* <DesktopRightPanel table={table} league={serverLeague} miniLeague={miniLeague} router={router} /> */}
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
        <AppBar title={'el Torneo'} />
        <div className={styles.calendar_panel}>
          <div className={styles.date_cont}>
            <img className={styles.cal_icon} src={`${SERVER_BASE_URL}/data/icons/calendar_black.svg`} />
            <span className={styles.date}>{moment(date).format('DD')} {t(moment(date).format('MMM').toLowerCase())} {moment(date).format('YYYY')}</span>

          </div>
          <Calendar router={router} date={date} />
        </div>

        <div className={styles.matches_cont}>

          {matches.map((m, i) => {

            let renderLeague = false;
            if (!currentLeague || currentLeague != m.league_name) {
              currentLeague = m.league_name
              renderLeague = true;
            }

            return <div key={`match_${m.id}`}>
              {renderLeague ? <div className={`${styles.league_cont} ${i === 0 ? styles.mt_0 : ''}`} >
                <img className={styles.league_icon} src={`${SERVER_BASE_URL}/data/leagues/${m.league_name}_colored.png`} />
                <div className={styles.league_name_cont}>
                  <span className={styles.league_name}>{m.league_name}</span>
                  <span className={styles.league_week}>{t('matchday')} {m.week}</span>
                </div>
              </div> : null}
              <MatchItemMobile currentWeek={m.currentWeek} router={router} match={m} onPreview={onPreview} />
            </div>
          })}

          {!matches.length ? <span className={styles.no_matches}>{t('no_matches_found')}</span> : null}

          {isAndroid ? <InstallPanel hasBg={false} hasMargin={true} /> : null}
        </div>
        {showPreview ? <MatchPreviewDialog match={previewMatch} onClose={onPreviewClose} /> : null}
        <BottomNavBar me={me} isAndroid={isAndroid} isIOS={isIOS} router={router} page={EPAGE_CAL} />
      </main>
    </>
  );
}
