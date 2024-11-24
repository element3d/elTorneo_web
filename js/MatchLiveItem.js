import styles from '@/styles/MatchLiveItem.module.css';
import { SERVER_BASE_URL } from './Config';
import moment from 'moment';
import { useTranslation } from 'next-i18next';

function TeamItem({ team, isHome, style }) {
  const {t} = useTranslation()

  return <div className={styles.team_item} style={style}>
    <img className={styles.team_logo} src={`${SERVER_BASE_URL}/data/teams/150x150/${team.name}.png`} />
    <span className={styles.team_name}>{team.shortName}</span>
    <span className={styles.home_away}>{isHome ? t("home") : t("away")}</span>
  </div>
}

export default function MatchLiveItem({ router, match, leagueName }) {
  const {t} = useTranslation()

  function isFinished() {
    if (match.status == 'FT' || (match.team1_score >= 0 && match.team2_score >= 0)) return true;
    return false
  }

  function isNotStarted() {
    const d = Date.now()
    if (match.date > d) {
      return true
    }
    return false
  }

  function isLive() {
    if (isNotStarted() || isFinished()) return false 
    return true
  }

  function getDate() {
    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'day').startOf('day');

    if (moment(match.date).isSame(today, 'day')) {
      return t("today");
    } else if (moment(match.date).isSame(tomorrow, 'day')) {
      return t("tomorrow");
    } else {
      return `${moment(match.date).format('DD')} ${t(moment(match.date).format('MMM').toLowerCase())}`;
    }
  }

  function onNavMatch() {
    router.push(`/match/${match.id}`)
  }

  return (<div className={styles.cont} onClick={onNavMatch}>
    <img className={styles.bg} src={`${SERVER_BASE_URL}/data/leagues/${leagueName}_banner2.png`} />

    <span className={styles.league_title}>{leagueName}</span>
    <span className={styles.week}>{t('matchday')} {match.week}</span>

    <div className={styles.teams_row}>
      <TeamItem team={match.team1} style={{paddingRight: '20px'}} isHome={true}/>
      <TeamItem team={match.team2} style={{paddingLeft: '20px'}} />

      {isFinished() ? <div className={styles.score_cont}>
        <div>
          <span className={styles.score}>{match.team1_score}</span>
          <span className={styles.score}>:</span>
          <span className={styles.score}>{match.team2_score}</span>
        </div>
        <div className={styles.status}>
          <span>FT</span>
        </div>
      </div> : null}

      {isNotStarted() ? <div className={styles.date_cont}>
        <div>
          <span className={styles.date}>{getDate()}</span>
        </div>
        <div className={styles.status}>
          <span>{moment(match.date).format('HH:mm')}</span>
        </div>
      </div> : null}

      {isLive() ? <div className={styles.score_cont}>
        <div>
          <span className={styles.score}>{match.team1_score_live}</span>
          <span className={styles.score}>:</span>
          <span className={styles.score}>{match.team2_score_live}</span>
        </div>
        <div className={styles.status}>
          <span>{ match.status == 'HT' ? "HT" : match.elapsed + " '"}</span>
        </div>
      </div> : null}
    </div>

    { match.predict?.status != -1 ? <div className={styles.predict}>
      <span>Predict {match.predict.team1_score} : {match.predict.team2_score}</span>
    </div> : null }

  </div>)
}