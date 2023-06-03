import {
  gamepad,
  gamepadUpdate,
  onGamepadConnected,
  onGamepadDisconnected,
} from "./devices/gamepad";
import {
  keyboard,
  keyboardUpdate,
  onKeyDown,
  onKeyUp,
  setDefaultKeyboardState,
} from "./devices/keyboard";
import {
  mouse,
  mouseUpdate,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseWheel,
  setDefaultMouseState,
} from "./devices/mouse";

export interface ButtonState {
  justPressed: boolean;
  pressed: boolean;
  justReleased: boolean;
}

export interface GamepadButtonState extends ButtonState {
  touched: boolean;
  value: number;
}

let $mousemove = null;
let $mousedown = null;
let $mouseup = null;
let $mousewheel = null;
let $keydown = null;
let $keyup = null;
let $gamepadconnected = null;
let $gamepaddisconnected = null;
let boundEvents = false;

const setDefaultStates = () => {
  setDefaultKeyboardState();
  setDefaultMouseState();
};

export const inputSystem = (through: any) => {
  if (typeof window === "undefined") return through;

  if (!boundEvents) {
    bindEvents();
    setDefaultStates();
    boundEvents = true;
  }

  mouseUpdate();
  keyboardUpdate();
  gamepadUpdate();

  return through;
};

export const destroyInput = () => {
  destroyEvents();
  boundEvents = false;
};

const bindEvents = () => {
  $mousemove = window.addEventListener("mousemove", onMouseMove);
  $mousedown = window.addEventListener("mousedown", onMouseDown);
  $mouseup = window.addEventListener("mouseup", onMouseUp);
  $mousewheel = window.addEventListener("mousewheel", onMouseWheel);
  $keydown = window.addEventListener("keydown", onKeyDown);
  $keyup = window.addEventListener("keyup", onKeyUp);
  $gamepadconnected = window.addEventListener(
    "gamepadconnected",
    onGamepadConnected
  );
  $gamepaddisconnected = window.addEventListener(
    "gamepaddisconnected",
    onGamepadDisconnected
  );
};

const destroyEvents = () => {
  window.removeEventListener("mousemove", $mousemove);
  window.removeEventListener("mousedown", $mousedown);
  window.removeEventListener("mouseup", $mouseup);
  window.removeEventListener("mousewheel", $mousewheel);
  window.removeEventListener("keydown", $keydown);
  window.removeEventListener("keyup", $keyup);
  window.removeEventListener("gamepadconnected", $gamepadconnected);
  window.removeEventListener("gamepaddisconnected", $gamepaddisconnected);
};

export const input = {
  ...keyboard(),
  ...mouse(),
  ...gamepad(),
};
