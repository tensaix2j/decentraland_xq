
/*
 * Copyright (c) 2020, lengyanyu258 (lengyanyu258@outlook.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *	this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *	this list of conditions and the following disclaimer in the documentation
 *	and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 *----------------------------------------------------------------------------*/
/* minified license below  */
/* @license
 * Copyright (c) 2020, lengyanyu258 (lengyanyu258@outlook.com)
 * Released under the BSD license
 * https://github.com/lengyanyu258/xiangqi.js/blob/master/LICENSE 
//-----------------------------------------------------------------------
	
	Typescript version
	Copyright (c) 2020, tensaix2j (tensaix2j@gmail.com)   

 */


export class Xiangqi {

	public BLACK = 'b';
	public RED = 'r';
	public EMPTY = -1;
	public PAWN = 'p';
	public CANNON = 'c';
	public ROOK = 'r';
	public KNIGHT = 'n';
	public BISHOP = 'b';
	public ADVISER = 'a';
	public KING = 'k';
	public SYMBOLS = 'pcrnbakPCRNBAK';
	public DEFAULT_POSITION = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 1';
	public POSSIBLE_RESULTS = Object.freeze(['1-0', '0-1', '1/2-1/2', '*']);
	public PAWN_OFFSETS = Object.freeze({
		b: [0x10, -0x01, 0x01],
		r: [-0x10, -0x01, 0x01]
	});
	public PIECE_OFFSETS = Object.freeze({
		c: [-0x10, 0x10, -0x01, 0x01],
		r: [-0x10, 0x10, -0x01, 0x01],
		n: [-0x20 - 0x01, -0x20 + 0x01, 0x20 - 0x01, 0x20 + 0x01,
			-0x10 - 0x02, 0x10 - 0x02, -0x10 + 0x02, 0x10 + 0x02],
		b: [-0x20 - 0x02, 0x20 + 0x02, 0x20 - 0x02, -0x20 + 0x02],
		a: [-0x10 - 0x01, 0x10 + 0x01, 0x10 - 0x01, -0x10 + 0x01],
		k: [-0x10, 0x10, -0x01, 0x01]
	});
	public FLAGS = Object.freeze({
		NORMAL: 'n',
		CAPTURE: 'c'
	});
	public BITS = Object.freeze({
		NORMAL: 1,
		CAPTURE: 2
	});
	public SQUARES = Object.freeze({
		a9: 0x00, b9: 0x01, c9: 0x02, d9: 0x03, e9: 0x04, f9: 0x05, g9: 0x06, h9: 0x07, i9: 0x08,
		a8: 0x10, b8: 0x11, c8: 0x12, d8: 0x13, e8: 0x14, f8: 0x15, g8: 0x16, h8: 0x17, i8: 0x18,
		a7: 0x20, b7: 0x21, c7: 0x22, d7: 0x23, e7: 0x24, f7: 0x25, g7: 0x26, h7: 0x27, i7: 0x28,
		a6: 0x30, b6: 0x31, c6: 0x32, d6: 0x33, e6: 0x34, f6: 0x35, g6: 0x36, h6: 0x37, i6: 0x38,
		a5: 0x40, b5: 0x41, c5: 0x42, d5: 0x43, e5: 0x44, f5: 0x45, g5: 0x46, h5: 0x47, i5: 0x48,
		a4: 0x50, b4: 0x51, c4: 0x52, d4: 0x53, e4: 0x54, f4: 0x55, g4: 0x56, h4: 0x57, i4: 0x58,
		a3: 0x60, b3: 0x61, c3: 0x62, d3: 0x63, e3: 0x64, f3: 0x65, g3: 0x66, h3: 0x67, i3: 0x68,
		a2: 0x70, b2: 0x71, c2: 0x72, d2: 0x73, e2: 0x74, f2: 0x75, g2: 0x76, h2: 0x77, i2: 0x78,
		a1: 0x80, b1: 0x81, c1: 0x82, d1: 0x83, e1: 0x84, f1: 0x85, g1: 0x86, h1: 0x87, i1: 0x88,
		a0: 0x90, b0: 0x91, c0: 0x92, d0: 0x93, e0: 0x94, f0: 0x95, g0: 0x96, h0: 0x97, i0: 0x98
	});
	public board = new Array(256);
	public kings = { r: this.EMPTY, b: this.EMPTY };
	public turn = this.RED;
	public half_moves = 0;
	public move_number = 1;
	public history = [];
	public header = {};


