import { useNavigate } from 'react-router-dom';
import styles from './Home.module.scss';

export default function Home() {
    const router = useNavigate();

    return (
        <main className={styles.main}>
            <section>
                <h1>Jogo Da Velha</h1>
                <article>

                    <p>
                        O jogo é multiplayer, porém jogar é para usar no mesmo dispositivo;
                        E jogar online, jogar em dispositivo diferente
                    </p>


                </article>
            </section>

            <span>
                <button
                    onClick={router.bind(null, '/online')}
                    type='button'
                >Jogar Online</button>
                <button
                    onClick={router.bind(null, '/play')}
                    type='button'
                >Jogar</button>
            </span>
        </main>
    )
}