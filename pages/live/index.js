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
import MatchLiveItem from '@/js/MatchLiveItem';
import { useTranslation } from 'next-i18next';
const inter = Inter({ subsets: ['latin'] });
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { UAParser } from 'ua-parser-js';
import InstallPanel from '@/js/InstallPanel';

export async function getServerSideProps(context) {
  const { query } = context;
  const { req } = context;
  let token = null
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  const { locale } = context;

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

  let isLive = true
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
    isLive = false
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
      isLive,
      isAndroid,
      isIOS,
      me,
      ...(await serverSideTranslations(locale)),
    },
  };
}

export default function Home({ me, isAndroid, isIOS, matches, isLive }) {
  const { t } = useTranslation()
  const today = moment();
  // const [date, setDate] = useState(today.format('YYYY-MM-DD'))
  const router = useRouter()
  let currentLeague = null

  return (
    <>
      <Head>
        <title>el Torneo - Live matches</title>
        <meta name="description" content="World's biggest football fan tournament." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <AppBar title={'el Torneo'} />

        <h4 className={styles.live_title}> {isLive ? t('live_matches') : t('upcoming_matches')}</h4>
        <div className={styles.matches_cont}>

          {matches.map((m, i) => {
            return <MatchLiveItem key={`match_${m.id}`} router={router} match={m} leagueName={m.league_name} />

          })}

        </div>
        {isAndroid ? <InstallPanel hasBg={false}/> : null }
        <BottomNavBar me={me} isAndroid={isAndroid} isIOS={isIOS} router={router} />
      </main>
    </>
  );
}
