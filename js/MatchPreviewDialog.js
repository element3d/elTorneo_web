import styles from '@/styles/MatchPreviewDialog.module.css';
import { SERVER_BASE_URL } from './Config';
import YouTube from 'react-youtube';

export default function MatchPreviewDialog({ match, onClose }) {
    function onReady() {

    }

    return <div className={styles.cont} onClick={(e) => e.stopPropagation()} >
        <div className={styles.panel}>
            <div className={styles.header}>
                <div className={styles.team1}>
                    <span>{match.team1.shortName}</span>
                    <img className={styles.img} src={`${SERVER_BASE_URL}/data/teams/150x150/${match.team1.name}.png`} />
                </div>
                <div className={styles.score}>
                    {match.team1_score} : {match.team2_score}
                </div>
                <div className={styles.team2}>
                    <img className={styles.img} src={`${SERVER_BASE_URL}/data/teams/150x150/${match.team2.name}.png`} />
                    <span>{match.team2.shortName}</span>
                </div>
            </div>

            <YouTube
                videoId={match.preview}
                opts={{
                    width: '100%',
                    height: '260px',
                    //   height: '100%',
                    playerVars: {
                        autoplay: 1, // Enable autoplay
                    },
                }}
                onReady={onReady}
            />

            <div className={styles.close} onClick={onClose}>
                <img className={styles.close_icon} src={`${SERVER_BASE_URL}/data/icons/close.svg`}/>
            </div>
        </div>
    </div>
}