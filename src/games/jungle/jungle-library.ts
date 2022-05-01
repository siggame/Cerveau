class Tile {
    type: string;
    isOccupied: boolean;
    piece: Piece;

    constructor(type: string, isOccupied: boolean, piece: Piece) {
        this.type = type;
        this.isOccupied = isOccupied;
        this.piece = piece;
    }

    getType() : string {
        return this.type;
    }

    setType(type: string) : void {
        this.type = type;
        return;
    }

    getIsOccupied() : boolean {
        return this.isOccupied;
    }

    setIsOccupied(isOccupied: boolean) : void {
        this.isOccupied = isOccupied;
        return;
    }

    getPiece() : Piece {
        return this.piece;
    }
}

class Piece {
  rank: number;
  color: number;

  constructor(rank: number, color: number) {
      this.rank = rank;
      this.color = color;
  }
  getRank() : number {
      return this.rank;
  }
  setRank(rank: number) : void {
      this.rank = rank;
      return;
  }
  getColor() : number {
      return this.color;
  }
  setColor(color: number) : void {
      this.color = color;
      return;
  }
}

class Gameboard {
  board: Tile[][];
  activeColor: string;
  halfmoves: integer;
  fullmoves: integer;

  constructor(board: Tile[][]) {
    this.board = board;
  }

  //copy constructor. TS doesn't have a built in copy constructor
  copy(other: Gameboard) {
    this.board = other.board;
  }

  getBoard() : Tile[][]{
      return this.board;
  }

  fenToBoard(fen: string): void {
      let fenList: string[] = fen.split(" ");
      // fenList[0] returns board set-up
      let blueprint: string = fenList[0];
      this.initBoard(blueprint);

      // fenList[1] returns active color - "b" or "r"
      //this.activeColor: string = fenList[1];
      if(fenList[1] == "b") {
          this.activeColor = 1;
      }
      else {
          this.activeColor = 2;
      }

      // fenList[2] returns number of half moves
      this.halfmoves: integer = Number(fenList[2]);

      // fenList[3] returns number of full moves
      this.fullmoves: integer = Number(fenList[3]);
      return;
  }

  initBoard(blueprint: string): void {
      var board: Tile[][]
      let rowList: string[] = fen.split("/")
      // Loop through each space in grid and set type
      for(var i = 0; i < 9; i++) {
          for(var j = 0; j < 7; j++) {
              //rowList[i][j]
              // let tempTile = Tile()
              // board[i][j] = Tile(``)
              // Set tile type based on coordinates
              if((i == 0 && j == 2) || (i == 0 && j == 4)
                  || (i == 1 && j == 3) || (i == 7 && j == 3)
                  || (i == 8 && j == 2) || (i == 8 && j == 4)) {
                      board[i][j].setType("t");
              }
              else if((i == 0 && j == 3) || (i == 8 && j == 3)) {
                  board[i][j].setType("d");
              }
              else if((i == 3 && j == 1) || (i == 3 && j == 2)
                  || (i == 3 && j == 4) || (i == 3 && j == 5)
                  || (i == 4 && j == 1) || (i == 4 && j == 2)
                  || (i == 4 && j == 4) || (i == 4 && j == 5)
                  || (i == 5 && j == 1) || (i == 5 && j == 2)
                  || (i == 5 && j == 4) || (i == 5 && j == 5)) {
                      board[i][j].setType("r");
              }
              else {
                  board[i][j].setType("b");
              }
              // Default is unoccupied
              board[i][j].setIsOccupied(False);
          }
      }
      // Now parse the fen string to set the piece info
      let board_i = 0
      let board_j = 0
      for(var i = 0; i < rowList.length; i++) {
          board_j = 0;
          for(var j = 0; j < rowList[i].length; j++) {
              // If number, skip that many locations
              if(isNumber(rowList[i][j])) {
                  board_j = board_j + Number(rowList[i][j]);
              }
              // Else, record the animal that is there
              else {
                  board[board_i][board_j].setIsOccupied(True);
                  let rank = 0;
                  let color = 1;
                  // If uppercase, then piece is Blue (1)
                  if(rowList[i][j] == rowList[i][j].toUpperCase()) {
                      color = 1;
                  }
                  // If lowercase, then piece is Red (2)
                  else {
                      color = 2;
                  }
                  rank = animalToRank[rowList[i][j].toLowerCase()];
                  board[board_i][board_j].setPiece(Piece(rank,color));
                  board_j++;
              }
          }
          board_i++;
      }
      return;
  }

  boardToFen(): string {
      let fen_str = "";
      let tempChar = "";
      let tempRank = 0;
      let tempColor = 1;
      let spaceCtr = 0;
      let board_str = "";
      let row_str = "";
      for(var i = 0; i < 9; i++) {
          for(var j = 0; j < 7; j++) {
              if(this.board[i][j].getIsOccupied()) {
                  if(spaceCtr != 0) {
                      row_str.concat(String(spaceCtr));
                  }
                  spaceCtr = 0;
                  tempRank = this.board[i][j].getRank();
                  tempColor = this.board[i][j].getColor();
                  //str3 = str1.concat(str2.toString());
                  // Get char from rank
                  tempChar = rankToAnimal[tempRank];
                  // Adjust to uppercase based on color
                  if(tempColor == 1) {
                      tempChar = tempChar.toUpperCase();
                  }
                  row_str = row_str.concat(tempChar.toString());
              }
              else {
                  spaceCtr++;
              }
          }
          board_str = board_str.concat(row_str);
          if(j < 6) {
              board_str = board_str.concat("/");
          }
          row_str = "";
          spaceCtr = 0;
      }

      //color = gameState.activeColor;
      if(this.activeColor == 1)
      {
          let color = "b";
      }
      else {
          let color = "r";
      }

      let halfmove = String(this.halfmoves);
      let fullmove = String(this.fullmoves);

      fen_str = board_str.concat(" ");
      fen_str = fen_str.concat(color.toString());
      fen_str = fen_str.concat(" ");
      fen_str = fen_Str.concat(halfmove.toString());
      fen_str = fen_str.concat(" ");
      fen_str = fen_Str.concat(fullmove.toString());
      return fen_str;
  }


  let animalToRank = {"e":8, "l":7, "t":6, "p":5, "w":4, "d":3, "c":2, "r":1};
  let rankToAnimal = {8:"e", 7:"l", 6:"t", 5:"p", 4:"w", 3:"d", 2:"c", 1:"r"};

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
  }

  let alphabetToNumber = {"g":6, "f":5, "e":4, "d":3, "c":2, "b":1, "a":0};

  // returns if a move is off the board
  function isValidMove (move: string) : boolean {
      if (alphabetToNumber[move[2]] < this.maxX) && (move[3] < this.maxY) {
          return true;
        }
      }
      else {
          return false;
      }
  }

  // move piece to a second tile and leave an empty space on the first
  function makeMove(move : string) : void {
      this.board[alphabetToNumber[move[2]][move[3]].setPiece(this.[alphabetToNumber[move[0]][move[1]].getPiece()])
      this.board[alphabetToNumber[move[2]][move[3]].setIsOccupied(true)
      this.board[alphabetToNumber[move[0]][move[1]].setPiece(0, );
      this.board[alphabetToNumber[move[0]][move[1]].setIsOccupied(false)
      return;
  }

  // predator must be higher rank than prey
  function capture(predator : Piece, prey : Piece) : bool {
      if (predator.getRank() > prey.getRank()) {
          return true;
      }
      else {
          return false;
      }
  }
}
//gameState = new Gameboard()