import styles from '@/styles/AwardsPanel.module.css';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next';

export default function AwardsPanel({showLeague, league}) {
    const {t} = useTranslation()

    function getImg() {
        if (!showLeague) return `${SERVER_BASE_URL}/data/icons/playstore.png`
        if (league == 1) return `${SERVER_BASE_URL}/data/icons/throphy.png`
        if (league == 2) return `${SERVER_BASE_URL}/data/icons/second.png`
    }

    return (<div className={styles.cont}>
        <img className={styles.bg} src={getImg()}/>
        { !showLeague ? <div className={styles.overlay}></div> : null }

        { showLeague ? <span className={styles.league_title}>League {league}</span> : null }
        <span className={styles.awards_title}>{t('awards')}</span>
        <span className={styles.awards_msg}>{t('award_msg')}</span>
        
        <div className={styles.award_item}>
            <span>1 pt = 0.{league == 1 ? '5' : '3'} $</span>
        </div>

        <span className={styles.rules_title}>{t('rules')}</span>
        <div className={styles.points_cont}>
            <div className={styles.points_score}>+3</div>
            <div className={styles.points_win}>+1</div>
            <div className={styles.points_loose}>-1</div>
        </div>

        <div className={styles.button}>
            <span>{t('learn_more')}</span>
        </div>
    </div>)
}