	//------------------------------
	constructor( fen:string ) {

		/* if the user passes in a fen string, load it, else default to starting position */
		if ( fen == null ) {
			this.load(this.DEFAULT_POSITION , false );
		} else {
			this.load(fen , false );
		}
	}


	//---------------------------
	public result(err_num) {
		var errors = {
			0: 'No errors.',
			1: 'FEN string must contain six space-delimited fields.',
			2: '6th field (move number) must be a positive integer.',
			3: '5th field (half move counter) must be a non-negative integer.',
			4: '4th field (en-passant square) should be \'-\'.',
			5: '3rd field (castling availability) should be \'-\'.',
			6: '2nd field (side to move) is invalid.',
			7: '1st field (piece positions) does not contain 10 \'/\'-delimited rows.',
			8: '1st field (piece positions) is invalid [consecutive numbers].',
			9: '1st field (piece positions) is invalid [invalid piece].',
			10: '1st field (piece positions) is invalid [row too large].',
			11: '1st field (piece positions) is invalid [each side has one king].',
			12: '1st field (piece positions) is invalid [each side has no more than 2 advisers].',
			13: '1st field (piece positions) is invalid [each side has no more than 2 bishops].',
			14: '1st field (piece positions) is invalid [each side has no more than 2 knights].',
			15: '1st field (piece positions) is invalid [each side has no more than 2 rooks].',
			16: '1st field (piece positions) is invalid [each side has no more than 2 cannons].',
			17: '1st field (piece positions) is invalid [each side has no more than 5 pawns].',
			18: '1st field (piece positions) is invalid [king should at palace].',
			19: '1st field (piece positions) is invalid [this.RED adviser should at right position].',
			20: '1st field (piece positions) is invalid [this.BLACK adviser should at right position].',
			21: '1st field (piece positions) is invalid [this.RED bishop should at right position].',
			22: '1st field (piece positions) is invalid [this.BLACK bishop should at right position].',
			23: '1st field (piece positions) is invalid [this.RED pawn should at right position].',
			24: '1st field (piece positions) is invalid [this.BLACK pawn should at right position].'
		};
		return { valid: err_num === 0, error_number: err_num, error: errors[err_num] };
	}


	//------------------
	public rank(i) {
		return i >> 4;
	}
	public file(i) {
		return i & 0x0f;
	}
	public algebraic(i) {
		var f = this.file(i), r = this.rank(i);
		return 'abcdefghi'.substring(f, f + 1) + '9876543210'.substring(r, r + 1);
	}
	public swap_color(c) {
		return c === this.RED ? this.BLACK : this.RED;
	}
	public is_digit(c) {
		return '0123456789'.indexOf(c) !== -1;
	}
	public crossed_river(p, c) {
		return c === this.RED ? this.rank(p) < 5 : this.rank(p) > 4;
	}
	public out_of_board(square) {
		return square < 0 || this.rank(square) > 9 || this.file(square) > 8;
	}

	public out_of_place(piece, square, color) {
	
		// K, A, B, P
		var side = {};
		if (piece === this.PAWN) {
			var side_arr = [0, 2, 4, 6, 8];
			if (color === this.RED) {
				return this.rank(square) > 6 ||
					(this.rank(square) > 4 && side_arr.indexOf( this.file(square)) === -1);
			}
			else {
				return this.rank(square) < 3 ||
					( this.rank(square) < 5 && side_arr.indexOf( this.file(square)) === -1);
			}
		}
		else if (piece === this.BISHOP) {
			side[this.RED] = [0x92, 0x96, 0x70, 0x74, 0x78, 0x52, 0x56];
			side[this.BLACK] = [0x02, 0x06, 0x20, 0x24, 0x28, 0x42, 0x46];
		}
		else if (piece === this.ADVISER) {
			side[this.RED] = [0x93, 0x95, 0x84, 0x73, 0x75];
			side[this.BLACK] = [0x03, 0x05, 0x14, 0x23, 0x25];
		}
		else if (piece === this.KING) {
			side[this.RED] = [0x93, 0x94, 0x95, 0x83, 0x84, 0x85, 0x73, 0x74, 0x75];
			side[this.BLACK] = [0x03, 0x04, 0x05, 0x13, 0x14, 0x15, 0x23, 0x24, 0x25];
		}
		else {
			// C, R, N
			return this.out_of_board(square);
		}
		return side[color].indexOf(square) === -1;
	}


