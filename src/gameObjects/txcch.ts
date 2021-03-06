



import resources from "src/resources";

import { Txcch_Piece } from "src/gameObjects/txcch_piece"
import { Txcch_Guide } from "src/gameObjects/txcch_guide"
import { Txclickable_box } from "src/gameObjects/txclickable_box"
import { Xiangqi } from "src/gameObjects/xiangqi"
import {EmitArg} from "src/gameObjects/txcch_busmessage"




export class Txcch extends Entity {

	public id:string;
	public transform:Transform;


	public pieces_pos_offset_x:number = -0.88;
	public pieces_pos_offset_y:number =  0.03;
	public pieces_pos_offset_z:number = -0.90;

	public grid_size_x:number = 0.218;
	public grid_size_y:number = 0.2;

	public pieces_size:number = 0.07;
	public pieces_height:number = 0.009;
	public pieces_arr:Txcch_Piece[] = [];

	public xq_logic:Xiangqi;


	public guide_pieces_size:number = 0.07;
	public guide_pieces_height:number = 0.02;
	public guide_pieces_arr = [];

	public current_selection:string;
	public table_text:TextShape;
	public table_text_transform:Transform;
	
	public reset_button:Txclickable_box;

	public userID:string;
	public tableMessageBus:MessageBus;
	public fen_obtained = false;

	//public apiurl 		= "https://meeiot.org"
	//public corsanywhere 	= "https://cors-anywhere.herokuapp.com"
	

	public apiurl2 			= "https://meeiot.org"
	public api_tokenkey2 	= "5de5bc29b1aad4bdf61d72b8611350234d4a702a2e699ae98051d7"
	public api_putaction2 	= "put"
	public api_getaction2 	= "get"
	public api_kvsep2 		= "=";
	
	public apiurl 			= "https://keyvalue.immanuel.co/api/KeyVal";
	public api_tokenkey 	= "2c0kbdqk";
	public api_getaction 	= "GetValue";
	public api_putaction 	= "UpdateValue";
	public api_kvsep 		= "/";
	
	
	constructor(
		id: string,
		transform_args: TranformConstructorArgs,
		userID:string
	) {

		super();
		engine.addEntity(this);

		this.id = id;
		this.userID = userID;
		this.transform = new Transform( transform_args );

		this.addComponent(  this.transform );
		
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
		
		this.xq_logic = new Xiangqi(null);


		this.create_pieces_from_FEN_string( this.xq_logic.generate_fen() );
		this.create_guide_pieces();
		

		let text_entity 	= new Entity();
		let text_shape 		= new TextShape("");
		text_shape.color    = Color3.Blue();
		let text_transform 	= new Transform({
			position : new Vector3 ( 0,  1.2 , 0 ), 
    		scale    : new Vector3 ( 0.2,  0.2,  0.2 )
		});
		text_entity.addComponent(text_shape);
		text_entity.addComponent(text_transform);
		text_entity.setParent( this);
		engine.addEntity( text_entity );

		this.table_text = text_shape;
		this.table_text_transform = text_transform;

		this.reset_button = new Txclickable_box(
			"reset_button",	
			{
				position : new Vector3 ( 0,  0.75 , 0 ), 
    			scale    : new Vector3 ( 0.3, 0.2, 0.1 )
			},
			this
		);

		this.reset_table(false);
		
		// Try to get from internet current FEN
		this.global_get_FEN();
		
		

	}

