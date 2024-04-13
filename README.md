# ngn

An ECS framework for the web.

<!-- vim-markdown-toc GFM -->

* [Comprehensive sample](#comprehensive-sample)
* [Installation](#installation)
* [API overview](#api-overview)
    * [createWorld](#createworld)
        * [Entities](#entities)
        * [Components](#components)
    * [Extras](#extras)
        * [Keyboard, mouse and gamepad input](#keyboard-mouse-and-gamepad-input)
            * [ButtonState](#buttonstate)
            * [API](#api)
        * [Expiring log system](#expiring-log-system)

<!-- vim-markdown-toc -->

# Comprehensive sample

```typescript
import {
  createWorld,
  input,
  GamepadMapping,
  SCUFVantage2,
  type WorldState,
  onGamepadConnected,
  inputSystem,
} from "@prsm/ngn";

// Create a mapping with unique button/key names.
const MyMapping = (): GamepadMapping => {
  return Object.assign(SCUFVantage2(), {
    axes: {
      2: "LookHorizontal",
      3: "LookVertical",
    },
    buttons: {
      0: "Sprint", // X
      2: "Jump", // ■
      3: "Action", // ▲
    },
  });
};

// Assign this mapping to gamepads when they connect.
onGamepadConnected((e: GamepadEvent) => {
  input.gamepad(e.gamepad.index).useMapping(MyMapping);
});

// Create a world
const {
  state,
  query,
  createEntity,
  addSystem,
  start,
  step,
  defineMain,
} = createWorld();

// Create components
const Position = () => ({ x: 0, y: 0 });
const Velocity = () => ({ x: 0, y: 0 });
const Alive = () => ({});
const Dead = () => ({});

// Create entities
const player =
  createEntity()
    .addComponent(Position)
    .addComponent(Velocity)
    .addComponent(Alive)
    .addTag("player");

Array
  .from(Array(50))
  .forEach((i) =>
    createEntity({ name: `monster ${i}`, hp: 100 })
      .addComponent(Position)
      .addComponent(Velocity)
      .addComponent(Alive)
      .addTag("monster");

// Create queries
const movables = query({ and: [Position, Velocity] });
const livingMonsters = query({ tag: ["monster"], and: [Alive] });
const deadOrAliveMonsters = query({ tag: ["monster"] or: [Dead, Alive] });

// Create systems
const moveSystem = (_: WorldState) => {
  movables((results) => {
    results.forEach(({ entity, Position, Velocity }) => {
      Position.x += Velocity.x;
      Position.y += Velocity.y;
    });
  });
};

const monsterDeathSystem = (_: WorldState) => {
  livingMonsters((results) => {
    results.forEach(({ entity }) => {
      if (entity.hp <= 0) {
        entity.removeComponent(Alive);
      }
    })
  });

  // Just for demonstration of 'or' query results:
  deadOrAliveMonsters((results) => {
    // Since this query uses 'or', `Dead` OR `Alive` will be 
    // present on the results. You will need to check for existence:
    results.forEach(({ entity, Dead, Alive }) => {
      if (Dead) { }
      if (Alive) { }
    });
  });
};

const gravitySystem = (w: WorldState) => {
  movables((results) => {
    results.
      forEach(({ Velocity }) => {
        Velocity.y += 4.9 * w.time.delta;
      })
  });
};

const playerControlSystem = (_: WorldState) => {
  if (input.gamepad(0).getButton("Jump").justPressed) {
    player.getComponent(Velocity).y = 1;
  }
};

// Add or remove systems at any time
addSystem(inputSystem, moveSystem, monsterDeathSystem);

// Finally, define your main entry point with `defineMain`:
defineMain(() => {
  // Once `start` is called, this will be called every frame.

  // Call `step` to call each registered system, passing the state of the world to each.
  //
  // This is intentionally handled by *you*, because there's a good chance
  // you'd prefer to dictate the order of execution here.
  step();
});

start();
```

# Installation

```bash
npm install @prsm/ngn
```

# API overview

## createWorld

```typescript
const {
  state,
  createEntity,
  getEntity,
  onEntityCreated,
  query,
  addSystem,
  removeSystem,
  start,
  stop,
  step,
} = createWorld();
```

* **`state`**

  - Stores all the entities.
  - Tracks relationships between entities and components for fast lookups.
  - Tracks query dependencies and caches results.
  - Is passed to all systems.
  - Contains a useful `time` object that looks like:

  * `state.time.delta` - time since last frame in ms.
  * `state.time.scale` - time scale (default: `1`, valid: `0 - 1`).
  * `state.time.elapsed` - time since `start` was called in ms.
  * `state.time.elapsedScaled` - time since `start` was called, scaled by `time.scale` in ms.
  * `state.time.fps` - frames per second.

### Entities

* **`World > createEntity`**

  ```typescript
  const {
    id,
    addTag,
    removeTag,
    getTag,
    addComponent,
    hasComponent,
    getComponent,
    removeComponent,
    destroy,
  } = createEntity({ optional: "default values" });
  ```

  **Forcefully setting the entity ID**

  You can forcefully set the entity ID by providing it as the second optional argument to `createEntity`. This is a feature that's probably not very useful in the context of this library alone, but this is a critical feature that `@prsm/ngn-net` relies on. An authoritative server must be able to assign IDs to entities.

  ```typescript
  // IDs are not numbers, but this example serves to
  // illustrate a behavior.

  // This entity will have id 1 (not really, but go with it).
  const firstEntity = createEntity({});
  // Now this entity has id 1, and `firstEntity` has id 2.
  const secondEntity = createEntity({}, 1);
  // This entity has id 3.
  const thirdEntity = createEntity({});
  ```

  * **`Entity > addTag`**

    Adds a tag to the entity. Tags are only useful for querying entities. An entity can only have one tag.

    ```typescript
    entity.addTag("coin");
    ```

  * **`Entity > removeTag`**

    Removes the tag from the entity.

    ```typescript
    entity.removeTag();
    ```

  * **`Entity > getTag`**

    Returns the tag of the entity.

    ```typescript
    const tag = entity.getTag();
    ```

  * **`Entity > destroy`**

    Destroys the entity. Removes it from the world.

    ```typescript
    entity.destroy();
    ```

* **`World > getEntity`**

  Returns the entity with the given ID.

  ```typescript
  const entity = getEntity("ngnluxhlpj30271be3f727d31");
  ```

### Components

  * **`Entity > addComponent`**

    Adds a component to the entity. Components are functions that return an object.
    An entity can only have one of each type of a component.

    ```typescript
    const Position = () => ({ x: 50, y: 50 });
    const Velocity = () => ({ x: 0, y: 0 });
    entity.addComponent(Position).addComponent(Velocity);

    // entity:
    // {
    //   ...,
    //   components: [
    //     { x: 50, y: 50 }, <-- Position
    //     { x: 0, y: 0 },   <-- Velocity
    //   ],
    // }
    ```

    If the object returned by the component function includes an `onAttach` function, it is called at this time.

    ```typescript
    const MeshComponent = () => ({
      entityId: null,
      mesh: null,
      onAttach(entity: Entity) {
        this.entityId = entity.id;
      },
    });
    ```

    You can override default values:

    ```typescript
    entity.addComponent(Position, { y: 10 });

    // entity:
    // {
    //   ...,
    //   components: [
    //     { x: 50, y: 10 }, <-- Position
    //   ],
    // }
    ```

  * **`Entity > hasComponent`**

    Returns `true` if the entity has the component.

    ```typescript
    const hasPosition = entity.hasComponent(Position);
    ```

  * **`Entity > getComponent`**

    Returns the component of the entity.

    ```typescript
    const position = entity.getComponent<typeof Position>(Position);
    ```

  * **`Entity > removeComponent`**

    Removes the component from the entity. Provide either the component function or the string name of the component (`.name` property).

    ```typescript
    entity.removeComponent(Position);
    // is the same as:
    entity.removeComponent("Position");
    ```

    If the object returned by the component function includes an `onDetach` function, it is called at this time.

    ```typescript
    const MeshComponent = () => ({
      mesh: null,
      onDetach(entity: Entity) {
        if (mesh) {
          dispose(mesh);
        }
      },
    });
    ```

#### Extending components

Occasionally you will want to override the component defaults when instantiating a component.

You can do something like `addComponent(Position, { y: CURRENT_Y })`, but for something more generic you can `extend` the component:

```typescript
import { extend } from "@prsm/ngn";

const Health = () => ({ max: 100 });
const WarriorHealth = extend(Health)({ max: 200 });
const MageHealth = extend(Health)({ max: 75 });

// Internally, `WarriorHealth` and `MageHealth` are still
// identified as a `Health` components.
// This means that queries that match against `Health` will be updated
// to include anything that has `WarriorHealth` or `MageHealth`.

warriorEntity.addComponent(WarriorHealth));

const mortals = query({ and: [Health] });

mortals((results) => {
  // results includes warriorEntity
});
```

* **`World > query`**

  Queries the world for entities with the given tags and components.

  `query` returns a function that accepts a callback. The callback is immediately called
  with an array of results. Each result is an object that contains an `entity` key, and a key
  for each component that is found on the entity.

  `query` accepts an object with the following properties:

  ```typescript
  {
    and: [], // matched Entities will have all of these components
    or: [], // matched Entities will have any of these components
    not: [], // matched Entities will have none of these components
    tags: [], // matched Entities will have any of these tags
  }
  ```

  ```typescript
  createEntity().addComponent(Position).addComponent(Velocity);
  createEntity().addComponent(Position).addComponent(Velocity).addComponent(Dead);

  const movables = query({ and: [Position, Velocity], not: [Dead] });

  movables((results) => {
    results.forEach(({ Position, Velocity }) => {
      Position.x += Velocity.x;
      Position.y += Velocity.y;
    });
  });
  ```

  For optimum performance, query results are cached while entity state is clean. When an entity is created, destroyed, or has a component added or removed, the cache is invalidated.

* **`World > addSystem`**

  Adds a system to the world. Systems are either:

    - A function that receives the `WorldState` as its only argument.
    - An object with an `update` function that receives the `WorldState` as its only argument.
    - An instance of a class that has an `update` function that receives the `WorldState` as its only argument.

    None of these need to return anything, and the `WorldState` they receive is mutable.
  
  Systems are called in the order they were added.

  ```typescript
  const MovementSystem = (state: WorldState) => {};
  addSystem(MovementSystem);

  const MovementSystem = { update: (state: WorldState) => {} };
  addSystem(MovementSystem);

  class MovementSystem { update(state: WorldState) {} }
  addSystem(new MovementSystem());
  ```

* **`World > removeSystem`**

  Removes a system from the world. Preserves the order of the remaining systems.

  ```typescript
  removeSystem(movableSystem);
  ```

  **`World > defineMain`**

  Defines the main program loop. The callback will be called every frame once `start` is called.

  ```typescript
  defineMain(() => {
    // ..
  });
  ```

* **`World > start`**

  Starts the main program loop. Does not do anything other than call
  the callback provided to `defineMain`.

  You can use your own loop instead of this one if you prefer, but the builtin loop does things like calculate fps and frame delta for you. These values are stored in `state.time`. If you create your own loop, it would be a good idea to calculate these values yourself and populate `state.time` with them.

  ```typescript
  start();
  ```

* **`World > stop`**

  Stops the main program loop (which was defined by passing it to `defineMain`).

  ```typescript
  // if gameover, or something
  stop();
  ```

* **`World > step`**

  Calls all systems once. Passes the `WorldState` to each system. You should do this in your main program loop, e.g.:

  ```typescript
  const main = () => {
    step();
  };

  defineMain(main);

  start();

  // later on:
  stop();
  ```

## Extras

Some optional extras are available that you may find useful.

### Keyboard, mouse and gamepad input

* **`inputSystem`**

  This input system recognizes keyboard, mouse and gamepad input and has a simple API.

  ```typescript
  import { inputSystem } from "ecs-ngn";

  addSystem(inputSystem);
  ```

  If you want to use the builtin input tooling, you will want to call the `inputSystem` before most all other systems in your main program as it is responsible for updating button/key/mouse state.

#### ButtonState

  For keyboard and mouse devices, when retrieving the state of a button will return a `ButtonState` object with the following shape:

  ```typescript
  export interface ButtonState {
    // This is true for one frame only, the frame the button was pressed.
    justPressed: boolean;
    // This is true for as long as the button is being pressed.
    pressed: boolean;
    // This is true for one frame only, the frame the button was released.
    justReleased: boolean;
  }
  ```

  Gamepads return a `GamepadButtonState` which includes all of the same properties as `ButtonState`, with the addition of:

  ```typescript
  export interface GamepadButtonState extends ButtonState {
    // This is true for as long as the button is being touched (e.g. the touchpad on a PS5 controller)
    touched: boolean;
    // This is the value of the button, between 0 and 1. For triggers, this is the amount the trigger is pressed.
    value: number;
  }
  ```

  So, for example, if you were handling the jumping of a character, which should happen as soon as the jump button is pressed, you would check for `justPressed`:

  ```typescript
  import { input } from "ecs-ngn";

  if (input.keyboard.getKey("Space").justPressed) {
    // jump!
  }
  ```

#### API

  ```typescript
  import { input } from "ecs-ngn";
  ```

  * **`input`** is an object that looks like:

    * **`input.mouse`**

      * **`input.mouse.useMapping(m: MouseMapping)`**

        Defines a human-readable mapping to mouse buttons and axes.

        By default, the [`StandardMouse`](./src/extras/input/devices/mappings/mouse.ts) mapping is used and you probably don't need to call this.

      * **`input.mouse.getButton(): { pressed: boolean, justPressed: boolean, justReleased: boolean }`**

        Returns the state of a mouse button, e.g.:

        ```typescript
        const { pressed, justPressed, justReleased } = input.mouse.getButton("Mouse1");
        ```

      * **`input.mouse.getAxis(axis: string): number`**

        Returns the value of a mouse axis.
        With the `StandardMouse` mapping, the axes are: `Horizontal`, `Vertical`, and `Wheel`.

      * **`input.mouse.getPosition(): [x: number, y: number]`**

        Returns the position of the mouse.

    * **`input.keyboard`**

      * **`input.keyboard.useMapping(m: KeyboardMapping)`**

        Defines a human-readable mapping to keyboard keys.

        By default, the [`StandardKeyboard`](./src/extras/input/devices/mappings/keyboard.ts) mapping is used and you probably don't need to call this, unless you want to rename a key, e.g.:

        ```typescript
          import { StandardKeyboard } from "@prsm/ngn";

          const MyKeyboardMapping = (): KeyboardMapping => {
            return {
              ...StandardKeyboard(),
              [KeyboardKey.Space]: "FireLazerz",
            }
          };

          input.keyboard.useMapping(MyKeyboardMapping);
          input.keyboard.getKey("FireLazerz");
        ```

      * **`input.keyboard.getKey(b: string): { pressed: boolean, justPressed: boolean, justReleased: boolean }`**

        Returns the state of a keyboard key. The key should be the human readable name value defined in the mapping used.

    * **`input.gamepad`**

      * **`input.gamepad(index: number).useMapping(m: GamepadMapping)`**

        Defines a human-readable mapping to gamepad buttons and axes.

        The default mapping is assigned by inspecting the `Gamepad.id` property.

        PlayStation5, Xbox, and SCUF Vantage 2 mappings are included and handled automatically. PRs that add additional mappings are welcome.
      
      * **`input.gamepad(index: number).getButton(button: string): { pressed: boolean, touched: boolean, value: number, justPressed: boolean, justReleased: boolean }`**
    
        Returns the state of a gamepad button.
      
      * **`input.gamepad(index: number).getAxis(axis: string): number`**
      
        Returns the value of a gamepad axis.

### Expiring log system

* **`logSystem`**

  This log system takes advantage of `state.time.delta` to expire log entries over
  time. By default, this is 10 seconds, but this is configurable.

  The whole point of this system is to draw debug messages to the canvas, but have them disappear after a while.

  ```typescript
  import { createLogSystem } from "ecs-ngn";

  const logSystem = createLogSystem({ maxLifetime: 5_000 });

  addSystem(logSystem);

  logSystem.log("some useful debug message");

  logSystem.expiringLogs.forEach(({ message }, index) => {
    drawTextToCanvas(message, { x: 0, y: index * 20 });
  });
  ```
