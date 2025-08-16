import styles from '@/styles/MatchTop20Panel.module.css';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next';

export default function MatchTop20Panel({ router, match, predicts }) {
    const { t } = useTranslation()

    function getBorderColor(p) {
        if (p.status == 0) return 'black'//'#8E8E93'
        if (p.status == 1 || p.status == 5) return '#00C566'
        if (p.status == 2) return '#ff7539'
        if (p.status == 3) return '#FF4747'
    }

    function getBgColor(p) {
        if (p.status == 0) return '#F7F7F7'
        if (p.status == 1 || p.status == 5) return '#00C56619'
        if (p.status == 2) return '#FACC1519'
        if (p.status == 3) return '#FF474719'
    }

    function getSpecialPoints() {
        return match.special_match_points.split(':')
    }

    function getPoint(p) {
        const sp = getSpecialPoints()

        if (p.status == 0) return '0'
        if (p.status == 1) return match.is_special ? '+' + sp[1] : '+1'
        if (p.status == 2) return match.is_special ? '+' + sp[0] : '+3'
        if (p.status == 3) return match.is_special ? sp[2] : '-1'
        if (p.status == 4) return '-2'
        if (p.status == 5) return match.is_special ? '+' + sp[1] : '+2'
    }

    return (<div className={styles.cont}>
        <span className={styles.title}>{t('top_20_predicts')}</span>
        {
            predicts.map((p) => {
                return <div key={`predict_${p.user.id}`} className={styles.player_item} onClick={() => router.push(`/profile/${p.user.id}`)}>
                    <div className={styles.ava_cont}>
                        {p.user.avatar?.length ?
                            <img className={styles.ava} src={`${SERVER_BASE_URL}/${p.user.avatar}`} /> :
                            <img className={styles.ava_blank} src={`${SERVER_BASE_URL}/data/icons/profile_blank.svg`} />}
                    </div>
                    <div className={styles.col}>
                        <span className={styles.name}>{p.user.name}</span>
                        <span className={styles.subtitle}>{p.user.league == 1 ? t('place_in_el_torneo') : t('place_in_league2')}:  {p.user.position}, Points:  {p.user.points}</span>
                    </div>

                    <div className={styles.predict} style={{ backgroundColor: getBgColor(p), color: getBorderColor(p) }}>
                        <span>{p.team1_score} : {p.team2_score} {p.status == 0 ? '' : `(${getPoint(p)})`}</span>
                    </div>
                </div>
            })
        }
    </div>)
}