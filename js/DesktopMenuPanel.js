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
{/* 
        <h5 className={styles.title}>Menu</h5>
        <div className={styles.beat_bet_item} onClick={onNavBeatBet}>
            Beat Bet
        </div> */}
    </div>
}