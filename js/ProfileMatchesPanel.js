import styles from '@/styles/Profile.module.css';
import MatchItemMobile from './MatchItemMobile';
import { useEffect, useState } from 'react';
import { SERVER_BASE_URL } from './Config';
import { useTranslation } from 'next-i18next';
import { Oval } from 'react-loader-spinner'

export default function ProfileMatchesPanel({ isMe, onPreview,  router, globalPage, user, predicts, setPredicts, totalPredicts }) {
    const { t } = useTranslation()

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(2);
    const [showNextPrev, setShowNextPrev] = useState(globalPage > 1)
    const [showNext, setShowNext] = useState(true)
    const [showPrev, setShowPrev] = useState(globalPage > 1)

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading) {
                const limit = Math.min(totalPredicts, 100);

                // if ((page - 1) * 20 < limit) {
                // if (Math.floor((page) % (globalPage * 5)) != 0) {
                if (page < 6) {
                    loadMorePredicts();
                    setShowNextPrev(false)
                }
                else {
                    if (predicts.length == 100 || globalPage > 1) {
                        setShowNextPrev(true)
                    }
                    if (predicts.length == 100) {
                        setShowNext(true)
                    } else {
                        setShowNext(false)
                    }
                    if (globalPage > 1) setShowPrev(true)
                    else setShowPrev(false)

                    // return
                    // if (((globalPage - 1) * 100) + predicts.length < totalPredicts) {
                    //     setShowNextPrev(true)
                    //     setShowNext(true)
                    // } else {
                    //     setShowNext(false)
                    // }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, globalPage, predicts]);

    const loadMorePredicts = async () => {
        setLoading(true);
        const response = await fetch(`${SERVER_BASE_URL}/api/v1/user/predicts?page=${(globalPage - 1) * 5 + page}&user_id=${user.id}&league_id=${-1}`);
        const newPredicts = await response.json();

        setPredicts(prev => [...prev, ...newPredicts.predicts]);
        setPage(prev => prev + 1);
        setLoading(false);
    };

    function onPrev() {
        setPage(2)
        router.back()
    }

    function onNext() {
        setPage(2)
        if (isMe)
            router.push(`/profile?page=${globalPage + 1}`)
        else
            router.push(`/profile/${user.id}?page=${globalPage + 1}`)
    }

    return <div className={styles.predicts_cont}>
        {predicts.map(p => (
            <MatchItemMobile onPreview={onPreview} router={router} key={`key_${p.id}`} match={p} showLeague={true} />
        ))}
        {loading && <div className={styles.loading}>  <Oval
            visible={true}
            height="30"
            width="30"
            color="#FF2882"
            ariaLabel="oval-loading"
            wrapperStyle={{}}
            wrapperClass=""
        /></div>}
        {showNextPrev ? <div className={styles.prev_next_cont}>
            {showPrev ? <span onClick={onPrev} className={`${styles.prev} ${showNext ? null : styles.text_center}`}>{'< '}{t('prev')}</span> : null}
            {showNext ? <span onClick={onNext} className={`${styles.next} ${showPrev ? null : styles.text_center}`}>{t('next')}{' >'}</span> : null}
        </div> : null}
    </div>
}