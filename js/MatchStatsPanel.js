import styles from '@/styles/MatchStatsPanel.module.css';
import { useTranslation } from 'next-i18next';


function Item({ title, stat, percent = false }) {
    const values = stat ? stat.split('-') : ['0', '0']
    const intValues = [Number.parseInt(values[0]), Number.parseInt(values[1])]
    const val1 = intValues[0]
    const val2 = intValues[1]
    const total = val1 + val2

    return <div className={styles.item}>
        <div className={styles.uprow}>
            <span className={styles.value} style={{ color: val1 > val2 ? '#FF2882' : 'black' }}>{intValues[0]}{percent ? '%' : ''}</span>
            <span className={styles.title}>{title}</span>
            <span className={styles.value} style={{ color: val2 > val1 ? '#FF2882' : 'black' }}>{intValues[1]}{percent ? '%' : ''}</span>
        </div>
        <div className={styles.middle_row}>
            <div className={styles.line_bg}>
                <div className={styles.line} style={{
                    backgroundColor: val1 > val2 ? '#FF2882' : 'black',
                    width: `${val1 / total * 100}%`
                }}></div>
            </div>

            <div className={styles.line_bg_right}>
                <div className={styles.line} style={{
                    backgroundColor: val2 > val1 ? '#FF2882' : 'black',
                    width: `${val2 / total * 100}%`
                }}></div>
            </div>
        </div>
    </div>
}

export default function MatchStatsPanel({ stats, isMobile=true }) {
    const { t } = useTranslation()

    return <div className={ isMobile ? styles.padding : styles.padding_desktop}>
        <div className={styles.panel}>
            <Item title={t('shots_on_target')} stat={stats.shotsOnTarget} ></Item>
            <Item title={t('shots_off_target')} stat={stats.shotsOffTarget}></Item>
            {/* <Item title={'Blocked shots'} stat={statistics.blockedShots}></Item> */}
            <Item title={t('ball_possession')} stat={stats.possession} percent={true}></Item>
            <Item title={t('fouls')} stat={stats.fouls}></Item>
            <Item title={t('corners')} stat={stats.corners}></Item>
            <Item title={t('offsides')} stat={stats.offsides}></Item>
            <Item title={t('saves')} stat={stats.saves}></Item>
        </div>
    </div>
}