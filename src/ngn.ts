/**
  * entity.id -> Set of component.name
  */
export const $ecMap = Symbol();

/**
  * entity.id -> component.name -> index of component in entity.components
  *
  * This map stores indices of components in the entity component array.
  * The purpose of this map is to allow for fast lookups of components in the
  * entity.components array (e.g. entity.getComponent()).
  */
export const $eciMap = Symbol();

/**
  * component.name -> array of entity.ids that have this component
  */
export const $ceMap = Symbol();
export const $eMap = Symbol();
export const $queryResults = Symbol();
export const $dirty = Symbol();
export const $systems = Symbol();
export const $running = Symbol();
export const $onEntityCreated = Symbol();
export const $mainLoop = Symbol();

export type Component = () => {};

export type QueryConfig = Readonly<Partial<{
  /** Matches entities as long as the entity has all of the components in the provided array. */
  and: Component[];
  /** Matches entities as long as the entity has at least one of the components in the provided array. */
  or: Component[];
  /** Matches entities as long as the entity has none of the components in the provided array. */
  not: Component[];
  /** Matches entities that have any of these tag strings. */
  tag: string[];
}>>;

export type Entity = Readonly<{
  id: number;
  components: Component[];
  addTag: (tag: string) => Entity;
  removeTag: (tag: string) => Entity;
  getTag: () => string;
  addComponent: (component: Component) => Entity;
  removeComponent: (component: Component) => Entity;
  getComponent: <T extends Component>(arg: T) => ReturnType<T>;
  destroy: () => void;
}>;

export type SystemFn = (w: World) => void;
export type SystemCls = { update: (w: World) => void; }
export type System = SystemCls | SystemFn;

export type World = {
  [$ecMap]: { [key: number]: Set<string> };
  [$eciMap]: { [key: number]: { [componentName: string]: number } };
  [$ceMap]: { [key: string]: number[] };
  [$eMap]: { [key: number]: any };
  [$dirty]: boolean;
  [$queryResults]: { [key: string]: any[] };
  [$systems]: ((w: World) => void)[];
  [$mainLoop]: (() => void);
  time: {
    elapsed: number;
    elapsedScaled: number;
    delta: number;
    scale: number;
    fps: number;
  };
  [$running]: boolean;
  [$onEntityCreated]: ((e: Entity) => void)[];
};

