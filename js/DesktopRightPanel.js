import styles from '@/styles/DesktopRightPanel.module.css';
import LeagueTablePanel from './LeagueTablePanel';


export default function DesktopRightPanel({table, league, miniLeague, router}) {
    return <div className={styles.panel}>
        { league ? <LeagueTablePanel table={table} league={league} miniLeague={miniLeague} router={router} /> : null }
    </div>
}