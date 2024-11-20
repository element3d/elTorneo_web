import styles from '@/styles/Home.module.css';
import { useEffect, useState } from 'react';


export default function TeamBrowseDialog({league, onPick}) {
    const [teams, setTeams] = useState([])

    useEffect(() => {
        fetch(`${SERVER_BASE_URL}/api/v1/teams?league_id=${league.id}`, {
          method: 'GET',
          // headers: { 'Content-Type': 'application/json' },
        })
          .then(response => response.json())
          .then(data => setTeams(data))
          .catch(error => console.error('Error fetching leagues:', error));
    }, []);

    return (<div className={styles.dialog}>
        <div className={styles.dialog_panel}>
            <div className={styles.list}>
            {teams.map((team, index) => (
            <div key={index} className={styles.dialog_list_item} onClick={() => onPick(team)}>
                <img className={styles.list_icon} src={`${SERVER_BASE_URL}/data/teams/150x150/${team.name}.png`} />
                {team.name}
            </div>
            ))}
            </div>
        </div>
    </div>)
}