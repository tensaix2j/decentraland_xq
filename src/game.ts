

import { Txcch } from "src/gameObjects/txcch";
import {EmitArg} from "src/gameObjects/txcch_busmessage"


let userID = "user" + Math.floor( Math.random() * 1000000 );
log( "I am ", userID );






let tables = [];

let table1 = new Txcch(
	"table01",
	{
	    position: new Vector3( 10, 0.5 , 7),
	    scale: new Vector3( 2, 2, 2),
	},
	userID
);
tables.push( table1 ) ;

let table2 = new Txcch(
	"table02",
	{
	    position: new Vector3( 4, 0.5 , 7),
	    scale: new Vector3( 2, 2, 2),
	},
	userID
);
tables.push( table2 ) ;







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
table1.setMessageBus( messageBus );
table2.setMessageBus( messageBus );




// Define the system
export class UpdateSystem implements ISystem {
	//Executed ths function on every frame
	update(dt: number) {
		for ( let t = 0 ; t < tables.length ; t++ ) {
			tables[t].update(dt);
		}
	}
}

// Add system to engine
engine.addSystem(new UpdateSystem())