	//-------------------
	public setMessageBus( messageBus:MessageBus ) {
		this.tableMessageBus = messageBus;
	}	

	
	//-----------------
	public global_save_FEN() {
		
		let value   		= encodeURIComponent( "FENSIG" + this.xq_logic.generate_fen().replace(/\//g,"ZZ").replace(/\ /g,"YY") ); 
		let url 			= this.apiurl + "/" + this.api_putaction +  "/" + this.api_tokenkey + "/fen," + this.id + this.api_kvsep +  value ; 
		
		log( "save_FEN" , url );

		executeTask(async () => {
			try {
				
				let response = await fetch(url, { method:'POST' } );
				log("sent request to URL", this.apiurl , "SUCCESS" , response );

			} catch {
				
				log("failed to reach URL", this.apiurl , "attempt to use 2nd option", this.apiurl2);
				let url2 = this.apiurl2 + "/" + this.api_putaction2 +  "/" + this.api_tokenkey2 + "/fen," + this.id + this.api_kvsep2 +  value ; 
				log( "save_FEN one more time" , url2 );

				executeTask(async () => {
					try {
						let response = await fetch(url2, { method:'POST' } );
						log("sent request to URL", this.apiurl2 , "SUCCESS" , response );
					} catch {
						log("failed to reach URL2, attempt to use 2nd option. Give up")
					}
				});				
			}
		});
	}

	//-----------------
	public global_get_FEN() {
		
		let url 			= this.apiurl + "/" + this.api_getaction +  "/" + this.api_tokenkey + "/fen," + this.id ; 
		
		log( "global_get_FEN" , url );

		executeTask(async () => {
			try {
				
				let response = await fetch(url, { method:'GET' } )
									.then(response => response.text())

				log("sent request to URL", this.apiurl , "SUCCESS", this.id , response );
				let responsetxt:string = response.replace(/\"/g,"");
				if ( responsetxt.substring(0,6) == "FENSIG" ) {
					let fen = decodeURIComponent(responsetxt).replace("FENSIG","").replace(/ZZ/g,"/").replace(/YY/g," ");
					this.checkFEN( fen );
				} else {
					log( "The obtained string is not FEN", responsetxt);
				}

			} catch {
				
				log("failed to reach URL", this.apiurl , "attempt to use 2nd option", this.apiurl2);
				let url2 = this.apiurl2 + "/" + this.api_getaction2 +  "/" + this.api_tokenkey2 + "/fen," + this.id ; 
				log( "global_get_FEN one more time" , url2 );

				executeTask(async () => {
					try {
						let response = await fetch(url2, { method:'GET' } )
										.then(response => response.text())

						log("sent request to URL", this.apiurl2 , "SUCCESS" , this.id, response );
						
						let responsetxt:string = response.replace(/\"/g,"");
						if ( responsetxt.substring(0,6) == "FENSIG" ) {
							let fen = decodeURIComponent(responsetxt).replace("FENSIG","").replace(/ZZ/g,"/").replace(/YY/g," ");
							this.checkFEN( fen );
						} else {
							log( "The obtained string is not FEN", responsetxt);
						}


					} catch {
						log("failed to reach URL2, attempt to use 2nd option. Give up")
					}
				});				
			}
		});
	}






	//--------------------------
	// This is like a timer
	update(dt: number) {
		this.table_text_transform.rotate(Vector3.Up(), dt * 10);
		this.reset_button.update(dt);

	}
  


	//----------------
	public create_guide_pieces() {

		for ( let i = 0 ; i < 20 ; i++ ) {

			let guide_piece = new Txcch_Guide({
			    	
	    			position: new Vector3 ( 
	    				0 + this.pieces_pos_offset_x , 
	    				-999 , 
	    				0 + this.pieces_pos_offset_z 
	    			),
	    			scale: new Vector3( 
	    				this.guide_pieces_size, 
	    				this.guide_pieces_height, 
	    				this.guide_pieces_size
	    			),
	  			}, 0 , 0 , this );

	  		this.guide_pieces_arr.push( guide_piece );	
		}
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

			} else if ( /[KkAaBbNnRrCcPp]/.test(FEN_str[i]) == true ) {
				
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
	  			},  FEN_str[i] , col , 9 - row , this );

	  			this.pieces_arr.push( txcch_piece );
	  			col += 1;

	  		} else if ( FEN_str[i] == " " ) {
	  			break;
	  		}
  		}
	}


	


