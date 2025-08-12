import styles from '@/styles/BottomNavBar.module.css';
import { SERVER_BASE_URL } from './Config';
import Cookies from 'js-cookie';
import moment from 'moment';
import { useEffect, useState } from 'react';

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

export default function BottomNavBar({router, me, isIOS, isAndroid, page}) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
          setCurrentTime(new Date()); // Update the state with the new time
        }, 10000); // Set the interval to update every minute (60000 milliseconds)
    
        return () => clearInterval(timer); // Clean up the interval on component unmount
      }, []);

    function onNavHome() {
        router.push('/')
    }
    
    function onNavCalendar() {
        router.push('/calendar')
    }

    function onNavTable() {
        if (me) {
            return router.push(`/table?league=${me.league}`)    
        }
        router.push(`/table`)
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

    const renderTime = () => {
        // Format the time as a string, e.g., HH:mm
        return moment(currentTime).format('HH:mm')
      };

      function getIconColor() {
        return '_white';
      }

    return (<div className={styles.panel}>
       <NavBarButton onClick={onNavHome} icon={page == EPAGE_HOME ? `home${getIconColor()}` : 'home'}/>
       <div></div>
       <NavBarButton onClick={onNavCalendar} icon={page == EPAGE_CAL ? `cal${getIconColor()}` : 'cal'}/>
       { isIOS ? <div className={styles.live} onClick={onNavLive}>
            <div className={styles.live_text}>LIVE</div>
            <div className={styles.time}>{renderTime()}</div>
       </div> : null }
       { isAndroid ? <div className={styles.live_and} onClick={onNavLive}>
            <div className={styles.live_text_and}>LIVE</div>
            <div className={styles.time_and}>{renderTime()}</div>
       </div> : null }

       {!isIOS && !isAndroid ? <div className={styles.live_and} onClick={onNavLive}>
            <div className={styles.live_text_and}>LIVE</div>
            <div className={styles.time_and}>{renderTime()}</div>
       </div> : null }
       <NavBarButton onClick={onNavTable} icon={page == EPAGE_TAB ? `stats${getIconColor()}` : 'stats'}/>
       <div></div>
       <NavBarButton onClick={onNavLogin} icon={page == EPAGE_PROF ? `profile${getIconColor()}` : 'profile'}/>

    </div>)
}