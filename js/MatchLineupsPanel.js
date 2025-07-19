import styles from '@/styles/MatchLineupsPanel.module.css';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next';


export default function MatchLineupsPanel({ match, lineups, isMobile=true }) {
    const { t } = useTranslation()

    function getKitImage(name) {
        if (match.league != 7) {
            return `${SERVER_BASE_URL}/data/teams/150x150/${name}_kit.png`
        }
        return `${SERVER_BASE_URL}/data/teams/150x150/${name}.png`
    }

    function LineupsHeader() {
        return <div className={styles.header}>
            <div className={styles.team_cont}>
                <img src={getKitImage(match.team1.name)} style={{
                    width: match.league != 7 ? 40 : 40,
                    height: match.league != 7 ? 50 : 40,
                    objectFit: match.league != 7 ? 'cover' : 'contain'
                }} />
                <div className={styles.team_name_cont}>
                    <span>{match.team1.shortName}</span>
                    <span className={styles.formation}>{lineups.team1.formation}</span>
                </div>
            </div>

            <div className={styles.team_cont}>
                <div className={styles.team2_name_cont}>
                    <span>{match.team2.shortName}</span>
                    <span className={styles.formation}>{lineups.team2.formation}</span>
                </div>
                <img src={getKitImage(match.team2.name)} style={{
                    width: match.league != 7 ? 40 : 40,
                    height: match.league != 7 ? 50 : 40,
                    objectFit: match.league != 7 ? 'cover' : 'contain'
                }} />
            </div>
        </div>
    }

    function getKgNumber(team) {

        let players = team == 1 ? lineups.team1.players : lineups.team2.players;

        for (let p of players) {
            const grid = p.grid.split(":");
            const r = Number.parseInt(grid[0]);
            const c = Number.parseInt(grid[1]);

            if (r === 1 && c === 1) {
                return p.number;
            }
        }
    }

    function renderLeftTeam(formation, playerColor, playerNColor) {
        const arr = formation.split('-'); // Split formation into rows

        function getPlayerNumber(row, col) {
            let players = lineups.team1.players;

            for (let p of players) {
                const grid = p.grid.split(":");
                const r = Number.parseInt(grid[0]);
                const c = Number.parseInt(grid[1]);

                if (r === row && c === col) {
                    return p.number;
                }
            }
        }

        return <div className={styles.left_team_cont}>
            {arr.map((item, rowIndex) => {
                return <div key={rowIndex} className={styles.left_team_item}>
                    <div className={styles.left_team_col}>
                        {Array.from({ length: parseInt(item) }).map((_, playerIndex) => {
                            return <div className={styles.player} style={{ border: `2px solid #${playerColor}` }}>
                                <span className={styles.player_num}>{getPlayerNumber(rowIndex + 2, playerIndex + 1)}</span>
                            </div>
                        })}
                    </div>
                </div>
            })}
        </div>
    }

    function renderRightTeam(formation, playerColor, playerNColor) {
        const arr = formation.split('-').reverse(); // Split formation into rows

        function getPlayerNumber(row, col) {
            let players = lineups.team2.players;

            for (let p of players) {
                const grid = p.grid.split(":");
                const r = Number.parseInt(grid[0]);
                const c = Number.parseInt(grid[1]);

                if (r === row && c === col) {
                    return p.number;
                }
            }
        }

        return <div className={styles.left_team_cont}>
            {arr.map((item, rowIndex) => {
                return <div key={rowIndex} className={styles.left_team_item}>
                    <div className={styles.left_team_col}>
                        {Array.from({ length: parseInt(item) }).map((_, playerIndex) => {
                            return <div className={styles.player} style={{ border: `2px solid #${playerColor}` }}>
                                <span className={styles.player_num}>
                                    {getPlayerNumber(arr.length - rowIndex + 1, item - playerIndex)}
                                </span>
                            </div>
                        })}
                    </div>
                </div>
            })}
        </div>
    }

    function getPlayerPos(pos) {
        if (pos == "G") return t('goalkeeper')
        if (pos == "D") return t('defender')
        if (pos == "M") return t('midfielder')
        if (pos == "F") return t('forward')

        return ""
    }

    return <div className={ isMobile ? styles.padding : styles.padding_desktop}>
        <div className={styles.panel}>
            <LineupsHeader></LineupsHeader>

            <div className={styles.pitch}>
                {/* team1 */}
                <div className={styles.team1_panel}>
                    <div className={styles.player_col}>
                        <div className={styles.player} style={{ borderColor: `#${lineups.team1.gk_color}` }}>
                            <span className={styles.player_num}>{getKgNumber(1)}</span>
                        </div>
                    </div>
                    {renderLeftTeam(lineups.team1.formation, lineups.team1.player_color, lineups.team1.player_ncolor)}
                </div>

                {/* team2 */}
                <div className={styles.team1_panel}>
                    {renderRightTeam(lineups.team2.formation, lineups.team2.player_color, lineups.team2.player_ncolor)}
                    <div className={styles.player_col}>
                        <div className={styles.player} style={{ borderColor: `#${lineups.team2.gk_color}` }}>
                            <span className={styles.player_num}>{getKgNumber(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coaches */}
            <div className={styles.title}>
                <span>{t('managers')}</span>
            </div>
            <div className={styles.coaches_cont}>
                <span>{lineups.team1.coach}</span>
                <span>{lineups.team2.coach}</span>
            </div>

            <div className={styles.title}>
                <span>{t('lineups')}</span>
            </div>
            <div className={styles.lineups_cont}>
                <div className={styles.lineups_left}>
                    {lineups.team1.players.map((p) => {
                        if (!p.start11) return

                        return <div key={p.name} className={styles.player_row}>
                            <span>{p.number}. {p.name}</span> 
                            <span className={styles.player_pos}>{getPlayerPos(p.pos)}</span>
                        </div>
                    })}
                </div>

                <div className={styles.lineups_right}>
                    {lineups.team2.players.map((p) => {
                        if (!p.start11) return

                        return <div key={p.name} className={styles.player_row} style={{alignItems: 'flex-end', textAlign: 'end'}}>
                            <span>{p.number}. {p.name}</span> 
                            <span className={styles.player_pos}>{getPlayerPos(p.pos)}</span>
                        </div>
                    })}
                </div>
            </div>

            <div className={styles.title}>
                <span>{t('substitutes')}</span>
            </div>
            <div className={styles.lineups_cont}>
            <div className={styles.lineups_left}>
                    {lineups.team1.players.map((p) => {
                        if (p.start11) return

                        return <div key={p.name} className={styles.player_row}>
                            <span>{p.number}. {p.name}</span> 
                            <span className={styles.player_pos}>{getPlayerPos(p.pos)}</span>
                        </div>
                    })}
                </div>

                <div className={styles.lineups_right}>
                    {lineups.team2.players.map((p) => {
                        if (p.start11) return

                        return <div key={p.name} className={styles.player_row} style={{alignItems: 'flex-end', textAlign: 'end'}}>
                            <span>{p.number}. {p.name}</span> 
                            <span className={styles.player_pos}>{getPlayerPos(p.pos)}</span>
                        </div>
                    })}
                </div>
            </div>

        </div>
    </div>
}