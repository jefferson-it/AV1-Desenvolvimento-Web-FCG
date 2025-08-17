import { useLocation, useNavigate } from "react-router-dom";
import TicTacToc from "../../../components/TicTacToe";
import { useEffect, useState } from "react";
import { socket } from "../../../assets/io";
import styles from './PlayOnline.module.scss';

export default function PlayOnline() {
    const location = useLocation();
    const redirect = useNavigate();
    const receivedState = location.state;
    const [room, setRoom] = useState(receivedState?.room || null)
    const [myTurn, setMyTurn] = useState(false);
    const [opponentId, setOpponentId] = useState('');

    useEffect(() => {
        socket.emit('verify-room', room?.code)

        socket.on('room-updated', room => {
            setRoom(room);


            setMyTurn(
                room.playerTurn === socket.id
            )
        });

        socket.on('room-failed', (msg) => {
            alert(msg)

            redirect('/online');
        })
    }, [redirect, room?.code])

    useEffect(() => {
        if (room) {

            const opponentId = room.player.find(id => id !== socket.id);

            setOpponentId(opponentId);
        }
    }, [room])

    useEffect(() => {
        function beforeUnload(e) {
            e.preventDefault();

            e.returnValue = true;

            return true;
        }

        if (room) window.addEventListener('beforeunload', beforeUnload)
    }, [room]);

    function setMatrizPlay(matriz) {
        if (!myTurn) return alert("Aguarde o outro jogador");

        const list = matriz([...room.matriz]);

        setMyTurn(false);

        socket.emit('send-matriz', { code: room.code, matriz: list })
    }

    function reset() { }

    return (
        <main>


            {
                room.player.length < 2 ? (
                    <div className="">
                        <h3>Código sala: {room.code}</h3>
                        <p>
                            Aguardando jogador
                        </p>
                    </div>

                ) :
                    <>
                        <div className={styles.info}>
                            <div>
                                <h2>{
                                    myTurn ?
                                        "Sua vez" :
                                        "Vez do oponente"
                                }</h2>

                                <p>
                                    Você está jogando com <strong>{room.symbols[socket.id]}</strong>
                                </p>
                            </div>

                            <div>
                                <p>Você: {room.score[socket.id]}</p>
                                <p>Oponente: {room.score[opponentId]}</p>
                                <p>Empate: {room.score.draw}</p>
                            </div>
                        </div>
                        <TicTacToc
                            clean={reset}
                            matriz={room.matriz}
                            setMatriz={setMatrizPlay}
                            setTurn={() => { }}
                            symbolTurn={room.symbols[socket.id]}
                            codeRoom={room.code}
                        />
                    </>

            }
        </main>
    )
}