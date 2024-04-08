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
export const $dirtyQueries = Symbol();
export const $queryDependencies = Symbol();
export const $systems = Symbol();
export const $running = Symbol();
export const $onEntityCreated = Symbol();
export const $mainLoop = Symbol();

//#region Types
export type Component = () => {};
export type ComponentInstance = () => {
  __ngn__?: {
    parent: number;
    name: string;
  };
} & Record<string, unknown>;

export type QueryConfig = Readonly<
  Partial<{
    /** Matches entities as long as the entity has all of the components in the provided array. */
    and: Component[];
    /** Matches entities as long as the entity has at least one of the components in the provided array. */
    or: Component[];
    /** Matches entities as long as the entity has none of the components in the provided array. */
    not: Component[];
    /** Matches entities that have any of these tag strings. */
    tag: string[];
  }>
>;

export type Entity = Readonly<{
  id: number;
  components: ReturnType<ComponentInstance>[];
  addTag: (tag: string) => Entity;
  removeTag: () => Entity;
  getTag: () => string;
  addComponent: (component: Component) => Entity;
  removeComponent: (component: Component) => Entity;
  getComponent: <T extends ComponentInstance>(arg: T) => ReturnType<T>;
  hasComponent: (component: Component) => boolean;
  destroy: () => void;
}>;

export type SystemFn = (w: World) => void;
export type SystemCls = { update: (w: World) => void };
export type System = SystemCls | SystemFn;

