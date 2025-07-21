import styles from '@/styles/Lang.module.css';
import { i18n } from 'next-i18next';

export default function LangPanel({router, locale}) {
    function getLangs() {
        return {
            "en": "English",
            "es": "Español",
            "ru": "Русский",
            "fr": "Français",
            "it": "Italiano",
            "pt": "Português",
            "de": "Deutsch",
            "hr": "Hrvatski",
        }
    }

    function onSetLang(l) {
        i18n.changeLanguage(l);

        router.push('/', '/', { locale: l });
    }

    return <div className={styles.lang_panel}>
        {Object.keys(getLangs()).map((l) => {
            return <div key={l} className={styles.item} onClick={() => onSetLang(l)}>
                <span style={{
                    color: l == locale ? '#ff2882' : '#8E8E93'
                }}>{getLangs()[l]}</span>
            </div>
        })}
    </div>
}