	//----------------------------
	public validate_fen(fen) {

		/* 1st criterion: 6 space-separated fields? */
		var tokens = fen.split(/\s+/);
		if (tokens.length !== 6) {
			return this.result(1);
		}
		/* 2nd criterion: move number field is a integer value > 0? */
		if (isNaN(tokens[5]) || parseInt(tokens[5], 10) <= 0) {
			return this.result(2);
		}
		/* 3rd criterion: half move counter is an integer >= 0? */
		if (isNaN(tokens[4]) || parseInt(tokens[4], 10) < 0) {
			return this.result(3);
		}
		/* 4th criterion: 4th field is a valid e.p.-string? */
		if (!/^-$/.test(tokens[3])) {
			return this.result(4);
		}
		/* 5th criterion: 3th field is a valid castle-string? */
		if (!/^-$/.test(tokens[2])) {
			return this.result(5);
		}
		/* 6th criterion: 2nd field is "r" (this.RED) or "b" (this.BLACK)? */
		if (!/^([rb])$/.test(tokens[1])) {
			return this.result(6);
		}
		/* 7th criterion: 1st field contains 10 rows? */
		var rows = tokens[0].split('/');
		if (rows.length !== 10) {
			return this.result(7);
		}
		/* 8th criterion: every row is valid? */
		var pieces = {
			'p': { number: 0, squares: [] }, 'P': { number: 0, squares: [] },
			'c': { number: 0, squares: [] }, 'C': { number: 0, squares: [] },
			'r': { number: 0, squares: [] }, 'R': { number: 0, squares: [] },
			'n': { number: 0, squares: [] }, 'N': { number: 0, squares: [] },
			'b': { number: 0, squares: [] }, 'B': { number: 0, squares: [] },
			'a': { number: 0, squares: [] }, 'A': { number: 0, squares: [] },
			'k': { number: 0, squares: [] }, 'K': { number: 0, squares: [] }
		};
		var i, sum_fields, previous_was_number;
		for (i = 0; i < rows.length; i++) {
			/* check for right sum of fields AND not two numbers in succession */
			sum_fields = 0;
			previous_was_number = false;
			for (var k = 0; k < rows[i].length; k++) {
				if (!isNaN(rows[i][k])) {
					if (previous_was_number) {
						return this.result(8);
					}
					sum_fields += parseInt(rows[i][k], 10);
					previous_was_number = true;
				}
				else {
					try {
						++pieces[rows[i][k]].number;
					}
					catch (e) {
						return this.result(9);
					}
					pieces[rows[i][k]].squares.push((9 - i) << 4 | sum_fields);
					sum_fields += 1;
					previous_was_number = false;
				}
			}
			if (sum_fields !== 9) {
				return this.result(10);
			}
		}
		/* 9th criterion: every piece's number is valid? */
		if (pieces.k.number !== 1 || pieces.K.number !== 1) {
			return this.result(11);
		}
		if (pieces.a.number > 2 || pieces.A.number > 2) {
			return this.result(12);
		}
		if (pieces.b.number > 2 || pieces.B.number > 2) {
			return this.result(13);
		}
		if (pieces.n.number > 2 || pieces.N.number > 2) {
			return this.result(14);
		}
		if (pieces.r.number > 2 || pieces.R.number > 2) {
			return this.result(15);
		}
		if (pieces.c.number > 2 || pieces.C.number > 2) {
			return this.result(16);
		}
		if (pieces.p.number > 5 || pieces.P.number > 5) {
			return this.result(17);
		}
		/* 10th criterion: every piece's place is valid? */
		if ( this.out_of_place( this.KING, pieces.k.squares[0], this.RED) ||
			 this.out_of_place( this.KING, pieces.K.squares[0], this.BLACK)) {
			return this.result(18);
		}
		for (i = 0; i < pieces.a.squares.length; ++i) {
			if ( this.out_of_place( this.ADVISER, pieces.a.squares[i], this.RED)) {
				return this.result(19);
			}
		}
		for (i = 0; i < pieces.A.squares.length; ++i) {
			if ( this.out_of_place( this.ADVISER, pieces.A.squares[i], this.BLACK)) {
				return this.result(20);
			}
		}
		for (i = 0; i < pieces.b.squares.length; ++i) {
			if ( this.out_of_place( this.BISHOP, pieces.b.squares[i], this.RED)) {
				return this.result(21);
			}
		}
		for (i = 0; i < pieces.B.squares.length; ++i) {
			if ( this.out_of_place( this.BISHOP, pieces.B.squares[i], this.BLACK)) {
				return this.result(22);
			}
		}
		for (i = 0; i < pieces.p.squares.length; ++i) {
			if ( this.out_of_place( this.PAWN, pieces.p.squares[i], this.RED)) {
				return this.result(23);
			}
		}
		for (i = 0; i < pieces.P.squares.length; ++i) {
			if ( this.out_of_place( this.PAWN, pieces.P.squares[i], this.BLACK)) {
				return this.result(24);
			}
		}
		/* everything's okay! */
		return this.result(0);
	}


