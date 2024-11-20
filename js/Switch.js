import styles from '@/styles/Switch.module.css';

export default function Switch({title1, title2, selected, onSelect}) {

    return (<div className={styles.switch}>
       <div onClick={() => {onSelect(1)}} className={selected == 1 ? styles.item_sel : styles.item}>{title1}</div>
       <div onClick={() => {onSelect(2)}} className={selected == 2 ? styles.item_sel : styles.item}>{title2}</div>
    </div>)
}