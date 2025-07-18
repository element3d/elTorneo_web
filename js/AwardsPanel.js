import styles from '@/styles/AwardsPanel.module.css';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next';

export default function AwardsPanel({router, showLeague, league, season}) {
    const {t} = useTranslation()

    function getImg() {
        return `${SERVER_BASE_URL}/data/icons/throphy.png`

        if (!showLeague) return `${SERVER_BASE_URL}/data/icons/playstore.png`
        if (league == 1) return `${SERVER_BASE_URL}/data/icons/throphy.png`
        if (league == 2) return `${SERVER_BASE_URL}/data/icons/second.png`
        if (league == 3) return `${SERVER_BASE_URL}/data/icons/tg_league.png`

    }

    function onNavAbout() {
        router.push('/about')
    }

    function getLeagueName() {
        if (league == 1) return 'Legend'
        if (league == 2) return 'Pro'
        if (league == 3) return 'Amateur'
        if (league == 4) return 'Beginner'

        if (league == 1) return 'el Torneo'
        if (league == 3) return 'Telegram ' + t('league')
        return `${t('league')} ${league}`
    }

    return (<div className={styles.cont} onClick={onNavAbout}>
        <img className={styles.bg} src={getImg()}/>
        { !showLeague ? <div className={styles.overlay}></div> : null }

        { showLeague ? <span className={styles.league_title}>{getLeagueName()}</span> : null }
        <span className={styles.awards_msg}>{t('season') + ` 20${season}`}</span>
        {/* <span className={styles.awards_msg}>{t('award_msg')}</span>
        
        <div className={styles.award_item}>
            <span>1 pt = 0.{league == 1 ? '5' : '3'} $</span>
        </div> */}

        <span className={styles.rules_title}>{t('rules')}</span>
        <div className={styles.points_cont}>
            <div className={styles.points_score}>+3</div>
            <div className={styles.points_win}>+2</div>
            <div className={styles.points_win}>+1</div>
            <div className={styles.points_loose}>-1</div>
        </div>

        <div className={styles.button} onClick={onNavAbout}>
            <span>{t('learn_more')}</span>
        </div>
    </div>)
}