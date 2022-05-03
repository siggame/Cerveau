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

    setPiece(piece: Piece) : void {
        this.piece.copyPiece(piece);
        return;
    }
}

class Piece {
  rank: number;
  color: string;

  constructor(rank: number, color: string) {
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
  getColor() : string {
      return this.color;
  }
  setColor(color: string) : void {
      this.color = color;
      return;
  }
  copyPiece(source: Piece) : void {
    this.rank = source.getRank();
    this.color = source.getColor();
    return;
  }
}

class Gameboard {
  board: Tile[][];
  activeColor: string;
  halfMoves: number;
  fullMoves: number;
  maxX: number;
  maxY: number;

  constructor(board: Tile[][], activeColor: string, halfMoves: number, fullMoves: number, maxX: number, maxY: number) {
    this.board = board;
    this.activeColor = activeColor;
    this.halfMoves = halfMoves;
    this.fullMoves = fullMoves;
    this.maxX = maxX;
    this.maxY = maxY;
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
          this.activeColor = "b";
      }
      else {
          this.activeColor = "r";
      }

      // fenList[2] returns number of half moves
      this.halfMoves = Number(fenList[2]);

      // fenList[3] returns number of full moves
      this.fullMoves = Number(fenList[3]);
      return;
  }
  

  animalToRank(character: string) {
    let animals: string = 'rcdwptle'
    //Check if animal is on a trap
    return animals.indexOf(character) + 1
  }


  rankToAnimal(rank: number) {
    let listRank: number = rank-1 
    let animals: string = 'rcdwptle'
    //Check if animal is on a trap
    return animals[listRank]
  }


  initBoard(blueprint: string): void {
      let rowList: string[] = blueprint.split("/")
      // Loop through each space in grid and set type
      for(let row = 0; row < 9; row++) {
          for(var col = 0; col < 7; col++) {
            //set trap tiles to traps
              if((row == 0 && col == 2) || (row == 0 && col == 4)
                  || (row == 1 && col == 3) || (row == 7 && col == 3)
                  || (row == 8 && col == 2) || (row == 8 && col == 4)) {
                      this.board[row][col].setType("t");
              }
              //set den tiles to dens
              else if((row == 0 && col == 3) || (row == 8 && col == 3)) {
                  this.board[row][col].setType("d");
              }
              //set river tiles to river
              else if((row == 3 && col == 1) || (row == 3 && col == 2)
                  || (row == 3 && col == 4) || (row == 3 && col == 5)
                  || (row == 4 && col == 1) || (row == 4 && col == 2)
                  || (row == 4 && col == 4) || (row == 4 && col == 5)
                  || (row == 5 && col == 1) || (row == 5 && col == 2)
                  || (row == 5 && col == 4) || (row == 5 && col == 5)) {
                      this.board[row][col].setType("r");
              }
              //set blank tiles to blank
              else {
                  this.board[row][col].setType("b");
              }
              // Default is unoccupied
              this.board[row][col].setIsOccupied(false);
          }
      }

      
      // Now parse the fen string to set the piece info for each location
      let boardRow = 0
      let boardCol = 0
      for(var row = 0; row < rowList.length; row++) {
          boardCol = 0;
          for(var col = 0; col < rowList[row].length; col++) {
              // If number, skip that many locations
              if(this.isNumber(rowList[row][col])) {
                  boardCol = boardCol + Number(rowList[row][col]);
              }
              // Else, record the animal that is there
              else {
                  this.board[boardRow][boardCol].setIsOccupied(true);
                  let rank: number = 0;
                  let color: string;
                  // If uppercase, then piece is Blue (1)
                  if(rowList[row][col] == rowList[row][col].toUpperCase()) {
                      color = 'b';
                  }
                  // If lowercase, then piece is Red (2)
                  else {
                      color = 'r';
                  }
                  rank = this.animalToRank(rowList[row][col]);
                  this.board[boardRow][boardCol].setPiece(new Piece(rank,color));
                  boardCol++;
              }
          }
          boardRow++;
      }
      return;
  }

