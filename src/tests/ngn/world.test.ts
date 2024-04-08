import { testSuite, expect, test } from "manten";
import { $ceMap, $eciMap, $eMap, $queryResults, $systems, createWorld, Entity, System, World } from "../../ngn";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default testSuite(async () => {
  test("can createWorld", () => {
    const { world, query, createEntity } = createWorld();
    expect(world).toBeDefined();
    expect(query).toBeDefined();
    expect(createEntity).toBeDefined();
  });

  test("can createEntity", () => {
    const { createEntity } = createWorld();
    const entity = createEntity({});
    expect(entity).toBeDefined();
    expect(entity.id).toBeDefined();
    expect(entity.components).toBeDefined();
    expect(entity.addComponent).toBeDefined();
    expect(entity.hasComponent).toBeDefined();
    expect(entity.getComponent).toBeDefined();
    expect(entity.removeComponent).toBeDefined();
    expect(entity.destroy).toBeDefined();
  });

  test("can createEntity and override id", () => {
    const { createEntity } = createWorld();
    const entity = createEntity({ name: "foo" }, 5);
    expect(entity.name).toEqual("foo");
    expect(entity.id).toEqual(5);

    const nextEntity = createEntity({ name: "bar" });
    expect(nextEntity.name).toEqual("bar");
    expect(nextEntity.id).toEqual(6);
  });

  test("overriding existing id should move the old entity and update world maps", () => {
    const { createEntity, world } = createWorld();

    const Foo = () => ({ name: "foo" });
    const Bar = () => ({ name: "bar" });

    const firstEntity = createEntity({ name: "foo" }, 5).addComponent(Foo)
    expect(firstEntity.id).toEqual(5);

    const secondEntity = createEntity({ name: "bar" }, 5).addComponent(Bar);

    // the old entity now has a new id, which is the next valid id
    expect(firstEntity.id).toEqual(6);

    // the new entity forcefully took the old id
    expect(secondEntity.id).toEqual(5);

    // the world maps should be correctly updated
    expect(world[$eMap][5]).toEqual(secondEntity);
    expect(world[$eMap][6]).toEqual(firstEntity);

    expect(world[$eciMap][5]).toEqual({ [Bar.name]: 0 });
    expect(world[$eciMap][6]).toEqual({ [Foo.name]: 0 });

    const thirdEntity = createEntity({ name: "baz" });
    expect(thirdEntity.id).toEqual(7);
  });

  test("can getEntity", () => {
    const { createEntity, getEntity } = createWorld();
    const entity = createEntity({});
    expect(getEntity(entity.id)).toEqual(entity);
  });

  test("createEntity with defaults", () => {
    const { createEntity } = createWorld();
    const entity = createEntity({ a: 1 });
    expect(entity["a"]).toEqual(1);
  });

  test("onEntityCreated", async () => {
    const { createEntity, onEntityCreated } = createWorld();
    let called = false;

    onEntityCreated((ent: Entity) => {
      called = true;
      expect(ent.id).toBeDefined();
    });

    createEntity();

    expect(called).toEqual(true);
  });

  test("can addComponent", () => {
    const { createEntity } = createWorld();
    const entity = createEntity({});
    const thing = () => ({ hello: "world" });
    entity.addComponent(thing);
    expect(entity.components.length).toEqual(1);
    expect(entity.components[0].hello).toEqual("world");
    expect(entity.components[0].__ngn__).toEqual({ parent: entity.id, name: thing.name });
  });

  test("can hasComponent", () => {
    const { createEntity } = createWorld();
    const entity = createEntity({});
    const thing = () => ({ hello: "world" });
    const otherThing = () => ({ hello: "world" });
    entity.addComponent(thing);
    expect(entity.hasComponent(thing)).toEqual(true);
    expect(entity.hasComponent(otherThing)).toEqual(false);

    entity.removeComponent(thing);
    expect(entity.hasComponent(thing)).toEqual(false);
  });

  test("can getComponent", () => {
    const { createEntity } = createWorld();
    const entity = createEntity({});
    const thing = () => ({ hello: "world" });
    entity.addComponent(thing);
    expect(entity.getComponent<typeof thing>(thing).hello).toEqual("world");
  });

  test("getComponent works even after adding/removing/add, etc", () => {
    const { createEntity } = createWorld();
    const entity = createEntity({});
    const thing1 = () => ({ hello: "world1" });
    const thing2 = () => ({ hello: "world2" });
    entity.addComponent(thing1);
    expect(entity.getComponent<typeof thing1>(thing1).hello).toEqual("world1");
    entity.addComponent(thing2);
    expect(entity.getComponent<typeof thing2>(thing2).hello).toEqual("world2");
    entity.removeComponent(thing1);
    expect(entity.getComponent<typeof thing2>(thing2).hello).toEqual("world2");
  });

  test("can removeComponent", () => {
    const { createEntity } = createWorld();
    const entity = createEntity({});
    const thing = () => ({ hello: "world" });
    entity.addComponent(thing);
    expect(entity.components.length).toEqual(1);
    entity.removeComponent(thing);
    expect(entity.components.length).toEqual(0);
  });

  test("world maps behave predictably", () => {
    const { world, createEntity } = createWorld();
    const entity = createEntity({});
    expect(world[$eciMap][entity.id]).toEqual({});

    const Position = () => ({ x: 0, y: 0 });
    const Velocity = () => ({ x: 1, y: 1 });

    entity.addComponent(Position).addComponent(Velocity);

    expect(world[$eciMap][entity.id]).toEqual({ [Position.name]: 0, [Velocity.name]: 1 });
    expect(world[$ceMap][Position.name]).toEqual([entity.id]);
    expect(world[$ceMap][Velocity.name]).toEqual([entity.id]);
    expect(entity.components).toEqual([
      {
        ...Position(),
        __ngn__: {
          parent: entity.id,
          name: Position.name,
        },
      },
      {
        ...Velocity(),
        __ngn__: {
          parent: entity.id,
          name: Velocity.name,
        },
      },
    ]);

    entity.removeComponent(Position);

    expect(world[$eciMap][entity.id]).toEqual({ [Velocity.name]: 0 });
    expect(world[$ceMap][Position.name]).toEqual([]);
    expect(world[$ceMap][Velocity.name]).toEqual([entity.id]);
    expect(entity.components).toEqual([
      {
        ...Velocity(),
        __ngn__: {
          parent: entity.id,
          name: Velocity.name,
        },
      },
    ]);

    const velocity = entity.getComponent<typeof Velocity>(Velocity);

    expect(velocity.x).toEqual(1);
    expect(velocity.y).toEqual(1);

    velocity.x = 2;
    velocity.y = 2;

    expect(entity.components).toEqual([{ x: 2, y: 2, __ngn__: { parent: entity.id, name: Velocity.name } }]);
    expect(world[$eMap][entity.id]).toEqual(entity);
  });

  test("can destroy entity", () => {
    const { world, createEntity } = createWorld();
    const entity = createEntity({});
    const Position = () => ({ x: 0, y: 0 });
    const Velocity = () => ({ x: 1, y: 1 });
    entity.addComponent(Position).addComponent(Velocity);
    entity.destroy();
    expect(world[$eMap][entity.id]).toBeUndefined();
    expect(world[$ceMap][Position.name]).toEqual([]);
    expect(world[$ceMap][Velocity.name]).toEqual([]);
  });

  test("can 'and' query", () => {
    const { world, createEntity, query } = createWorld();
    const entity1 = createEntity({});
    const entity2 = createEntity({});
    const Position = () => ({ x: 0, y: 0 });
    const Velocity = () => ({ x: 1, y: 1 });
    const NotMe = () => ({ x: 2, y: 2 });
    entity1.addComponent(Position).addComponent(Velocity).addComponent(NotMe);
    const movables = query({ and: [Position, Velocity] });

    movables((entities) => {
      expect(entities.length).toEqual(1);
      expect(entities[0].components.length).toEqual(3);
      expect(world[$queryResults]["andPositionVelocityornottag"].length).toEqual(1);
    });

    entity2.addComponent(Position).addComponent(Velocity).addComponent(NotMe);

    movables((entities) => {
      expect(entities.length).toEqual(2);
      expect(entities[0].components.length).toEqual(3);
      expect(entities[1].components.length).toEqual(3);
      expect(world[$queryResults]["andPositionVelocityornottag"].length).toEqual(2);
    });
  });

  test("can 'or' query", () => {
    const { world, createEntity, query } = createWorld();
    const entity1 = createEntity({});
    const entity2 = createEntity({});
    const Position = () => ({ x: 0, y: 0 });
    const Velocity = () => ({ x: 1, y: 1 });
    const NotMe = () => ({ x: 2, y: 2 });
    entity1.addComponent(Position).addComponent(NotMe);
    const movables = query({ or: [Position, Velocity] });

    movables((entities) => {
      expect(entities.length).toEqual(1);
      expect(entities[0].components.length).toEqual(2);
      expect(world[$queryResults]["andorPositionVelocitynottag"].length).toEqual(1);
    });

    entity2.addComponent(Position).addComponent(Velocity).addComponent(NotMe);

    movables((entities) => {
      expect(entities.length).toEqual(2);
      expect(entities[0].components.length).toEqual(2);
      expect(entities[1].components.length).toEqual(3);
      expect(world[$queryResults]["andorPositionVelocitynottag"].length).toEqual(2);
    });
  });

  test("can 'not' query", () => {
    const { createEntity, query } = createWorld();
    const entity0 = createEntity({});
    const entity1 = createEntity({});
    const entity2 = createEntity({});
    const Position = () => ({ x: 0, y: 0 });
    const Velocity = () => ({ x: 1, y: 1 });
    const NotMe = () => ({ x: 2, y: 2 });
    entity0.addComponent(Position).addComponent(Velocity).addComponent(NotMe);
    entity1.addComponent(Position).addComponent(Velocity);
    const movables = query({ and: [Position, Velocity], not: [NotMe] });
    const other = query({ not: [NotMe] });

    other((entities) => {
      expect(entities.length).toEqual(2);
      expect(entities[0].id).toEqual(entity1.id);
      expect(entities[1].id).toEqual(entity2.id);
    });

    entity2.addComponent(NotMe);

    other((entities) => {
      expect(entities.length).toEqual(1);
      expect(entities[0].id).toEqual(entity1.id);
    });

    movables((entities) => {
      expect(entities.length).toEqual(1);
      expect(entities[0].id).toEqual(entity1.id);
    });

    entity0.removeComponent(NotMe);

    movables((entities) => {
      expect(entities.length).toEqual(2);
      expect(entities[0].id).toEqual(entity0.id);
      expect(entities[1].id).toEqual(entity1.id);
    });
  });

  test("can 'tag' query", () => {
    const { createEntity, query } = createWorld();
    const entity0 = createEntity({});
    const entity1 = createEntity({});
    const Position = () => ({ x: 0, y: 0 });
    const Velocity = () => ({ x: 1, y: 1 });
    const NotMe = () => ({ x: 2, y: 2 });
    entity0.addComponent(Position).addComponent(Velocity).addComponent(NotMe).addTag("cube");
    entity1.addComponent(Position).addComponent(Velocity).addTag("cube");
    const movables = query({ tag: ["cube"], not: [NotMe] });

    movables((entities) => {
      expect(entities.length).toEqual(1);
      expect(entities[0].id).toEqual(entity1.id);
      expect(entities[0].getTag()).toEqual("cube");
    });

    entity0.removeComponent(NotMe);

    movables((entities) => {
      expect(entities.length).toEqual(2);
      expect(entities[0].id).toEqual(entity0.id);
      expect(entities[1].id).toEqual(entity1.id);
    });

    entity1.addTag("not-cube");

    movables((entities) => {
      expect(entities.length).toEqual(1);
      expect(entities[0].id).toEqual(entity0.id);
    });

    entity0.removeTag();

    movables((entities) => {
      expect(entities.length).toEqual(0);
    });

    entity1.addTag("cube");

    movables((entities) => {
      expect(entities.length).toEqual(1);
      expect(entities[0].id).toEqual(entity1.id);
    });
  })

  test("destroying an entity removes it from query results", () => {
    const { createEntity, query } = createWorld();
    const entity = createEntity({});
    const Thing = () => ({ x: 0, y: 0 });
    const things = query({ and: [Thing] });

    entity.addComponent(Thing);

    things((entities) => {
      expect(entities.length).toEqual(1);
    });

    entity.destroy();

    things((entities) => {
      expect(entities.length).toEqual(0);
    });
  });

  test("can add and remove systems", () => {
    const { world, addSystem, removeSystem } = createWorld();

    const system1: System = { update() {} };
    const system2: System = { update() {} };
    const system3: System = () => {};

    addSystem(system1, system2, system3);

    expect(world[$systems].length).toEqual(3);
    expect(world[$systems][0]).toEqual(system1.update);
    expect(world[$systems][1]).toEqual(system2.update);
    expect(world[$systems][2]).toEqual(system3);

    removeSystem(system2);
    expect(world[$systems].includes(system2.update)).toEqual(false);

    expect(world[$systems].length).toEqual(2);
    expect(world[$systems][0]).toEqual(system1.update);
    expect(world[$systems][1]).toEqual(system3);

    // @ts-ignore
    expect(() => addSystem({})).toThrow();
  });

  test("pipe provides world to systems", () => {
    const { world, pipe } = createWorld();

    let i = 0;

    const sys1: System = (w: World) => {
      i++;
      w["foo"] = "bar";
      expect(w).toBeDefined();
    };
    const sys2: System = (w: World) => {
      i++;
      expect(w).toBeDefined();
      expect(w["foo"]).toEqual("bar");
    };
    const sys3: System = () => { i++; };

    const chain = pipe(sys1, sys2, sys3);
    chain();

    expect(i).toEqual(3);
    expect(world["foo"]).toEqual("bar");
  });

  test("start", async () => {
    const { world, start, stop, defineMain } = createWorld();
    let i = 0;

    defineMain(() => {
      if (++i === 3) stop();
    });

    start();
    await sleep(100);

    expect(i).toBe(3);
    expect(world.time.delta).toBeGreaterThan(16.6);
    expect(world.time.delta).toBeLessThan(16.7);
  });

  test("step calls systems, passing world", async () => {
    const { world, step, start, stop, addSystem } = createWorld();

    const sys1: System = (w: World) => {
      w["foo"] = "bar";
    };

    const sys2: System = (w: World) => {
      w["bar"] = "baz";
    };

    addSystem(sys1, sys2);

    step();

    expect(world["foo"]).toEqual("bar");
    expect(world["bar"]).toEqual("baz");
  });
});
