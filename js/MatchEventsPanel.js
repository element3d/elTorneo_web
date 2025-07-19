import styles from '@/styles/MatchEventsPanel.module.css';
import { useTranslation } from 'next-i18next';
import { SERVER_BASE_URL } from './Config';


function Item({ event, index, isLast, score }) {
    const { t } = useTranslation()

    function getTypeString() {
        if (event.type == 'Goal' && event.detail == "Missed Penalty") return t('missed_penalty')
        if (event.type == "Goal") return `${t('goal')} (${score})`
        if (event.type == "Card") return t('card')
        if (event.type == "Var" && event.detail == "Goal Disallowed - handball") return `Var: ${t('handball')}`
        if (event.type == "subst") return event.assist
        return event.type
    }

    function getIcon() {
        if (event.type == "Goal") {
            if (event.detail == "Penalty") {
                return <div className={styles.pen_cont}>
                    <img className={styles.icon_small} src={`${SERVER_BASE_URL}/data/icons/goal.svg`} />
                    <span>PEN</span>
                </div>

            }
            if (event.detail == "Missed Penalty") {
                return <div className={styles.pen_cont}>
                    <img className={styles.icon_small} src={`${SERVER_BASE_URL}/data/icons/var.svg`} />
                    <span>PEN</span>
                </div>

            }
            else if (event.detail == "Own Goal") {
                return <div className={styles.pen_cont}>
                    <img className={styles.icon_small} src={`${SERVER_BASE_URL}/data/icons/goal.svg`} />
                    <span>OG</span>
                </div>

            }

            return <img className={styles.icon} src={`${SERVER_BASE_URL}/data/icons/goal.svg`} />
        }
        if (event.type == "Var" && (event.detail == 'Goal cancelled'
            || event.detail == 'Goal Disallowed - offside'
            || event.detail == 'Goal Disallowed - handball'))
            return <img className={styles.icon} src={`${SERVER_BASE_URL}/data/icons/var.svg`} />

        if (event.detail == "Yellow Card") return <img className={styles.icon} src={`${SERVER_BASE_URL}/data/icons/yellow_card.svg`} />
        if (event.detail == "Red Card") return <img className={styles.icon} src={`${SERVER_BASE_URL}/data/icons/red_card.svg`} />
        if (event.type == "subst") return <img className={styles.subst} src={`${SERVER_BASE_URL}/data/icons/subst.svg`} />

    }

    function renderContent() {
        return <div className={styles.team_content} style={{ alignItems: event.team == 1 ? 'flex-end' : 'flex-start' }}>
            <span className={styles.elapsed}>{event.elapsed}'{event.extra ? ' + ' + event.extra : null}</span>
            <span className={styles.player}>{event.player}</span>
            <span className={styles.type}>{getTypeString()}</span>
        </div>
    }

    return <div className={styles.item}>
        <div className={styles.team1_panel}>
            {event.team == 1 ? renderContent() : null}
        </div>
        <div className={styles.middle_panel}>
            <div className={styles.line} style={{ opacity: index == 0 ? 0 : 1 }}></div>
            <div className={styles.icon_panel}>
                {getIcon()}
            </div>
            <div className={styles.line} style={{ opacity: isLast ? 0 : 1 }}></div>
        </div>
        <div className={styles.team2_panel}>
            {event.team == 2 ? renderContent() : null}
        </div>
    </div>
}

export default function MatchEventsPanel({ events, isMobile=true }) {
    let t1Score = 0
    let t2Score = 0

    return <div className={isMobile ? '' : styles.padding_desktop}>
        {events.map((e, i) => {
            if (e.type == "Goal" && e.detail != "Missed Penalty") {
                if (e.team == 1) t1Score++;
                else t2Score++;
            }
            const score = `${t1Score}-${t2Score}`

            return <Item event={e} index={i} score={score} isLast={i == events.length - 1} />
        })}
    </div>
}