export function genRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}


export function shuffleData(input) {
    for (let i = input.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [input[i], input[j]] = [input[j], input[i]];
    }

    return input;
}
