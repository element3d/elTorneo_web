import styles from '@/styles/HomeMatchesPanel.module.css';
import MatchItemMobile from './MatchItemMobile';
import moment from 'moment';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next';

export default function HomeMatchesPanel({ isMobile, league, matches, router, onPreview }) {
    const {t} = useTranslation()
    let currMatchDate = null

    const isSameDay = (date1, date2) => {
        return (
          date1.getFullYear() === date2.getFullYear() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getDate() === date2.getDate()
        );
    };

    return (<div className={styles.panel} style={{padding: isMobile ? '20px' : '0px', paddingTop: '0px'}}>
        {matches.map((m, i) => {

            let renderTime = false;
            if (currMatchDate == null) {
                renderTime = true;
                currMatchDate = new Date(m.date);
            } else if (!isSameDay(new Date(currMatchDate), new Date(m.date))) {
                renderTime = true;
                currMatchDate = new Date(m.date);
            }

            return <div key={`match_${m.id}`}> 
                { renderTime ? <div className={`${styles.date_cont} ${i === 0 ? styles.mt_0 : ''}`} >
                    <img className={styles.cal_icon} src={`${SERVER_BASE_URL}/data/icons/calendar_black.svg`}/>
                    <span className={styles.date}>{moment(currMatchDate).format('DD')} {t(moment(currMatchDate).format('MMM').toLowerCase())} {moment(currMatchDate).format('YYYY')}</span>
                </div> : null }
                <MatchItemMobile onPreview={onPreview} currentWeek={league.week} router={router} match={m} />
            </div>
        })}

        {!matches.length ? <span className={styles.no_matches}>{t('no_matches_found')}</span> : null}
    </div>)
}