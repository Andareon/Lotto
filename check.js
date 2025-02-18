// check.js
let tickets = [];
let gameState = {
    currentRound: 1,
    drawnNumbers: []
};

function initializeGame() {
    const series = parseInt(document.getElementById('series').value) || 1;
    const ticketNumbers = document.getElementById('ticketNumbers').value
        .split(',')
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n) && n > 0 && n <= 9999);

    tickets = ticketNumbers.map(number => ({
        number,
        data: generateTicket(series * 10000 + number)
    }));

    gameState = {
        currentRound: 1,
        drawnNumbers: []
    };

    showSampleTicket(tickets[0].data);
    updateDisplay();
}

function checkAllWinners() {
    const winners = {
        round1: [],
        round2: [],
        round3: [],
        jackpot: []
    };

    tickets.forEach(ticket => {
        const isRound1 = checkRound(ticket.data, 1);
        const isRound2 = checkRound(ticket.data, 2);
        const isRound3 = checkRound(ticket.data, 3);

        if (isRound1) winners.round1.push(ticket.number);
        if (isRound2) winners.round2.push(ticket.number);
        if (isRound3) {
            winners.round3.push(ticket.number);
            if (gameState.drawnNumbers.length <= 30) {
                winners.jackpot.push(ticket.number);
            }
        }
    });

    let newRound = 1;
    if (winners.round3.length > 0) newRound = 4;
    else if (winners.round2.length > 0) newRound = 3;
    else if (winners.round1.length > 0) newRound = 2;

    gameState.currentRound = Math.min(newRound, 3);

    return winners;
}

function showSampleTicket(ticketData) {
    const container = document.getElementById('sampleTicket');
    let html = '<h4>Пример билета №1:</h4>';
    ticketData.forEach((field, fi) => {
        html += `<div class="game-field"><table>`;
        field.forEach(row => {
            html += '<tr>';
            row.forEach(num => {
                html += `<td>${num !== null ? num : ''}</td>`;
            });
            html += '</tr>';
        });
        html += '</table></div>';
    });
    container.innerHTML = html;
}

function checkRound(ticketData, roundNum) {
    for (const field of ticketData) {
        if (roundNum === 1) {
            for (const row of field) {
                if (row.every(num => num === null || gameState.drawnNumbers.includes(num))) {
                    return true;
                }
            }
        }
        if (roundNum === 2) {
            if (field.every(row =>
                row.every(num => num === null || gameState.drawnNumbers.includes(num)))) {
                    return true;
            }
        }
        if (roundNum === 3) {
            const allMarked = ticketData.every(field =>
                field.every(row =>
                    row.every(num => num === null || gameState.drawnNumbers.includes(num))
                )
            );
            if (allMarked) return true;
        }
    }
    return false;
}

function addNumber() {
    const numInput = document.getElementById('newNumber');
    const num = parseInt(numInput.value);

    if (!isNaN(num)) {
        if (num < 1 || num > 90) {
            alert('Число должно быть от 1 до 90');
            return;
        }
        if (gameState.drawnNumbers.includes(num)) {
            alert('Это число уже было добавлено');
            return;
        }

        gameState.drawnNumbers.push(num);
        numInput.value = '';
        updateDisplay();
    }
}

function addRandomNumber() {
    const availableNumbers = Array.from({length: 90}, (_, i) => i + 1)
        .filter(n => !gameState.drawnNumbers.includes(n));

    if (availableNumbers.length === 0) {
        alert('Все числа уже были добавлены!');
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const randomNumber = availableNumbers[randomIndex];
    gameState.drawnNumbers.push(randomNumber);
    updateDisplay();
}

function removeLastNumber() {
    if (gameState.drawnNumbers.length > 0) {
        gameState.drawnNumbers.pop();
        updateDisplay();
    }
}

function removeNumber(num) {
    gameState.drawnNumbers = gameState.drawnNumbers.filter(n => n !== num);
    updateDisplay();
}

function updateDisplay() {
    const drawnNumbersDiv = document.getElementById('drawnNumbers');
    drawnNumbersDiv.innerHTML = gameState.drawnNumbers
        .map(num => `<div class="number-chip" onclick="removeNumber(${num})">${num}</div>`)
        .join('');

    const winners = checkAllWinners();

    const winnersDiv = document.getElementById('winners');
    winnersDiv.innerHTML = `
        <h3>Победители:</h3>
        <div class="tour-winner">
            <strong>Тур 1:</strong> ${winners.round1.join(', ') || 'нет'}
        </div>
        <div class="tour-winner">
            <strong>Тур 2:</strong> ${winners.round2.join(', ') || 'нет'}
        </div>
        <div class="tour-winner">
            <strong>Тур 3:</strong> ${winners.round3.join(', ') || 'нет'}
        </div>
        ${winners.jackpot.length > 0 ?
            `<div class="tour-winner" style="color: #c62828;">
                <strong>Джекпот:</strong> ${[...new Set(winners.jackpot)].join(', ')}
            </div>` : ''
        }
        <div class="tour-winner">
            <strong>Текущий раунд:</strong> ${gameState.currentRound}
        </div>
    `;
}