export type World = {
  [$eciMap]: { [key: number]: { [componentName: string]: number } };
  [$ceMap]: { [key: string]: number[] };
  [$eMap]: { [key: number]: any };
  [$dirtyQueries]: Set<string>;
  [$queryDependencies]: Map<string, Set<string>>;
  [$queryResults]: { [key: string]: any[] };
  [$systems]: ((w: World) => void)[];
  [$mainLoop]: () => void;
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

//#region World API
export const createWorld = () => {
  const world: World = {
    [$eciMap]: {},
    [$ceMap]: {},
    [$eMap]: {},
    [$dirtyQueries]: new Set(),
    [$queryDependencies]: new Map(),
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

  //#region Frametime logic
  /**
   * start - starts the game loop.
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
        time.fps = Math.min(Math.ceil(1000 / time.delta / (1000 / 60)), 60);
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
        throw new TypeError(
          "Parameter must be a function or an object with an update function.",
        );
      }
    }
  }

  //#region Query logic
  /**
   * Retrieves entities from the world that match the given query configuration.
   * If the world is not dirty and the query has been run before, returns the cached query results.
   * @param queryConfig - Object containing arrays of component types and tags to match against.
   * @param queryName - Unique name for this query.
   * @returns Array of entities that match the given query configuration.
   */
  const getQuery = (queryConfig: QueryConfig, queryName: string): Entity[] => {
    // If we have non-dirty query results for this queryName, return them
    if (!world[$dirtyQueries].has(queryName) && world[$queryResults][queryName]) {
      return world[$queryResults][queryName];
    }

    const { and = [], or = [], not = [], tag = [] } = queryConfig;
    const entities: Entity[] = Object.values(world[$eMap]).filter((entity) => {
      return (
        (!not.length ||
          !not.some((component) => entity.hasComponent(component))) &&
        (!and.length ||
          and.every((component) => entity.hasComponent(component))) &&
        (!or.length ||
          or.some((component) => entity.hasComponent(component))) &&
        (!tag.length || tag.some((t) => entity.tag === t))
      );
    });

    world[$queryResults][queryName] = entities;
    world[$dirtyQueries].delete(queryName);

    return entities;
  };

  const markQueryDirty = (queryName: string) => {
    world[$dirtyQueries].add(queryName);
  };

  /**
   * Defines a query for filtering entities based on a combination of criteria.
   * @param queryConfig The configuration for the query. Contains and, or, not and tag criteria.
   * @throws {Error} Invalid query if any criteria in the query config does not have a 'name' property.
   * @returns A function that takes a query implementation and returns the results of the query.
   */
  const query = ({ and = [], or = [], not = [], tag = [] }: QueryConfig) => {
    // Checks if a criteria object has a 'name' property
    const validQuery = (c: Component) => Object.prototype.hasOwnProperty.call(c, "name");

    // Throws an error if any criteria object in the query config does not have a 'name' property
    if (![...and, ...or, ...not].every(validQuery))
      throw new Error("Invalid query");

    // Constructs a string representing the query name based on the criteria in the query config
    const queryName = [
      "and",
      ...and.map((c) => c.name),
      "or",
      ...or.map((c) => c.name),
      "not",
      ...not.map((c) => c.name),
      "tag",
      ...tag,
    ].join("");

    // Register component dependencies
    [...and, ...or, ...not].forEach((c) => {
      const dependencies = world[$queryDependencies].get(c.name) || new Set();
      dependencies.add(queryName);
      world[$queryDependencies].set(c.name, dependencies);
    });

    // Register tag dependencies
    tag.forEach((t) => {
      const tagKey = `tag:${t}`;
      const dependencies = world[$queryDependencies].get(tagKey) || new Set();
      dependencies.add(queryName);
      world[$queryDependencies].set(tagKey, dependencies);
    });

    // Returns a function that takes a query implementation and executes the query using the given query name
    return (queryImpl: (entities: Entity[]) => void) =>
      queryImpl(getQuery({ and, or, not, tag }, queryName));
  };

  function destroyEntity(e: Entity) {
    const exists = world[$eMap][e.id];

    if (!exists) return false;

    const componentsToRemove: string[] = Object.keys(world[$eciMap][e.id]);

    componentsToRemove.forEach((componentName) => {
      world[$ceMap][componentName] = world[$ceMap][componentName].filter(
        (id) => id !== e.id,
      );
    });

    delete world[$eciMap][e.id];
    delete world[$eMap][e.id];

    componentsToRemove.forEach((componentName) => {
      const affectedQueries = world[$queryDependencies].get(componentName);

      if (affectedQueries) {
        affectedQueries.forEach(markQueryDirty);
      }
    });

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
  function createComponent(
    entity: Entity,
    component: Function,
    defaults: object = {},
  ): Entity {
    // If the entity already has this component, return the unmodified entity.
    if (world[$eciMap]?.[entity.id]?.[component.name] !== undefined) return entity;

    const affectedQueries = world[$queryDependencies].get(component.name);

    if (affectedQueries) {
      affectedQueries.forEach(markQueryDirty);
    }

    // Create the component, assigning defaults and a reference to the parent entity.
    entity.components.push(
      Object.assign(
        {},
        {
          ...component(),
          ...defaults,
          __ngn__: {
            parent: entity.id,
            name: component.name,
          },
        },
      ),
    );

    // Add the component index to the entity's index map.
    world[$eciMap][entity.id] = world[$eciMap][entity.id] || {};
    world[$eciMap][entity.id][component.name] = entity.components.length - 1;

    // Add the entity to the component's entity map.
    world[$ceMap][component.name] = world[$ceMap][component.name] || [];
    world[$ceMap][component.name].push(entity.id);

    return entity;
  }

  let _currentEntityId = 0;

  const nextValidEntityId = () => {
    while (world[$eMap][_currentEntityId]) {
      _currentEntityId++;
    }

    return _currentEntityId;
  };

  //#region Entity API
  /**
   * Creates an entity with the given specification object.
   * @param {object} spec - Optional data to be stored on the entity.
   * @param {boolean} forceId - Forcefully set the entity's ID to the given value. If an existing entity already occupies this ID, the existing entity's ID will
   * be incremented until a new valid ID is found.
   * @returns {any} - Returns the created entity.
   */
  function createEntity<T>(spec: T = {} as T, forceId = undefined): T & Entity {
    const id = forceId ?? nextValidEntityId();
    const components: any[] = [];

    if (forceId !== undefined) {
      _currentEntityId = forceId;
    }

    const tagKey = (t: string) => `tag:${t}`;

    function addTag(t: string): Entity {
      const previousTagKey = tagKey(this.tag);

      this.tag = t;

      const newAffectedQueries = world[$queryDependencies].get(tagKey(t));

      if (newAffectedQueries) {
        newAffectedQueries.forEach(markQueryDirty);
      }

      const oldAffectedQueries = world[$queryDependencies].get(previousTagKey);

      if (oldAffectedQueries) {
        oldAffectedQueries.forEach(markQueryDirty);
      }

      return this;
    }

    function removeTag(): Entity {
      const previousTagKey = tagKey(this.tag);
      this.tag = "";

      const affectedQueries = world[$queryDependencies].get(previousTagKey);

      if (affectedQueries) {
        affectedQueries.forEach(markQueryDirty);
      }

      return this;
    }

    function getTag() {
      return this.tag;
    }

    function addComponent(c: Component, defaults = {}) {
      return createComponent(this, c, defaults);
    }

    function hasComponent(component: Component) {
      return world[$eciMap]?.[id]?.[component.name] !== undefined;
    }

    function getComponent<T extends ComponentInstance>(arg: T): ReturnType<T> {
      const index = world[$eciMap][id][arg.name];
      return components[index];
    }

    /**
     * Removes the specified component from the entity and updates the world state accordingly.
     *
     * @param component The component to remove from the entity.
     * @returns The modified entity.
     */
    function removeComponent(component: Component | string): Entity {
      const name = typeof component === "string" ? component : component.name;

      const affectedQueries = world[$queryDependencies].get(name);

      if (affectedQueries) {
        affectedQueries.forEach(markQueryDirty);
      }

      // Set the entity's component index for the specified component to undefined.
      world[$eciMap][id][name] = undefined;

      // Remove the entity's ID from the component's entity list.
      world[$ceMap][name] = world[$ceMap][name].filter((e) => e !== id);

      // Remove the component from the entity's component list.
      const index = world[$eciMap][id][name];
      components.splice(index, 1)

      // Update the entity's component indices for all components after the removed component.
      Object.keys(world[$eciMap][id]).forEach((componentName) => {
        if (
          world[$eciMap][id][componentName] >
          components.findIndex((c) => c.name === componentName)
        ) {
          world[$eciMap][id][componentName]--;
        }
      });

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

    // If we are focing a specific entity id, we need to migrate any
    // entity that might already occupy this space.
    if (forceId !== undefined && world[$eMap][forceId]) {
      migrateEntityId(forceId, nextValidEntityId());
    }

    world[$eMap][id] = entity;
    world[$eciMap][id] = {};

    world[$onEntityCreated].forEach((fn) => {
      fn(entity);
    });

    return entity as unknown as T & Entity;
  }

  /**
   * migrateEntityId updates the id of an entity in the world, and all
   * associated world maps.
   * @param oldId The id of the entity to migrate.
   * @param newId The id to migrate the entity to.
   */
  function migrateEntityId(oldId: number, newId: number) {
    const entity = world[$eMap][oldId];

    if (!entity) return;

    entity.id = newId;

    world[$eMap][newId] = entity;
    delete world[$eMap][oldId];

    world[$eciMap][newId] = world[$eciMap][oldId];
    delete world[$eciMap][oldId];
  }

  function getEntity(id: number): Entity {
    return world[$eMap][id];
  }

  return {
    world,
    query,
    createEntity,
    getEntity,
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
