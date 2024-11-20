import styles from '@/styles/Home.module.css';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next'

const NUM_NEXT_WEEKS = 3

function LeagueChip({ onClick, league, selected }) {

    function getIcon() {
        if (selected) return`${SERVER_BASE_URL}/data/leagues/${league.name}_white.png`

        return `${SERVER_BASE_URL}/data/leagues/${league.name}_colored.png`
    }

    return (<div onClick={() => onClick(league)} className={ selected ? styles.league_chip_sel : styles.league_chip}>
        <img className={styles.chip_icon} src={getIcon()}/>
    </div>)
}

function WeekChip({ ref, onClick, selected, week }) {
    const { t  } = useTranslation()

    return (<div ref={ref} onClick={() => {onClick(week)}} className={ selected ? styles.week_chip_sel : styles.week_chip}>
        {t('matchday')} {week.week}
    </div>)
}

export default function LeaguesPanel({ router, weeks, week, leagues, league }) {
    const weeksScrollRef = useRef(null);
    const itemWidth = 100; // Width of each week item
    const itemMargin = 10; // Margin-right of each week item

    useEffect(() => {
        const selectedWeekIndex = weeks.findIndex((w) => w.week === week);
        if (selectedWeekIndex !== -1 && weeksScrollRef.current) {
            const container = weeksScrollRef.current;
            const containerWidth = container.offsetWidth;
            const itemTotalWidth = itemWidth + itemMargin;

            // Calculate the scroll position to center the selected item
            const scrollPosition =
                selectedWeekIndex * itemTotalWidth - containerWidth / 2 + itemWidth / 2;

            // Ensure the scroll position is within valid bounds
            const maxScrollLeft = container.scrollWidth - containerWidth;
            const validScrollPosition = Math.max(0, Math.min(scrollPosition, maxScrollLeft));

            container.scrollTo({
                left: validScrollPosition,
                behavior: 'smooth',
            });
        }
    }, [week, weeks]);

    function onLeagueClick(league) {
        router.push(`?league=${league.id}`);
    }

    function onWeekClick(week) {
        router.push(`?league=${league.id}&week=${week}`);
    }

    return (
        <div className={styles.leagues_panel}>
            <div className={styles.leagues_scroll}>
                {leagues.map((l) => (
                    <LeagueChip key={l.name} onClick={onLeagueClick} selected={league.id === l.id} league={l} />
                ))}
            </div>

            <div className={styles.weeks_scroll} ref={weeksScrollRef} style={{ overflowX: 'auto' }}>
                {weeks.map((w, index) => (
                    <WeekChip
                        key={`${league.name}_${w.week}`}
                        week={w}
                        selected={week === w.week}
                        onClick={() => onWeekClick(w.week)}
                        style={{ width: `${itemWidth}px`, marginRight: `${itemMargin}px` }}
                    />
                ))}
            </div>
        </div>
    );
}