import styles from '@/styles/Profile.module.css';
import MatchItemMobile from './MatchItemMobile';
import { useEffect, useState } from 'react';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next';

export default function ProfileMatchesPanel({ isMe, router, globalPage, user, predicts, setPredicts, totalPredicts }) {
    const {t} = useTranslation()

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(2);
    const [showNextPrev, setShowNextPrev] = useState(globalPage > 1)
    const [showNext, setShowNext] = useState(true)
    const [showPrev, setShowPrev] = useState(globalPage > 1)

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading) {
                // console.log(totalPredicts)
                const limit = Math.min(totalPredicts, 100);
                if ((page - 1) * 20 < limit)
                    loadMorePredicts();
                else {
                    if (((globalPage - 1) * 100) + predicts.length < totalPredicts) {
                        setShowNext(true)
                    } else {
                        setShowNext(false)
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading]);

    const loadMorePredicts = async () => {
        setLoading(true);
        const response = await fetch(`${SERVER_BASE_URL}/api/v1/user/predicts?page=${page}&user_id=${user.id}&league_id=${-1}`);
        const newPredicts = await response.json();

        setPredicts(prev => [...prev, ...newPredicts.predicts]);
        setPage(prev => prev + 1);
        console.log(page)
        setLoading(false);
    };

    useEffect(() => {
        console.log(predicts.length)
    }, [predicts])

    function onPrev() {

    }

    function onNext() {
        if (isMe)
            router.push(`/profile?page=${globalPage + 1}`)
        else
            router.push(`/profile/${user.id}?page=${globalPage + 1}`)
    }   

    return <div className={styles.predicts_cont}>
        {predicts.map(p => (
            <MatchItemMobile router={router} key={p.id} match={p} showLeague={true} />
        ))}
        {loading && <div>Loading more predictions...</div>}
        {showNextPrev ? <div className={styles.prev_next_cont}>
            {showPrev ? <span onClick={onPrev} className={`${styles.prev} ${showNext ? null : styles.text_center}`}>{'< '}{t('previous')}</span> : null }
            <span onClick={onNext} className={`${styles.next} ${showPrev ? null : styles.text_center}`}>{t('next')}{' >'}</span>
        </div> : null}
    </div>
}