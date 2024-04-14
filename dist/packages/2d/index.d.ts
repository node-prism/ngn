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

export { CreateCanvasOptions, Vector2, create2D, createCanvas, createDraw };
