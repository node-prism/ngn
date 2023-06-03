export type CreateCanvasOptions = Partial<{
  width: number;
  height: number;
  fullscreen: boolean;
  target: HTMLElement;
}>;

export const createCanvas = (options: CreateCanvasOptions) => {
  const canvas = document.createElement("canvas");
  const { target, fullscreen } = options;
  const { body } = window.document;

  if (target && fullscreen) {
    options.target = null;
  } else if (!target && !fullscreen) {
    options.fullscreen = true;
  }

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  if (fullscreen) {
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    body.appendChild(canvas);
    body.style.margin = "0";
    body.style.padding = "0";
    body.style.width = "100%";
    body.style.height = "100%";
    body.style.overflow = "hidden";
  }

  if (target) {
    target.appendChild(canvas);
    target.style.overflow = "hidden";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  const meta = window.document.createElement("meta");
  meta.name = "viewport";
  meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0";
  window.document.head.appendChild(meta);

  return canvas;
};
