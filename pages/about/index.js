import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import styles from '@/styles/About.module.css';
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

export async function getServerSideProps(context) {
  const { query } = context;
  const timestamp = query.date ? Number(query.date) : new Date(moment().format('YYYY-MM-DD')).getTime();
  const { locale } = context;

  const { req } = context
  let token = null
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
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
      isAndroid,
      isIOS,
      me,
      ...(await serverSideTranslations(locale)),
    },
  };
}

export default function Home({ me, isAndroid, isIOS }) {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <>
      <Head>
        <title>el Torneo</title>
        <meta name="description" content="World's biggest football fan tournament." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <AppBar title={'el Torneo'} router={router} />

        <div className={styles.padding}>
            <h3 className={styles.title}>{t('learn_more')}</h3>
            <span className={styles.text}>{t('awards_info_short')}</span>

            <h3 className={styles.title}>{t('rules')}</h3>
            <span className={styles.text}>{t('rules_info')}</span>

            <h4>{t('supermatch')}</h4>
            <span className={styles.text}>{t('supermatch_msg')}</span>

            <h4>{t('quest')}</h4>
            <span className={styles.text}>{t('quest_match_msg')}</span>

            {/* <h3 className={styles.title}>{t('about_us')}</h3>
            <span className={styles.text}>{t('about_us_msg')}</span> */}

            {isAndroid ? <InstallPanel /> : null }
        </div>
      
        <BottomNavBar me={me} isAndroid={isAndroid} isIOS={isIOS} router={router} />
      </main>
    </>
  );
}
