import { getCreateId } from "./ids";

const createId = getCreateId({ init: 0, len: 4 });

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
    parent: string;
    name: string;
  };
} & {
  [key: string]: any;
};

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
  id: string;
  components: ReturnType<ComponentInstance>[];
  addTag: (tag: string) => Entity;
  removeTag: () => Entity;
  getTag: () => string;
  addComponent: (component: Component, defaults?: object) => Entity;
  removeComponent: (component: Component) => Entity;
  getComponent: <T extends ComponentInstance>(arg: T) => ReturnType<T>;
  hasComponent: (component: Component) => boolean;
  destroy: () => void;
}>;

export type QueryResults = {
  results: {
    entity: Entity;
    [componentName: string]: any;
  }[];
};

export type SystemFn = (w: WorldState) => void;
export type SystemCls = { update: (w: WorldState) => void };
export type System = SystemCls | SystemFn;

export type WorldState = {
  [$eciMap]: { [key: number]: { [componentName: string]: number } };
  [$ceMap]: { [key: string]: string[] };
  [$eMap]: { [key: number]: any };
  [$dirtyQueries]: Set<string>;
  [$queryDependencies]: Map<string, Set<string>>;
  [$queryResults]: { [key: string]: QueryResults };
  [$systems]: ((w: WorldState) => void)[];
  [$mainLoop]: (w: WorldState) => void;
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
  const state: WorldState = {
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

  const defineMain = (callback: (w?: WorldState) => void) => {
    state[$mainLoop] = callback;
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
    const { time } = state;
    time.delta = 0;
    time.elapsed = 0;
    time.elapsedScaled = 0;
    time.fps = 0;
    state[$running] = true;

    let raf: ((cb: FrameRequestCallback) => number) | null = null;
    let craf: ((handle: number) => void) | null = null;

    /**
     * Fake requestAnimationFrame and cancelAnimationFrame
     * so that we can run tests for this in node.
     */
    if (typeof window !== "undefined") {
      raf = requestAnimationFrame;
      craf = cancelAnimationFrame;
    } else {
      let now = 0;
      raf = (cb: FrameRequestCallback) => {
        return setTimeout(() => {
          now += 16.67;
          cb(now);
        }, 16.67);
      };

      craf = (id: number) => {
        clearTimeout(id);
      };
    }

    function handler(now: number) {
      if (!state[$running]) return craf(loopHandler);
      time.delta = now - then;
      time.elapsedScaled += time.delta * 0.001 * time.scale;

      if (time.elapsedScaled < time.elapsed) {
        return raf(boundLoop);
      }

      time.elapsed += time.delta * 0.001;
      then = now;
      accumulator += time.delta;

      if (accumulator > 100) {
        time.fps = Math.ceil(1000 / time.delta);
        accumulator = 0;
      }

      state[$mainLoop](state);

      loopHandler = raf(boundLoop);
    }

    loopHandler = raf(boundLoop);

    return () => (state[$running] = false);
  };

  const stop = () => {
    state[$running] = false;
  };

  function step() {
    for (const system of state[$systems]) {
      system(state);
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
        state[$systems].push(system);
        // If the system has an `update` method, add that method to the world systems array
      } else if (system.update && typeof system.update === "function") {
        state[$systems].push(system.update);
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
        state[$systems] = state[$systems].filter((s) => s !== system);
      } else if (system.update && typeof system.update === "function") {
        state[$systems] = state[$systems].filter((s) => s !== system.update);
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
  const getQuery = (queryConfig: QueryConfig, queryName: string) => {
    // If we have non-dirty query results for this queryName, return them
    if (!state[$dirtyQueries].has(queryName) && state[$queryResults][queryName]) {
      return state[$queryResults][queryName].results;
    }

    const { and = [], or = [], not = [], tag = [] } = queryConfig;
    const entities: Entity[] = Object.values(state[$eMap]).filter((entity) => {
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

    state[$queryResults][queryName] = {
      results: entities.map((entity) => {
        const result: any = { entity };

        entity.components.forEach((component) => {
          result[component.__ngn__.name] = component;
        });

        return result;
      }),
    };

    state[$dirtyQueries].delete(queryName);

    return state[$queryResults][queryName].results;
  };

  const markQueryDirty = (queryName: string) => {
    state[$dirtyQueries].add(queryName);
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

    // Component dependencies
    [...and, ...or, ...not].forEach((c) => {
      const dependencies = state[$queryDependencies].get(c.name) || new Set();
      dependencies.add(queryName);
      state[$queryDependencies].set(c.name, dependencies);
    });

    // Tag dependencies
    tag.forEach((t) => {
      const tagKey = `tag:${t}`;
      const dependencies = state[$queryDependencies].get(tagKey) || new Set();
      dependencies.add(queryName);
      state[$queryDependencies].set(tagKey, dependencies);
    });

    return (queryImpl: (results: { entity }[]) => void) =>
      queryImpl(getQuery({ and, or, not, tag }, queryName));
  };

  function destroyEntity(e: Entity) {
    const exists = state[$eMap][e.id];

    if (!exists) return false;

    const componentsToRemove: string[] = Object.keys(state[$eciMap][e.id]);

    componentsToRemove.forEach((componentName) => {
      state[$ceMap][componentName] = state[$ceMap][componentName].filter(
        (id) => id !== e.id,
      );
    });

    delete state[$eciMap][e.id];
    delete state[$eMap][e.id];

    componentsToRemove.forEach((componentName) => {
      const affectedQueries = state[$queryDependencies].get(componentName);

      if (affectedQueries) {
        affectedQueries.forEach(markQueryDirty);
      }
    });

    return true;
  }

  function onEntityCreated(fn: any) {
    if (typeof fn !== "function") return;

    state[$onEntityCreated].push(fn);

    return () => {
      state[$onEntityCreated] = state[$onEntityCreated].filter((f) => f !== fn);
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
    if (state[$eciMap]?.[entity.id]?.[component.name] !== undefined) return entity;

    const affectedQueries = state[$queryDependencies].get(component.name);

    if (affectedQueries) {
      affectedQueries.forEach(markQueryDirty);
    }

    const componentInstance = component();

    if (componentInstance.onAttach && typeof componentInstance.onAttach === "function") {
      componentInstance.onAttach(entity);
    }

    // Create the component, assigning defaults and a reference to the parent entity.
    entity.components.push(
      Object.assign(
        {},
        {
          ...componentInstance,
          ...defaults,
          __ngn__: {
            parent: entity.id,
            name: component.name,
          },
        },
      ) as ComponentInstance,
    );

    // Add the component index to the entity's index map.
    state[$eciMap][entity.id] = state[$eciMap][entity.id] || {};
    state[$eciMap][entity.id][component.name] = entity.components.length - 1;

    // Add the entity to the component's entity map.
    state[$ceMap][component.name] = state[$ceMap][component.name] || [];
    state[$ceMap][component.name].push(entity.id);

    return entity;
  }

  //#region Entity API
  /**
   * Creates an entity with the given specification object.
   * @param {object} spec - Optional data to be stored on the entity.
   * @param {boolean} forceId - Forcefully set the entity's ID to the given value. If an existing entity already occupies this ID, the existing entity's ID will
   * be incremented until a new valid ID is found.
   * @returns {any} - Returns the created entity.
   */
  function createEntity<T>(spec: T = {} as T, forceId: string = undefined): T & Entity {
    const id = forceId ?? createId();
    const components: any[] = [];

    const tagKey = (t: string) => `tag:${t}`;

    function updateTagQueries(tagKey: string) {
      const affectedQueries = state[$queryDependencies].get(tagKey);

      if (affectedQueries) {
        affectedQueries.forEach(markQueryDirty);
      }
    }

    function addTag(t: string): Entity {
      const previousTagKey = tagKey(this.tag);
      
      this.tag = t;
    
      updateTagQueries(tagKey(t));
      updateTagQueries(previousTagKey);
    
      return this;
    }
    
    function removeTag(): Entity {
      const previousTagKey = tagKey(this.tag);
      this.tag = "";
    
      updateTagQueries(previousTagKey);
    
      return this;
    }

    function getTag() {
      return this.tag;
    }

    function addComponent(c: Component, defaults = {}) {
      return createComponent(this, c, defaults);
    }

    function hasComponent(component: Component) {
      return state[$eciMap]?.[id]?.[component.name] !== undefined;
    }

    function getComponent<T extends ComponentInstance>(arg: T): ReturnType<T> {
      const index = state[$eciMap][id][arg.name];
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

      const componentInstance = getComponent(typeof component === "string" ? { name } as any : component);

      if (componentInstance && (componentInstance.onDetach && typeof componentInstance.onDetach === "function")) {
        componentInstance.onDetach(this);
      }

      const affectedQueries = state[$queryDependencies].get(name);

      if (affectedQueries) {
        affectedQueries.forEach(markQueryDirty);
      }

      // Set the entity's component index for the specified component to undefined.
      state[$eciMap][id][name] = undefined;

      // Remove the entity's ID from the component's entity list.
      state[$ceMap][name] = state[$ceMap][name].filter((e) => e !== id);

      // Remove the component from the entity's component list.
      const index = state[$eciMap][id][name];
      components.splice(index, 1)

      // Update the entity's component indices for all components after the removed component.
      Object.keys(state[$eciMap][id]).forEach((componentName) => {
        if (
          state[$eciMap][id][componentName] >
          components.findIndex((c) => c.name === componentName)
        ) {
          state[$eciMap][id][componentName]--;
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
    if (forceId !== undefined && state[$eMap][forceId]) {
      migrateEntityId(forceId, createId());
    }

    state[$eMap][id] = entity;
    state[$eciMap][id] = {};

    state[$onEntityCreated].forEach((fn) => {
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
  function migrateEntityId(oldId: string, newId: string) {
    const entity = state[$eMap][oldId];

    if (!entity) return;

    entity.id = newId;

    state[$eMap][newId] = entity;
    delete state[$eMap][oldId];

    state[$eciMap][newId] = state[$eciMap][oldId];
    delete state[$eciMap][oldId];
  }

  function getEntity(id: string): Entity {
    return state[$eMap][id];
  }

  return {
    state,
    query,
    createEntity,
    getEntity,
    onEntityCreated,
    addSystem,
    removeSystem,
    start,
    stop,
    step,
    defineMain,
  };
};
