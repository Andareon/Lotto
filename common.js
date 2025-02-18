function shuffle(array, rng) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function generateMask(rng) {
    while (true) {
        const mask = [...Array(15).fill(1), ...Array(12).fill(0)];
        shuffle(mask, rng);
        const grid = [];
        for (let i = 0; i < 3; i++) {
            grid.push(mask.slice(i * 9, (i + 1) * 9));
        }

        const rowValid = grid.every(row => row.filter(x => x === 1).length === 5);
        const colValid = Array.from({length: 9}).every((_, col) => {
            const sum = grid.reduce((acc, row) => acc + row[col], 0);
            return sum >= 1 && sum <= 2;
        });

        if (rowValid && colValid) return grid;
    }
}

function generateTicket(seed) {
    const rng = new Math.seedrandom(seed);
    const columns = {};
    for (let i = 0; i < 9; i++) {
        columns[i] = Array.from({length: 10}, (_, j) => i * 10 + j);
        if (i === 0) columns[i] = columns[i].slice(1);
        if (i === 8) columns[i] = Array.from({length: 11}, (_, j) => 80 + j);
        shuffle(columns[i], rng);
    }

    const ticket = [[], []];
    for (let field = 0; field < 2; field++) {
        const mask = generateMask(rng);
        const fieldNumbers = Array.from({length: 3}, () => Array(9).fill(null));

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 9; col++) {
                if (mask[row][col] && columns[col].length > 0) {
                    fieldNumbers[row][col] = columns[col].pop();
                }
            }
        }
        ticket[field] = fieldNumbers;
    }
    return ticket;
}