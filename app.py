from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

symbols = ["🍒", "🍋", "🔔", "⭐", "💎", "7⃣", "🍇", "🍉", "🍎", "🍓", "🍍", "🥝"]

def generate_grid():
    return [[random.choice(symbols) for _ in range(3)] for _ in range(3)]

def calculate_winnings(grid, bet):
    winnings = 0
    diamond_bonus = 0
    center_symbol = grid[1][1]

    # Check horizontal rows
    for row in grid:
        if row[0] == row[1] == row[2]:
            winnings += bet * 2

    # 5x bonus if center is 💎 or 7⃣
    if center_symbol in ["💎", "7⃣"]:
        diamond_bonus = bet * 5
        winnings += diamond_bonus

    return winnings, diamond_bonus

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/spin', methods=['POST'])
def spin():
    data = request.get_json()
    bet = int(data['bet'])

    if bet <= 0:
        return jsonify({'error': 'Invalid bet amount'}), 400

    grid = generate_grid()
    winnings, diamond_bonus = calculate_winnings(grid, bet)
    net_result = winnings - bet

    return jsonify({
        'grid': grid,
        'winnings': winnings,
        'diamond_bonus': diamond_bonus,
        'net_result': net_result
    })

if __name__ == '__main__':
    app.run(debug=True)
