import {
  IUpwordsBoardFormat,
  TileRack,
  PlayDirection,
  UpwordsPlay,
  UBFHelper,
  Letter,
  Coord
} from 'upwords-toolkit';
import { Trie } from '@kamilmielnik/trie';
import { UpwordsWordFinderAlgorithmSubroutines as Subroutines } from './helpers/algorithmSubroutines.js';
import { UpwordsCrossCheckManager } from './helpers/crossCheckManager.js';

const ACROSS = PlayDirection.Horizontal;
const DOWN = PlayDirection.Vertical;

class UpwordsWordFinder {
  private static wordTrie: Trie;
  static init(wordList: string[]): void {
    this.wordTrie = new Trie();
    wordList.forEach((word) => {
      this.wordTrie.add(word.toUpperCase());
    });
  }

  static findAllPossiblePlays(board: IUpwordsBoardFormat, rack: TileRack): UpwordsPlay[] {
    const anchors = Subroutines.findAnchorSquares(board);
    const crossChecker = new UpwordsCrossCheckManager(this.wordTrie);
    const words: UpwordsPlay[] = [];
    crossChecker.board = board;
    for (const anchor of anchors) {
      for (const dir of [ACROSS, DOWN]) {
        const usesRack = Subroutines.findLeftpartLimit(board, anchor, dir) > 0;
        Subroutines.findLeftParts(this.wordTrie, board, anchor, dir, rack).forEach((part) => {
          words.push(
            ...this.#findMatchingRightParts(board, crossChecker, rack, anchor, dir, part, usesRack)
          );
        });
      }
    }
    return words.map((word) => useOnlyRackTiles(word, board));
  }

  static #findMatchingRightParts(
    board: IUpwordsBoardFormat,
    crossChecker: UpwordsCrossCheckManager,
    rack: TileRack,
    anchor: Coord,
    direction: PlayDirection,
    leftPart: string,
    usesRack: boolean
  ): UpwordsPlay[] {
    const leftPartNode = this.wordTrie.find(leftPart);
    if (!leftPartNode) {
      return [];
    }
    const leftPartTiles = usesRack ? withholdTiles(rack, leftPart) : null;
    const fullWords = Subroutines.extendRight(
      leftPartNode,
      crossChecker,
      rack,
      board,
      direction,
      anchor,
      leftPart
    );
    addBackWithheldTiles(rack, leftPartTiles);
    return fullWords.map((fullWord) => ({
      tiles: fullWord.toUpperCase(),
      start: UBFHelper.offsetCoord(anchor, direction, -leftPart.length),
      direction
    }));
  }
}

export { UpwordsWordFinder };

function withholdTiles(rack: TileRack, tilesString: string): TileRack {
  const withheldTiles = new TileRack();
  for (const letter of tilesString) {
    rack.removeTile(letter.toUpperCase() as Letter, 1);
    withheldTiles.addTiles({ [letter.toUpperCase()]: 1 });
  }
  return withheldTiles;
}

function addBackWithheldTiles(rack: TileRack, withheldTiles: TileRack | null): TileRack {
  if (!withheldTiles) {
    return rack;
  }
  for (const letter of withheldTiles.listTiles()) {
    rack.addTile(letter as Letter, 1);
  }
  return rack;
}

function useOnlyRackTiles(play: UpwordsPlay, board: IUpwordsBoardFormat): UpwordsPlay {
  const tiles = play.tiles.split('');
  let newTiles = '';
  for (let i = 0; i < tiles.length; i++) {
    const coord = UBFHelper.offsetCoord(play.start, play.direction, i);
    if (UBFHelper.getLetterAt(board, coord) !== play.tiles[i]) {
      newTiles += tiles[i];
    } else {
      newTiles += ' ';
    }
  }
  return { ...play, tiles: newTiles };
}
