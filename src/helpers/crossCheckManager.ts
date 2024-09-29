import { Trie } from '@kamilmielnik/trie';
import { IUpwordsBoardFormat, Coord, UBFHelper, UpwordsPlay, PlayDirection } from 'upwords-toolkit';

const ENGLISH_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function coordToString(coord: Coord): string {
  return coord.join(',');
}

class UpwordsCrossCheckManager {
  private boardState: IUpwordsBoardFormat;
  private wordTrie: Trie;
  private crossChecksVertical: Map<string, string[]>;
  private crossChecksHorizontal: Map<string, string[]>;

  constructor(wordTrie: Trie) {
    this.boardState = UBFHelper.createEmptyBoard();
    this.wordTrie = wordTrie;
    this.crossChecksVertical = new Map();
    this.crossChecksHorizontal = new Map();
  }

  get board(): IUpwordsBoardFormat {
    return UBFHelper.copyBoard(this.boardState);
  }

  set board(board: IUpwordsBoardFormat) {
    this.boardState = UBFHelper.copyBoard(board);
    this.#computeCrossChecks();
  }

  addMove(play: UpwordsPlay): void {
    this.boardState = UBFHelper.placeTiles(this.boardState, play);
    this.#computeCrossChecks();
  }

  getCrossCheck(square: Coord, direction: PlayDirection): string[] {
    if (direction === PlayDirection.Horizontal) {
      return this.crossChecksHorizontal.get(coordToString(square)) || [];
    } else {
      return this.crossChecksVertical.get(coordToString(square)) || [];
    }
  }

  #computeCrossChecks(): void {
    this.crossChecksHorizontal.clear();
    this.crossChecksVertical.clear();
    for (let x = 0; x < this.boardState.length; x++) {
      for (let y = 0; y < this.boardState[x]!.length; y++) {
        const horizontal = this.#computeCrossCheckSquare([x, y], PlayDirection.Horizontal);
        this.crossChecksHorizontal.set(coordToString([x, y]), horizontal);
        const vertical = this.#computeCrossCheckSquare([x, y], PlayDirection.Vertical);
        this.crossChecksVertical.set(coordToString([x, y]), vertical);
      }
    }
  }

  #computeCrossCheckSquare(square: Coord, direction: PlayDirection): string[] {
    if (UBFHelper.getHeightAt(this.boardState, square) === 5) {
      return [];
    }
    const dummyBoard = UBFHelper.placeSingleTile(this.boardState, '#', square);
    const wildcardWord = UBFHelper.findWord(dummyBoard, square, direction).reduce((acc, tile) => {
      acc += tile.letter;
      return acc;
    }, '');

    if (wildcardWord === '#') {
      return [...ENGLISH_ALPHABET];
    }

    const allowedLetters: string[] = [];
    const currentLetter = UBFHelper.getLetterAt(this.boardState, square);
    for (const letter of ENGLISH_ALPHABET) {
      if (letter === currentLetter) {
        continue;
      }
      if (this.wordTrie.has(wildcardWord.replace('#', letter).toLowerCase())) {
        allowedLetters.push(letter);
      }
    }
    return allowedLetters;
  }
}

export { UpwordsCrossCheckManager };
