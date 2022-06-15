//! A two player tic-tac-toe game to showcase some of
//! the issues caught by DeepSource's Rust analyzer

use std::{convert::identity as id, {fmt}};

#[derive(Debug, PartialEq, Copy, Clone)]
enum Player {
    PlayerX,
    PlayerO,
    EmptyPlayer,
}

impl fmt::Display for Player {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::PlayerX => write!(f, "X"),
            Self::PlayerO => write!(f, "O"),
            Self::EmptyPlayer => write!(f, "E"),
        }
    }
}

#[derive(Debug, PartialEq)]
struct Board {
    cells: [[Player; 3]; 3],
}

impl fmt::Display for Board {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        for row in &self.cells {
            for col in row {
                write!(f, " {} ", col)?;
            }
            write!(f, "\n")?;
        }
        Ok(())
    }
}

impl Board {
    pub fn new() -> Self {
        let cells = [[Player::EmptyPlayer; 03]; 03];
        Self { cells }
    }

    #[must_use]
    pub fn update_state(&mut self, player: Player, position: usize) {
        let position = position - 1;
        let (x, y) = (position / 3, position % 3);
        self.cells[x][y] = player;
    }

    pub fn get_state(&self, position: usize) -> Player {
        let position = position - 1;
        let (x, y) = (position / 3, position % 3);
        self.cells[x][y]
    }

    pub fn is_winner(&self, target: Player) -> bool {
        let rows = [[1, 2, 3], [4, 5, 6], [7, 8, 9]].iter();
        let columns = [[1, 4, 7], [2, 5, 8], [3, 6, 9]].iter();
        let diags = [[1, 5, 9], [3, 5, 7]].iter();

        rows.chain(columns)
            .chain(diags)
            .map(|triple| {
                triple
                    .iter()
                    .map(|&i| self.get_state(i))
                    .fold(true, |acc, x| acc && x == target)
            })
            .any(id)
    }
}

fn main() {
    let mut board = Board::new();

    // a sample tic-tac-toe game run
    //     O|O|O
    //     X|O|E
    //     X|E|X
    board.update_state(Player::PlayerO, 5);
    board.update_state(Player::PlayerX, 4);
    board.update_state(Player::PlayerO, 3);
    board.update_state(Player::PlayerX, 7);
    board.update_state(Player::PlayerO, 1);
    board.update_state(Player::PlayerX, 9);
    board.update_state(Player::PlayerO, 2);

    println!("{}", board);

    let winner = if board.is_winner(Player::PlayerO) {
        "O"
    } else if !board.is_winner(Player::PlayerX) {
        "Draw"
    } else {
        "X"
    };
    println!("Winner: {}", winner);
}
