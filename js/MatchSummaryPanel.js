import styles from '@/styles/MatchSummaryPanel.module.css';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next';

export default function MatchSummaryPanel({ match, summary }) {
    const { t } = useTranslation()

    function getPredictPercent(numPredicts) {
        const percent = numPredicts / summary.numPredicts * 100
        if (percent <= 0) return ""
        return ` (${Number.parseInt(percent)}%)`
    }

    function getPredictPercent2(numPredicts) {
        const percent = numPredicts / summary.numPredicts * 100
        if (percent <= 0) return 0
        return Number.parseInt(percent)
    }

    function getTeamImg(team) {
        if (match.league == 7)
            return `${SERVER_BASE_URL}/data/teams/150x150/${team.name.replace(/ö/g, 'o')}.png`
        return `${SERVER_BASE_URL}/data/teams/150x150/${team.name.replace(/ö/g, 'o')}_kit.png`
    }

    return (<div className={styles.cont}>
        <span className={styles.title}>{t('summary')} ({summary.numPredicts} {t('predictions')})</span>
        <div className={styles.panel}>
            <img className={match.league == 7 ? styles.team_flag : styles.team_kit}
                src={getTeamImg(match.team1)}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${SERVER_BASE_URL}/data/teams/150x150/blank.png`;
                }}
            />
            <div className={styles.content}>
                <span className={styles.subtitle}>{t('chanses_to_win')}</span>
                <div className={styles.progress_bg}>
                    <div className={styles.progress_p1} style={{ width: `${getPredictPercent2(summary.numP1)}%` }}></div>
                    <div className={styles.progress_draw} style={{ width: `${getPredictPercent2(summary.numDraw)}%` }}></div>
                    <div className={styles.progress_p2} style={{ width: `${getPredictPercent2(summary.numP2)}%` }}></div>
                </div>
                <div className={styles.stats}>
                    <span className={styles.summary_p1}>{summary.numP1}{getPredictPercent(summary.numP1)}</span>
                    <span className={styles.summary_draw}>{summary.numDraw}{getPredictPercent(summary.numDraw)}</span>
                    <span className={styles.summary_p2}>{summary.numP2}{getPredictPercent(summary.numP2)}</span>
                </div>
            </div>
            <img className={match.league == 7 ? styles.team_flag : styles.team_kit}
                src={getTeamImg(match.team2)}
                onError={(e) => {
                    e.currentTarget.onerror = null; // prevent infinite loop
                    e.currentTarget.src = `${SERVER_BASE_URL}/data/teams/150x150/blank.png`;
                }}
                alt="Team"
            />
        </div>
    </div>)
}