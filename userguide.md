# Tic-Tac-Toe Game - User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Creating an Account](#creating-an-account)
4. [Game Lobby](#game-lobby)
5. [Creating a Game](#creating-a-game)
6. [Joining a Game](#joining-a-game)
7. [Playing the Game](#playing-the-game)
8. [Game Rules](#game-rules)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

Welcome to the Tic-Tac-Toe multiplayer game! This web-based application allows you to play the classic Tic-Tac-Toe game with other players online. You can create public games that anyone can join, or private games that require a game code to access.

**Key Features:**
- User authentication (login and registration)
- Public and private game rooms
- Real-time multiplayer gameplay
- Simple and intuitive interface
- Game status tracking

---

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Stable internet connection
- No additional software installation required

### Accessing the Application
Navigate to: `tic-tac-toe-three-jade.vercel.app` in your web browser.

---

## Creating an Account

### Registration Process

1. **Navigate to the Login Page**
   - When you first visit the application, you'll see the login screen with the Tic-Tac-Toe logo

2. **Click "Create Account"**
   - Located at the bottom of the login form
   - This will take you to the registration page

3. **Fill in Registration Details**
   - **Username**: Choose a unique username
   - **Password**: Create a secure password 

4. **Submit Registration**
   - Click the "Start Playing!" button
   - If successful, you'll be redirected to the game lobby

### Login Process

1. **Enter Credentials**
   - Username: Your registered username
   - Password: Your account password

2. **Click "Login"**
   - You'll be directed to the game lobby upon successful authentication

3. **Existing User?**
   - If on the registration page, click "Login to Play" to return to the login screen

---

## Game Lobby

The Game Lobby is your central hub for game management. From here you can:

### Lobby Features

**Header Section:**
- Game Lobby title with tagline "Find opponents and start playing!"
- Red "Logout" button in the top-right corner

**Main Actions:**
- **Create New Game** (purple button): Start a new game session
- **Refresh List** (white button): Update the list of available public games

**Join Options:**

1. **Join Private Game**
   - Green section with hashtag icon
   - Enter a 6-digit game code
   - Click "Join Game" button

2. **Public Games**
   - Purple section showing available public games
   - Displays game code and player count
   - Each game has a "Join Now →" button in green
   - Shows "0 games waiting" when no public games are available

---

## Creating a Game

### Step-by-Step Process

1. **Click "Create New Game"**
   - Purple button at the top of the lobby

2. **Choose Game Type**
   
   **Public Game Option:**
   - Purple/blue gradient card with globe icon
   - "Anyone can join from the lobby"
   - Visible to all players in the public games list
   
   **Private Game Option:**
   - Green gradient card with lock icon
   - "Share code with friends to join"
   - Only accessible via 6-digit game code

3. **Create Your Selection**
   - Click on your preferred game type
   - A game code will be generated automatically
   - You'll be taken to the game room

4. **Share Game Code (Private Games)**
   - For private games, share the 6-digit code displayed at the top
   - Friends can enter this code in the "Join Private Game" section

5. **Cancel Option**
   - Click "Cancel" at the bottom of the modal to return to the lobby

---

## Joining a Game

### Joining a Public Game

1. **View Available Games**
   - Scroll to the "Public Games" section in the lobby
   - Games show their code and current player status

2. **Select a Game**
   - Click the green "Join Now →" button next to any available game

3. **Enter Game Room**
   - You'll be automatically assigned as Player O
   - Wait for the game to start

### Joining a Private Game

1. **Obtain Game Code**
   - Get the 6-digit code from your friend who created the game

2. **Enter Code**
   - Type the code in the "Join Private Game" input field
   - Format: 6 alphanumeric characters (e.g., "1SLE5Q")

3. **Join Game**
   - Click the green "Join Game" button
   - You'll be taken to the game room

---

## Playing the Game

### Game Interface

**Top Section:**
- Game title "Tic-Tac-Toe"
- Game code (e.g., "Code: 1SLE5Q")
- "Exit Game" button (orange/red)

**Player Information:**
- Your assigned symbol (X or O) displayed in a blue square
- Text showing "You are playing as X" or "You are playing as O"

**Turn Indicator:**
- Green badge showing "Your Turn!" when it's your move
- Gray badge showing "Opponent's Turn" when waiting
- "Game Over" badge when the game concludes

**Game Board:**
- 3x3 grid of clickable squares
- Empty squares have light borders
- Played squares show X (blue) or O (red)

**Game Status Panel:**
- "Current Turn": Shows whose turn it is (X or O)
- "Game Status": Shows game state (Waiting/Playing/Finished)
- Result announcement in colored box when game ends

### Making Moves

1. **Wait for Your Turn**
   - Check the turn indicator at the top
   - The board is only clickable during your turn

2. **Select a Square**
   - Click any empty square on the 3x3 grid
   - Your symbol (X or O) will appear in that square

3. **Wait for Opponent**
   - After your move, the turn indicator changes
   - Wait for your opponent to make their move

4. **Continue Playing**
   - Alternate turns until the game concludes

### Game Completion

**Winning:**
- When you get three in a row (horizontal, vertical, or diagonal)
- A green success box appears showing "You Won! X wins the game!"

**Losing:**
- When your opponent gets three in a row
- Game status updates to show the winner

**Draw:**
- When all squares are filled with no winner
- Game status indicates a draw

**After Game Ends:**
- Click "Exit Game" to return to the lobby
- Create or join a new game

---

## Game Rules

### Classic Tic-Tac-Toe Rules

1. **Players**: Two players (X and O)
2. **Board**: 3x3 grid of squares
3. **Objective**: Get three of your symbols in a row

**How to Win:**
- Three horizontal in a row
- Three vertical in a row
- Three diagonal in a row

**Game States:**
- **Waiting**: Game created, waiting for second player
- **Playing**: Both players present, game in progress
- **Finished**: Game concluded (win or draw)

**Turn Order:**
- Player X always goes first
- Players alternate turns
- One move per turn

**Valid Moves:**
- Can only play in empty squares
- Cannot change a square once played
- Must wait for your turn

---

## Troubleshooting

### Common Issues and Solutions

**Cannot Log In:**
- Verify username and password are correct
- Ensure password meets minimum 6-character requirement
- Try creating a new account if forgotten credentials

**Game Code Not Working:**
- Verify the code is exactly 6 characters
- Check for correct capitalization
- Ensure the game still exists (not expired)
- Ask the creator to verify the code

**Game Not Loading:**
- Refresh your browser page
- Check your internet connection
- Clear browser cache if problems persist

**Opponent Not Joining:**
- Verify you shared the correct game code
- Try creating a new game
- Use the "Refresh List" button in the lobby

**Cannot Make a Move:**
- Confirm it's your turn (check turn indicator)
- Ensure the square is empty
- Verify game status is "Playing" not "Waiting"

**Stuck in Game:**
- Use the "Exit Game" button to return to lobby
- If button doesn't work, refresh the page and log back in

**Public Games Not Showing:**
- Click "Refresh List" button
- Create a new public game for others to join
- Try again during peak hours for more players

---

## Tips for Best Experience

1. **Stable Connection**: Ensure you have a reliable internet connection for smooth gameplay
2. **Share Codes Carefully**: When playing private games, double-check the game code before sharing
3. **Be Patient**: Wait for your opponent to join before starting play
4. **Refresh Regularly**: Use the refresh button to see the latest available public games
5. **Exit Properly**: Always use the "Exit Game" button to return to the lobby cleanly

---

## Support

If you encounter any issues not covered in this guide:
- Report bugs through the application feedback system
- Check for application updates
- Contact the development team through the appropriate channels

---

**Version**: 1.0  
**Last Updated**: November 2025  

Enjoy playing Tic-Tac-Toe!