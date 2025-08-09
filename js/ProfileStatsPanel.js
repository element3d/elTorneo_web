import styles from '@/styles/Profile.module.css';
import { useTranslation } from 'next-i18next';

export default function ProfileStatsPanel({ view, isMobile, stats }) {
    const { t } = useTranslation()

    if (view == 'bets') {
        return <div className={isMobile ? styles.stats_cont_mobile : styles.stats_cont}>
            <span className={styles.stats_title}>{t('in_all_leagues')}</span>
            <div>
                <span>{t('total_bets')}:</span>
                <span className={styles.stats_val}>{stats.totalBets}</span>
            </div>
            <div>
                <span>{t('winning_bets')}:</span>
                <span className={styles.stats_val}>
                    {stats.totalWinBets} {stats.totalBets > 0 ? `(${Number.parseInt(stats.totalWinBets / stats.totalBets * 100)}%)` : null}
                </span>
            </div>
            <div>
                <span>{t('losing_bets')}:</span>
                <span className={styles.stats_val}>
                    {stats.totalLooseBets} {stats.totalBets > 0 ? `(${Number.parseInt(stats.totalLooseBets / stats.totalBets * 100)}%)` : null}
                </span>
            </div>
        </div>
    }

    return (
        <div className={isMobile ? styles.stats_cont_mobile : styles.stats_cont}>
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
