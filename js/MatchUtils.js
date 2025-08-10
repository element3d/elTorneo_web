import styles from '@/styles/MatchItem.module.css';


export default class MatchUtils {
    static isFinished(match) {
        if (match.status == 'FT' || (match.team1_score >= 0 && match.team2_score >= 0)) return true

        return false
    }

    static isNotStarted(match) {
        const d = Date.now()
        if (match.date > d) {
            return true
        }
        return false
    }

    static isPstOrInt(match) {
        if (match.status == "PST" || match.status == "INT") return true
        return false
    }

    static isLive(match) {
        if (isPstOrInt(match)) return false
        if (isNotStarted(match) || isFinished(match)) return false
        return true
    }

    static getBetText(bet) {
        if (bet == 'w1') return "W1"
        if (bet == 'x') return "X"
        if (bet == 'w2') return "W2"
        if (bet == 'x1') return "1X"
        if (bet == 'x12') return "12"
        if (bet == 'x2') return "2X"

        return ''
    }

    static getPredictTitle(p, t) {
        if (p.status == 4) return t("missing_prediction")
        if (p.status == 0) return t("prediction")
        if (p.status == 1) {
            if (p.team1_score == p.team2_score) return t("draw_predicted")
            return t("winner_predicted")
        }
        if (p.status == 2) return t("score_predicted")
        if (p.status == 3) return t("prediction_was_failed")
    }

    static getPredictionColor(p) {
        if (p.status == 0) return styles.black//'#8E8E93'
        if (p.status == 1) return styles.winner
        if (p.status == 2) return match.is_special ? styles.gold : styles.scorep
        if (p.status == 3 || p.status == 4) return styles.failed
    }

    static getPredictValue(predict) {
        if (predict.status == 4) return ''
        return ` ${predict.team1_score} : ${predict.team2_score}`
    }

    static getBetSign(userBet) {
        if (userBet.status == 0) return ''
        if (userBet.status == 1) return '+'
        if (userBet.status == 2) return '-'

        return ''
    }

    static getBetColorStyle(userBet) {
        if (userBet.status == 0) return 'color_title'
        if (userBet.status == 1) return 'color_success'
        if (userBet.status == 2) return 'color_fail'
        return 'color_title'
    }

    static getBetAmount(userBet) {
        if (userBet.status == 1) return (userBet.amount * userBet.odd).toFixed(2)

        return userBet.amount
    }
}
