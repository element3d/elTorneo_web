import styles from '@/styles/Calendar.module.css';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

export default function Calendar({router, date}) {
  const {t} = useTranslation()
    const [dates, setDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(date);

    useEffect(() => {
        const today = moment();
        const daysArray = [];
        for (let i = -3; i <= 3; i++) {
          daysArray.push(today.clone().add(i, 'days').format('YYYY-MM-DD'));
        }
        setDates(daysArray);
        // setDate(today.format('YYYY-MM-DD'))
        // setSelectedDate(today.format('YYYY-MM-DD')); // Initialize today as selected
      }, []);
      
      useEffect(() => {
        setSelectedDate(date)
      }, [router])

    function onSelect(date) {
      setSelectedDate(date)
      router.push(`/calendar?date=${new Date(date).getTime()}`)
    }

    return (<div className={styles.calendar_cont}>
       {dates.map((date) => {
        return <div key={date} className={ date == selectedDate ? styles.calendar_item_sel : styles.calendar_item} onClick={() => {onSelect(date)}}>
            <span className={ date == selectedDate ? styles.calendar_item_day_sel : styles.calendar_item_day}>{t(moment(date).format('ddd').toLowerCase())}</span>
            <span className={  styles.calendar_item_date} style={{color: date == selectedDate ? 'white' : ''}}>{moment(date).format('DD')}</span>
        </div>
       })}  
    </div>)
}