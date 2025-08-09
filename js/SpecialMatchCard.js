import styles from '@/styles/SpecialMatchCard.module.css';
import { SERVER_BASE_URL } from './Config';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import SpecialPointsPanel from './SpecialPointsPanel';


export default function SpecialMatchCard({ match, router, onClose }) {
    const {t} = useTranslation()

    function onNavMatch() {
        router.push(`/match/${match.match.id}`)
    }

    function getDate(matchDate) {
        const today = moment().startOf('day');
        const tomorrow = moment().add(1, 'day').startOf('day');

        if (moment(matchDate).isSame(today, 'day')) {
            return t('today');
        } else if (moment(matchDate).isSame(tomorrow, 'day')) {
            return t('tomorrow');
        } else {
            return `${moment(matchDate).format('DD')} ${t(moment(matchDate).format('MMM').toLowerCase())}`;
        }
    }

    return <div className={styles.cont}>
        <div className={styles.card}>
            <img src={`${SERVER_BASE_URL}/data/special/${match.title}.png`} className={styles.bg} />

            <div className={styles.title_cont}>
                <span>{match.translatedTitle}</span>
            </div>

            <div className={styles.teams_row}>
                <div className={styles.team1_cont}>
                    <img className={styles.team_icon} src={`${SERVER_BASE_URL}/data/teams/150x150/${match.match.team1.name}.png`} />
                    <span>{match.match.team1.shortName}</span>
                </div>
                <div className={styles.middle}>
                    <span>{getDate(match.match.date)}</span>
                    <div className={styles.time_cont}>
                        <span className={styles.time}>{moment(match.match.date).format('HH:mm')}</span>
                    </div>
                </div>
                <div className={styles.team1_cont}>
                    <img className={styles.team_icon} src={`${SERVER_BASE_URL}/data/teams/150x150/${match.match.team2.name}.png`} />
                    <span>{match.match.team2.shortName}</span>
                </div>
            </div>
            <SpecialPointsPanel match={match}/>
            <button className={styles.predict} onClick={onNavMatch}>
                {t('predict')}
            </button>
            <button className={styles.close} onClick={onClose}>x</button>
        </div>
    </div>

}