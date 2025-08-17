import { useEffect, useState } from 'react';
import styles from './TicTacToe.module.scss';
import { socket } from '../assets/io';

export default function TicTacToc({
    symbolTurn,
    matriz,
    setMatriz,
    clean,
    setTurn,
    codeRoom = "",
}) {
    const [verifying, setVerifying] = useState(false);
    const [ended, setEndend] = useState(null)

    useEffect(() => {
        socket.on('end-game', (winnerInfo) => setEndend(winnerInfo));
        socket.on('reset-game', () => setEndend(null));
    }, [])

    useEffect(() => {
        verifyWinner();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matriz])

    function selectBlock(i, j) {
        console.log({
            verifying,
            i, j,
            symbolTurn
        });

        if (verifying) return;

        if (matriz[i][j]) {
            alert("Bloco já preenchido")

            return
        }

        setMatriz(list => {
            const copy = [...list];

            copy[i][j] = symbolTurn;

            return copy
        })
    }

    function verifyWinner() {
        if (!verifying && !ended) {
            setVerifying(true);
            const winnerInfo = {};

            for (let i = 0; i < 3; i++) {
                if (matriz[i][0] === matriz[i][1] &&
                    matriz[i][1] === matriz[i][2] &&
                    matriz[i][0] === symbolTurn) {
                    winnerInfo.symbol = symbolTurn;
                    winnerInfo.line = i;
                }
            }

            for (let j = 0; j < 3; j++) {
                if (matriz[0][j] === matriz[1][j] &&
                    matriz[1][j] === matriz[2][j] &&
                    matriz[0][j] === symbolTurn) {
                    winnerInfo.symbol = symbolTurn;
                    winnerInfo.column = j;
                }
            }

            if (
                (matriz[0][0] === matriz[1][1] &&
                    matriz[2][2] === matriz[1][1] &&
                    matriz[2][2] === symbolTurn
                )
            ) {
                winnerInfo.symbol = symbolTurn;
                winnerInfo.start = 0
                winnerInfo.end = 2
            }
            if (
                (matriz[0][2] === matriz[1][1] &&
                    matriz[2][0] === matriz[1][1] &&
                    matriz[2][0] === symbolTurn
                )
            ) {
                winnerInfo.start = 2
                winnerInfo.symbol = symbolTurn;
                winnerInfo.end = 0
            }


            setTurn(
                symbolTurn === "O" ?
                    "X" :
                    "O"
            );


            if (winnerInfo.symbol) {
                winnerInfo.title = `Jogador ${symbolTurn} Ganhou`;
                setEndend(winnerInfo);

                setVerifying(false);

                if (codeRoom) {
                    socket.emit("winner", {
                        code: codeRoom,
                        winnerInfo
                    });
                }

                return;
            }

            const countFilled = matriz.flat().filter(Boolean).length;

            if (countFilled === 9) {
                winnerInfo.title = "Deu velha";
                setEndend(winnerInfo);

                setVerifying(false);

                if (codeRoom) {
                    socket.emit("winner", {
                        code: codeRoom,
                        winnerInfo
                    });
                }

                return;
            }

            setVerifying(false);
        }
    }

    function reset() {
        clean();

        setTurn(ended.symbol);
        setEndend(null);

        if (codeRoom) socket.emit("reset", {
            code: codeRoom,
        })
    }

    return (
        <section className={styles.game}>
            {
                ended && (
                    <div className={styles.reset}>
                        <h2>{ended.title}</h2>

                        <button
                            type='button'
                            onClick={reset}
                        >Reiniciar</button>
                    </div>
                )
            }
            <article className={styles.tictactoe}>
                {/* i = 0 */}
                <div
                    onClick={selectBlock.bind(null, 0, 0)}
                    className={styles.block}>{matriz[0][0]}</div>
                <div
                    onClick={selectBlock.bind(null, 0, 1)}
                    className={styles.block}>{matriz[0][1]}</div>
                <div
                    onClick={selectBlock.bind(null, 0, 2)}
                    className={styles.block}>{matriz[0][2]}</div>
                {/* i = 1 */}
                <div
                    onClick={selectBlock.bind(null, 1, 0)}
                    className={styles.block}>{matriz[1][0]}</div>
                <div
                    onClick={selectBlock.bind(null, 1, 1)}
                    className={styles.block}>{matriz[1][1]}</div>
                <div
                    onClick={selectBlock.bind(null, 1, 2)}
                    className={styles.block}>{matriz[1][2]}</div>
                {/* i = 2 */}
                <div
                    onClick={selectBlock.bind(null, 2, 0)}
                    className={styles.block}>{matriz[2][0]}</div>
                <div
                    onClick={selectBlock.bind(null, 2, 1)}
                    className={styles.block}>{matriz[2][1]}</div>
                <div
                    onClick={selectBlock.bind(null, 2, 2)}
                    className={styles.block}>{matriz[2][2]}</div>
            </article>
        </section>
    )
}