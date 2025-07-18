import styles from '@/styles/DesktopLeaguesMiddlePanel.module.css';
import MatchLiveItem from './MatchLiveItem';
import { useTranslation } from 'next-i18next';
import { SERVER_BASE_URL } from './Config';
import moment from 'moment';
import MatchItemMobile from './MatchItemMobile';
import HomeMatchesPanel from './HomeMatchesPanel';


export default function DesktopLeaguesMiddlePanel({ router, leagueName, league, matches, matchOfDay }) {
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

    return <div className={styles.panel}>
        <MatchLiveItem match={matchOfDay} router={router} leagueName={leagueName} />
        <HomeMatchesPanel league={league} matches={matches} router={router} onPreview={onPreview} />
    </div>
}