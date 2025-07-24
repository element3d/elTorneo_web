import styles from '@/styles/DesktopWeeksPanel.module.css';
import { getWeek } from './LeaguesPanel';
import { useTranslation } from 'next-i18next';

export function DesktopWeekPanel({router, league, thisWeek, weeks}) { 
    const {t} = useTranslation()

    function onWeekClick(week) {
        router.push(`?league=${league.id}&week=${week}`);
    }

    return <div className={styles.cont}>
        {weeks.map((week) => {
            return <button className={ thisWeek == week.week ? styles.item_sel : styles.item} onClick={() => {onWeekClick(week.week)}}>{ getWeek(t, week)}{week.week == league.week ? " *" : ""}</button>
        })}
    </div>
}