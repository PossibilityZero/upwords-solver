import { Trie } from '@kamilmielnik/trie';
import { PlayDirection, TileRack, Letter } from 'upwords-toolkit';
import { UBFHelper as UBF } from 'upwords-toolkit';
import { IUpwordsBoardFormat, Coord } from 'upwords-toolkit';

class UpwordsWordFinderAlgorithmSubroutines {
  static findAnchorSquares(board: IUpwordsBoardFormat): Coord[] {
    if (UBF.boardIsEmpty(board)) {
      // Return the center tiles as anchor squares for an empty board
      return [
        [4, 4],
        [4, 5],
        [5, 4],
        [5, 5]
      ];
    } else {
      // find all anchor squares
      // square can be an anchor if adjacent to an existing tile,
      // and the square itself has a stack height less than 5
      const anchors: Coord[] = [];
      for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[x]!.length; y++) {
          const height = UBF.getHeightAt(board, [x, y]);
          const adjacentTiles = UBF.getAdjacentTiles(board, [x, y]);
          if (height < 5 && adjacentTiles.some((tile) => tile.height > 0)) {
            anchors.push([x, y]);
          }
        }
      }
      return anchors;
    }
  }

  static findLeftpartLimit(
    board: IUpwordsBoardFormat,
    coord: Coord,
    direction: PlayDirection
  ): number {
    const anchorSquares = this.findAnchorSquares(board);
    let limit = 0;
    const boardEdgeLimit = coord[direction === PlayDirection.Horizontal ? 1 : 0];
    for (let i = boardEdgeLimit; i > 0; i--) {
      coord = UBF.offsetCoord(coord, direction, -1);
      // Occupied squares and anchor squares are a boundary
      if (
        UBF.getHeightAt(board, coord) > 0 ||
        anchorSquares.some((anchor) => UBF.coordsAreEqual(anchor, coord))
      ) {
        break;
      }
      limit++;
    }
    return limit;
  }

  static #findAllFreeLeftParts(trie: Trie, leftPartLimit: number, rack: TileRack): string[] {
    const foundPrefixes: string[] = [''];
    function findWordPrefixesRecursive(limit: number, rack: TileRack, prefix: string): void {
      if (limit === 0) {
        return;
      } else {
        const availableLetters: Letter[] = rack.listLetters();
        for (const letter of availableLetters) {
          const newPrefix = prefix + letter.toLowerCase();
          if (trie.hasPrefix(newPrefix)) {
            foundPrefixes.push(newPrefix);

            rack.removeTile(letter, 1);
            findWordPrefixesRecursive(limit - 1, rack, newPrefix);
            rack.addTile(letter, 1);
          }
        }
      }
    }
    // technically the rack should be restored after all the recursive calls,
    // but take a copy to ensure that the original TileRack object is not mutated
    findWordPrefixesRecursive(leftPartLimit, rack.copyToNewRack(), '');
    return foundPrefixes;
  }

  static findLeftParts(
    trie: Trie,
    board: IUpwordsBoardFormat,
    anchor: Coord,
    direction: PlayDirection,
    rack: TileRack
  ): string[] {
    const limit = this.findLeftpartLimit(board, anchor, direction);
    if (limit === 0) {
      if (isFrontEdgeOfBoard(anchor, direction)) {
        return [''];
      }
      const word = UBF.findWord(board, UBF.offsetCoord(anchor, direction, -1), direction);
      const anchorIndex = word.findIndex(
        (tile) => tile.coord[0] === anchor[0] && tile.coord[1] === anchor[1]
      );
      if (anchorIndex > 0) {
        return [
          word
            .slice(0, anchorIndex)
            .map((tile) => tile.letter)
            .join('')
        ];
      } else {
        return [word.map((tile) => tile.letter).join('')];
      }
    } else {
      const freeLeftParts = this.#findAllFreeLeftParts(trie, limit, rack);
      return [...freeLeftParts];
    }
  }
}

function isFrontEdgeOfBoard(coord: Coord, direction: PlayDirection): boolean {
  return direction === PlayDirection.Vertical ? coord[0] === 0 : coord[1] === 0;
}

export { UpwordsWordFinderAlgorithmSubroutines };
