import styles from '@/styles/SpecialPointsPanel.module.css';

export default function SpecialPointsPanel({match}) {
    function getSpecialPoints() {
        return match.match.special_match_points.split(':')
    }

    return <div className={styles.cont}>
        <div className={styles.p1}>
            +{getSpecialPoints()[0]}
        </div>
        <div className={styles.p2}>
            +{getSpecialPoints()[1]}
        </div>
        <div className={styles.p2}>
            +{getSpecialPoints()[1]}
        </div>
        <div className={styles.p3}>
            {getSpecialPoints()[2]}
        </div>
    </div>
}