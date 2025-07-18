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
import DesktopBeatBetMiddlePanel from '@/js/DesktopBeatBetMiddlePanel';
import DesktopBeatBetStrategiesPanel, { ESTRATEGY_LEAGUE, ESTRATEGY_PLAYER, ESTRATEGY_TEAM } from '@/js/DesktopBeatBetStrategiesPanel';
import BeatBetDialog from '@/js/BeatBetDialog';

export async function getServerSideProps(context) {
  const { query } = context;
  const { locale } = context;

  const player = query.player ? query.player : -1
  const team = query.team ? query.team : -1
  const league = query.league ? query.league : -1
  const home = query.home ? query.home : 0
  const away = query.away ? query.away : 0

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

  let url = `${SERVER_BASE_URL}/api/v1/beat_bet?player=${player}&team=${team}&league=${league}`
  if (home == 1) {
    url += '&home=1'
  } else if (away == 1) {
    url += '&away=1'
  }
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
      player,
      team,
      league,
      leagues,
      home,
      away,
      ...(await serverSideTranslations(locale)),
    },
  };
}

export default function Home({ me, isAndroid, isIOS, matches, isMobile, leagues, player, league, team, home, away }) {
  const { t } = useTranslation()
  const router = useRouter()

  const [showBeatBetDialog, setShowBeatBetDialog] = useState(false)
  const [beatBetStrategy, setBeatBetStrategy] = useState(null)

  // const [home, setHome] = useState(false)
  // const [away, setAway] = useState(false)

  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = ''; // Disable background scroll
    }
  }, [])

  function onShowBeatBetDialog(strategy) {
    setShowBeatBetDialog(true)
    setBeatBetStrategy(strategy)
    document.documentElement.style.overflow = 'hidden';
  }

  function onStrategyClick(option) {
    setShowBeatBetDialog(false)
    document.documentElement.style.overflow = '';
    let p = player
    let t = team
    let l = league
    if (beatBetStrategy == ESTRATEGY_PLAYER) p = option.id
    if (beatBetStrategy == ESTRATEGY_TEAM) t = option.id
    if (beatBetStrategy == ESTRATEGY_LEAGUE) l = option.id

    let path = `/beat_bet?player=${p}&team=${t}&league=${l}`

    if (home) {
      path += '&home=1'
    } else if (away) {
      path += '&away=1'
    }

    router.push(path)

    // router.push(`/beat_bet?player=${p}&team=${t}&league=${l}`)
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
          <DesktopMenuPanel leagues={leagues} />
          <DesktopBeatBetMiddlePanel router={router} matches={matches.predicts} />
          <DesktopBeatBetStrategiesPanel router={router} onShowDialog={onShowBeatBetDialog} player={player} team={team} league={league} home={home} away={away} />
        </div>

        {showBeatBetDialog ? <BeatBetDialog strategy={beatBetStrategy} leagues={leagues} player={player} league={league} onOptionClick={onStrategyClick} /> : null}
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

        <BottomNavBar me={me} isAndroid={isAndroid} isIOS={isIOS} router={router} page={EPAGE_CAL} />
      </main>
    </>
  );
}
