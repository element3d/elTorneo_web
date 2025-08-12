import styles from '@/styles/LinkAccountPanel.module.css';
import { useTranslation } from 'next-i18next';

export default function LinkAccountPanel({onCompleteAccount}) {
    const {t} = useTranslation()

    function onCompleteAccountInternal() {
        window.gtag('event', 'button_click', {
            event_category: 'Button click',
            event_label: "CompleteAccount",
        });
        onCompleteAccount()
    }

    return <div className={styles.panel}>
        <span className={styles.title}>{t('attention')}</span>
        <span>{t('link_account_message')}</span>

        <button onClick={onCompleteAccountInternal} className={styles.button}>{t('complete_account')}</button>
    </div>
}