let balance = 2500000;

const spinSound = new Audio('/static/spin.mp3');
const winSound = new Audio('/static/win.mp3');
const loseSound = new Audio('/static/lose.mp3');

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

    const symbols = ["🍒", "🍋", "🔔", "⭐", "💎", "7⃣", "🍇", "🍉", "🍎", "🍓", "🍍", "🥝"];
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = "";

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

    const spinners = cellRefs.map(cell => {
        return setInterval(() => {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            cell.textContent = randomSymbol;
        }, 50);
    });

    fetch('/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bet })
    })
    .then(res => res.json())
    .then(data => {
        setTimeout(() => {
            spinners.forEach(interval => clearInterval(interval));

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

            const resultDiv = document.getElementById('result');
            let message = "";

            if (data.winnings > 0) {
                winSound.currentTime = 0;
                winSound.play();
                message += `🎉 You won ${data.winnings} coins!`;
            } else {
                loseSound.currentTime = 0;
                loseSound.play();
                message += `😢 You lost ${-data.net_result} coins.`;
            }

            if (data.diamond_bonus > 0) {
                message += ` <br> 💎 Lucky Diamond or 7⃣ in center! 5× Bonus (+${data.diamond_bonus})`;
            }

            resultDiv.innerHTML = `<p>${message}</p>`;
        }, 1000);
    });
}
