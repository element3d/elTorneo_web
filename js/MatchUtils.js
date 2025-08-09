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

}