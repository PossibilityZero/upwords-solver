import { IUpwordsBoardFormat, BoardWord, TileSet } from 'upwords-toolkit';

class UpwordsWordFinder {
  static findAllPossiblePlays(board: IUpwordsBoardFormat, tiles: TileSet): BoardWord[] {
    console.log(board, tiles);
    return [];
  }
}

export { UpwordsWordFinder };
