/**
  * entity.id -> Set of component.name
  */
declare const $ecMap: unique symbol;
/**
  * entity.id -> component.name -> index of component in entity.components
  *
  * This map stores indices of components in the entity component array.
  * The purpose of this map is to allow for fast lookups of components in the
  * entity.components array (e.g. entity.getComponent()).
  */
declare const $eciMap: unique symbol;
/**
  * component.name -> array of entity.ids that have this component
  */
declare const $ceMap: unique symbol;
declare const $eMap: unique symbol;
declare const $queryResults: unique symbol;
declare const $dirty: unique symbol;
declare const $systems: unique symbol;
declare const $running: unique symbol;
declare const $onEntityCreated: unique symbol;
declare const $mainLoop: unique symbol;
declare type Component = () => {};
declare type QueryConfig = Readonly<Partial<{
    /** Matches entities as long as the entity has all of the components in the provided array. */
    and: Component[];
    /** Matches entities as long as the entity has at least one of the components in the provided array. */
    or: Component[];
    /** Matches entities as long as the entity has none of the components in the provided array. */
    not: Component[];
    /** Matches entities that have any of these tag strings. */
    tag: string[];
}>>;
declare type Entity = Readonly<{
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
declare type SystemFn = (w: World) => void;
declare type SystemCls = {
    update: (w: World) => void;
};
declare type World = {
    [$ecMap]: {
        [key: number]: Set<string>;
    };
    [$eciMap]: {
        [key: number]: {
            [componentName: string]: number;
        };
    };
    [$ceMap]: {
        [key: string]: number[];
    };
    [$eMap]: {
        [key: number]: any;
    };
    [$dirty]: boolean;
    [$queryResults]: {
        [key: string]: any[];
    };
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
declare const createWorld: () => {
    world: World;
    query: (queryConfig: QueryConfig) => (queryImpl: (entities: Entity[]) => void) => void;
    createEntity: (spec?: object) => object & {
        id: number;
        components: any[];
        addTag: (t: string) => Entity;
        removeTag: () => Entity;
        getTag: () => any;
        addComponent: (c: Component, defaults?: {}) => Readonly<{
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
        hasComponent: (component: Component) => boolean;
        getComponent: <T_1 extends Component>(arg: T_1) => ReturnType<T_1>;
        removeComponent: (component: Component) => Entity;
        destroy: () => boolean;
    };
    onEntityCreated: (fn: any) => () => void;
    addSystem: (...systems: (SystemCls | SystemFn)[]) => void;
    removeSystem: (...systems: (SystemCls | SystemFn)[]) => void;
    start: () => () => boolean;
    stop: () => void;
    step: () => void;
    pipe: (...fns: Function[]) => () => void;
    defineMain: (callback: (w?: World) => void) => void;
};

declare enum KeyboardKey {
    KeyQ = "KeyQ",
    KeyW = "KeyW",
    KeyE = "KeyE",
    KeyR = "KeyR",
    KeyT = "KeyT",
    KeyY = "KeyY",
    KeyU = "KeyU",
    KeyI = "KeyI",
    KeyO = "KeyO",
    KeyP = "KeyP",
    KeyA = "KeyA",
    KeyS = "KeyS",
    KeyD = "KeyD",
    KeyF = "KeyF",
    KeyG = "KeyG",
    KeyH = "KeyH",
    KeyJ = "KeyJ",
    KeyK = "KeyK",
    KeyL = "KeyL",
    KeyZ = "KeyZ",
    KeyX = "KeyX",
    KeyC = "KeyC",
    KeyV = "KeyV",
    KeyB = "KeyB",
    KeyN = "KeyN",
    KeyM = "KeyM",
    BracketLeft = "BracketLeft",
    BracketRight = "BracketRight",
    Comma = "Comma",
    Period = "Period",
    Slash = "Slash",
    Backquote = "Backquote",
    Semicolon = "Semicolon",
    Quote = "Quote",
    Backslash = "Backslash",
    IntlBackslash = "IntlBackslash",
    Digit1 = "Digit1",
    Digit2 = "Digit2",
    Digit3 = "Digit3",
    Digit4 = "Digit4",
    Digit5 = "Digit5",
    Digit6 = "Digit6",
    Digit7 = "Digit7",
    Digit8 = "Digit8",
    Digit9 = "Digit9",
    Digit0 = "Digit0",
    Minus = "Minus",
    Equal = "Equal",
    Enter = "Enter",
    Space = "Space",
    NumpadDecimal = "NumpadDecimal",
    Numpad0 = "Numpad0",
    Numpad1 = "Numpad1",
    Numpad2 = "Numpad2",
    Numpad3 = "Numpad3",
    Numpad4 = "Numpad4",
    Numpad5 = "Numpad5",
    Numpad6 = "Numpad6",
    Numpad7 = "Numpad7",
    Numpad8 = "Numpad8",
    Numpad9 = "Numpad9",
    NumpadDivide = "NumpadDivide",
    NumpadMultiply = "NumpadMultiply",
    NumpadSubtract = "NumpadSubtract",
    NumpadAdd = "NumpadAdd",
    NumpadEnter = "NumpadEnter",
    Delete = "Delete",
    End = "End",
    Home = "Home",
    Insert = "Insert",
    PageDown = "PageDown",
    PageUp = "PageUp",
    ArrowDown = "ArrowDown",
    ArrowLeft = "ArrowLeft",
    ArrowRight = "ArrowRight",
    ArrowUp = "ArrowUp",
    Backspace = "Backspace",
    AltLeft = "AltLeft",
    AltRight = "AltRight",
    CapsLock = "CapsLock",
    ContextMenu = "ContextMenu",
    ControlLeft = "ControlLeft",
    ControlRight = "ControlRight",
    ShiftLeft = "ShiftLeft",
    ShiftRight = "ShiftRight",
    Tab = "Tab",
    Escape = "Escape",
    F1 = "F1",
    F2 = "F2",
    F3 = "F3",
    F4 = "F4",
    F5 = "F5",
    F6 = "F6",
    F7 = "F7",
    F8 = "F8",
    F9 = "F9",
    F10 = "F10",
    F11 = "F11",
    F12 = "F12",
    PrintScreen = "PrintScreen",
    ScrollLock = "ScrollLock",
    Pause = "Pause"
}
interface KeyboardMapping {
    [KeyboardKey.KeyQ]?: string;
    [KeyboardKey.KeyW]?: string;
    [KeyboardKey.KeyE]?: string;
    [KeyboardKey.KeyR]?: string;
    [KeyboardKey.KeyT]?: string;
    [KeyboardKey.KeyY]?: string;
    [KeyboardKey.KeyU]?: string;
    [KeyboardKey.KeyI]?: string;
    [KeyboardKey.KeyO]?: string;
    [KeyboardKey.KeyP]?: string;
    [KeyboardKey.KeyA]?: string;
    [KeyboardKey.KeyS]?: string;
    [KeyboardKey.KeyD]?: string;
    [KeyboardKey.KeyF]?: string;
    [KeyboardKey.KeyG]?: string;
    [KeyboardKey.KeyH]?: string;
    [KeyboardKey.KeyJ]?: string;
    [KeyboardKey.KeyK]?: string;
    [KeyboardKey.KeyL]?: string;
    [KeyboardKey.KeyZ]?: string;
    [KeyboardKey.KeyX]?: string;
    [KeyboardKey.KeyC]?: string;
    [KeyboardKey.KeyV]?: string;
    [KeyboardKey.KeyB]?: string;
    [KeyboardKey.KeyN]?: string;
    [KeyboardKey.KeyM]?: string;
    [KeyboardKey.KeyM]?: string;
    [KeyboardKey.BracketLeft]?: string;
    [KeyboardKey.BracketRight]?: string;
    [KeyboardKey.Comma]?: string;
    [KeyboardKey.Period]?: string;
    [KeyboardKey.Slash]?: string;
    [KeyboardKey.Backquote]?: string;
    [KeyboardKey.Semicolon]?: string;
    [KeyboardKey.Quote]?: string;
    [KeyboardKey.Backslash]?: string;
    [KeyboardKey.IntlBackslash]?: string;
    [KeyboardKey.Digit1]?: string;
    [KeyboardKey.Digit2]?: string;
    [KeyboardKey.Digit3]?: string;
    [KeyboardKey.Digit4]?: string;
    [KeyboardKey.Digit5]?: string;
    [KeyboardKey.Digit6]?: string;
    [KeyboardKey.Digit7]?: string;
    [KeyboardKey.Digit8]?: string;
    [KeyboardKey.Digit9]?: string;
    [KeyboardKey.Digit0]?: string;
    [KeyboardKey.Minus]?: string;
    [KeyboardKey.Equal]?: string;
    [KeyboardKey.Enter]?: string;
    [KeyboardKey.Space]?: string;
    [KeyboardKey.NumpadDecimal]?: string;
    [KeyboardKey.Numpad0]?: string;
    [KeyboardKey.Numpad1]?: string;
    [KeyboardKey.Numpad2]?: string;
    [KeyboardKey.Numpad3]?: string;
    [KeyboardKey.Numpad4]?: string;
    [KeyboardKey.Numpad5]?: string;
    [KeyboardKey.Numpad6]?: string;
    [KeyboardKey.Numpad7]?: string;
    [KeyboardKey.Numpad8]?: string;
    [KeyboardKey.Numpad9]?: string;
    [KeyboardKey.NumpadDivide]?: string;
    [KeyboardKey.NumpadMultiply]?: string;
    [KeyboardKey.NumpadSubtract]?: string;
    [KeyboardKey.NumpadAdd]?: string;
    [KeyboardKey.NumpadEnter]?: string;
    [KeyboardKey.Delete]?: string;
    [KeyboardKey.End]?: string;
    [KeyboardKey.Home]?: string;
    [KeyboardKey.Insert]?: string;
    [KeyboardKey.PageDown]?: string;
    [KeyboardKey.PageUp]?: string;
    [KeyboardKey.ArrowDown]?: string;
    [KeyboardKey.ArrowLeft]?: string;
    [KeyboardKey.ArrowRight]?: string;
    [KeyboardKey.ArrowUp]?: string;
    [KeyboardKey.Backspace]?: string;
    [KeyboardKey.AltLeft]?: string;
    [KeyboardKey.AltRight]?: string;
    [KeyboardKey.CapsLock]?: string;
    [KeyboardKey.ContextMenu]?: string;
    [KeyboardKey.ControlLeft]?: string;
    [KeyboardKey.ControlRight]?: string;
    [KeyboardKey.ShiftLeft]?: string;
    [KeyboardKey.ShiftRight]?: string;
    [KeyboardKey.Tab]?: string;
    [KeyboardKey.Escape]?: string;
    [KeyboardKey.F1]?: string;
    [KeyboardKey.F2]?: string;
    [KeyboardKey.F3]?: string;
    [KeyboardKey.F4]?: string;
    [KeyboardKey.F5]?: string;
    [KeyboardKey.F6]?: string;
    [KeyboardKey.F7]?: string;
    [KeyboardKey.F8]?: string;
    [KeyboardKey.F9]?: string;
    [KeyboardKey.F10]?: string;
    [KeyboardKey.F11]?: string;
    [KeyboardKey.F12]?: string;
    [KeyboardKey.PrintScreen]?: string;
    [KeyboardKey.ScrollLock]?: string;
    [KeyboardKey.Pause]?: string;
}

interface MouseMapping {
    axes: {
        0: string;
        1: string;
        2: string;
    };
    buttons: {
        0: string;
        1: string;
        2: string;
        3: string;
        4: string;
    };
}

interface GamepadMapping {
    axes: {
        0?: any;
        1?: any;
        2?: any;
        3?: any;
    };
    buttons: {
        0?: string;
        1?: string;
        2?: string;
        3?: string;
        4?: string;
        5?: string;
        6?: string;
        7?: string;
        8?: string;
        9?: string;
        10?: string;
        11?: string;
        12?: string;
        13?: string;
        14?: string;
        15?: string;
        16?: string;
        17?: string;
    };
}

interface ButtonState {
    justPressed: boolean;
    pressed: boolean;
    justReleased: boolean;
}
interface GamepadButtonState extends ButtonState {
    touched: boolean;
    value: number;
}
declare const inputSystem: (through: any) => any;
declare const input: {
    gamepad(index: number): {
        useMapping: (m: () => GamepadMapping) => GamepadMapping;
        getButton(b: string): GamepadButtonState;
        getAxis(a: string): number;
    };
    mouse: {
        useMapping: (m: () => MouseMapping) => void;
        getButton(b: string): ButtonState;
        getAxis(a: string): number;
        getPosition(): [number, number];
    };
    keyboard: {
        useMapping: (m: () => KeyboardMapping) => KeyboardMapping;
        getKey(b: string): ButtonState;
    };
};

declare type CreateCanvasOptions = Partial<{
    width: number;
    height: number;
    fullscreen: boolean;
    target: HTMLElement;
}>;
declare const createCanvas: (options: CreateCanvasOptions) => HTMLCanvasElement;

declare type Vector2 = {
    x: number;
    y: number;
};
declare const createDraw: (context: CanvasRenderingContext2D) => {
    text: (v: Vector2, text: string, color?: string, size?: number) => void;
    line: (from: Vector2, to: Vector2, color?: string, lineWidth?: number) => void;
    rectangle: (pos: Vector2, dimensions: Vector2, color?: string, lineWidth?: number) => void;
    circle: (pos: Vector2, radius?: number, color?: string, lineWidth?: number) => void;
};

declare type Create2DOptions = Partial<{
    canvas: CreateCanvasOptions;
}>;
declare const create2D: (options: Create2DOptions) => {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    draw: {
        text: (v: Vector2, text: string, color?: string, size?: number) => void;
        line: (from: Vector2, to: Vector2, color?: string, lineWidth?: number) => void;
        rectangle: (pos: Vector2, dimensions: Vector2, color?: string, lineWidth?: number) => void;
        circle: (pos: Vector2, radius?: number, color?: string, lineWidth?: number) => void;
    };
    destroy: () => void;
};

interface LogEntry {
    message: string;
}
interface ExpiringLogEntry extends LogEntry {
    lifetime: number;
    start: Date;
}
declare type LogSystem = {
    expiringLogs: ExpiringLogEntry[];
    allLogs: LogEntry[];
    update: (w: World) => void;
    log: (message: string) => void;
};
declare const createLogSystem: (options?: Partial<{
    maxLifetime: number;
}>) => LogSystem;

export { Component, CreateCanvasOptions, Entity, QueryConfig, Vector2, World, create2D, createCanvas, createDraw, createLogSystem, createWorld, input, inputSystem };
