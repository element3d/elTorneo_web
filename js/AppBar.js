import styles from '@/styles/AppBar.module.css';
import { SERVER_BASE_URL } from './Config';

export default function AppBar({title, locale, router, showLang = false}) {
     function onNavLang() {
          router.push('/lang')
     }

     function onBack() {
          router.back()
     }

    return (<div className={styles.app_bar}>
       <div className={styles.back_button} onClick={onBack}>
            <img className={styles.back_icon} src={`${SERVER_BASE_URL}/data/icons/back.svg`}/>
       </div>
       <span className={styles.title}>{title}</span>
       <button className={styles.back_button} onClick={onNavLang} disabled={!showLang} style={{opacity: showLang ? 1 : 0}}>
            {locale?.toUpperCase()}
       </button>
    </div>)
}