import styles from '@/styles/UserPanel.module.css';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next';

export default function UserPanel({user, pos, isMe}) {
    const {t} = useTranslation()

    return (<div className={styles.panel}>
        <div className={styles.ava_cont}>
            { user.avatar.length ? <img className={styles.ava} src={`${SERVER_BASE_URL}/${user.avatar}`}/>
            : <img className={styles.ava_blank} src={`${SERVER_BASE_URL}/data/icons/profile_blank.svg`}/>}
        </div>
        <div className={styles.name_cont}>
            <span className={styles.name}>{user.name}</span>
            <span className={styles.desc}>{t('place_in_el_torneo')}:  {user.position}</span>
            <span className={styles.desc}>{t('points')}:  {user.points}</span>
        </div>

        { isMe ? <div>

        </div> : null }
    </div>)
}