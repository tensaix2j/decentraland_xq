

import { Txcch } 	from "src/gameObjects/txcch";
import { EmitArg } 	from "src/gameObjects/txcch_busmessage"
import { Utils} 		from "src/utils";

let userID = "user" + Math.floor( Math.random() * 1000000 );
log( "I am ", userID );





let tables = [];

let table1 = new Txcch(
	"Table01",
	{
	    position: new Vector3( 10, 0.5 , 7),
	    scale: new Vector3( 2, 2, 2),
	},
	userID
);
tables.push( table1 ) ;

let table2 = new Txcch(
	"Table02",
	{
	    position: new Vector3( 4, 0.5 , 7),
	    scale: new Vector3( 2, 2, 2),
	},
	userID
);
tables.push( table2 ) ;



// Player's position is camera's position
const camera = Camera.instance;



let messageBus = new MessageBus();

messageBus.on("move", (info: EmitArg) => {
	log( "(bus)move", info );
	if ( userID != info.userID ) {
		for ( let t = 0 ; t < tables.length ; t++ ) {
			if ( tables[t].id == info.tableID ) {
				tables[t].move_by_notation( info.notation , false );
				tables[t].checkFEN( info.fen );

			}
		}
	}
});
messageBus.on("reset", (info: EmitArg) => {
	log( "(bus)reset", info );
	if ( userID != info.userID  ) {
		for ( let t = 0 ; t < tables.length ; t++ ) {
			if ( tables[t].id == info.tableID ) {
				tables[t].reset_table(false);
			}
		}
	}
});

for ( let t = 0 ; t < tables.length ; t++ ) {
	tables[t].setMessageBus( messageBus );
}




// Create a textShape component, setting the canvas as parent
let ui_2d_canvas 	= new UICanvas();
let ui_2d_text 	 	= new UIText( ui_2d_canvas );

ui_2d_text.fontSize = 30;
ui_2d_text.value 	= "";
ui_2d_text.vAlign = "bottom";


// UpdateSystem callback 
export class UpdateSystem implements ISystem {
	//Executed ths function on every frame
	update(dt: number) {

		let current_closest_table_dist = 999;

		for ( let t = 0 ; t < tables.length ; t++ ) {
			
			tables[t].update(dt);
			let dist_to_player = Utils.distance( camera.position, tables[t].transform.position );
			if ( dist_to_player < 50 && dist_to_player < current_closest_table_dist ) {
				current_closest_table_dist = dist_to_player;
				
				ui_2d_text.value = tables[t].id + ":" + tables[t].table_text.value;
				ui_2d_text.color = tables[t].table_text.color;


			}

		}
	}
}

// Add system to engine
engine.addSystem(new UpdateSystem())