  boardToFen(): string {
      let fen_str = "";
      let tempChar = "";
      let tempRank = 0;
      let tempColor: string;
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
                  tempRank = this.board[i][j].getPiece().getRank();
                  tempColor = this.board[i][j].getPiece().getColor();
                  //str3 = str1.concat(str2.toString());
                  // Get char from rank
                  tempChar = this.rankToAnimal(tempRank)
                  // Adjust to uppercase based on color
                  if(tempColor == 'b') {
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

      let halfmove = String(this.halfMoves);
      let fullmove = String(this.fullMoves);

      fen_str = board_str.concat(" ");
      fen_str = fen_str.concat(this.activeColor);
      fen_str = fen_str.concat(" ");
      fen_str = fen_str.concat(halfmove.toString());
      fen_str = fen_str.concat(" ");
      fen_str = fen_str.concat(fullmove.toString());
      return fen_str;
  }


  isNumber(n: string) {
    if (typeof(n[0]) == typeof(3)) {
      return true
    }
    else {
      return false
    }
  }

  alphabetToNumber(character: string) : number {
    let char: string[] = ['abcdefg'];
    return char.indexOf(character) + 1;
  }

  // returns if a move is off the board
  isValidMove (move: string) : boolean {
    
    // cannot move off the board
    if (this.alphabetToNumber(move[2]) > this.maxX && Number(move[3]) > this.maxY) {
      return false;
    }
    // cannot move onto water unless piece is of rank 1, the mouse
    if (this.board[this.alphabetToNumber(move[2])][Number(move[3])].getType() == "w" && this.board[this.alphabetToNumber(move[0])][Number(move[1])].getPiece().getRank() != 1) {
      return false;
    }
    // cannot move onto higher rank piece, that would be suicide
    if (this.board[this.alphabetToNumber(move[2])][Number(move[3])].isOccupied && !this.isCapture(this.board[this.alphabetToNumber(move[0])][Number(move[1])].getPiece(), this.board[this.alphabetToNumber(move[2])][Number(move[3])].getPiece())) {
      return false;
    }
    return true;
  }

  // predator must be higher rank than prey
  isCapture(predator : Piece, prey : Piece) : boolean {
      if (predator.getRank() > prey.getRank()) {
          return true;
      }
      else {
          return false;
      }
  }

  UCIToCoords(uci: string) {
    let beginFile: string = uci[0]
    let beginRank: string = uci[1]
    let endFile: string = uci[2]
    let endRank: string = uci[3]
    let files: string = 'abcdefg'
    let ranks: string = '123456789'
    let coords: number[] = [files.indexOf(beginFile), ranks.indexOf(beginRank), files.indexOf(endFile), ranks.indexOf(endRank)]
    return coords
 }

 inDen(): boolean {
    if(this.activeColor == "b") {
        if((this.board[0][3]).isOccupied) {
            return true;
        }
    }
    else {
        if((this.board[8][3]).isOccupied) {
            return true;
        }
    }
    return false;
 }

 inTrap(): boolean {
    if(this.activeColor == "b") {
         if(((this.board[0][2]).isOccupied) || ((this.board[1][3]).isOccupied) || ((this.board[0][4]).isOccupied)) {
             return true;
         }
     }
     else {
         if(((this.board[8][2]).isOccupied) || ((this.board[7][3]).isOccupied) || ((this.board[8][4]).isOccupied)) {
             return true;
         }
     }
     return false;
 }

 coordToUCI(coord: number[]) {
    let files: string = 'abcdefg';
    let ranks: string = '123456789';
    let file: string = files[coord[0]];
    let rank: string = ranks[coord[1]];
    return file.concat(rank);
  }

 getAllMoves(): string[] {
    let move_list: string[] = [];
    let i_offsets: number[] = [-1, 1];
    let j_offsets: number[] = [-1, 1];
      // Loop over all locations in grid
      for(let row = 0; row < 9; row++) {
          for(let col = 0; col < 7; col++) {
              // If the cell is occupied
              if((this.board[row][col]).isOccupied) {
                  // If the cell contains our own piece, generate its moves
                  if((this.board[row][col]).piece.color == this.activeColor) {
                      let startUCI: string = this.coordToUCI([row,col]);
                      for(let i = 0; i < 2; i ++) {
                          for(let j = 0; j < 2; j++) {
                              let endUCI: string = this.coordToUCI([row+i_offsets[i],col+j_offsets[j]]);
                              //
                              let moveUCI: string = startUCI.concat(endUCI);
                              if(this.isValidMove(moveUCI)) {
                                  move_list.push(moveUCI)
                              }
                          }
                      }
                  }
              }
          }
      }
    return move_list
  }
}
//gameState = new Gameboard()