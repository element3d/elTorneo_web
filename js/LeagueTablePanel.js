import styles from '@/styles/LeagueTablePanel.module.css';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next';

export default function LeagueTablePanel({ router, table, league, miniLeague, group, isMobile }) {
    const {t} = useTranslation()
    let currentGroup = 0
    let currentPos = 1

    function getGroupName(lindex, index) {
        let word = ''
        if (lindex == 0) word = "A"
        if (lindex == 1) word = "B"
        if (lindex == 2) word = "C"
        if (lindex == 3) word = "D"

        return `${word}${index + 1}`
    }

    function getMiniLeagues() {
        const numLeagues = league.num_leagues;
        const leagues = [];
        const startCharCode = 'A'.charCodeAt(0); // Get the char code for 'A'

        for (let i = 0; i < numLeagues; i++) {
            leagues.push({ index: i, name: String.fromCharCode(startCharCode + i) }); // Convert to letter
        }

        return leagues;
    }

    function onMiniLeagueClick(i) {
        router.push(`?league=${league.id}&mini=${i}`)
    }

    return (<div className={ isMobile ? styles.cont : styles.cont_desktop}>

        { league.num_leagues > 1 ? <div className={styles.mini_cont}>
            {
                getMiniLeagues().map((league, i) => {
                    return <div key={`league${league.name}`} onClick={ () => onMiniLeagueClick(i)} className={ miniLeague == i ? styles.mini_item_sel : styles.mini_item} >
                        {t('league')} {league.name}
                    </div>
                })
            }
        </div> : null }
        <div className={ isMobile ? styles.padding : styles.padding_desktop}>
            <div className={styles.team_header}>
                <span className={styles.pos}>Pos</span>
                <div className={styles.name_header}>
                    <span>{t('team')}</span>
                </div>
                <span className={styles.points}>Mp</span>
                <span className={styles.points}>Gd</span>
                <span className={styles.points}>Pts</span>
            </div>

            {table.map((team, i) => {
                if (group != undefined && group != team.group_index) return

                let renderGroupName = false

                if (league == 7 || league.id == 7) {
                    if (league.num_leagues > 1 && group === team.group_index && currentPos == 1) {
                        currentGroup = team.group_index
                        renderGroupName = true
                        // currentPos = 1
                    } else if (league.num_leagues > 1 && (i == 0 || team.group_index != currentGroup)) {
                        currentGroup = team.group_index
                        renderGroupName = true
                        currentPos = 1
                    } else if (league.num_leagues == undefined && group === team.group_index && currentPos == 1) {
                        currentGroup = team.group_index
                        renderGroupName = true
                        currentPos = 1
                    }
                }

                return <div key={`${team.team.name}`}>
                    {renderGroupName ? <div className={styles.group}>Group {getGroupName(team.league_index, team.group_index)}</div> : null}
                    <div className={styles.team_row}>
                        <span className={styles.pos}>{currentPos++}</span>
                        <div className={styles.name_row}>
                            <img className={styles.team_icon} src={`${SERVER_BASE_URL}/data/teams/150x150/${team.team.name}.png`} />
                            <span>{team.team.short_name}</span>
                        </div>
                        <span className={styles.points}>{team.matches_played}</span>
                        <span className={styles.points}>{team.goal_difference}</span>
                        <span className={styles.points}>{team.points}</span>
                    </div>
                </div>
            })}
        </div>
    </div>)
}