	//-----------
	public clear_board( ) {

		this.clear_guides();
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

	//-----
	public clear_guides( ) {

		for ( let i = 0 ; i < this.guide_pieces_arr.length ; i++ ) {
			this.guide_pieces_arr[i].setPosition( 
				new Vector3 ( 
					( (0 + Math.floor( i / 10 ) ) * this.grid_size_x ) + this.pieces_pos_offset_x , 
					-99 + this.pieces_pos_offset_y , 
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

			} else if ( /[KkAaBbNnRrCcPp]/.test(FEN_str[i]) == true ) {
				
				
				let txcch_piece = this.get_piece_by_rank( FEN_str[i] );
				if ( txcch_piece != null ) {
					txcch_piece.setPosition( 
						new Vector3 ( 
	    					(col * this.grid_size_x ) + this.pieces_pos_offset_x , 
	    					this.pieces_pos_offset_y , 
	    					((9 - row) * this.grid_size_y ) + this.pieces_pos_offset_z 
	    				), 
	    				col, 
	    				9 - row 
	    			);
				}
	  			col += 1;

	  		} else if ( FEN_str[i] == " " ) {
	  			break;
	  		
	  		}
  		}
	}



	//-----------
	public get_piece_by_rank( rank:string ):Txcch_Piece {

		for ( let i = 0 ; i < this.pieces_arr.length ; i++ ) {
			if ( this.pieces_arr[i].rank == rank && this.pieces_arr[i].row == -2 ) {
				return this.pieces_arr[i];
			}
		}
		return null;
	}

	//------------
	public get_piece_by_col_row( col , row ):Txcch_Piece {

		for ( let i = 0 ; i < this.pieces_arr.length ; i++ ) {
			if ( this.pieces_arr[i].col == col && this.pieces_arr[i].row == row ) {
				return this.pieces_arr[i];
			}
		}
		return null;
	}


	//-----------
	public move_piece( frm_col, frm_row, to_col , to_row ) {


		let dst_piece = this.get_piece_by_col_row( to_col , to_row );
		if ( dst_piece != null ) {
			dst_piece.setPosition( 
				new Vector3 ( 
					( -1 * this.grid_size_x ) + this.pieces_pos_offset_x , 
					-0.15 + this.pieces_pos_offset_y , 
					( to_col * this.grid_size_y ) + this.pieces_pos_offset_z 
				), 
				-2, 
				-2 
			);
			//log( to_col , to_row, "has", dst_piece.rank , " eating it" );

		} else {
			//log( to_col , to_row, "has nothing");
		}

		let src_piece = this.get_piece_by_col_row( frm_col , frm_row );
		if ( src_piece != null ) {
			src_piece.setPosition( 
				new Vector3 ( 
					(to_col * this.grid_size_x ) + this.pieces_pos_offset_x , 
					this.pieces_pos_offset_y , 
					(to_row * this.grid_size_y ) + this.pieces_pos_offset_z 
				), 
				to_col, 
				to_row 
			);
		}

	}


	//-------------
	public reset_table( do_emit ) {

		this.xq_logic.load( this.xq_logic.DEFAULT_POSITION , false );
		this.resort_board_with_FEN_string( this.xq_logic.DEFAULT_POSITION );
		this.render_current_turn();

		const action: EmitArg = {
			tableID: this.id,
			userID: this.userID,
			notation:"",
			fen:""
		}
		if ( do_emit == true && this.tableMessageBus != null ) {
			this.tableMessageBus.emit( "reset", action );
			this.global_save_FEN();
		}
	}

	//-------------
	public render_current_turn( ) {

		this.reset_table_txt();
		this.reset_clickable();
	}

	//------------
	public reset_table_txt() {

		let show_str:string = "";

		if ( this.xq_logic.in_checkmate() ) {

			show_str += "Check Mate\n";
			if ( this.xq_logic.turn == "r" ) {
				show_str += " Black Wins";
				this.table_text.color = Color3.Black();
			} else {
				show_str += " Red Wins";
				this.table_text.color = Color3.Red();
			}

		} else {

			if ( this.xq_logic.turn == "r" ) {
				show_str +=  "Red's turn.\n";
				this.table_text.color = Color3.Red();
			} else {
				show_str +=  "Black's turn.\n";
				this.table_text.color = Color3.Black();
			}
			if ( this.xq_logic.in_check() ) {
				show_str += " (In Check)";	
			}
		}		

		this.table_text.value = show_str;	

	}

	//-----------
	public reset_clickable() {

		for ( let i = 0 ; i < this.pieces_arr.length ; i++ ) {
			if ( this.pieces_arr[i].get_sidecolor_from_rank() == this.xq_logic.turn ) {
				this.pieces_arr[i].enable_clickable();
			} else {
				this.pieces_arr[i].disable_clickable();
			}
		}
		
	}


	//----------
	public checkFEN( fen:string ) {

		if ( this.xq_logic.generate_fen() != fen ) {

			log("Fen not the same, readjust table");
			this.xq_logic.load( fen, false );
			this.resort_board_with_FEN_string( fen );
			this.render_current_turn();
		}
	}	
	
	//--------------
	public move_by_notation( notation:string , do_emit ) {

		if ( this.xq_logic.move( notation , undefined ) != null ) {

			let fr_col = "abcdefghi".indexOf( notation[0] );
			let fr_row = parseInt( notation[1] );
			let to_col = "abcdefghi".indexOf( notation[2] );
			let to_row = parseInt( notation[3] );

			log("Move action: ", notation , fr_col , fr_row, to_col , to_row);

			this.move_piece( fr_col , fr_row , to_col , to_row );
			this.clear_guides();
			this.current_selection = "";
			this.render_current_turn();

			if ( do_emit == true ) {
				const action: EmitArg = {
					tableID: this.id,
					userID: this.userID,
					notation:notation,
					fen: this.xq_logic.generate_fen()
				}
				if ( this.tableMessageBus != null ) {
					this.tableMessageBus.emit( "move", action );
				}
				this.global_save_FEN();
			}
			
		}
	}


	//---------------
	public txclickable_button_onclick( id:string ) {
		if ( id == "reset_button" ) {
			this.reset_table( true );
		}
	}

	//------------------
	public children_pieces_onclick( col , row , rank ) {

		//log( "children_pieces_onclick", rank , col, row );

		if ( rank != null ) {
			// Clicked on pieces
			this.clear_guides();	

			this.current_selection = "abcdefghi"[col] + row
			let moves_possible = this.xq_logic.moves({square: this.current_selection});

			for ( let i = 0 ; i < moves_possible.length ; i++ ) {
				
				let newcol = "abcdefghi".indexOf( moves_possible[i][2] ); 
				let newrow = parseInt( moves_possible[i][3] );

				this.guide_pieces_arr[i].setPosition(
					new Vector3(
						(newcol * this.grid_size_x ) + this.pieces_pos_offset_x , 
	    				this.pieces_pos_offset_y , 
	    				(newrow * this.grid_size_y ) + this.pieces_pos_offset_z 
					),
					newcol,
					newrow
				);
			}

		} else {
			
			// Clicked on guides 
			let moving_to = "abcdefghi"[col] + row
			let notation  = this.current_selection + moving_to ;
			//log( notation );

			this.move_by_notation( notation , true );
				

		}
	}
}