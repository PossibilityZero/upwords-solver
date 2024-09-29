import { jest } from '@jest/globals';

import { UBFHelper, PlayDirection, UpwordsPlay } from 'upwords-toolkit';
import { UpwordsCrossCheckManager } from './crossCheckManager';
import { Trie } from '@kamilmielnik/trie';

function makePlay(tiles: string, start: [number, number], direction: PlayDirection): UpwordsPlay {
  return {
    tiles,
    start,
    direction
  };
}
describe('UpwordsCrossCheckManager', () => {
  beforeAll(() => {
    jest.mock('@kamilmielnik/trie');
    jest.spyOn(Trie.prototype, 'has').mockImplementation((word: string) => {
      return testWordList.includes(word);
    });
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
  const testTrie = new Trie();

  const testWordList = ['hello', 'cello', 'world', 'he', 'hi', 'me'];
  const simpleUBF = [
    ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
    ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
    ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
    ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '1W', '0 ', '0 '],
    ['0 ', '0 ', '0 ', '1H', '1E', '1L', '1L', '2O', '0 ', '0 '],
    ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '1R', '0 ', '0 '],
    ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '1L', '0 ', '0 '],
    ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '1D', '0 ', '0 '],
    ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
    ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ']
  ];

  describe('constructor', () => {
    it('should initialize to an empty board state', () => {
      const crossCheck = new UpwordsCrossCheckManager(testTrie);
      expect(UBFHelper.boardIsEmpty(crossCheck.board)).toBe(true);
    });

    it('should take a Trie as a parameter', () => {
      new UpwordsCrossCheckManager(testTrie);
    });
  });

  describe('addMove', () => {
    it('should update the board state with a new move', () => {
      const crossCheck = new UpwordsCrossCheckManager(testTrie);
      crossCheck.addMove(makePlay('HELLO', [4, 3], PlayDirection.Horizontal));
      expect(UBFHelper.getTileAt(crossCheck.board, [4, 3])).toEqual('1H');
      crossCheck.addMove(makePlay('WORLD', [3, 7], PlayDirection.Vertical));
      expect(crossCheck.board).toEqual(simpleUBF);
    });
  });

  describe('setBoard', () => {
    it('should set the board state to a given board', () => {
      const crossCheck = new UpwordsCrossCheckManager(testTrie);
      crossCheck.board = simpleUBF;
      expect(crossCheck.board).toEqual(simpleUBF);
    });
  });

  describe('getCrossCheck', () => {
    it('should return the valid letters for a given square', () => {
      const crossCheck = new UpwordsCrossCheckManager(testTrie);
      crossCheck.board = simpleUBF;

      const validLetters1 = crossCheck.getCrossCheck([5, 3], PlayDirection.Vertical);
      expect(validLetters1).toHaveLength(2);
      expect(validLetters1).toEqual(expect.arrayContaining(['E', 'I']));

      const validLetters2 = crossCheck.getCrossCheck([3, 4], PlayDirection.Vertical);
      expect(validLetters2).toHaveLength(2);
      expect(validLetters2).toEqual(expect.arrayContaining(['M', 'H']));

      const validLetters3 = crossCheck.getCrossCheck([6, 8], PlayDirection.Horizontal);
      expect(validLetters3).toHaveLength(0);
    });

    it('should return an empty array for a square with height 5', () => {
      const crossCheck = new UpwordsCrossCheckManager(testTrie);
      let testBoard = UBFHelper.placeSingleTile(simpleUBF, 'O', [4, 7]); // height 3
      testBoard = UBFHelper.placeSingleTile(testBoard, 'O', [4, 7]); // height 4
      testBoard = UBFHelper.placeSingleTile(testBoard, 'O', [4, 7]); // height 5
      crossCheck.board = testBoard;

      const validLetters = crossCheck.getCrossCheck([4, 7], PlayDirection.Vertical);
      expect(validLetters).toHaveLength(0);
    });

    it('should return the entire alphabet for a square with no adjacent tiles', () => {
      const crossCheck = new UpwordsCrossCheckManager(testTrie);
      crossCheck.board = simpleUBF;

      const validLetters = crossCheck.getCrossCheck([5, 3], PlayDirection.Horizontal);
      expect(validLetters).toHaveLength(26);
    });

    it('should not return the current letter of the square', () => {
      const crossCheck = new UpwordsCrossCheckManager(testTrie);
      crossCheck.board = simpleUBF;

      const validLetters = crossCheck.getCrossCheck([4, 3], PlayDirection.Horizontal);
      expect(validLetters).toHaveLength(1);
      expect(validLetters).toEqual(expect.arrayContaining(['C']));
    });
  });
});