	//--------------------------
	public generate_fen() {

		var empty = 0, fen = '', color, piece;
		for (var i = this.SQUARES.a9; i <= this.SQUARES.i0; ++i) {
			if ( this.board[i] == null) {
				empty++;
			}
			else {
				if (empty > 0) {
					fen += empty;
					empty = 0;
				}
				color = this.board[i].color;
				piece = this.board[i].type;
				fen += color === this.RED ? piece.toUpperCase() : piece.toLowerCase();
			}
			if ( this.file(i) >= 8) {
				if (empty > 0) {
					fen += empty;
				}
				if (i !== this.SQUARES.i0) {
					fen += '/';
				}
				empty = 0;
				i += 0x07;
			}
		}
		return [fen, this.turn, '-', '-', this.half_moves, this.move_number].join(' ');
	}


	//----------------------------
	public update_setup(fen) {
		if ( this.history.length > 0)
			return;
		if (fen !== this.DEFAULT_POSITION) {
			this.header["FEN"] = fen;
		}
		else {
			delete this.header["FEN"];
		}
	}



	//----------------
	public clear(keep_headers) {
		
		this.board = new Array(256);
		this.kings = { r: this.EMPTY, b: this.EMPTY };
		this.turn = this.RED;
		this.half_moves = 0;
		this.move_number = 1;
		this.history = [];
		if (!keep_headers)
			this.header = {};
		this.update_setup( this.generate_fen()  );
	}

	public get(square) {
		var piece = this.board[ this.SQUARES[square]];
		return piece ? { type: piece.type, color: piece.color } : null;
	}
	public put(piece, square) {
		/* check for valid piece object */
		if (!('type' in piece && 'color' in piece)) {
			return false;
		}
		/* check for piece */
		if ( this.SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
			return false;
		}
		/* check for valid square */
		if (!(square in this.SQUARES)) {
			return false;
		}
		var sq = this.SQUARES[square];
		/* don't let the user place more than one king */
		if (piece.type === this.KING &&
			!( this.kings[piece.color] === this.EMPTY || this.kings[piece.color] === sq)) {
			return false;
		}
		if ( this.out_of_place(piece.type, sq, piece.color)) {
			return false;
		}
		this.board[sq] = { type: piece.type, color: piece.color };
		if (piece.type === this.KING) {
			this.kings[piece.color] = sq;
		}
		this.update_setup( this.generate_fen() );
		return true;
	}


	//-----------------------------------
	public load(fen, keep_headers) {

		if (!this.validate_fen(fen).valid) {
			return false;
		}

		var tokens = fen.split(/\s+/);
		var position = tokens[0];
		var square = 0, piece, color;
		this.clear(keep_headers);
		

		for (var i = 0; i < position.length; ++i) {
			piece = position.charAt(i);
			if (piece === '/') {
				square += 0x07;
			}
			else if ( this.is_digit(piece)) {
				square += parseInt(piece, 10);
			}
			else {
				color = piece < 'a' ? this.RED : this.BLACK;
				this.put({ type: piece.toLowerCase(), color: color }, this.algebraic(square));
				square++;
			}
		}
		this.turn = tokens[1];
		this.half_moves = parseInt(tokens[4], 10);
		this.move_number = parseInt(tokens[5], 10);
		this.update_setup( this.generate_fen() );
		return true;
	}


