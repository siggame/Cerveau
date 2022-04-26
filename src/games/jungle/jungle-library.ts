class Gameboard {

}

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


}