export const createWorld = () => {
  const world: World = {
    [$ecMap]: {},
    [$eciMap]: {},
    [$ceMap]: {},
    [$eMap]: {},
    [$dirty]: true,
    [$queryResults]: {},
    [$systems]: [],
    [$mainLoop]: null,
    time: {
      elapsed: 0,
      elapsedScaled: 0,
      delta: 0,
      scale: 1,
      fps: 0,
    },
    [$running]: false,
    [$onEntityCreated]: [],
  };

  const defineMain = (callback: (w?: World) => void) => {
    world[$mainLoop] = callback;
  };

  /**
   * start - starts the game loop.
   * @param callback - function to be executed on each iteration of the loop.
   * @returns - a function to stop the loop.
   */
  const start = () => {
    let then = 0;
    let accumulator = 0;
    const boundLoop = handler.bind(start);
    let loopHandler = -1;
    const { time } = world;
    time.delta = 0;
    time.elapsed = 0;
    time.elapsedScaled = 0;
    time.fps = 0;
    world[$running] = true;

    let raf: ((cb: FrameRequestCallback) => number) | null = null;
    let craf: ((handle: number) => void) | null = null;

    /**
     * fake requestAnimationFrame and cancelAnimationFrame
     * so that we can run tests in a node.js environment.
     */
    if (typeof window !== "undefined") {
      raf = requestAnimationFrame;
      craf = cancelAnimationFrame;
    } else {
      let now = 0;
      raf = (cb: FrameRequestCallback) => {
        return setTimeout(() => {
          now += 16.67; // simulate 60 fps
          cb(now);
        }, 16.67);
      };
  
      craf = (id: number) => {
        clearTimeout(id);
      };
    }

    const fpsMultiplier = 100 / 60;

    function handler(now: number) {
      if (!world[$running]) return craf(loopHandler);
      time.delta = now - then;
      time.elapsedScaled += time.delta * 0.001 * time.scale;

      if (time.elapsedScaled < time.elapsed) {
        return raf(boundLoop);
      }

      time.elapsed += time.delta * 0.001;
      then = now;
      accumulator += time.delta;

      if (accumulator > 100) {
        // world.time.fps = Math.ceil(((((1000 / world.time.delta) * 100) | 0) * 0.01 * 100) / 100);
        time.fps = Math.ceil(((1000 / time.delta) * fpsMultiplier) * 100) / 100;
        accumulator = 0;
      }

      world[$mainLoop]();

      loopHandler = raf(boundLoop);
    }

    loopHandler = raf(boundLoop);

    return () => (world[$running] = false);
  };

  const stop = () => {
    world[$running] = false;
  };

  const worldPipe = (...fns: Function[]) => {
    return () => {
      for (const fn of fns) {
        fn(world);
      }
    };
  };

  const pipe = (...fns: Function[]) => worldPipe(...fns);

  function step() {
    for (const system of world[$systems]) {
      system(world);
    }
  }

  /**
   * Adds one or more systems to the ECS world.
   * A system can be either a @see SystemFn or a @see SystemCls.
   * @param systems An array of system classes or functions.
   * @throws {Error} If a system is not a valid system class or function.
   */
  function addSystem(...systems: (SystemCls | SystemFn)[]) {
    for (const system of systems) {
      // If the system is a function, add it to the world systems array
      if (typeof system === "function") {
        world[$systems].push(system);
      // If the system has an `update` method, add that method to the world systems array
      } else if (system.update && typeof system.update === "function") {
        world[$systems].push(system.update);
      // If the system is not a valid system class or function, throw an error
      } else {
        throw new Error(`Not a valid system: ${JSON.stringify(system)}`);
      }
    }
  }

  /**
   * Removes one or more systems from the world.
   * 
   * @param {...(SystemCls | SystemFn)[]} systems - The system or systems to remove.
   * @throws {TypeError} Throws an error if the system parameter is not a function or an object with an update function.
   * @returns {void}
   */
  function removeSystem(...systems: (SystemCls | SystemFn)[]): void {
    for (const system of systems) {
      if (typeof system === "function") {
        world[$systems] = world[$systems].filter((s) => s !== system);
      } else if (system.update && typeof system.update === "function") {
        world[$systems] = world[$systems].filter((s) => s !== system.update);
      } else {
        throw new TypeError("Parameter must be a function or an object with an update function.");
      }
    }
  }

/**
 * Retrieves entities from the world that match the given query configuration.
 * If the world is not dirty and the query has been run before, returns the cached query results.
 * @param queryConfig - Object containing arrays of component types and tags to match against.
 * @param queryName - Unique name for this query.
 * @returns Array of entities that match the given query configuration.
 */
const getQuery = (queryConfig: QueryConfig, queryName: string): Entity[] => {
  // If the world is not dirty and the query has been run before, return the cached query results.
  if (!world[$dirty] && world[$queryResults][queryName]) {
    return world[$queryResults][queryName];
  }

  const { and = [], or = [], not = [], tag = [] } = queryConfig;
  
  // Create a set to hold the IDs of matching entities.
  const entityIds = new Set<number>();

  // Loop through all entities in the world and check if they match the given query.
  Object.values(world[$eMap]).forEach((entity) => {
    const matches = [];
    
    not.length && matches.push(!not.some((component) => entity.hasComponent(component)));
    and.length && matches.push(and.every((component) => entity.hasComponent(component)));
    or.length && matches.push(or.some((component) => entity.hasComponent(component)));
    tag.length && matches.push(tag.some((tag) => entity.tag && entity.tag === tag));

    // If all match conditions are true, add the entity's ID to the set of matching entity IDs.
    if (matches.length && matches.every((m) => m === true)) {
      entityIds.add(entity.id);
    }
  });

  // Create an array of entities from the set of matching entity IDs.
  const entities: Entity[] = [];
  [...entityIds].map((entityId) => entities.push(world[$eMap][entityId]));

  // Cache the query results and mark the world as not dirty.
  world[$queryResults][queryName] = entities;
  world[$dirty] = false;

  return entities;
};

/**
 * Defines a query for filtering entities based on a combination of criteria.
 * @param queryConfig The configuration for the query. Contains and, or, not and tag criteria.
 * @throws {Error} Invalid query if any criteria in the query config does not have a 'name' property.
 * @returns A function that takes a query implementation and returns the results of the query.
 */
const query = (queryConfig: QueryConfig) => {
  const { and = [], or = [], not = [], tag = [] } = queryConfig;

  // Checks if a criteria object has a 'name' property
  const validQuery = (c) => {
    return Object.prototype.hasOwnProperty.call(c, "name");
  };

  // Throws an error if any criteria object in the query config does not have a 'name' property
  if (![...and, ...or, ...not].every(validQuery)) {
    throw new Error("Invalid query");
  }

  // Constructs a string representing the query name based on the criteria in the query config
  const queryName = [
    "and", ...and.map((c) => c.name),
    "or", ...or.map((c) => c.name),
    "not", ...not.map((c) => c.name),
    "tag", ...tag,
  ].join("");

  // Returns a function that takes a query implementation and executes the query using the given query name
  return (queryImpl: (entities: Entity[]) => void) => {
    return queryImpl(getQuery(queryConfig, queryName));
  };
};

  function destroyEntity(e: Entity) {
    const exists = world[$eMap][e.id];

    if (!exists) return false;

    const components: string[] = [];

    world[$ecMap][e.id].forEach((componentName) => {
      components.push(componentName);
    });

    components.forEach((componentName) => {
      world[$ceMap][componentName] = world[$ceMap][componentName].filter(
        (id) => id !== e.id
      );
    });

    delete world[$ecMap][e.id];
    delete world[$eMap][e.id];

    world[$dirty] = true;

    return true;
  }

  function onEntityCreated(fn: any) {
    if (typeof fn !== "function") return;

    world[$onEntityCreated].push(fn);

    return () => {
      world[$onEntityCreated] = world[$onEntityCreated].filter((f) => f !== fn);
    };
  }

/**
 * Creates a new component for the given entity and adds it to the world.
 * @param entity The entity to add the component to.
 * @param component The component function to add.
 * @param defaults (optional) Default values to apply to the component.
 * @returns The modified entity with the new component added.
 */
function createComponent(entity: Entity, component: Function, defaults: object = {}): Entity {
  // Set the world dirty flag to indicate a change.
  world[$dirty] = true;

  // If the entity already has this component, return the unmodified entity.
  if (world[$ecMap]?.[entity.id]?.has(component.name)) return entity;

  // If defaults are provided and are an object, assign them to the component.
  if (defaults && typeof defaults === "object") {
    entity.components.push(Object.assign(component(), defaults));
  } else {
    entity.components.push(component());
  }

  // Add the component to the entity's component map.
  world[$ecMap][entity.id] = world[$ecMap][entity.id] || new Set();
  world[$ecMap][entity.id].add(component.name);

  // Add the component index to the entity's index map.
  world[$eciMap][entity.id] = world[$eciMap][entity.id] || {};
  world[$eciMap][entity.id][component.name] = entity.components.length - 1;

  // Add the entity to the component's entity map.
  world[$ceMap][component.name] = world[$ceMap][component.name] || [];
  world[$ceMap][component.name].push(entity.id);

  return entity;
}

  let _entityId = 0;

  /**
   * Creates an entity with the given specification object.
   * @param {object} spec - An optional specification object for the entity.
   * @returns {any} - Returns the created entity.
   */
  function createEntity(spec: object = {}) {
    world[$dirty] = true;
    const id = _entityId++;
    const components: any[] = [];

    function addTag(t: string): Entity {
      this.tag = t;
      world[$dirty] = true;

      return this;
    }

    function removeTag(): Entity {
      this.tag = "";
      world[$dirty] = true;

      return this;
    }

    function getTag() {
      return this.tag;
    }

    function addComponent(c: Component, defaults = {}) {
      return createComponent(this, c, defaults);
    }

    function hasComponent(component: Component) {
      return world[$ecMap]?.[id]?.has(component.name);
    }

    function getComponent<T extends Component>(arg: T): ReturnType<T> {
      const index = [...world[$ecMap][id]].indexOf(arg.name);
      return components[index];
    }

    /**
     * Removes the specified component from the entity and updates the world state accordingly.
     * 
     * @param component The component to remove from the entity.
     * @returns The modified entity.
     */
    function removeComponent(component: Component): Entity {
      // Remove the component from the entity's component map.
      world[$ecMap][id].delete(component.name);

      // Set the entity's component index for the specified component to undefined.
      world[$eciMap][id][component.name] = undefined;

      // Remove the entity's ID from the component's entity list.
      world[$ceMap][component.name] = world[$ceMap][component.name].filter((e) => e !== id);

      // Remove the component from the entity's component list.
      components.splice([...world[$ecMap][id]].indexOf(component.name) - 1, 1);

      // Update the entity's component indices for all components after the removed component.
      Object.keys(world[$eciMap][id]).forEach((componentName) => {
        if (world[$eciMap][id][componentName] > components.findIndex((c) => c.name === componentName)) {
          world[$eciMap][id][componentName]--;
        }
      });

      // Mark the world as dirty to trigger a system update.
      world[$dirty] = true;

      // Return the modified entity.
      return this;
    }

    function destroy() {
      return destroyEntity(this);
    }

    const entity = Object.assign({}, spec, {
      id,
      components,
      addTag,
      removeTag,
      getTag,
      addComponent,
      hasComponent,
      getComponent,
      removeComponent,
      destroy,
    });

    world[$eMap][id] = entity;
    world[$ecMap][id] = new Set();

    world[$onEntityCreated].forEach((fn) => {
      fn(entity);
    });

    return entity;
  };

  return {
    world,
    query,
    createEntity,
    onEntityCreated,
    addSystem,
    removeSystem,
    start,
    stop,
    step,
    pipe,
    defineMain,
  };
};
