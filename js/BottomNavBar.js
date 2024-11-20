import styles from '@/styles/BottomNavBar.module.css';
import { SERVER_BASE_URL } from './Config';
import Cookies from 'js-cookie';

export const EPAGE_HOME = 1
export const EPAGE_CAL = 2
export const EPAGE_TAB = 3
export const EPAGE_PROF = 4
export const EPAGE_LIVE = 5

function NavBarButton({onClick, icon}) {
    return (<div onClick={onClick} className={styles.button}>
        <img  className={styles.icon} src={`${SERVER_BASE_URL}/data/icons/${icon}.svg`}/>
    </div>)
}

export default function BottomNavBar({router, page}) {
    function onNavHome() {
        router.push('/')
    }
    
    function onNavCalendar() {
        router.push('/calendar')
    }

    function onNavTable() {
        router.push('/table')
    }

    function onNavLive() {
        router.push('/live')
    }

    function onNavLogin() {
        const token = Cookies.get('token')
        if (!token)
            router.push('/login')
        else 
            router.push('/profile')
    }

    return (<div className={styles.panel}>
       <NavBarButton onClick={onNavHome} icon={page == EPAGE_HOME ? 'home_black' : 'home'}/>
       <div></div>
       <NavBarButton onClick={onNavCalendar} icon={page == EPAGE_CAL ? 'cal_active' : 'cal'}/>
       <div className={styles.live} onClick={onNavLive}>
            <span className={styles.live_text}>LIVE</span>
            <span className={styles.time}>12:30</span>
       </div>
       <NavBarButton onClick={onNavTable} icon={page == EPAGE_TAB ? 'stats_active' : 'stats'}/>
       <div></div>
       <NavBarButton onClick={onNavLogin} icon={page == EPAGE_PROF ? 'profile_active' : 'profile'}/>

    </div>)
}