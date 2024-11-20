import styles from '@/styles/Home.module.css';

export default function TeamBrowseButton({title, team, onClick}) {
    return (<div onClick={onClick} className={styles.team_browse_button}>
        { team ? team.name : title}
    </div>)
}