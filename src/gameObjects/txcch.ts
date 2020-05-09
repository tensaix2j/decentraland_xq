
import { Txcch_Piece } from "src/gameObjects/txcch_piece"
import resources from "src/resources";


export class Txcch extends Entity {

	public pieces_pos_offset_x:number = -0.88;
	public pieces_pos_offset_y:number =  0.03;
	public pieces_pos_offset_z:number = -0.90;

	public grid_size_x:number = 0.218;
	public grid_size_y:number = 0.2;

	public pieces_size:number = 0.07;
	public pieces_height:number = 0.009;

	public current_state_FEN = "rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR";
	public pieces_arr:Txcch_Piece[] = [];


	constructor(
		transform: TranformConstructorArgs
	) {

		super();
		engine.addEntity(this);

		this.addComponent( new Transform( transform ) );
		
		let board_entity 	= new Entity();
		let board_shape  	= new BoxShape();
		let board_transform = new Transform({
			position : new Vector3 ( 0,  0, 0 ), 
    		scale    : new Vector3 ( 2, 0.01, 2 )
		});
		let board_material 	= new BasicMaterial();
		board_material.texture = resources.textures.chessboard;
		board_transform.rotation.eulerAngles = new Vector3( 0, 90, 0);
		

		board_entity.setParent(this);
		board_entity.addComponent(board_shape);
		board_entity.addComponent(board_transform);
		board_entity.addComponent(board_material);	

		engine.addEntity( board_entity );
		


		this.create_pieces_from_FEN_string( this.current_state_FEN );
		this.resort_board_with_FEN_string(  "4kaR2/4a4/3hR4/7H1/9/9/9/9/4Ap1r1/3AK3c" );

	}



	//-----------------
	public create_pieces_from_FEN_string( FEN_str:string ):void {

		let row = 0;
		let col = 0;

		for ( let i = 0 ; i < FEN_str.length ; i++ ) {

			if ( FEN_str[i] == "/" ) {
			
				row += 1;
				col = 0;

			} else if ( /[0-9]/.test(FEN_str[i]) ) {

				col += parseInt( FEN_str[i] );

			} else if ( FEN_str[i] != "/" && !/[0-9]/.test(FEN_str[i]) ) {
				
				let txcch_piece = new Txcch_Piece( {
			    	
	    			position: new Vector3 ( 
	    				(col * this.grid_size_x ) + this.pieces_pos_offset_x , 
	    				this.pieces_pos_offset_y , 
	    				((9 - row) * this.grid_size_y ) + this.pieces_pos_offset_z 
	    			),
	    			scale: new Vector3( 
	    				this.pieces_size, 
	    				this.pieces_height, 
	    				this.pieces_size
	    			),
	  			},  FEN_str[i] , col , row );

	  			txcch_piece.setParent( this );
	  			
	  			
	  			this.pieces_arr.push( txcch_piece );
	  			col += 1;
	  		}
  		}
	}

	//-----------
	public find_piece_from_arr( rank:string ):Txcch_Piece {

		for ( let i = 0 ; i < this.pieces_arr.length ; i++ ) {
			if ( this.pieces_arr[i].rank == rank && this.pieces_arr[i].row == -2 ) {
				return this.pieces_arr[i];
			}
		}
		return null;
	}


	//-----------
	public clear_board( ) {

		for ( let i = 0 ; i < this.pieces_arr.length ; i++ ) {
			this.pieces_arr[i].setPosition( 
				new Vector3 ( 
					( (0 + Math.floor( i / 10 ) ) * this.grid_size_x ) + this.pieces_pos_offset_x , 
					-0.15 + this.pieces_pos_offset_y , 
					( ( i % 10) * this.grid_size_y ) + this.pieces_pos_offset_z 
				), 
				-2, 
				-2 
			);
		}
	}


	//--------------
	public resort_board_with_FEN_string( FEN_str:string ) {

		let row = 0;
		let col = 0;

		this.clear_board();

		for ( let i = 0 ; i < FEN_str.length ; i++ ) {

			if ( FEN_str[i] == "/" ) {
			
				row += 1;
				col = 0;

			} else if ( /[0-9]/.test(FEN_str[i]) ) {

				col += parseInt( FEN_str[i] );

			} else if ( FEN_str[i] != "/" && !/[0-9]/.test(FEN_str[i]) ) {
				
				let txcch_piece = this.find_piece_from_arr( FEN_str[i] );
				if ( txcch_piece != null ) {
					txcch_piece.setPosition( 
						new Vector3 ( 
	    					(col * this.grid_size_x ) + this.pieces_pos_offset_x , 
	    					this.pieces_pos_offset_y , 
	    					((9 - row) * this.grid_size_y ) + this.pieces_pos_offset_z 
	    				), 
	    				col, 
	    				row 
	    			);
				}
	  			col += 1;
	  		}
  		}
	}


}