	//-------------------
	public ascii() {
		var s = '   +---------------------------+\n';
		for (var i = this.SQUARES.a9; i <= this.SQUARES.i0; i++) {
			/* display the rank */
			if (this.file(i) === 0) {
				s += ' ' + '9876543210'[ this.rank(i) ] + ' |';
			}
			/* empty piece */
			if (this.board[i] == null) {
				s += ' . ';
			}
			else {
				var piece = this.board[i].type;
				var color = this.board[i].color;
				var symbol = color === this.RED ? piece.toUpperCase() : piece.toLowerCase();
				s += ' ' + symbol + ' ';
			}
			if (i & 0x08) {
				s += '|\n';
				i += 7;
			}
		}
		s += '   +---------------------------+\n';
		s += '	 a  b  c  d  e  f  g  h  i\n';
		return s;
	}



	//---------------------------
	public remove(square) {
		var piece = this.get(square);
		this.board[this.SQUARES[square]] = null;
		if (piece && piece.type === this.KING) {
			this.kings[piece.color] = this.EMPTY;
		}
		this.update_setup(this.generate_fen());
		return piece;
	}

	public build_move(board, from, to, flags) {
		var move = {
			color: this.turn,
			from: from,
			to: to,
			flags: flags,
			piece: board[from].type
		};
		if (board[to]) {
			move["captured"] = board[to].type;
		}
		return move;
	}

	public add_move(board, moves, from, to, flags) {
		moves.push( this.build_move(board, from, to, flags));
	}

	public hobbling_horse_leg(square, index) {
        var orientation = [-0x10, 0x10, -0x01, 0x01];
        return this.board[square + orientation[Math.floor(index / 2)]] != null;
    }
    public blocking_elephant_eye(square, index) {
        var orientation = [-0x10 - 0x01, 0x10 + 0x01, 0x10 - 0x01, -0x10 + 0x01];
        return this.board[square + orientation[index]] != null;
    }


	public generate_moves(options) {
		
		var moves = [];
		var us = this.turn;
		var them = this.swap_color(us);
		var first_sq = this.SQUARES.a9;
		var last_sq = this.SQUARES.i0;
		/* do we want legal moves? */
		var legal = typeof options !== 'undefined' && 'legal' in options ? options.legal : true;



		// do we need opponent moves?
		var opponent = typeof options !== 'undefined' && 'opponent' in options ? options.opponent : false;
		/* are we generating moves for a single square? */
		if (typeof options !== 'undefined' && 'square' in options) {
			if (options.square in this.SQUARES) {
				first_sq = last_sq = this.SQUARES[options.square];
			}
			else {
				/* invalid square */
				return [];
			}
		}
		if (opponent) {
			this.turn = this.swap_color(this.turn);
			us = this.turn;
			them = this.swap_color(us);
		}
		var i, j, len, piece, OFFSETS, offset, square, crossed;
		for (i = first_sq; i <= last_sq; ++i) {
			piece = this.board[i];
			if (piece == null || piece.color !== us)
				continue;
			OFFSETS = piece.type === this.PAWN ? this.PAWN_OFFSETS[us] : this.PIECE_OFFSETS[piece.type];
			for (j = 0, len = OFFSETS.length; j < len; ++j) {
				if (piece.type === this.PAWN && j > 0 && !this.crossed_river(i, us))
					break;
				offset = OFFSETS[j];
				square = i;
				crossed = false;
				while (true) {
					square += offset;
					if (this.out_of_board(square))
						break;
					else if (piece.type === this.KNIGHT && this.hobbling_horse_leg(i, j))
						break;
					else if (piece.type === this.BISHOP &&
						(this.blocking_elephant_eye(i, j) || this.crossed_river(square, us)))
						break;
					else if ((piece.type === this.ADVISER || piece.type === this.KING) &&
						this.out_of_place(piece.type, square, us))
						break;
					if (this.board[square] == null) {
						if (piece.type === this.CANNON && crossed)
							continue;
						this.add_move(this.board, moves, i, square, this.BITS.NORMAL);
					}
					else {
						if (piece.type === this.CANNON) {
							if (crossed) {
								if (this.board[square].color === them)
									this.add_move(this.board, moves, i, square, this.BITS.CAPTURE);
								break;
							}
							crossed = true;
						}
						else {
							if (this.board[square].color === them)
								this.add_move(this.board, moves, i, square, this.BITS.CAPTURE);
							break;
						}
					}
					if (piece.type !== this.CANNON && piece.type !== this.ROOK)
						break;
				}
			}
			if (this.file(i) >= 8) {
				i = i + 0x07;
			}
		}
		/* return all pseudo-legal moves (this includes moves that allow the king
		 * to be captured)
		 */
		if (!legal) {
			return moves;
		}
		/* filter out illegal moves */
		var legal_moves = [];
		for (i = 0, len = moves.length; i < len; i++) {
			this.make_move(moves[i]);
			if (!this.king_attacked(us)) {
				legal_moves.push(moves[i]);
			}
			this.undo_move();
		}
		// DID we need opponent moves?
		if (opponent) {
			this.turn = this.swap_color(this.turn);
		}
		return legal_moves;
	}














