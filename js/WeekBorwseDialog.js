import styles from '@/styles/Home.module.css';
import { useEffect, useState } from 'react';


export default function WeekBrowseDialog({league, onPick}) {
    const [weeks, setWeeks] = useState([])

    useEffect(() => {
       const ww = []
       for (let i = 1; i <= league.num_weeks; ++i) {
        ww.push(i)
       }
       setWeeks(ww)
    }, []);

    return (<div className={styles.dialog}>
        <div className={styles.dialog_panel}>
            <div className={styles.list}>
            {weeks.map((week, index) => (
            <div key={index} className={styles.dialog_list_item} onClick={() => onPick(week)}>
                Matchday {week}
            </div>
            ))}
            </div>
        </div>
    </div>)
}