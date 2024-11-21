import Head from 'next/head';
import { Profiler, useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import styles from '@/styles/Profile.module.css';
import { useRouter } from 'next/router';
import { SERVER_BASE_URL } from '@/js/Config';
import AppBar from '@/js/AppBar';
import BottomNavBar, { EPAGE_PROF } from '@/js/BottomNavBar';
import UserPanel from '@/js/UserPanel';
import MatchItemMobile from '@/js/MatchItemMobile';
import ProfileStatsPanel from '@/js/ProfileStatsPanel';
import ProfileMatchesPanel from '@/js/ProfileMatchesPanel';
const inter = Inter({ subsets: ['latin'] });
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getServerSideProps(context) {
    const {req} = context
    const { query } = context;
    const globalPage = query.page ? Number(query.page) : 1;
    const { locale } = context;

    const token = req.cookies.token;
    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false, // This indicates that the redirect is temporary
            },
        };
    }

    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authentication': token 
        },
    };

    const user = await fetch(`${SERVER_BASE_URL}/api/v1/me`, requestOptions)
        .then(response => {
            if (response.status === 200) return response.json();
            return null;
        });

    const initialPredicts = await fetch(`${SERVER_BASE_URL}/api/v1/user/predicts?page=${globalPage}&user_id=${user.id}&league_id=${-1}`, {
        method: 'GET',
        headers: {},
    }).then(response => response.json());

    return {
        props: {
            user,
            globalPage,
            initialPredicts,
            ...(await serverSideTranslations(locale)),
        },
    };
}


export default function Home({ user, stats, globalPage, initialPredicts }) {
    const router = useRouter();
    const totalPredicts = initialPredicts.totalPredicts
    const [predicts, setPredicts] = useState(initialPredicts.predicts);

    return (
        <>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main} ${inter.className}`}>
                <AppBar title="el Torneo" />
                <UserPanel user={user} isMe={true} router={router} />
                <div className={styles.padding}>
                    <ProfileStatsPanel stats={initialPredicts} />
                    <ProfileMatchesPanel isMe={true} router={router} globalPage={globalPage} user={user} predicts={predicts} setPredicts={setPredicts} totalPredicts={initialPredicts.allPredicts}/>
                </div>
                <BottomNavBar router={router} page={EPAGE_PROF}/>
            </main>
        </>
    );
}
