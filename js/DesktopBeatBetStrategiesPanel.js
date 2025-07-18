import styles from '@/styles/DesktopRightPanel.module.css';
import LeagueTablePanel from './LeagueTablePanel';
import { useState } from 'react';

export const ESTRATEGY_PLAYER = 1
export const ESTRATEGY_TEAM = 2
export const ESTRATEGY_LEAGUE = 3

export default function DesktopBeatBetStrategiesPanel({router, onShowDialog, player, league, team, home, away}) {
    // const [player, setPlayer] = useState('')

    function onChangeHome(e) {
        const checked = e.target.checked
        let home = false;
        let path = `/beat_bet?player=${player}&team=${team}&league=${league}`

        if (checked) {
            home = true
            path += '&home=1'
        } 

        router.push(path)
    }

    function onChangeAway(e) {
        const checked = e.target.checked
        let away = false;
        let path = `/beat_bet?player=${player}&team=${team}&league=${league}`

        if (checked) {
            away = true
            path += '&away=1'
        } 

        router.push(path)
    }

    return <div className={styles.padding}>
        <h4>Strategies</h4>
        <div className={styles.strat_item}>
            <span>Player</span>
            <button className={styles.button} onClick={() => onShowDialog(ESTRATEGY_PLAYER)}>
                {player ? player : 'Choose a player'}
            </button>    
        </div>

        <div className={styles.strat_item}>
            <span>League</span>
            <button className={styles.button} onClick={() => onShowDialog(ESTRATEGY_LEAGUE)}>
                {league ? league : 'Choose a league'}
            </button>    
        </div>

        <div className={styles.strat_item}>
            <span>Team</span>
            <button className={styles.button} onClick={() => onShowDialog(ESTRATEGY_TEAM)}>
                {team ? team : 'Choose a team'}
            </button>    
        </div>

        <div className={styles.strat_item}>
            <div className={styles.check_row}>
                <input type='checkbox' className={styles.check} checked={home} onChange={onChangeHome}/>
                <span>Only home</span>
            </div> 
            <div className={styles.check_row}>
                <input type='checkbox' className={styles.check} checked={away} onChange={onChangeAway}/>
                <span>Only away</span>
            </div> 
        </div>
    </div>
}