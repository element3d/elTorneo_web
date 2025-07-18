import styles from '@/styles/BeatBetDialog.module.css';
import { useEffect, useState } from 'react';
import { SERVER_BASE_URL } from './Config';
import { ESTRATEGY_LEAGUE, ESTRATEGY_PLAYER, ESTRATEGY_TEAM } from './DesktopBeatBetStrategiesPanel';


export default function BeatBetDialog({ strategy, leagues, player, onOptionClick }) {

    const [options, setOptions] = useState([])
    const [league, setLeague] = useState(-1)

    useEffect(() => {
        if (strategy == ESTRATEGY_PLAYER) return getPlayers()
        if (strategy == ESTRATEGY_LEAGUE) return setOptions(leagues)

        if (strategy == ESTRATEGY_TEAM) return setOptions(leagues)
    }, [])

    function getPlayers() {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        fetch(`${SERVER_BASE_URL}/api/v1/table/points?page=${1}&league=${1}`, requestOptions)
            .then(response => {
                if (response.status == 200)
                    return response.json()

                return null
            })
            .then(table => {
                setOptions(table)
            })
    }

    function getTeams(lid) {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        fetch(`${SERVER_BASE_URL}/api/v1/teams?league_id=${lid}`, requestOptions)
            .then(response => {
                if (response.status == 200)
                    return response.json()

                return null
            })
            .then(table => {
                setOptions(table)
            })
    }

    function onOptionClickInternal(o) {
        if (strategy == ESTRATEGY_PLAYER) return onOptionClick(o)

        if (strategy == ESTRATEGY_LEAGUE) {
            return onOptionClick(o)
        }

        if (strategy == ESTRATEGY_TEAM) {
            if (league == -1) {
                setLeague(league.id)
                return getTeams(o.id)
            }
            onOptionClick(o)
        }
        
    }

    return <div className={styles.bg}>
        <div className={styles.content}>
            {options.map((o) => {
                return <div className={styles.option} onClick={() => onOptionClickInternal(o)}>
                    {o.name}
                </div>
            })}
        </div>
    </div>
}