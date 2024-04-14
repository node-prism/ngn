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

interface MouseMapping {
    axes?: {
        0?: string;
        1?: string;
        2?: string;
    };
    buttons?: {
        0?: string;
        1?: string;
        2?: string;
        3?: string;
        4?: string;
    };
}

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
declare const destroyInput: () => void;
declare const keyboard: {
    keyboard: {
        useMapping: (m: () => KeyboardMapping) => void;
        getKey(b: string): ButtonState;
    };
};
declare const mouse: {
    mouse: {
        useMapping: (m: () => MouseMapping) => void;
        getButton(b: string): ButtonState;
        getAxis(a: string): number;
        getPosition(): [number, number];
    };
};
declare const gamepad: {
    gamepad(index: number): {
        useMapping: (m: () => GamepadMapping) => GamepadMapping;
        getButton(b: string): GamepadButtonState;
        getAxis(a: string): number;
    };
};
declare const input: {
    keyboard: {
        keyboard: {
            useMapping: (m: () => KeyboardMapping) => void;
            getKey(b: string): ButtonState;
        };
    };
    mouse: {
        mouse: {
            useMapping: (m: () => MouseMapping) => void;
            getButton(b: string): ButtonState;
            getAxis(a: string): number;
            getPosition(): [number, number];
        };
    };
    gamepad: {
        gamepad(index: number): {
            useMapping: (m: () => GamepadMapping) => GamepadMapping;
            getButton(b: string): GamepadButtonState;
            getAxis(a: string): number;
        };
    };
};

export { ButtonState, GamepadButtonState, destroyInput, gamepad, input, inputSystem, keyboard, mouse };