	/* convert a move from 0x9a coordinates to Internet Chinese Chess Server (ICCS)
	 *
	 * @param {boolean} sloppy Use the sloppy ICCS generator to work around over
	 * disambiguation bugs in Fritz and Chessbase.  See below:
	 *
	 * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
	 * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
	 * 4. ... Ne7 is technically the valid SAN
	 */
	public move_to_iccs(move, sloppy) {
		var output = '';
		// let disambiguator = get_disambiguator(move, sloppy);
		// if (move.piece !== PAWN) {
		//   output += move.piece.toUpperCase() + disambiguator;
		// }
		// output += algebraic(move.to);
		output = this.algebraic(move.from) + this.algebraic(move.to);
		return output;
	}
	// parses all of the decorators out of a SAN string
	public stripped_iccs(move) {
		return move.replace(/=/, '').replace(/[+#]?[?!]*$/, '');
	}





	public king_attacked(us) {
		var square = this.kings[us];
		var them = this.swap_color(us);
		var i, len, sq;
		// knight
		for (i = 0, len = this.PIECE_OFFSETS[this.KNIGHT].length; i < len; ++i) {
			sq = square + this.PIECE_OFFSETS[this.KNIGHT][i];
			if (this.board[sq] != null && !this.out_of_board(sq) && this.board[sq].color === them &&
				this.board[sq].type === this.KNIGHT && !this.hobbling_horse_leg(sq, i < 4 ? 3 - i : 11 - i))
				return true;
		}
		// king, rook, cannon
		for (i = 0, len = this.PIECE_OFFSETS[this.ROOK].length; i < len; ++i) {
			var offset = this.PIECE_OFFSETS[this.ROOK][i];
			var crossed = false;
			for (sq = square + offset; !this.out_of_board(sq); sq += offset) {
				var piece = this.board[sq];
				if (piece != null) {
					if (piece.color === them) {
						if (crossed) {
							if (piece.type === this.CANNON)
								return true;
						}
						else {
							if (piece.type === this.ROOK || piece.type === this.KING)
								return true;
						}
					}
					if (crossed)
						break;
					else
						crossed = true;
				}
			}
		}
		// pawn
		for (i = 0, len = this.PAWN_OFFSETS[them].length; i < len; ++i) {
			sq = square - this.PAWN_OFFSETS[them][i];
			if (this.board[sq] != null && !this.out_of_board(sq) &&
				this.board[sq].color === them && this.board[sq].type === this.PAWN)
				return true;
		}
		return false;
	}






	public in_check() {
		return this.king_attacked(this.turn);
	}
	public in_checkmate() {
		return this.in_check() && this.generate_moves(undefined).length === 0;
	}
	public in_stalemate() {
		return !this.in_check() && this.generate_moves(undefined).length === 0;
	}
	public insufficient_material() {
		// TODO: more cases
		var pieces = {}, piece;
		var num_pieces = 0;
		for (var sq in this.SQUARES) {
			if (this.SQUARES.hasOwnProperty(sq)) {
				piece = this.board[this.SQUARES[sq]];
				if (piece) {
					pieces[piece.type] = (piece.type in pieces) ? pieces[piece.type] + 1 : 1;
					num_pieces++;
				}
			}
		}
		/* k vs. k */
		if (num_pieces === 2)
			return true;
		else if (typeof pieces[this.KNIGHT] === 'undefined' &&
			typeof pieces[this.ROOK] === 'undefined' &&
			typeof pieces[this.CANNON] === 'undefined' &&
			typeof pieces[this.PAWN] === 'undefined')
			return true;
		return false;
	}







	public in_threefold_repetition() {
		/* TODO: while this public is fine for casual use, a better
		 * implementation would use a Zobrist key (instead of FEN). the
		 * Zobrist key would be maintained in the make_move/undo_move publics,
		 * avoiding the costly that we do below.
		 */
		var moves = [], move;
		var positions = {};
		var repetition = false;
		while (true) {
			move = this.undo_move();
			if (!move)
				break;
			moves.push(move);
		}
		while (true) {
			/* remove the last four fields in the FEN string, they're not needed
			 * when checking for draw by rep */
			var fen_1 = this.generate_fen()
				.split(' ')
				.slice(0, 2)
				.join(' ');
			/* has the position occurred three or move times */
			positions[fen_1] = fen_1 in positions ? positions[fen_1] + 1 : 1;
			if (positions[fen_1] >= 3) {
				repetition = true;
			}
			if (!moves.length) {
				break;
			}
			this.make_move(moves.pop());
		}
		return repetition;
	}












	public push(move) {
		this.history.push({
			move: move,
			kings: { b: this.kings.b, r: this.kings.r },
			turn: this.turn,
			half_moves: this.half_moves,
			move_number: this.move_number
		});
	}
	






	public make_move(move) {
		
		this.push(move);
		// if king was captured
		if (this.board[move.to] != null && this.board[move.to].type === this.KING)
			this.kings[this.board[move.to].color] = this.EMPTY;
		this.board[move.to] = this.board[move.from];
		this.board[move.from] = null;
		/* if we moved the king */
		if (this.board[move.to].type === this.KING) {
			this.kings[this.board[move.to].color] = move.to;
		}
		/* reset the 60 move counter if a piece is captured */
		if (move.flags & this.BITS.CAPTURE) {
			this.half_moves = 0;
		}
		else {
			this.half_moves++;
		}
		if (this.turn === this.BLACK) {
			this.move_number++;
		}
		this.turn = this.swap_color(this.turn);
	}









	public undo_move() {
		var old = this.history.pop();
		if (old == null) {
			return null;
		}
		var move = old.move;
		this.kings = old.kings;
		this.turn = old.turn;
		this.half_moves = old.half_moves;
		this.move_number = old.move_number;
		var them = this.swap_color(this.turn);
		this.board[move.from] = this.board[move.to];
		this.board[move.from].type = move.piece; // to undo any s
		this.board[move.to] = null;
		if ((move.flags & this.BITS.CAPTURE) > 0) {
			this.board[move.to] = { type: move.captured, color: them };
		}
		return move;
	}








	/* this public is used to uniquely identify ambiguous moves */
	public get_disambiguator(move, sloppy) {
		
		var moves = this.generate_moves({ legal: !sloppy });
		var from = move.from;
		var to = move.to;
		var piece = move.piece;
		var ambiguities = 0;
		var same_rank = 0;
		var same_file = 0;
		for (var i = 0, len = moves.length; i < len; i++) {
			var ambig_from = moves[i].from;
			var ambig_to = moves[i].to;
			var ambig_piece = moves[i].piece;
			/* if a move of the same piece type ends on the same to square, we'll
			 * need to add a disambiguator to the algebraic notation
			 */
			if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
				ambiguities++;
				if (this.rank(from) === this.rank(ambig_from)) {
					same_rank++;
				}
				if (this.file(from) === this.file(ambig_from)) {
					same_file++;
				}
			}
		}
		if (ambiguities > 0) {
			/* if there exists a similar moving piece on the same rank and file as
			 * the move in question, use the square as the disambiguator
			 */
			if (same_rank > 0 && same_file > 0) {
				return this.algebraic(from);
			}
			else if (same_file > 0) {
				/* if the moving piece rests on the same file, use the rank symbol as the
			   * disambiguator
			   */
				return this.algebraic(from).charAt(1);
			}
			else {
				/* else use the file symbol */
				return this.algebraic(from).charAt(0);
			}
		}
		return '';
	}



	//--------------------
	// convert a move from Internet Chinese Chess Server (ICCS) to 0x9a coordinates
    public move_from_iccs(move, sloppy) {
        // strip off any move decorations: e.g Nf3+?!
        var clean_move = this.stripped_iccs(move);
        // if we're using the sloppy parser run a regex to grab piece, to, and from
        // this should parse invalid ICCS like: h2e2, H7-E7
        var matches = clean_move.match(/([a-iA-I][0-9])-?([a-iA-I][0-9])/);
        var piece, from, to;
        // TODO: support sloppy (must integrate with WXF)
        if (sloppy) {
            if (matches) {
                piece = matches[1];
                from = matches[2];
                to = matches[3];
            }
        }
        var moves = this.generate_moves(undefined);
        for (var i = 0, len = moves.length; i < len; i++) {
            // try the strict parser first, then the sloppy parser if requested by the user
            if (clean_move === this.stripped_iccs(  this.move_to_iccs(  moves[i], false  )   )   ||
                (sloppy && clean_move === this.stripped_iccs( this.move_to_iccs(moves[i], true)  ))) {
                return moves[i];
            }
            else {
                if (matches &&
                    (!piece || piece.toLowerCase() === moves[i].piece) &&
                    this.SQUARES[from] === moves[i].from &&
                    this.SQUARES[to] === moves[i].to) {
                    return moves[i];
                }
            }
        }
        return null;
    }




    //-----------------
    public clone(obj) {
        var dupe = obj instanceof Array ? [] : {};
        for (var property in obj) {
            if (typeof property === 'object') {
                dupe[property] = this.clone(obj[property]);
            }
            else {
                dupe[property] = obj[property];
            }
        }
        return dupe;
    }

    //-----------------
    public trim(str) {
        return str.replace(/^\s+|\s+$/g, '');
    }



    public make_pretty(ugly_move) {
    
        var move = this.clone(ugly_move);
        move["iccs"] = this.move_to_iccs(move, false);
        move["to"] = this.algebraic(move["to"]);
        move["from"] = this.algebraic(move["from"]);
        var flags = '';
        for (var flag in this.BITS) {
            if ((this.BITS[flag] & move["flags"]) > 0) {
                flags += this.FLAGS[flag];
            }
        }
        move["flags"] = flags;
        return move;
    }

	//----------------------------
	public move(move, options) {
		
		/* The move function can be called with in the following parameters:
		 *
		 * .move('Nxb7')	  <- where 'move' is a case-sensitive SAN string
		 *
		 * .move({ from: 'h7', <- where the 'move' is a move object (additional
		 *		 to :'h8',	  fields are ignored)
		 *	  })
		 */
		// allow the user to specify the sloppy move parser to work around over
		// disambiguation bugs in Fritz and Chessbase
		var sloppy = typeof options !== 'undefined' && 'sloppy' in options ?
			options.sloppy : false;
		var move_obj = null;
		if (typeof move === 'string') {
			move_obj = this.move_from_iccs(move, sloppy);
		}
		else if (typeof move === 'object') {
			var moves = this.generate_moves(undefined);
			/* convert the pretty move object to an ugly move object */
			for (var i = 0, len = moves.length; i < len; i++) {
				if (move.from === this.algebraic(moves[i].from) &&
					move.to === this.algebraic(moves[i].to) &&
					!('' in moves[i])) {
					move_obj = moves[i];
					break;
				}
			}
		}
		/* failed to find move */
		if (!move_obj) {
			return null;
		}
		/* need to make a copy of move because we can't generate SAN after the
		 * move is made
		 */
		var pretty_move = this.make_pretty(move_obj);
		this.make_move(move_obj);
		return pretty_move;
	}

	//---------------------
	public moves(options) {
			
		/* The internal representation of a xiangqi move is in 0x9a format, and
		 * not meant to be human-readable.  The code below converts the 0x9a
		 * square coordinates to algebraic coordinates.  It also prunes an
		 * unnecessary move keys resulting from a verbose call.
		 */
		var ugly_moves = this.generate_moves(options);
		var moves = [];
		for (var i = 0, len = ugly_moves.length; i < len; i++) {
			// does the user want a full move object (most likely not), or just ICCS
			if (typeof options !== 'undefined' &&
				'verbose' in options &&
				options.verbose) {
				moves.push(this.make_pretty(ugly_moves[i]));
			}
			else {
				moves.push(this.move_to_iccs(ugly_moves[i], false));
			}
		}
		return moves;
	}
}













