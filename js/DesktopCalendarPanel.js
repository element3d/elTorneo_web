import styles from '@/styles/DesktopCalendarPanel.module.css';
import Calendar from './Calendar';
import { SERVER_BASE_URL } from './Config';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import MatchItemMobile from './MatchItemMobile';

export default function DesktopCalendarPanel({ router, date, matches }) {
  const { t } = useTranslation()
  let currentLeague = null

  function onPreview() {
    
  }

  return <div className={styles.panel}>
    <div className={styles.calendar_panel}>
      <div className={styles.date_cont}>
        <img className={styles.cal_icon} src={`${SERVER_BASE_URL}/data/icons/calendar_black.svg`} />
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
            <img className={styles.league_icon} src={`${SERVER_BASE_URL}/data/leagues/${m.league_name}_colored.png`} />
            <div className={styles.league_name_cont}>
              <span className={styles.league_name}>{m.league_name}</span>
              <span className={styles.league_week}>{t('matchday')} {m.week}</span>
            </div>
          </div> : null}
          <MatchItemMobile currentWeek={m.currentWeek} router={router} match={m} onPreview={onPreview} />
        </div>
      })}

      {!matches.length ? <span className={styles.no_matches}>{t('no_matches_found')}</span> : null}

    </div>
  </div>
}