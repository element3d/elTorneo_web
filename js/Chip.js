import styles from '@/styles/Home.module.css';

export default function Chip({title, selected, onClick}) {
    return (<div onClick={onClick} className={` ${selected ? styles.chip_selected : null} ${styles.chip}`}>
        {title}
    </div>)
}