import styles from '@/styles/DesktopLeaguesMiddlePanel.module.css';
import MatchLiveItem from './MatchLiveItem';
import { useTranslation } from 'next-i18next';
import { SERVER_BASE_URL } from './Config';
import moment from 'moment';
import MatchItemMobile from './MatchItemMobile';
import HomeMatchesPanel from './HomeMatchesPanel';
import { getWeek } from './LeaguesPanel';


export default function DesktopLeaguesMiddlePanel({ router, week, weeks, leagueName, league, matches, matchOfDay }) {
    const {t} = useTranslation()
    let currMatchDate = null

    const isSameDay = (date1, date2) => {
        return (
          date1.getFullYear() === date2.getFullYear() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getDate() === date2.getDate()
        );
    };

    function onPreview() {}

    function getWeekInternal() {
        for (var w of weeks) {
            if (w.week == week) return getWeek(t, w)
        }

        return ''
    }

    return <div className={styles.panel}>
        <MatchLiveItem match={matchOfDay} router={router} leagueName={leagueName} />
        <div className={styles.title_cont}>
            <h3>{t('matches')}</h3>
            <button className={styles.week_button}>{getWeekInternal(week)}</button>
        </div>
        <HomeMatchesPanel league={league} matches={matches} router={router} onPreview={onPreview} />
    </div>
}