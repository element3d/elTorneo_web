import styles from '@/styles/Table.module.css';
import { SERVER_BASE_URL } from './Config';

export default function TableItem({ isMe, pos, player, onClick }) {
    return <div className={styles.table_item} style={{ backgroundColor: `${isMe ? 'var(--panel-color)' : 'transparent'}`, color: isMe ? '#FF2882' : 'var(--title-color)' }} onClick={onClick}>
        {pos == 1 ? <img className={styles.trophy} src={`${SERVER_BASE_URL}/data/icons/trophy.svg`} /> : <span className={styles.table_number}>{pos}</span>}
        <span className={styles.table_player_name}>{player.name}</span>
        <span className={styles.table_number}>{player.totalPredictions}</span>
        <span className={styles.table_number}>{player.predictions}</span>
    </div>
}