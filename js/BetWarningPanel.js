import styles from '@/styles/LinkAccountPanel.module.css';
import { useTranslation } from 'next-i18next';

export default function BetWarningPanel() {
    const {t} = useTranslation()

    return <div className={styles.panel_bet}>
        <span className={styles.title}>{t('attention')}</span>
        <span>{t('bet_msg')}</span>
    </div>
}