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
import DesktopMenuPanel from '@/js/DesktopMenuPanel';
import DesktopLeaguesMiddlePanel from '@/js/DesktopLeaguesMiddlePanel';
import DesktopRightPanel from '@/js/DesktopRightPanel';
import DesktopAppBar from '@/js/DesktopAppBar';
import LoginPanel from '@/js/LoginPanel';
import RegisterPanel from '@/js/RegisterPanel';
import LangPanel from '@/js/LangPanel';

const NUM_NEXT_WEEKS = 3

function getRandomMatch(matches) {
  const randomIndex = Math.floor(Math.random() * matches.length);  // Generate a random index
  return matches[randomIndex];  // Return the match at that index
}

export async function getServerSideProps(context) {
  const { params } = context;
  const { query } = context;
  let routerLeague = query.league ? Number(query.league) : -1;
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
  if (routerLeague > 0) {
    for (let i = 0; i < leagues.length; ++i) {
      if (leagues[i].id == routerLeague) {
        serverLeague = leagues[i]
        break
      }
    }
  } else {
    serverLeague = leagues[0]
    routerLeague = serverLeague.id
  }

  const week = routerWeek == -1 ? serverLeague.week : routerWeek;
  const url = `${SERVER_BASE_URL}/api/v1/matches?league_id=${routerLeague}&week=${week}&season=20${serverLeague.season}&lang=${locale}`
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
      if (serverLeague.id == 1) {
        if (weeks.length > 8)
          weeks[8].type = 1
        if (weeks.length > 9)
          weeks[9].type = 5
        if (weeks.length > 10)
          weeks[10].type = 2
        if (weeks.length > 11)
          weeks[11].type = 3
        if (weeks.length > 12)
          weeks[12].type = 4
      } else if (serverLeague.id == 7) {
        if (weeks.length > 6)
          weeks[6].type = 2
        if (weeks.length > 7)
          weeks[7].type = 3
        if (weeks.length > 8)
          weeks[8].type = 4
      }
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

    if (!me) res.setHeader('Set-Cookie', 'token=; Path=/; HttpOnly; Max-Age=0');
  }

  const isMobile = /Mobile|Android|iOS/i.test(req.headers['user-agent']);

  return {
    props: {
      leagues: leagues,
      serverLeague: serverLeague,
      matches: matches,
      weeks,
      week: week,
      table,
      isMobile,
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

export default function Home({ leagues, isMobile, me, isAndroid, isIOS, locale, miniLeague, serverLeague, weeks, week, matches, table, matchOfDay }) {
  const { t } = useTranslation()
  const [name, setName] = useState('');
  const [specialMatchId, setSpecialMatchId] = useState('')
  const league = serverLeague

  const [view, setView] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [previewMatch, setPreviewMatch] = useState(null)
  const [showSignIn, setShowSignIn] = useState(false)
  const [logOrReg, setLogOrReg] = useState(0)
  const [showLang, setShowLang] = useState(0)
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

  function onSignIn() {
    setShowSignIn(true)
  }

  function onNavRegister() {
    setLogOrReg(1)
  }

  function onNavLogin() {
    setLogOrReg(0)
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
    }

    return <DesktopRightPanel table={table} league={serverLeague} miniLeague={miniLeague} router={router} />
  }

  function onShowLang() {
    setShowLang(1)
    setShowSignIn(0)
  }

  function renderDesktop() {
    return <>
      <Head>
        <title>el Torneo - {serverLeague?.name}</title>
        <meta name="description" content="Worlds biggest football fan tournament." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>

        <DesktopAppBar router={router} onSignIn={onSignIn} onShowLang={onShowLang} pageEnum={EPAGE_HOME}/>
        <div className={styles.desktop_panels_cont}>
          <DesktopMenuPanel leagues={leagues} router={router} />
          <DesktopLeaguesMiddlePanel league={league} matches={matches} matchOfDay={matchOfDay} router={router} leagueName={serverLeague.name} />
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

        {/* {me ? <TelegramCodePanel hasBg={true} me={me} /> : null} */}

        <LeaguesPanel router={router} league={serverLeague} weeks={weeks} week={week} leagues={leagues} />
        <div className={styles.switch_cont}>
          <MatchLiveItem match={matchOfDay} router={router} leagueName={serverLeague.name} />
          <Switch title1={t('matches')} title2={t('table')} selected={view} onSelect={onSelect} />
        </div>
        {view == 1 ? <HomeMatchesPanel league={league} matches={matches} router={router} onPreview={onPreview} isMobile={isMobile} /> :
          <LeagueTablePanel table={table} league={serverLeague} miniLeague={miniLeague} router={router} />}

        {showPreview ? <MatchPreviewDialog match={previewMatch} onClose={onPreviewClose} /> : null}

        <BottomNavBar me={me} isIOS={isIOS} isAndroid={isAndroid} router={router} page={EPAGE_HOME} />
      </main>
    </>
  );
}
