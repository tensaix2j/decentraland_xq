


import { Txcch } from "src/gameObjects/txcch";


export class Txcch_Guide extends Entity {
	
	public col:number;
	public row:number;
	public transform:Transform;
	public parent:Txcch;
	
	constructor(
			transform_args: TranformConstructorArgs,
			col:number,
			row:number,
			parent:Txcch
	) {

		super();
		engine.addEntity(this);
		
		this.row  = row;
		this.col  = col;
		this.parent = parent;

		
		let shape 	= new BoxShape();
			
		this.transform = new Transform( transform_args )

		this.addComponent( shape );
		this.addComponent( this.transform );

		// Change to red color 
		let material = new Material();
		material.albedoColor = Color3.Red();
		this.addComponent( material );

		this.setParent( parent );
	  	
	  	this.addComponent(
			new OnPointerDown((e) => {
				this.parent.children_pieces_onclick( this.col , this.row , null );
			})
		)		
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

}







