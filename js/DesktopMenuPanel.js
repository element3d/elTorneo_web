import styles from '@/styles/DesktopMenuPanel.module.css';
import { SERVER_BASE_URL } from './Config';


export default function DesktopMenuPanel({ router, leagues }) {
    function onNavBeatBet() {
        router.push('/beat_bet')
    }

    function onLeagueClick(l) {
        router.push(`/?league=${l.id}`)
    }

    return <div className={styles.panel}>
        {/* <span>Leagues</span> */}
        {leagues.map((l) => {
            return <div className={styles.menu_item} onClick={() => onLeagueClick(l)}>
                <img className={styles.league_icon} src={`${SERVER_BASE_URL}/data/leagues/${l.name}_colored.png`}></img>
                {l.name}
            </div>
        })}

        <div className={styles.supports}>
            <a href='https://www.youtube.com/@eltorneo/videos' target="_blank">
                <img className={styles.youtube} src={`${SERVER_BASE_URL}/data/icons/youtube.svg`}></img>
            </a>
            <a href='https://play.google.com/store/apps/details?id=com.eltorneo' target="_blank">
                <img className={styles.gplay} src={`${SERVER_BASE_URL}/data/icons/google-play.svg`}></img>
            </a>
            <a href='https://web.telegram.org/k/#@elTorneoBot' target="_blank">
                <img className={styles.telegram} src={`${SERVER_BASE_URL}/data/icons/telegram.svg`}></img>
            </a>
            <a href='https://www.tiktok.com/@el.torneo.app' target="_blank">
                <img className={styles.tiktok} src={`${SERVER_BASE_URL}/data/icons/tiktok.svg`}></img>
            </a>
        </div>
{/* 
        <h5 className={styles.title}>Menu</h5>
        <div className={styles.beat_bet_item} onClick={onNavBeatBet}>
            Beat Bet
        </div> */}
    </div>
}