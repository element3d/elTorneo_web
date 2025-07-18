import styles from '@/styles/DesktopTablePanel.module.css';
import AwardsPanel from './AwardsPanel';
import LeagueChip from './LeagueChip';
import TableItem from './TableItem';
import { useTranslation } from 'next-i18next';


export default function DesktopTablePanel({ router, league, onNavLeague1, onNavLeague2, onNavLeague3, onNavInfo, me, onNavProfile, table, page, showPrev, showNext, onNext, onPrev }) {
    const { t } = useTranslation()

    return <div className={styles.panel}>
        <AwardsPanel league={league} showLeague={true} router={router} />

        <div className={styles.leagues_cont}>
            <LeagueChip selected={league == 1} onClick={onNavLeague1} league={1} isMy={me?.league == 1} />
            <LeagueChip selected={league == 2} onClick={onNavLeague2} league={2} isMy={me?.league == 2} />
            <LeagueChip selected={league == 3} onClick={onNavLeague3} league={3} isMy={me?.league == 3} />

            <button onClick={onNavInfo} className={styles.info_button}>i</button>
        </div>

        <div className={styles.table_cont}>
            <div className={styles.table_header}>
                <span className={styles.table_number}>{'Pos'}</span>
                <span className={styles.table_player_name}>{t('player')}</span>
                <span className={styles.table_number}>{'Tp'}</span>
                <span className={styles.table_number}>{'Pts'}</span>
            </div>

            {table.map((u, i) => {
                return <TableItem key={`${u.id}_${u.name}`} isMe={me?.id == u.id} pos={(page - 1) * 20 + i + 1} player={u} onClick={() => onNavProfile(u.id)} />
            })}
        </div>

        <div className={styles.prev_next_cont}>
            {showPrev ? <span onClick={onPrev} className={`${styles.prev} ${showNext ? null : styles.text_center}`}>{'< ' + t('prev')}</span> : null}
            {showNext ? <span onClick={onNext} className={`${styles.next} ${showPrev ? null : styles.text_center}`}>{t('next') + ' >'}</span> : null}
        </div>
    </div>
}