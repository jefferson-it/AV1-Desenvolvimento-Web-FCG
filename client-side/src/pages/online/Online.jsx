import { useEffect } from 'react';
import styles from './Online.module.scss';
import { socket } from '../../assets/io';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Online() {
    const redirect = useNavigate();
    const [code, setCode] = useState('');

    useEffect(() => {
        socket.on('room-updated', room => {
            redirect('/online/play', { state: { room } })
        });

        socket.on('result-join', msg => alert(msg))
    }, [redirect])

    function createRoom() {
        socket.emit('create-room');
    };

    function joinRoom() {
        socket.emit('join-room', code);
    }

    return (
        <main>
            <section className={styles.card}>
                <h1>Jogar Online</h1>

                <input
                    onChange={e => setCode(e.target.value)}
                    type="text"
                    name="code"
                    placeholder="Código da sala" />


                {
                    code ?
                        <button onClick={joinRoom}>Entrar</button> :
                        <button onClick={createRoom}>Criar minha sala</button>
                }
            </section>
        </main>
    )
}