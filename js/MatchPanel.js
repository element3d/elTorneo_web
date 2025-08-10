import styles from '@/styles/MatchPanel.module.css';
import { SERVER_BASE_URL } from './Config';
import moment from 'moment';
import { useGoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import SpecialPointsPanel from './SpecialPointsPanel';

function TeamItem({ team, isHome, style }) {
    const { t } = useTranslation()

    return <div className={styles.team_item} style={style}>
        <img className={styles.team_img} src={`${SERVER_BASE_URL}/data/teams/150x150/${team.name.replace(/ö/g, 'o')}.png`} />
        <span>{team.shortName}</span>
        <span className={styles.homeaway}>{isHome ? t('home') : t("away")}</span>
    </div>
}

export const EMODE_VIEW = 0
export const EMODE_EDIT = 1

export default function MatchPanel({browserName, isAndroid, router, me, match, predict, isMobile, onLogin }) {
    const { t } = useTranslation()
    const [team1Score, setTeam1Score] = useState('')
    const [team2Score, setTeam2Score] = useState('')
    const [mode, setMode] = useState(EMODE_VIEW)

    function getDate() {
        const today = moment().startOf('day');
        const tomorrow = moment().add(1, 'day').startOf('day');
        const matchDate = moment(match.date); // Ensure it's in milliseconds

        if (matchDate.isSame(today, 'day')) {
            return t('today');
        } else if (matchDate.isSame(tomorrow, 'day')) {
            return t('tomorrow');
        } else {
            return `${matchDate.format('DD')} ${t(matchDate.format('MMM').toLowerCase())} ${matchDate.format('YYYY').toLowerCase()}`;
        }
    }

    function isFinished() {
        if (match.status == 'FT' || (match.team1_score >= 0 && match.team2_score >= 0)) return true

        return false
    }

    function isNotStarted() {
        const d = Date.now()
        if (match.date > d) {
            return true
        }
        return false
    }

    function isLive() {
        if (isPstOrInt()) return false
        if (isNotStarted() || isFinished()) return false
        return true
    }

    function getBorderColor(p) {
        if (p.status == 0) return 'black'//'#8E8E93'
        if (p.status == 1) return '#00C566'
        if (p.status == 2) return '#ff7539'
        if (p.status == 3) return '#FF4747'
    }

    function getBgColor(p) {
        if (p.status == 0) return '#F7F7F7'
        if (p.status == 1) return '#00C56619'
        if (p.status == 2) return '#FACC1519'
        if (p.status == 3) return '#FF474719'
    }

    function showLoginButton() {
        if (isFinished() || isLive()) return false

        if (predict || me) return false
        return true
    }

    function showPredictButton() {
        if (!me || (predict && mode != EMODE_EDIT)) return false
        if (isFinished() || isLive()) return false

        return true
    }

    function signinGoogle(email, name) {
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                name: name
            })
        };
        return fetch(`${SERVER_BASE_URL}/api/v1/signin/googlemail`, requestOptions)
            .then(response => {
                if (response.status == 200)
                    return response.text()

                // setError(t('incorrect_login'))
                return null
            })
    }

    const onSuccess = async (tokenResponse) => {
        try {
            // Extract the access token from the tokenResponse
            const accessToken = tokenResponse.access_token;

            // Fetch user information from Google's API
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const userInfo = await response.json();

            // You can access user's email and name like this:
            const email = userInfo.email;
            const name = userInfo.name;

            signinGoogle(email, name)
                .then((token) => {
                    Cookies.set('token', token, { expires: 365 * 100 });
                    router.reload()
                })
                .catch((err) => {
                    console.error(err)
                })
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    }

    // function login() {
    //     signinGoogle('narekhovhannisyanim9@gmail.com', 'narek im4')
    //             .then((token) => {
    //                 Cookies.set('token', token);
    //                 router.reload()
    //             })
    //             .catch((err) => {
    //                 console.error(err)
    //             })
    // }

    function login() {
        if (!isMobile && onLogin) return onLogin()
        router.push('/login')
    }

    // const login = useGoogleLogin({
    //     onSuccess,
    //     clientId: '854989049861-uc8rajtci5vgrobdd65m4ig8vtbsec5s.apps.googleusercontent.com', // Replace with your Google API client ID
    //     isSignedIn: true,
    //     accessType: 'offline',
    //     fetchBasicProfile: true,
    //     scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',

    // });

    function getTime(ts) {
        const date = new Date(ts);

        // return moment(ts).format('HH:mm')

        // Format the time as "23:30"
        const formattedTime = date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        return formattedTime;
    }

    function onEdit() {
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authentication': me.token
            },
            body: JSON.stringify({
                predict: predict.id,
                team1_score: Number.parseInt(team1Score),
                team2_score: Number.parseInt(team2Score)
            })
        };

        fetch(`${SERVER_BASE_URL}/api/v1/predicts`, requestOptions)
            .then(response => {

                if (response.status == 403) {
                    // setShowFailPlayDialog(true)
                    // setProcessing(false)
                    return
                }

                router.reload()
                return null
            })
            .then(data => {
                // setMode(EMODE_VIEW)
                // router.reload()
            })
            .catch((e) => {
            });
    }

    function onPredict() {
        if (browserName == 'Facebook' || browserName == 'Chrome WebView') {
            if (isAndroid) {
                window.open('https://play.google.com/store/apps/details?id=com.eltorneo', '_blank');
                return;
            }
        }

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authentication': me.token
            },
            body: JSON.stringify({
                match: match.id,
                team1_score: Number.parseInt(team1Score),
                team2_score: Number.parseInt(team2Score)
            })
        };

        fetch(`${SERVER_BASE_URL}/api/v1/predicts`, requestOptions)
            .then(response => {
                return response.json()
            })
            .then(data => {
                router.reload()
            })
            .catch((e) => {
            });
    }

    function onScore1Change(e) {
        if (!isNaN(Number.parseInt(e.target.value))) {
            return setTeam1Score(e.target.value)
        }
        setTeam1Score('')
    }

    function onScore2Change(e) {
        if (!isNaN(Number.parseInt(e.target.value))) {
            return setTeam2Score(e.target.value)
        }
        setTeam2Score('')
    }

    function onEditClick() {
        setMode(EMODE_EDIT)
    }

    function isPstOrInt() {
        if (match.status == "PST" || match.status == "INT") return true
        return false
    }

    return (<div className={isMobile ? styles.panel : styles.panel_desktop}>
        <span>{getDate()}</span>
        <span className={styles.week}>{t('matchday')} {match.week}</span>
        <div className={styles.teams_row}>
            <TeamItem isHome={true} team={match.team1} style={{ paddingRight: '30px' }} />
            <TeamItem isHome={false} team={match.team2} style={{ paddingLeft: '30px' }} />

            {isFinished() ? <div className={styles.score_panel}>
                <span className={styles.score_label}>{match.team1_score}</span>
                <span>:</span>
                <span className={styles.score_label}>{match.team2_score}</span>
            </div> : null}

            {isNotStarted() && predict && mode == EMODE_VIEW ? <div className={styles.live_panel}>
                <div className={styles.live_score_panel}>
                    <div className={styles.status}>
                        <span>{getTime(match.date)}</span>
                    </div>
                </div>
            </div> : null}

            {isPstOrInt() ? <div className={styles.live_panel}>
                <div className={styles.live_score_panel}>
                    <div className={styles.pst}>
                        <span>{match.status}</span>
                    </div>
                </div>
            </div> : null}

            {isNotStarted() && (!predict || mode == EMODE_EDIT) ? <div className={styles.live_panel}>
                <div className={styles.live_score_panel}>
                    <input type='tel' maxLength={1} className={styles.score_input} value={team1Score} onChange={onScore1Change} />
                    <span className={styles.dots}>:</span>
                    <input type='tel' maxLength={1} className={styles.score_input} value={team2Score} onChange={onScore2Change} />
                </div>
            </div> : null}

            {isLive() ? <div className={styles.live_panel}>
                <div className={styles.live_score_panel}>
                    <span className={styles.score_label}>{match.team1_score_live}</span>
                    <span>:</span>
                    <span className={styles.score_label}>{match.team2_score_live}</span>
                </div>
                <div className={styles.status}>
                    <span>{match.status == 'HT' ? 'HT' : match.elapsed + " '"}</span>
                </div>
            </div> : null}
        </div>
        {match.is_special ? <SpecialPointsPanel match={{match: match}}/> : null }
        {predict && predict.status != 4 && mode != EMODE_EDIT ? <div className={styles.edit_row}><div className={styles.predict_item} style={{ backgroundColor: getBgColor(predict), color: getBorderColor(predict) }}>
            <span >{t('prediction')} {predict.team1_score} : {predict.team2_score}</span></div>
            <button className={styles.edit_button} onClick={onEditClick}>
                <img className={styles.edit_icon} src={`${SERVER_BASE_URL}/data/icons/edit.svg`} />
            </button>
        </div>
            : null}

        {showLoginButton() ? <button onClick={login} className={styles.sign_in_btn} >
            <span>{t('sign_in_to_predict')}</span>
            {/* <div className={styles.gcont}>
                <img className={styles.gicon} src={`${SERVER_BASE_URL}/data/icons/google.svg`}/>
            </div> */}
        </button> : null}
        {showPredictButton() ?
            <button onClick={mode == EMODE_VIEW ? onPredict : onEdit} disabled={team1Score.length == 0 || team2Score.length == 0} className={styles.sign_in_btn} style={{ opacity: team1Score.length && team2Score.length ? 1 : .6 }}>{mode == EMODE_VIEW ? t('predict') : t('save')}</button> : null}


    </div>)
}