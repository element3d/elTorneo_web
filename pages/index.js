import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Cookie, Inter } from 'next/font/google';
import styles from '@/styles/Home.module.css';
import { useRouter } from 'next/router';
import { SERVER_BASE_URL } from '@/js/Config';
import AppBar from '@/js/AppBar';
import LeaguesPanel from '@/js/LeaguesPanel';
import Switch from '@/js/Switch';
import HomeMatchesPanel from '@/js/HomeMatchesPanel';
import BottomNavBar, { EPAGE_HOME } from '@/js/BottomNavBar';
import MatchLiveItem from '@/js/MatchLiveItem';
import LeagueTablePanel from '@/js/LeagueTablePanel';
const inter = Inter({ subsets: ['latin'] });
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { UAParser } from 'ua-parser-js';
import MatchPreviewDialog from '@/js/MatchPreviewDialog';
import TelegramCodePanel from '@/js/TelegramCodePanel';
import Cookies from 'js-cookie';

const NUM_NEXT_WEEKS = 3

function getRandomMatch(matches) {
  const randomIndex = Math.floor(Math.random() * matches.length);  // Generate a random index
  return matches[randomIndex];  // Return the match at that index
}

export async function getServerSideProps(context) {
  const { params } = context;
  const { query } = context;
  const routerLeague = query.league ? Number(query.league) : 1;
  const routerWeek = query.week ? Number(query.week) : -1;
  const routerMiniLeague = query.mini ? Number(query.mini) : 0;
  const { locale } = context;

  const { req, res } = context
  let token = null
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // res.setHeader('Set-Cookie', 'token=; Path=/; HttpOnly; Max-Age=0');

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

  const leagues = await fetch(`${SERVER_BASE_URL}/api/v1/leagues`, {
    method: 'GET',
  })
    .then(response => response.json())

  let serverLeague = null
  for (let i = 0; i < leagues.length; ++i) {
    if (leagues[i].id == routerLeague) {
      serverLeague = leagues[i]
      break
    }
  }

  const week = routerWeek == -1 ? serverLeague.week : routerWeek;
  const url = `${SERVER_BASE_URL}/api/v1/matches?league_id=${routerLeague}&week=${week}&season=2024/25&lang=${locale}`
  const matches = await fetch(url, {
    method: 'GET',
    headers: {
      'Authentication': token ? token : ''
    }

  })
    .then(response => response.json())

  const table = await fetch(`${SERVER_BASE_URL}/api/v1/league/table?league_id=${routerLeague}&league_index=${serverLeague.num_leagues > 1 ? routerMiniLeague : 0}`, {
    method: 'GET',
    // headers: { 'Content-Type': 'application/json' },
  })
    .then(response => response.json())

  let weeks = []
  if (serverLeague.num_weeks != 0) {
    if (serverLeague.type == 0) {
      weeks = Array.from({ length: Math.min(serverLeague.week + NUM_NEXT_WEEKS, serverLeague.num_weeks) }, (_, index) => { return { week: index + 1, type: 0 } });
    } else {
      weeks = serverLeague.weeks.slice(0, serverLeague.week + NUM_NEXT_WEEKS);
    }
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

    if (!me)   res.setHeader('Set-Cookie', 'token=; Path=/; HttpOnly; Max-Age=0');
  }

  return {
    props: {
      leagues: leagues,
      serverLeague: serverLeague,
      matches: matches,
      weeks,
      week: week,
      table,
      locale,
      isAndroid,
      isIOS,
      me,
      miniLeague: routerMiniLeague,
      matchOfDay: getRandomMatch(matches),
      ...(await serverSideTranslations(locale)),
    },
  };
}

export default function Home({ leagues, me, isAndroid, isIOS, locale, miniLeague, serverLeague, weeks, week, matches, table, matchOfDay }) {
  const { t } = useTranslation()
  const [name, setName] = useState('');
  const [specialMatchId, setSpecialMatchId] = useState('')
  const league = serverLeague
  
  const [view, setView] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [previewMatch, setPreviewMatch] = useState(null)

  // if (!me) Cookies.remove('token')

  useEffect(() => {
    return () => {
      setShowPreview(false)
      document.documentElement.style.overflow = ''; // Disable background scroll
    }
  }, [serverLeague])

  useEffect(() => {
    // Cookies.remove('token')
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

  const router = useRouter()

  function onSelect(index) {
    setView(index)
  }

  function onInstall() {
    window.open('https://play.google.com/store/apps/details?id=com.eltorneo', '_blank');
  }

  return (
    <>
      <Head>
        <title>el Torneo - {serverLeague?.name}</title>
        <meta name="description" content="Worlds biggest football fan tournament." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <AppBar locale={locale} title={serverLeague?.name} showLang router={router} />
        {/* {isAndroid ? <div className={styles.install_cont}>
          <img className={styles.gplay_icon} src={`${SERVER_BASE_URL}/data/icons/google-play.svg`} />
          <span>{t('available_google_play')}</span>
          <button className={styles.install_button} onClick={onInstall}>
            {t('install_now')}
          </button>
        </div> : null} */}

         { me ? <TelegramCodePanel hasBg={true} me={me}/> : null }

        <LeaguesPanel router={router} league={serverLeague} weeks={weeks} week={week} leagues={leagues} />
        <div className={styles.switch_cont}>
          <MatchLiveItem match={matchOfDay} router={router} leagueName={serverLeague.name} />
          <Switch title1={t('matches')} title2={t('table')} selected={view} onSelect={onSelect} />
        </div>
        {view == 1 ? <HomeMatchesPanel league={league} matches={matches} router={router} onPreview={onPreview} /> :
          <LeagueTablePanel table={table} league={serverLeague} miniLeague={miniLeague} router={router} />}

        {showPreview ? <MatchPreviewDialog match={previewMatch} onClose={onPreviewClose} /> : null}

        <BottomNavBar me={me} isIOS={isIOS} isAndroid={isAndroid} router={router} page={EPAGE_HOME} />
      </main>
    </>
  );
}
