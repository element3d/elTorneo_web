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
import DesktopAppBar, { EPAGE_CALENDAR } from '@/js/DesktopAppBar';
import DesktopMenuPanel from '@/js/DesktopMenuPanel';
import DesktopCalendarPanel from '@/js/DesktopCalendarPanel';
import DesktopRightPanel from '@/js/DesktopRightPanel';
import LoginPanel from '@/js/LoginPanel';
import RegisterPanel from '@/js/RegisterPanel';
import MatchLiveItem from '@/js/MatchLiveItem';
import LangPanel from '@/js/LangPanel';
import authManager from '@/js/AuthManager';
import Link from 'next/link';
import LinkAccountPanel from '@/js/LinkAccountPanel';
import CompleteAccountPanel from '@/js/CompleteAccountPanel';

export async function getServerSideProps(context) {
  const { query } = context;
  const timestamp = query.date ? Number(query.date) : new Date(moment().format('YYYY-MM-DD')).getTime();
  const { locale } = context;

  const { req } = context
  let token = null
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  let guestUsername = null
  if (req.cookies?.guest_username) {
    guestUsername = req.cookies.guest_username;
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
  const userAgent = context.req.headers['user-agent'];
  const parser = new UAParser(userAgent);
  const uaResult = parser.getResult();
  const osName = uaResult.os.name || 'Unknown';
  isAndroid = osName == 'Android'
  isIOS = osName == 'iOS'


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
  if (!token && !guestUsername) {
    let userOs = 'Web';
    userOs += " - " + uaResult.os.name + ' - ' + uaResult.device.type + ' - ' + uaResult.browser.name + ' - ' + 'calendar';
    try {
      token = await authManager.createGuestUser(userOs);
    } catch (e) {
      console.log("Error create user: " + e);
    }
  }
  if (token) {
    me = await authManager.getMe(token)
    const guestUser = 'temp_username';
    context.res.setHeader('Set-Cookie', [
      `guest_username=${guestUser}; Path=/; Max-Age=${365 * 100 * 24 * 60 * 60}`,
      `token=${token}; Path=/; Max-Age=${365 * 100 * 24 * 60 * 60}`
    ]);
  }

  const urlLive = `${SERVER_BASE_URL}/api/v1/matches/live`
  let liveMatches = null;
  if (!isMobile) {
    liveMatches = await fetch(urlLive, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authentication': token ? token : ''
      },
    })
      .then(response => response.json())

    if (!liveMatches.length) {
      const urlLive = `${SERVER_BASE_URL}/api/v1/matches/upcoming`
      liveMatches = await fetch(urlLive, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authentication': token ? token : ''
        },
      })
        .then(response => response.json())
    }
  }

  return {
    props: {
      matches: matches,
      isAndroid,
      isIOS,
      isMobile,
      locale,
      me,
      liveMatches,
      queryDate: query.date ? query.date : null,
      leagues,
      // date: moment(timestamp).format('YYYY-MM-DD'),
      ...(await serverSideTranslations(locale)),
    },
  };
}

export default function Home({ me, queryDate, isAndroid, isIOS, matches, isMobile, leagues, liveMatches, locale }) {
  const { t } = useTranslation()
  const router = useRouter()
  let currentLeague = null
  const [showPreview, setShowPreview] = useState(false)
  const [previewMatch, setPreviewMatch] = useState(null)
  const [showSignIn, setShowSignIn] = useState(false)
  const [logOrReg, setLogOrReg] = useState(0)
  const [showLang, setShowLang] = useState(0)
  const [showCompleteAccount, setShowCompleteAccount] = useState(0)
  const date = moment(queryDate ? Number.parseInt(queryDate) : undefined).format('YYYY-MM-DD')

  useEffect(() => {
    return () => {
      setShowPreview(false)
      document.documentElement.style.overflow = ''; // Disable background scroll
    }
  }, [])

  function onPreview(m) {
    setShowPreview(true)
    setPreviewMatch(m)
    document.documentElement.style.overflow = 'hidden'; // Disable background scroll
  }

  function onPreviewClose() {
    setShowPreview(false)
    document.documentElement.style.overflow = '';
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
    } else {
      return <div className={styles.desktop_right_cont_live}>
        {me?.isGuest ? <LinkAccountPanel onCompleteAccount={onCompleteAccountClick} /> : null}
        {liveMatches.map((m, i) => {
          if (i > 5) return
          return <MatchLiveItem key={`match_${m.id}`} router={router} match={m} leagueName={m.league_name} />
        })}
      </div>
    }
  }

  function onSignIn() {
    setShowSignIn(true)
  }

  function onNavRegister() {
    setLogOrReg(1)
  }

  function onNavLogin() {
    setLogOrReg(0)
    setShowCompleteAccount(false)
    setShowSignIn(true)
  }

  function onShowLang() {
    setShowLang(1)
    setShowSignIn(0)
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

        <DesktopAppBar locale={locale} router={router} onSignIn={onSignIn} me={me} onShowLang={onShowLang} pageEnum={EPAGE_CALENDAR} />
        <div className={styles.desktop_panels_cont}>
          <DesktopMenuPanel leagues={leagues} router={router} />
          <DesktopCalendarPanel router={router} date={date} matches={matches} />
          {renderDesktopRightPanel()}
        </div>
      </main>
    </>
  }

  if (!isMobile) {
    return renderDesktop()
  }

  function getIconColor() {
    return '_white';
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
        <AppBar title={t('calendar_page')} />
        <div className={styles.calendar_panel}>
          <div className={styles.date_cont}>
            <img className={styles.cal_icon} src={`${SERVER_BASE_URL}/data/icons/calendar${getIconColor()}.svg`} />
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
                <img className={styles.league_icon} src={`${SERVER_BASE_URL}/data/leagues/${m.league_name}${getIconColor()}.png`} />
                <div className={styles.league_name_cont}>
                  <span className={styles.league_name}>{m.league_name}</span>
                  <span className={styles.league_week}>{t('matchday')} {m.week}</span>
                </div>
              </div> : null}
              <MatchItemMobile currentWeek={m.currentWeek} router={router} match={m} onPreview={onPreview} />
            </div>
          })}

          {!matches.length ? <span className={styles.no_matches}>{t('no_matches_found')}</span> : null}

          {/* {isAndroid ? <InstallPanel hasBg={false} hasMargin={true} /> : null} */}
        </div>
        {showPreview ? <MatchPreviewDialog match={previewMatch} onClose={onPreviewClose} /> : null}
        <BottomNavBar me={me} isAndroid={isAndroid} isIOS={isIOS} router={router} page={EPAGE_CAL} />
      </main>
    </>
  );
}
