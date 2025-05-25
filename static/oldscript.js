let balance = 100;

const spinSound = new Audio('/static/spin.mp3');
const winSound = new Audio('/static/win.mp3');

function spin() {
    const bet = parseInt(document.getElementById('bet').value);
    if (bet > balance) {
        alert("Not enough coins!");
        return;
    }
    if (bet <= 0 || isNaN(bet)) {
        alert("Please enter a valid bet.");
        return;
    }

    spinSound.currentTime = 0;
    spinSound.play();

    const symbols = ["🍒", "🍋", "🔔", "⭐", "💎", "7️⃣", "🍇", "🍉", "🍎", "🍓", "🍍", "🥝"];
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = "";

    // Create the spinning grid
    const cellRefs = [];
    for (let i = 0; i < 3; i++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row";
        for (let j = 0; j < 3; j++) {
            const cellDiv = document.createElement("div");
            cellDiv.className = "cell";
            cellDiv.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            rowDiv.appendChild(cellDiv);
            cellRefs.push(cellDiv);
        }
        gridContainer.appendChild(rowDiv);
    }

    // Start fast spinning for all 9 cells
    const spinners = cellRefs.map(cell => {
        return setInterval(() => {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            cell.textContent = randomSymbol;
        }, 50); // spin speed (lower is faster)
    });

    // Fetch the result while spinning
    fetch('/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bet })
    })
    .then(res => res.json())
    .then(data => {
        setTimeout(() => {
            // Stop all spinners
            spinners.forEach(interval => clearInterval(interval));

            // Set final symbols
            const grid = data.grid;
            let index = 0;
            for (let row of grid) {
                for (let cell of row) {
                    cellRefs[index].textContent = cell;
                    index++;
                }
            }

            balance += data.net_result;
            document.getElementById('balance').textContent = balance;

            // Show result
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = `<p>${data.net_result >= 0 ? `You won ${data.winnings} coins! 🎉` : `You lost ${-data.net_result} coins 😢`}</p>`;

            // Play win sound
            if (data.net_result > 0) {
                winSound.currentTime = 0;
                winSound.play();
            }
        }, 1000); // spin duration
    });
}
