import styles from '@/styles/MatchItem.module.css';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next';
import MatchUtils from './MatchUtils';

function TeamItemLeft({ team, isSpecial }) {
    return (<div className={styles.team_item_left}>
        <span className={isSpecial ? styles.white : null}>{team.shortName}</span>
        <img className={styles.team_icon} src={`${SERVER_BASE_URL}/data/teams/150x150/${team.name.replace(/ö/g, 'o')}.png`} />
    </div>)
}

function TeamItemRight({ team, isSpecial }) {
    return (<div className={styles.team_item_right}>
        <img className={styles.team_icon} src={`${SERVER_BASE_URL}/data/teams/150x150/${team.name.replace(/ö/g, 'o')}.png`} />
        <span className={isSpecial ? styles.white : null}>{team.shortName}</span>
    </div>)
}

function getBgColor(p) {
    if (p.status == 0) return styles.gray
    if (p.status == 1) return styles.winner_bg
    if (p.status == 2) return styles.score_bg
    if (p.status == 3 || p.status == 4) return styles.fail_bg
}

function PredictPanel({ predict }) {
    const { t } = useTranslation()

    return <div className={`${styles.predict_panel} ${getBgColor(predict)}`}>
        <span className={MatchUtils.getPredictionColor(predict)}>{MatchUtils.getPredictTitle(predict, t)}{MatchUtils.getPredictValue(predict)}</span>
    </div>
}

function BetPanel({ bet }) {
    const { t } = useTranslation()

    return <div className={styles.bet_panel}>
        <div>
            <span>{t('bet')} { MatchUtils.getBetText(bet.bet)}</span>
            <span className={styles.bet_odd}>({bet.odd})</span>
        </div>
        <div>
            <span className={styles[MatchUtils.getBetColorStyle(bet)]}>{MatchUtils.getBetSign(bet)}{MatchUtils.getBetAmount(bet)}$</span>
        </div>
    </div>
}

