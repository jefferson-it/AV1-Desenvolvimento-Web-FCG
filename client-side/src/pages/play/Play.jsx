import { useState } from "react";
import TicTacToc from "../../components/TicTacToe";

export default function Play() {
    const [matriz, setMatriz] = useState([
        [], [], [],
    ]);
    const [turn, setTurn] = useState('O');

    function reset() {
        setMatriz([
            [], [], [],
        ])
    }

    return (
        <main>
            <TicTacToc
                symbolTurn={turn}
                matriz={matriz}
                setMatriz={setMatriz}
                setTurn={setTurn}
                clean={reset}
            />
        </main>
    )
}