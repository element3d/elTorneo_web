import styles from '@/styles/Table.module.css';
import { useTranslation } from 'next-i18next';

function getLeagueName(league, t) {
    if (league == 1) return 'Legend'
    if (league == 2) return 'Pro'
    if (league == 3) return 'Amateur'
    if (league == 4) return 'Beginner'

    if (league == 3) return 'Telegram ' + t('league')
    return `${t('league')} ${league}`
}

export default function LeagueChip({ league, selected, isMy, onClick }) {
    const { t } = useTranslation()

    return <div onClick={onClick} className={selected ? styles.league_chip_sel : styles.league_chip}>
        <span>{getLeagueName(league, t)}</span>
        {isMy ? <span className={styles.chip_subtitle}>{t('your_league')}</span> : null}
    </div>
}