export default function MatchItemMobile({ view, currentWeek, router, match, showLeague, onPreview, settings }) {

    const { t } = useTranslation()

    const showPoints = match.status != 'PST' && match.predict && match.predict.status > 0

    function onNavMatch() {
        if (match.status == 'PST') return

        if (match.week > currentWeek) {
            const matchDate = new Date(match.date); // Ensure match.date is a valid date
            const currentDate = new Date(); // Current date and time

            // Calculate the difference in time (milliseconds)
            const timeDifference = matchDate - currentDate;

            // Convert the time difference to days
            const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

            if (daysDifference > 2) {
                return; // Match is starting in more than 2 days
            }

            // Continue with your logic for matches starting within 2 days
        }
        router.push(`/match/${match.id}`)
    }

    function renderFT() {
        const st = match.is_special ? styles.score_white : styles.score

        return <div className={styles.row}>
            <span className={st}>{match.team1_score}</span>
            <div className={match.is_special ? styles.score_dots_white : styles.score_dots}>:</div>
            <span className={st}>{match.team2_score}</span>

        </div>
    }

    function renderLive() {
        const st = match.is_special ? styles.score_white : styles.score

        return <div className={styles.col}>
            <div className={styles.elapsed} style={{ border: match.is_special ? '1px solid #00C566' : 'none' }}>
                {match.status == 'HT' ? 'HT' : match.elapsed + " '"}
            </div>
            <div className={styles.row}>
                <span className={st}>{match.team1_score_live}</span>
                <div className={match.is_special ? styles.score_dots_white : styles.score_dots}>:</div>
                <span className={st}>{match.team2_score_live}</span>
            </div>
        </div>
    }


    function renderNotStarted() {
        return <div className={styles.match_date} style={{ border: match.is_special ? '1px solid #00C566' : null }}>
            <span>{getTime(match.date)}</span>
        </div>
    }

    function renderPST() {
        return <div className={styles.match_pst} style={{ border: match.is_special ? '1px solid #FF4747' : null }}>
            <span>{'PST'}</span>
        </div>
    }

    function isFinished() {
        if (match.status == 'FT') return true
        if (match.team1_score != -1 && match.team2_score != -1) return true

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
        if (match.status == 'PST') return false
        if (isNotStarted() || isFinished()) return false
        return true
    }

    function getTime(ts) {
        const date = new Date(ts);

        // return moment(ts).format('HH:mm')

        // Format the time as "23:30"
        const formattedTime = date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        return formattedTime;
    }

    function getWeekTitleShort(week) {
        if (week.type == 0) {
            return `(${week.week})`
        } else if (week.type == 1) {
            return '(KR)'
        } else if (week.type == 2) {
            return '(QF)'
        } else if (week.type == 3) {
            return '(SF)'
        } else if (week.type == 4) {
            return '(F)'
        } else if (week.type == 5) {
            return '(R16)'
        }
    }

    function LeaguePanel({ league, week, isSpecial }) {
        function getIcon() {
            if (isSpecial) return `${SERVER_BASE_URL}/data/leagues/${league}_white.png`

            return `${SERVER_BASE_URL}/data/leagues/${league}_colored.png`
        }

        return <div className={styles.league_panel}>
            <div className={styles.league_panel_top}>
                <img className={styles.league_icon} src={getIcon()} />
                <span className={isSpecial ? styles.white : null}>{league}</span>
                <span className={styles.week}>{getWeekTitleShort(week)}</span>
                {settings && settings.season != match.season ? <span className={styles.week}>{match.season}</span> : null}
            </div>
            {/* <span className={styles.week}>Matchday {week}</span> */}
        </div>
    }

    function getSpecialPoints() {
        return match.special_match_points.split(':')
    }

    function getPoints(p) {
        const sp = getSpecialPoints()

        if (p.status == 0) return '0'
        if (p.status == 1) return match.is_special ? '+' + sp[1] : '+1'
        if (p.status == 2) return match.is_special ? '+' + sp[0] : '+3'
        if (p.status == 3) return match.is_special ? sp[2] : '-1'
        if (p.status == 4) return '-2'
        if (p.status == 5) return '+2'
    }

    function PointsPanel() {

        const st = getBgColor(match.predict)

        return <div className={`${styles.points_panel} ${st}`}>
            <span className={MatchUtils.getPredictionColor(match.predict)}>{t('points')}: {getPoints(match.predict)}</span>
        </div>
    }


    function getSpecialPoints() {
        return match.special_match_points.split(':')
    }

    function isShowPoints() {
        return !isFinished() && match.is_special && match.predict?.status == -1
    }

    function renderUserPredict() {
        return match.predict?.status != -1 ? <PredictPanel predict={match.predict} /> : null;
    }

    function renderUserBet() {
        return <BetPanel bet={match.bet} />
    }

    return (<div onClick={onNavMatch} className={styles.match_item}>
        {showPoints && match.predict.status != 0 ? <PointsPanel /> : null}

        {match.predict?.status != -1 && !showLeague && !match.is_special ? <div className={styles.space} /> : null}

        {match.is_special ? <img className={styles.banner} src={`${SERVER_BASE_URL}/data/special/${match.special_match_title}.png`} /> : null}
        {showLeague ? <LeaguePanel league={match.league.name} week={{ week: match.week, type: match.week_type }} isSpecial={match.is_special} /> : null}
        {!showLeague && match.is_special ? <span className={styles.sm_title}>{match.special_match_tr_title}</span> : null}
        <div className={styles.content}>
            <TeamItemLeft team={match.team1} isSpecial={match.is_special} />
            {isFinished() ? renderFT() : null}
            {isLive() ? renderLive() : null}
            {isNotStarted() ? renderNotStarted() : null}
            {match.status == 'PST' ? renderPST() : null}
            <TeamItemRight team={match.team2} isSpecial={match.is_special} />
        </div>
        {view != 'bets' ? renderUserPredict() : renderUserBet()}
        {match.predict?.status == -1 && (showLeague || (match.is_special && !isShowPoints())) ? <div className={styles.space} /> : null}

        {isShowPoints() ? <div className={styles.points_cont}>
            <div className={styles.score_p}>
                +{getSpecialPoints()[0]}
            </div>
            <div className={styles.win_p}>
                +{getSpecialPoints()[1]}
            </div>
            <div className={styles.win_p}>
                +{getSpecialPoints()[1]}
            </div>
            <div className={styles.fail_p}>
                {getSpecialPoints()[2]}
            </div>
        </div>
            : null}

        {match.preview?.length ? <button className={styles.preview} onClick={(e) => { onPreview(match), e.stopPropagation() }}>
            <img className={styles.preview_icon} src={`${SERVER_BASE_URL}/data/icons/camera.svg`} />
        </button> : null}
    </div>)
}