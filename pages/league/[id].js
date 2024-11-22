import styles from '@/styles/Home.module.css';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import Chip from '@/js/Chip';
import TeamBrowseButton from '@/js/TeamBrowseButton';
import TeamBrowseDialog from '@/js/TeamBrowseDialog';
import { SERVER_BASE_URL } from '@/js/Config';
import { MatchItem } from '@/js/MatchItem';
import WeekBrowseDialog from '@/js/WeekBorwseDialog';

const inter = Inter({ subsets: ['latin'] });

const ETAB_TEAMS = 0
const ETAB_MATCHES = 1

export async function getServerSideProps(context) {
    const { params } = context;
    const { id } = params;
    const { req } = context;
    const { locale } = context;
  
    const requestOptions = {
        method: 'GET',
    };

    const data = await fetch(`${SERVER_BASE_URL}/api/v1/league?id=${id}`, requestOptions)
    .then(response => {
        if (response.status !== 200) {
            
            return;
        }

        return response.json();
    })

    return {
        props: {
            league: data
        },
    };
}

export default function League({league}) {
    const [name, setName] = useState('');
    const [teams, setTeams] = useState([])
    const [tab, setTab] = useState(ETAB_MATCHES)
    const [team1, setTeam1] = useState(null)
    const [team2, setTeam2] = useState(null)
    const [showTeam1Dialog, setShowTeam1Dialog] = useState(false)
    const [showTeam2Dialog, setShowTeam2Dialog] = useState(false)
    const [date, setDate] = useState(null)
    const [time, setTime] = useState(null)
    const [week, setWeek] = useState(league.week)
    const [matches, setMatches] = useState([])
    const [showWeekDialog, setShowWeekDialog] = useState(false)
    const [selectedWeek, setSelectedWeek] = useState(1)

    useEffect(() => {
        // fetch(`${SERVER_BASE_URL}/api/v1/teams?league_id=${league.id}`, {
        //   method: 'GET',
        //   // headers: { 'Content-Type': 'application/json' },
        // })
        //   .then(response => response.json())
        //   .then(data => {
        //     console.log(data)
        //     setTeams(data)
        //   })
        //   .catch(error => console.error('Error fetching leagues:', error));
        getMatches()
    }, []);

    useEffect(()=>{
      getMatches()
    }, [week])

    function getMatches() {
      const url = `${SERVER_BASE_URL}/api/v1/matches?league_id=${league.id}&week=${week}&season=2024/25`
      fetch(url, {
        method: 'GET',
        // headers: { 'Content-Type': 'application/json' },
      })
        .then(response => response.json())
        .then(data => setMatches(data))
        .catch(error => console.error('Error fetching leagues:', error));
    }

    function onNameChange(e) {
        setName(e.target.value);
    }

    function onWeekChange(e) {
        setWeek(e.target.value);
    }

    function onDateChange(e) {
      setDate(e.target.value);
    }
    
    function onTimeChange(e) {
        setTime(e.target.value);
    }

    function onAddTeam() {
        if (!name.length) return;

        fetch(`${SERVER_BASE_URL}/api/v1/teams`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name, leagueId: league.id })
        })
          .then(response => {
            if (response.ok) {
              setName('');
              return response.json();
            }
            throw new Error('Failed to add team');
          })
          .then(newLeague => setLeagues([...leagues, newLeague]))
          .catch(error => console.error('Error adding team:', error));
    }

    function onAddMatch() {
      if (!team1 || !team2 || !week || !date || !time) return;

      const datetime = combineDateTimeToEpoch(date, time)
      return

      fetch(`${SERVER_BASE_URL}/api/v1/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          league: league.id, 
          week: Number.parseInt(week),
          team1: team1.id,
          team2: team2.id,
          date: datetime 
        })
      })
        .then(response => {
          if (response.ok) {
            setTeam1(null);
            setTeam2(null)
            setWeek(0)
            setDate(null)
            setTime(0)
            return response.json();
          }
          throw new Error('Failed to add team');
        })
        .then(newLeague => {})
        .catch(error => console.error('Error adding match:', error));
    }

    function combineDateTimeToEpoch(dateStr, timeStr) {
      // Split the date string by "/"
      let parts = dateStr.split('/');
  
      // Reorder the date parts to fit the MM/dd/yy format (or MM/dd/yyyy)
      let newDateStr = `${parts[1]}/${parts[0]}/${parts[2]}`;
  
      // Combine the date and time into a single string
      let dateTimeStr = `${newDateStr} ${timeStr}`;
  
      // Create a new Date object
      let date = new Date(dateTimeStr);
  
      // Convert the Date object to Unix timestamp in milliseconds
      return date.getTime();
  }
  
  
    function renderMatches() {
      // console.log(matches)
      return (<div>
         {/* <div className={styles.row}>
              <TeamBrowseButton title={"Team 1"} team={team1} onClick={()=>{setShowTeam1Dialog(true)}}/>
              <TeamBrowseButton title={"Team 2"} team={team2} onClick={()=>{setShowTeam2Dialog(true)}}/>
              <input className={styles.input} type="text" value={week} onChange={onWeekChange}></input>
              <input className={styles.input} type="text" value={date} onChange={onDateChange}></input>
              <input className={styles.input} type="text" value={time} onChange={onTimeChange}></input>

              <button className={styles.button} onClick={onAddMatch}>Add Match</button>
        </div> */}
        <div className={styles.row}>

        </div>
        <div className={styles.list}>
          {matches.map((match, index) => (
            <MatchItem key={`match_${match.id}`} match={match} team1={match.team1} team2={match.team2}/>
          // <div key={index} className={styles.list_item} >
          //   <span className={styles.team_name_left}>{match.team1.name}</span>
          //   <img className={styles.list_icon} src={`${SERVER_BASE_URL}/data/teams/150x150/${match.team1.name}.png`} />
          //     -
          //   <img className={styles.list_icon} src={`${SERVER_BASE_URL}/data/teams/150x150/${match.team2.name}.png`} />
          //   <span className={styles.team_name_right}>{match.team2.name}</span>
          // </div>
          ))}
        </div>
      </div>
      )
    }

    function renderTeams() {
      return (<div>
        <div className={styles.row}>
              <input className={styles.input} type="text" value={name} onChange={onNameChange}></input>
              <button className={styles.button} onClick={onAddTeam}>Add Team</button>
        </div>
        <div className={styles.list}>
          {teams.map((league, index) => (
          <div key={index} className={styles.list_item} onClick={() => onNavLeague(league.id)}>
            <img className={styles.list_icon} src={`${SERVER_BASE_URL}/data/teams/150x150/${league.name}.png`} />
              {league.name}
          </div>
          ))}
        </div>
      </div>)
    }

    function onTeam1Pick(team) {
      setTeam1(team)
      setShowTeam1Dialog(false)
    }

    function onTeam2Pick(team) {
      setTeam2(team)
      setShowTeam2Dialog(false)
    }

    function onPickWeek(w) {
      setWeek(w)
      setShowWeekDialog(false)
    }

    function onMakeCurrentWeek() {
      fetch(`${SERVER_BASE_URL}/api/v1/league/week?league_id=${league.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week: week })
      })
        .then(response => {
          
        })
        // .then(newLeague => {})
        .catch(error => console.error('Error adding team:', error));
 
    }


    return (
        <>
        <Head>
          <title>Create Next App</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={`${styles.main} ${inter.className}`}>
          <div>
            <div className={styles.league_title}>
              <img className={styles.league_logo} src={`${SERVER_BASE_URL}/data/leagues/${league.name}.png`}/>
              <div>
                <h2>{league.name}</h2>
                <h4>{'2024/25'}</h4>
              </div>
            </div>
            <div className={styles.week_row}>
              <button className={styles.week_button} onClick={()=>{setShowWeekDialog(true)}}>{`Week ${week}`}</button>
              <button className={styles.week_button} onClick={()=>{onMakeCurrentWeek()}}>{`Make current`}</button>

            </div>
            {/* <div className={styles.row_centered}>
              <Chip title={"Teams"} selected={tab == ETAB_TEAMS} onClick={()=>{setTab(ETAB_TEAMS)}}/>
              <Chip title={"Matches"} selected={tab == ETAB_MATCHES} onClick={()=>{setTab(ETAB_MATCHES); getMatches()}}/>

            </div> */}
          
            { tab == ETAB_TEAMS ? renderTeams() : renderMatches()}
          </div>
          {showTeam1Dialog ? <TeamBrowseDialog league={league} onPick={onTeam1Pick}/> : null }
          {showTeam2Dialog ? <TeamBrowseDialog league={league} onPick={onTeam2Pick}/> : null }
          {showWeekDialog  ? <WeekBrowseDialog league={league} onPick={onPickWeek}/> : null }
        </main>
      </>
    )
}