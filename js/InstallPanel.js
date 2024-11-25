import styles from '@/styles/Home.module.css';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next';

export default function InstallPanel({hasBg, hasMargin = false}) {
    const { t } = useTranslation()

    function onInstall() {
        window.open('https://play.google.com/store/apps/details?id=com.eltorneo', '_blank');
    }

    return <div className={styles.install_cont} style={{backgroundColor: hasBg ? 'white' : 'transparent', marginTop: hasMargin? '20px' : '0px'}}>
        <img className={styles.gplay_icon} src={`${SERVER_BASE_URL}/data/icons/google-play.svg`} />
        <span>{t('available_google_play')}</span>
        <button className={styles.install_button} onClick={onInstall}>
            {t('install_now')}
        </button>
    </div>
}