

import resources from "src/resources";

export class Txcch_Piece extends Entity {
	
	public rank:string;
	public col:number;
	public row:number;
	public transform:Transform;
	
	constructor(
			transform_args: TranformConstructorArgs,
			rank:string,
			col:number,
			row:number
	) {

		super();
		engine.addEntity(this);
		
		this.rank = rank;
		this.row  = row;
		this.col  = col;
		
		let shape 	= new CylinderShape();
		shape.radiusBottom = 1;
		shape.radiusTop = 1;
		
		this.transform = new Transform( transform_args )
		this.addComponent( shape );
		this.addComponent( this.transform );
		

		let face_entity 	= new Entity();
		let face_shape 		= new PlaneShape();
		let face_transform 	= new Transform({
			position : new Vector3 ( 0, 1.1, 0 ), 
    		scale    : new Vector3 ( 2.1, 2.1, 1 )
		});

		let face_material 	= new BasicMaterial();

		face_entity.setParent( this );
		face_material.texture = resources.textures.chessface;
		face_transform.rotation.eulerAngles = new Vector3( 90, 180, 0);
		
		face_shape.uvs = this.get_uv_coords();

		
		
		engine.addEntity( face_entity );
		face_entity.addComponent( face_shape );
		face_entity.addComponent( face_transform );
		face_entity.addComponent( face_material );
		
	}


	//---------
	public setPosition(
		position:Vector3,
		col:number,
		row:number
	):void {

		this.transform.position = position;
		this.col = col;
		this.row = row;

	}


	//---------------
	public get_sidecolor_from_rank( ):string {

		if ( this.rank.toLowerCase() == this.rank ) {
			return "black";
		} else {
			return "red";
		}
	}


	//-----------------------------------
	/*
		Pt1       Pt2

		Pt4       Pt3
		
	*/

	public get_uv_coords() {

		let sidecolor = this.get_sidecolor_from_rank();

		let arr = [
			  0/7 ,   0/2,     	
			  1/7 ,   0/2,     	
			  1/7 ,   1/2,     
			  0/7 ,   1/2,
			  0, 0,     	
			  1, 0,     	
			  1, 1,     
			  0, 1
		];

		if ( this.rank.toUpperCase() == "K" ) {

			arr[0] = arr[6] = 0/7;
			arr[2] = arr[4] = 1/7;
			
		} else if ( this.rank.toUpperCase() == "A" ) {
			
			arr[0] = arr[6] = 1/7;
			arr[2] = arr[4] = 2/7;

		} else if ( this.rank.toUpperCase() == "E" ) {
			
			arr[0] = arr[6] = 3/7;
			arr[2] = arr[4] = 4/7;

		} else if ( this.rank.toUpperCase() == "R" ) {
			
			arr[0] = arr[6] = 4/7;
			arr[2] = arr[4] = 5/7;

		} else if ( this.rank.toUpperCase() == "H" ) {

			arr[0] = arr[6] = 2/7;
			arr[2] = arr[4] = 3/7;
		
		} else if ( this.rank.toUpperCase() == "C" ) {

			arr[0] = arr[6] = 5/7;
			arr[2] = arr[4] = 6/7;
		
		} else if ( this.rank.toUpperCase() == "P" ) {
		
			arr[0] = arr[6] = 6/7;
			arr[2] = arr[4] = 7/7;
		} 

		if ( sidecolor == "black" ) {
			arr[1] = arr[3] = 0/2;
			arr[5] = arr[7] = 1/2;

		} else if ( sidecolor == "red" ) {
			arr[1] = arr[3] = 1/2;
			arr[5] = arr[7] = 2/2;
		}

		return arr;
	}

}






