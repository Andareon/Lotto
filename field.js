// DOM элементы
const input = document.getElementById('newNumber');
const container = document.getElementById('barrels-container');
const resizer = document.getElementById('resizer');
const left = document.querySelector('.left');
const right = document.querySelector('.right');

// Состояние игры
let tickets = [];
let gameState = {
    currentRound: 1,
    drawnNumbers: []
};
let winners = {
    round1: [],
    round2: [],
    round3: [],
    jackpot: []
};

// Инициализация
input.focus();

// ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addNumber();
  }
});

resizer.addEventListener('mousedown', function(e) {
  e.preventDefault();
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
});

// ==================== ОСНОВНЫЕ ФУНКЦИИ ИГРЫ ====================

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

    document.getElementById('winnerMessage').style.display = 'none';
    showSampleTicket(tickets[0].data);
    updateDisplay();
    updateBarrels();
}

function addBarrel(number) {
  const el = document.createElement('div');
  el.className = 'barrel';
  el.textContent = number;
  container.appendChild(el);
}

function updateBarrels() {
  container.innerHTML = '';
  gameState.drawnNumbers.forEach(num => {
    addBarrel(num);
  });
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
        input.focus();
        updateDisplay();
        updateBarrels();
        checkForWinners();
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
    input.focus();
    updateDisplay();
    updateBarrels();
    checkForWinners();
}

function removeLastNumber() {
    if (gameState.drawnNumbers.length > 0) {
        gameState.drawnNumbers.pop();
        updateDisplay();
        updateBarrels();
    }
}

function removeNumber(num) {
    gameState.drawnNumbers = gameState.drawnNumbers.filter(n => n !== num);
    updateDisplay();
    updateBarrels();
}

// ==================== ПРОВЕРКА ПОБЕДИТЕЛЕЙ (ТОЛЬКО ОТОБРАЖЕНИЕ) ====================

function checkAllWinners() {
    let currentWinners = [];
    let isWinnerExist = false;
    tickets.forEach(ticket => {
        const isWinner = checkRound(ticket.data, gameState.currentRound);

        if (isWinner) {
          currentWinners.push(ticket.number);
          isWinnerExist = true;
        }
        if (isWinner && gameState.currentRound == 3 && gameState.drawnNumbers.length <= 30) {
            winners.jackpot.push(ticket.number);
        }
    });

    if (gameState.currentRound == 1) {
        winners.round1 = currentWinners;
    } else if (gameState.currentRound == 2) {
        winners.round2 = currentWinners;
    } else if (gameState.currentRound == 3) {
        winners.round3 = currentWinners;
    }

    if (isWinnerExist) gameState.currentRound++

    return winners;
}

function checkForWinners() {
    const winnerMessage = document.getElementById('winnerMessage');
    
    if (winners.round3.length > 0) {
        winnerMessage.style.display = 'block';
        winnerMessage.innerHTML = `Победители в 3 туре: ${winners.round3.join(', ')}`;
    } else if (winners.round2.length > 0) {
        winnerMessage.style.display = 'block';
        winnerMessage.innerHTML = `Победители во 2 туре: ${winners.round2.join(', ')}`;
    } else if (winners.round1.length > 0) {
        winnerMessage.style.display = 'block';
        winnerMessage.innerHTML = `Победители в 1 туре: ${winners.round1.join(', ')}`;
    } else {
        winnerMessage.style.display = 'none';
    }
}

// ==================== ОТОБРАЖЕНИЕ ИНФОРМАЦИИ ====================

function showSampleTicket(ticketData) {
    const container = document.getElementById('sampleTicket');
    let html = '<h4>Пример билета №1:</h4>';
    ticketData.forEach((field, fi) => {
        html += `<div class="game-field"><table>`;
        field.forEach(row => {
            html += '<tr>';
            row.forEach(num => {
                const marked = num !== null && gameState.drawnNumbers.includes(num);
                html += `<td class="${marked ? 'marked' : ''}">${num !== null ? num : ''}</td>`;
            });
            html += '</tr>';
        });
        html += '</table></div>';
    });
    container.innerHTML = html;
}

function updateDisplay() {
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

    if (tickets.length > 0) {
        showSampleTicket(tickets[0].data);
    }
}

// ==================== ГЕНЕРАЦИЯ БИЛЕТОВ ====================

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

// ==================== ИЗМЕНЕНИЕ РАЗМЕРА ОКНА ====================

function resize(e) {
  const containerWidth = document.getElementById('main-container').getBoundingClientRect().width;
  const newRightWidth = containerWidth - e.clientX;
  if (newRightWidth > 120 && newRightWidth < containerWidth - 100) {
    right.style.width = newRightWidth + 'px';
  }
}

function stopResize() {
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopResize);
}
