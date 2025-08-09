import styles from '@/styles/UserPanel.module.css';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next';
import LinkAccountPanel from './LinkAccountPanel';

export default function UserPanel({ router, user, pos, isMe, isMobile = true }) {
    const { t } = useTranslation()

    function onNavSettings() {
        router.push('/settings')
    }

    function onNavCompleteAccount() {
        router.push('/complete_account')
    }

    return (<div className={isMobile ? styles.cont_mobile : styles.cont}>
        <div className={isMobile ? styles.panel : styles.panel_desktop}>
            <div className={styles.ava_cont}>
                {user.avatar.length ? <img className={styles.ava} src={`${SERVER_BASE_URL}/${user.avatar}`} />
                    : <img className={styles.ava_blank} src={`${SERVER_BASE_URL}/data/icons/profile_blank.svg`} />}
            </div>
            <div className={styles.name_cont}>
                <span className={styles.name}>{user.name}</span>
                {user.position > 0 ? <span className={styles.desc}>{user.league == 1 ? t('place_in_el_torneo') : t('place_in_league2')}:  {user.position}</span> : null}
                <span className={styles.desc}>{t('points')}:  {user.points}</span>
                <div className={styles.balance_cont}>
                    <span className={styles.desc}>{t('balance')}:  </span>
                    <span className={user.balance >= 0 ? styles.balance_green : styles.balance_red}>{user.balance.toFixed(2)}$</span>
                </div>
            </div>

            {isMe ? <div className={styles.settings} onClick={onNavSettings}>
                <img src={`${SERVER_BASE_URL}/data/icons/gear.svg`} className={styles.settings_icon} />
                <span>{'>'}</span>
            </div> : null}

        </div>
        {isMe && user.isGuest ? <LinkAccountPanel onCompleteAccount={onNavCompleteAccount} /> : null}

    </div>)
}