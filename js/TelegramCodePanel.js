import styles from '@/styles/Home.module.css';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next';

export default function TelegramCodePanel({hasBg, me, hasMargin = false}) {
    const { t } = useTranslation()

    function onInstall() {
        window.open('https://play.google.com/store/apps/details?id=com.eltorneo', '_blank');
    }

    return <div className={styles.install_cont} style={{backgroundColor: hasBg ? 'white' : 'transparent', marginTop: hasMargin? '20px' : '0px'}}>
        <img className={styles.gplay_icon} src={`${SERVER_BASE_URL}/data/icons/telegram.svg`} />
        <span>{t("auth_code")}</span>
        <span className={styles.code}>
            {me.tgCode}
        </span>
    </div>
}