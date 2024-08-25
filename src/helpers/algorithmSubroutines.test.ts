import { PlayDirection, UBFHelper, TileRack, Coord } from 'upwords-toolkit';
import { UpwordsWordFinderAlgorithmSubroutines as AlgorithmSubroutines } from './algorithmSubroutines';
import { Trie } from '@kamilmielnik/trie';

describe('AlgorithmSubroutines', () => {
  const simpleUBF = [
    ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
    ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '1S', '0 '],
    ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '1E', '0 '],
    ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '1W', '1E', '0 '],
    ['0 ', '0 ', '0 ', '1H', '1E', '1L', '1L', '2O', '0 ', '0 '],
    ['0 ', '0 ', '0 ', '1A', '0 ', '0 ', '0 ', '1R', '0 ', '0 '],
    ['0 ', '0 ', '0 ', '1S', '0 ', '0 ', '0 ', '1L', '0 ', '0 '],
    ['0 ', '0 ', '0 ', '1H', '0 ', '0 ', '0 ', '1D', '0 ', '0 '],
    ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
    ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ']
  ];

  describe('findAnchorSquares', () => {
    // Anchor squares are defined as the topmost/leftmost point of adjacency to existing tiles
    it('should return the center tiles as anchor squares for an empty board', () => {
      const board = UBFHelper.createEmptyBoard();
      const anchors = AlgorithmSubroutines.findAnchorSquares(board);
      const expected = [
        [4, 4],
        [4, 5],
        [5, 4],
        [5, 5]
      ];
      expect(anchors).toEqual(expect.arrayContaining(expected));
    });

    it('should return anchor squares given a board', () => {
      const board = UBFHelper.copyBoard(simpleUBF);
      const anchors = AlgorithmSubroutines.findAnchorSquares(board);
      const expected = [
        [2, 7],
        [3, 3],
        [3, 4],
        [3, 5],
        [3, 6],
        [3, 7],
        [3, 8],
        [4, 2],
        [4, 3],
        [4, 4],
        [4, 5],
        [4, 6],
        [4, 7],
        [4, 8],
        [5, 3],
        [5, 4],
        [5, 5],
        [5, 6],
        [5, 7],
        [5, 8],
        [6, 6],
        [6, 7],
        [6, 8],
        [7, 6],
        [7, 7],
        [7, 8],
        [8, 7]
      ];
      expect(anchors).toEqual(expect.arrayContaining(expected));
    });

    it('should not return squares which are of height 5', () => {
      const testUBF = [
        ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
        ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
        ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
        ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
        ['0 ', '0 ', '0 ', '5T', '1E', '5S', '1T', '0 ', '0 ', '0 '],
        ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
        ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
        ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
        ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 '],
        ['0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ', '0 ']
      ];
      const anchors = AlgorithmSubroutines.findAnchorSquares(testUBF);
      expect(anchors).not.toEqual(
        expect.arrayContaining([
          [4, 3],
          [4, 5]
        ])
      );
    });
  });

  describe('findLeftpartLimit', () => {
    describe('case where the immediate former square is occupied', () => {
      it('should return 0 because the word cannot be extended leftwards', () => {
        const board = UBFHelper.copyBoard(simpleUBF);
        const limit = AlgorithmSubroutines.findLeftpartLimit(
          board,
          [5, 8],
          PlayDirection.Horizontal
        );
        expect(limit).toBe(0);
      });
    });

    describe('case where the limit is the edge of the board', () => {
      it('should return the number of empty squares to the left', () => {
        const board = UBFHelper.copyBoard(simpleUBF);
        const limit = AlgorithmSubroutines.findLeftpartLimit(
          board,
          [3, 3],
          PlayDirection.Horizontal
        );
        expect(limit).toBe(3);
      });

      it('should return the number of squares to the top for vertical plays', () => {
        const board = UBFHelper.copyBoard(simpleUBF);
        const limit = AlgorithmSubroutines.findLeftpartLimit(board, [3, 4], PlayDirection.Vertical);
        expect(limit).toBe(3);
      });

      it('should return 0 if the square is at the edge of the board', () => {
        const board = UBFHelper.copyBoard(simpleUBF);
        const limit = AlgorithmSubroutines.findLeftpartLimit(board, [0, 8], PlayDirection.Vertical);
        expect(limit).toBe(0);
      });
    });

    describe('case where the limit is due to another anchor square', () => {
      it('should return the number of square up to and not including the first anchor square', () => {
        const board = UBFHelper.copyBoard(simpleUBF);
        const limit = AlgorithmSubroutines.findLeftpartLimit(
          board,
          [6, 6],
          PlayDirection.Horizontal
        );
        expect(limit).toBe(1);
      });
    });
  });

  describe('findLeftParts', () => {
    test.each([
      { anchor: [3, 9], expected: ['WE'], direction: PlayDirection.Horizontal },
      { anchor: [2, 9], expected: ['E'], direction: PlayDirection.Horizontal },
      { anchor: [5, 4], expected: ['A'], direction: PlayDirection.Horizontal },
      { anchor: [5, 4], expected: ['E'], direction: PlayDirection.Vertical },
      { anchor: [6, 3], expected: ['HA'], direction: PlayDirection.Vertical }
    ])(
      'should return what is currently on the board if it immediately precedes the anchor square: $anchor -> $expected',
      ({ anchor, expected, direction }) => {
        const testTrie = new Trie();
        const testRack = new TileRack();
        const board = UBFHelper.copyBoard(simpleUBF);

        const leftParts = AlgorithmSubroutines.findLeftParts(
          testTrie,
          board,
          anchor as Coord,
          direction,
          testRack
        );

        expect(leftParts).toHaveLength(1);
        expect(leftParts).toEqual(expect.arrayContaining(expected));
      }
    );

    test.each([
      {
        subtest: 'more empty spaces than the longest valid word',
        anchor: [2, 7],
        direction: PlayDirection.Horizontal,
        expected: ['', 'h', 'he', 'hel']
      },
      {
        subtest: 'fewer empty spaces than the longest valid word',
        anchor: [6, 6],
        direction: PlayDirection.Horizontal,
        expected: ['', 'h']
      }
    ])('should find valid prefixes: $subtest', ({ anchor, direction, expected }) => {
      const testWordList = ['hello', 'ham', 'he', 'test'];
      const testTrie = new Trie();
      testWordList.forEach((word) => testTrie.add(word));
      const board = UBFHelper.copyBoard(simpleUBF);
      const rack = new TileRack();
      rack.addTiles({ H: 1, E: 1, L: 1, Z: 4 });

      const foundLeftParts = AlgorithmSubroutines.findLeftParts(
        testTrie,
        board,
        anchor as Coord,
        direction,
        rack
      );
      expect(foundLeftParts).toHaveLength(expected.length);
      // don't include 'hell' because the rack only has one 'L'
      // include the empty prefix ''
      expect(foundLeftParts).toEqual(expect.arrayContaining(expected));
    });

    it('should return an array with an empty string if the anchor square is at the edge of the board', () => {
      const testTrie = new Trie();
      const testRack = new TileRack();
      const board = UBFHelper.copyBoard(simpleUBF);
      const anchor: Coord = [0, 8];
      const direction = PlayDirection.Vertical;

      const leftParts = AlgorithmSubroutines.findLeftParts(
        testTrie,
        board,
        anchor,
        direction,
        testRack
      );

      expect(leftParts).toHaveLength(1);
      expect(leftParts).toEqual(expect.arrayContaining(['']));
    });
  });
});
