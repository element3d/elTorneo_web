import styles from '@/styles/DesktopAppBar.module.css';
import { SERVER_BASE_URL } from './Config';


export default function DesktopAppBar({router}) {
    function onNavCal() {
        router.push('/calendar')
    }

    function onNavTable() {
        router.push('/table')
    }

    return <div className={styles.desktop_appbar_cont}>
        <div className={styles.desktop_appbar}>
            <div className={styles.home_button}>
                <img className={styles.icon} src={`${SERVER_BASE_URL}/data/icons/playstore.png`} />
                <h4>el Torneo</h4>
            </div>

            <div className={styles.home_button} onClick={onNavCal}>
                <img className={styles.icon} src={`${SERVER_BASE_URL}/data/icons/cal.svg`} />
                <h4>Calendar</h4>
            </div>

            <div className={styles.home_button} onClick={onNavTable}>
                <img className={styles.tournament_icon} src={`${SERVER_BASE_URL}/data/icons/stats.svg`} />
                <h4>Tournaments</h4>
            </div>
        </div>
    </div>
}