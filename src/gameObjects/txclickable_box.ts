
import resources from "src/resources";
import { Txcch } from "src/gameObjects/txcch";

export class Txclickable_box extends Entity {
	
	public id:string;
	public transform:Transform;
	public parent:Txcch;

	public text_shape:TextShape;
	public text_transform:Transform;

	constructor(
			id:string,
			transform_args: TranformConstructorArgs,
			parent:Txcch
	) {

		super();
		engine.addEntity(this);

		this.id = id;
		this.parent = parent;
		this.transform = new Transform( transform_args );
		

		let shape = new BoxShape();
		let shape_material = new Material();
		shape_material.albedoColor = Color3.FromInts(44,55,66);

		this.addComponent( shape );
		this.addComponent( shape_material );
		this.addComponent( this.transform );
		this.addComponent( new OnPointerDown((e) => {
			parent.txclickable_button_onclick( this.id );
		}));

		this.setParent( parent );
		


		let text_entity 	 = new Entity();
		this.text_shape 		 = new TextShape("Reset");
		this.text_shape.color    = Color3.Red();
		this.text_transform  = new Transform({
			position : new Vector3 ( 0,  0 , -0.6 ), 
    		scale    : new Vector3 ( 0.35,  0.35, 0.35 )
		});
		text_entity.addComponent(this.text_shape);
		text_entity.addComponent(this.text_transform);
		text_entity.setParent( this);
		engine.addEntity( text_entity );
		

	}

	//--------------------------
	// This is like a timer
	update(dt: number) {
		this.transform.rotate(Vector3.Up(), dt * 10);
    }
}