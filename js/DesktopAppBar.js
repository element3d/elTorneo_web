import styles from '@/styles/DesktopAppBar.module.css';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next';

export const EPAGE_HOME = 1
export const EPAGE_CALENDAR = 2
export const EPAGE_ELTORNEO = 3

export default function DesktopAppBar({ locale, router, me, onSignIn, isMe, onShowLang, pageEnum }) {
    const { t } = useTranslation()

    function onNavHome() {
        router.push('/')
    }

    function onNavCal() {
        router.push('/calendar')
    }

    function onNavTable() {
        router.push('/table')
    }

    function onNavProfile() {
        router.push('/profile')
    }

    function renderProfileItem() {
        if (isMe) return <div className={styles.signin_button} onClick={onSignIn}>
            <h4>{t('signout')}</h4>
        </div>

        if (me) return <div className={styles.ava_cont} onClick={onNavProfile}>
            {me.avatar.length ? <img className={styles.ava} src={`${SERVER_BASE_URL}/${me.avatar}`} />
                : <img className={styles.ava_blank} src={`${SERVER_BASE_URL}/data/icons/profile_blank.svg`} />}
        </div>

        return <div className={styles.signin_button} onClick={onSignIn}>
            {/* <img className={styles.icon} src={`${SERVER_BASE_URL}/data/icons/playstore.png`} /> */}
            <h4>{t('signin')}</h4>
        </div>
    }

    return <div className={styles.desktop_appbar_cont}>
        <div className={styles.desktop_appbar}>
            <div className={styles.home_button1}>
                <img className={styles.icon} src={`${SERVER_BASE_URL}/data/icons/playstore.png`} />
                {/* <h4>el Torneo</h4> */}
            </div>
            <div className={styles.middle}>
                <div className={styles.home_button} onClick={onNavHome}>
                    {/* <img className={styles.icon} src={`${SERVER_BASE_URL}/data/icons/cal.svg`} /> */}
                    <h4>Home</h4>
                    {pageEnum == EPAGE_HOME ? <div className={styles.underline}></div> : null}
                </div>
                <div className={styles.home_button} onClick={onNavCal}>
                    {/* <img className={styles.icon} src={`${SERVER_BASE_URL}/data/icons/cal.svg`} /> */}
                    <h4>Calendar</h4>
                    {pageEnum == EPAGE_CALENDAR ? <div className={styles.underline}></div> : null}
                </div>

                <div className={styles.home_button} onClick={onNavTable}>
                    {/* <img className={styles.tournament_icon} src={`${SERVER_BASE_URL}/data/icons/stats.svg`} /> */}
                    <h4>el Torneo</h4>
                    {pageEnum == EPAGE_ELTORNEO ? <div className={styles.underline}></div> : null}
                </div>
            </div>
            <div className={styles.right_item}>
                <div className={styles.lang_button} onClick={onShowLang}>
                    <span>{locale?.toUpperCase()}</span>
                </div>
                {renderProfileItem()}
            </div>
        </div>
    </div>
}