import styles from '@/styles/Profile.module.css';
import { useTranslation } from 'next-i18next';

export default function ProfileStatsPanel({ stats }) {
    const {t} = useTranslation()

    return (
        <div className={styles.stats_cont}>
            <span className={styles.stats_title}>{t('in_all_leagues')}</span>
            <div>
                <span>{t('total_short')}:</span>
                <span className={styles.stats_val}>{stats.totalPredicts}</span>
            </div>
            <div>
                <span>{t('score_predicted')}:</span>
                <span className={styles.stats_val}>{stats.totalScorePredicts} {stats.totalScorePredicts > 0 ? `(${Number.parseInt(stats.totalScorePredicts / stats.totalPredicts * 100)}%)` : ''}</span>
            </div>
            <div>
                <span>{t('winner_or_draw_predicted')}:</span>
                <span className={styles.stats_val}>{stats.totalWinnerPredicts} {stats.totalWinnerPredicts > 0 ? `(${Number.parseInt(stats.totalWinnerPredicts / stats.totalPredicts * 100)}%)` : ''}</span>
            </div>
            <div>
                <span>{t('prediction_was_failed')}:</span>
                <span className={styles.stats_val}>{stats.totalFailPredicts}  {stats.totalFailPredicts > 0 ? `(${Number.parseInt(stats.totalFailPredicts / stats.totalPredicts * 100)}%)` : ''}</span>
            </div>
        </div>
    );
}
