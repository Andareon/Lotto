// ticket.js
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('series').value = 1;
    document.getElementById('number').value = 1;
    generateAndDisplayTicket();
});

function generateAndDisplayTicket() {
    let gameNumber = parseInt(document.getElementById('series').value) || 1;
    let ticketNumber = parseInt(document.getElementById('number').value) || 1;

    gameNumber = Math.max(1, Math.min(gameNumber, 9999));
    ticketNumber = Math.max(1, Math.min(ticketNumber, 9999));

    document.getElementById('series').value = gameNumber;
    document.getElementById('number').value = ticketNumber;

    const ticket = generateTicket(gameNumber * 10000 + ticketNumber);
    displayTicket(ticket, gameNumber, ticketNumber);
}

function displayTicket(ticket, gameNumber, ticketNumber) {
    const container = document.querySelector('.ticket-container');
    let html = `
        <div class="ticket-header">
            <h1 class="ticket-title">ЛОТО</h1>
        </div>
    `;

    ticket.forEach(field => {
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

    html += `<div class="serial-number">Серия: ${gameNumber} № ${ticketNumber}</div>`;
    container.innerHTML = html;
    addCellClickHandlers();
}

function addCellClickHandlers() {
    document.querySelectorAll('td').forEach(cell => {
        if (cell.textContent.trim()) {
            cell.addEventListener('click', function() {
                this.classList.toggle('marked');
            });
        }
    });
}