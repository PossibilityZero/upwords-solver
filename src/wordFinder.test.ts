import { TileRack } from 'upwords-toolkit';
import { UpwordsWordFinder } from './wordFinder';

describe('UpwordsWordFinder', () => {
  it('finds all starting moves', () => {
    const wordList = ['test'];
    UpwordsWordFinder.init(wordList);
    const blankUBF = [
      ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ']
    ];
    const tiles = new TileRack();
    tiles.addTiles({ T: 2, E: 1, S: 1, Z: 3 });

    const plays = UpwordsWordFinder.findAllPossiblePlays(blankUBF, tiles);

    expect(plays).toHaveLength(20);
  });

  it('should return correct location of available plays', () => {
    const wordList = ['test'];
    UpwordsWordFinder.init(wordList);
    const blankUBF = [
      ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '1T', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '1E', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '1S', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '1T', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
      ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ']
    ];
    const tiles = new TileRack();
    tiles.addTiles({ T: 1, E: 1, S: 1, Z: 4 });

    const plays = UpwordsWordFinder.findAllPossiblePlays(blankUBF, tiles);
    const expectedStartSquares = [
      [3, 1],
      [3, 4],
      [6, 1],
      [6, 4]
    ];

    expect(plays).toHaveLength(4);
    for (const start of expectedStartSquares) {
      expect(plays.some((play) => numArraysEqual(play.start, start))).toBe(true);
    }
  });
});

function numArraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
