

import { Txcch } from "src/gameObjects/txcch";

const txcch_board = new Txcch({
    position: new Vector3( 7, 0.5 , 7),
    scale: new Vector3( 2, 2, 2),
});

// Define the system
export class UpdateSystem implements ISystem {
	//Executed ths function on every frame
	update(dt: number) {
  		txcch_board.update(dt);
	}
}

// Add system to engine
engine.addSystem(new UpdateSystem())



