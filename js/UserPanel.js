import styles from '@/styles/UserPanel.module.css';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next';

export default function UserPanel({router, user, pos, isMe}) {
    const {t} = useTranslation()

    function onNavSettings() {
        router.push('/settings')
    }

    return (<div className={styles.panel}>
        <div className={styles.ava_cont}>
            { user.avatar.length ? <img className={styles.ava} src={`${SERVER_BASE_URL}/${user.avatar}`}/>
            : <img className={styles.ava_blank} src={`${SERVER_BASE_URL}/data/icons/profile_blank.svg`}/>}
        </div>
        <div className={styles.name_cont}>
            <span className={styles.name}>{user.name}</span>
            { user.position > 0 ? <span className={styles.desc}>{ user.league == 1 ? t('place_in_el_torneo') : t('place_in_league2')}:  {user.position}</span> : null }
            <span className={styles.desc}>{t('points')}:  {user.points}</span>
        </div>

        { isMe ? <div className={styles.settings} onClick={onNavSettings}>
        <img src={`${SERVER_BASE_URL}/data/icons/gear.svg`} className={styles.settings_icon} />
        <span>{'>'}</span>
        </div> : null }
    </div>)
}