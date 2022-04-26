class Gameboard {

}

class Tile {
    type: string;
    isOccupied: boolean;
    piece: Piece;

    getType() : string {
        return this.type
    }

    setType(type) : void {
        this.type = type
        return
    }

    getIsOccupied() : boolean {
        return this.isOccupied
    }

    setIsOccupied(isOccupied) : void {
        this.isOccupied = isOccupied
        return
    }

    getPiece() : Piece {
        return this.piece
    }
}

class Piece {


}