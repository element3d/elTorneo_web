import styles from '@/styles/Home.module.css';
import { SERVER_BASE_URL } from './Config';
import { useEffect, useState } from 'react';

export function MatchItem({match, team1, team2}) {
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [team1Score, setTeam1Score] = useState(match.team1_score >= 0 ? match.team1_score : '')
    const [team2Score, setTeam2Score] = useState(match.team2_score >= 0 ? match.team2_score : '')
    const [preview, setPreview] = useState(match.preview)

    useEffect(() => {
        const date = new Date(match.date);
    
        // Extract the date components in local time
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    
        // Extract the time components in local time
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
    
        // Format the date and time strings
        const dateStr = `${day}/${month}`;
        const timeStr = `${hours}:${minutes}`;
        
        setDate(dateStr);
        setTime(timeStr);
    }, [match]);
    

    function onChangeDate(e) {
        setDate(e.target.value)
    }

    function onChangeTime(e) {
        setTime(e.target.value)
    }

    function onChangeTeam1Score(e) {
        setTeam1Score(e.target.value)
    }

    function onChangeTeam2Score(e) {
        setTeam2Score(e.target.value)
    }

    function onChangePreview(e) {
        setPreview(e.target.value)
    }

    function onSavePreview() {
        
        fetch(`${SERVER_BASE_URL}/api/v1/match/preview?match_id=${match.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                preview: preview
            })
          })
            .then(response => {
              if (response.ok) {
               
                return response.text();
              }
              throw new Error('Failed to edit preview');
            })
           // .then(newLeague => setLeagues([...leagues, newLeague]))
            .catch(error => console.error('Error editing preview:', error));
    }

    function onSave() {
        const [day, month] = date.split('/');
        const [hours, minutes] = time.split(':');
        
        // Get the current year
        const currentYear = new Date().getFullYear();
        
        // Create a new Date object using the provided date and time components
        // Note that we're not adding the "Z" suffix here
        const localDate = new Date(`${currentYear}-${month}-${day}T${hours}:${minutes}:00`);
        
        // Convert the local date to UTC by adjusting for the timezone offset
        const utcDate = new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000);
        
        // Get the Unix timestamp in milliseconds
        const timestampMs = localDate.getTime();
        // return

        fetch(`${SERVER_BASE_URL}/api/v1/match?match_id=${match.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                team1_score: Number.parseInt(team1Score) >= 0 ? Number.parseInt(team1Score) : -1,
                team2_score: Number.parseInt(team2Score) >=0 ? Number.parseInt(team2Score) : -1,
                date: timestampMs
            })
          })
            .then(response => {
              if (response.ok) {
               
                return response.text();
              }
              throw new Error('Failed to edit match');
            })
           // .then(newLeague => setLeagues([...leagues, newLeague]))
            .catch(error => console.error('Error editing match:', error));
    }

    function isFinished() {
        return match.team1_score != -1 || match.team2_score != -1
    }

    return (
    <div className={styles.list_item}>
        <div className={styles.match_item_date_panel}>
            <input className={styles.date_input} type='text' value={date} onChange={onChangeDate}/>
            -
            <input className={styles.date_input} type='text' value={time} onChange={onChangeTime}/>
        </div>

        <span className={styles.team_name_left}>{match.team1.shortName}</span>
        <img className={styles.list_icon} src={`${SERVER_BASE_URL}/data/teams/150x150/${match.team1.name}.png`} />
          -
        <img className={styles.list_icon} src={`${SERVER_BASE_URL}/data/teams/150x150/${match.team2.name}.png`} />
        <span className={styles.team_name_right}>{match.team2.shortName}</span>

        { isFinished() ? <div className={styles.match_item_score_panel}>
            <input className={styles.preview_input} type='text' value={preview} onChange={onChangePreview}/>

            <button className={styles.button_primary} value={'Save'} onClick={onSavePreview}>Save</button> 
        </div>
        : 
        <div className={styles.match_item_score_panel}>
            <input className={styles.score_input} type='text' value={team1Score} onChange={onChangeTeam1Score}/>
            :
            <input className={styles.score_input} type='text' value={team2Score} onChange={onChangeTeam2Score}/>

            { !isFinished() ? <button className={styles.button_primary} value={'Save'} onClick={onSave}>Save</button> : null }
        </div> }
      </div>
    )
}