import { useEffect, useRef, useState } from "react";
import "./app.scss";
import { v4 as uuidv4 } from "uuid";
import { Stage, Layer, Rect, Image as Kimage } from "react-konva";
import Konva from "konva";
import { type Image as Kimg } from "konva/lib/shapes/Image";

function App() {
  const [roundness, setRoundness] = useState(0);
  const [bg, setBg] = useState("#fafafa");
  const [useGradient, setUseGradient] = useState(false);
  const [newColor, setNewColor] = useState("#000000");
  const [colors, setColors] = useState<{ color: string; id: string }[]>([
    { color: "#eee", id: uuidv4() },
    { color: "#999", id: uuidv4() },
  ]);
  const [shdblur, setShdblur] = useState(20);
  const [shdopacity, setShdopacity] = useState(50);
  const [shdcolor, setShdcolor] = useState("#000000");
  const [source, setSource] = useState<HTMLImageElement>();
  const artboard = useRef<HTMLDivElement>(null);
  const workspace_ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(300);
  const [h, setH] = useState(300);
  const [gradientDir, setGradientDir] = useState(JSON.stringify({ start: { x: 0, y: 0 }, end: { x: w, y: h } }));
  const [scale, setScale] = useState(1);
  const [autocanvas, setAutocanvas] = useState(true);
  const kimg = useRef<Kimg>(null);

  const save = async () => {
    if (!artboard.current) return;
    const image = Konva.stages[0].toDataURL({ pixelRatio: scale });
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = image;
    link.click();
  };

  const swap_color = (id: string) => {
    const input = document.createElement("input");
    input.type = "color";
    input.style.display = "none";
    document.body.appendChild(input);
    input.click();
    input.onchange = (e) => {
      const copy = Array.from(colors);
      const i = copy.findIndex((e) => e.id === id);
      copy[i].color = (e.target as HTMLInputElement).value;
      setColors(copy);
      input.remove();
    };
  };

  const readFileAsync = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== "string") reject("Invalid format");
        else resolve(result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const positionX = (pos: string) => {
    if (!kimg.current) return;
    const x =
      pos === "left"
        ? 0
        : pos === "right"
        ? Konva.stages[0].getSize().width - kimg.current.getSize().width
        : Konva.stages[0].getSize().width / 2 - kimg.current.getSize().width / 2;
    const y = kimg.current.getPosition().y;
    kimg.current?.position({ x, y });
  };

  const positionY = (pos: string) => {
    if (!kimg.current) return;
    const x = kimg.current.getPosition().x;
    const y =
      pos === "top"
        ? 0
        : pos === "bottom"
        ? Konva.stages[0].getSize().height - kimg.current.getSize().height
        : Konva.stages[0].getSize().height / 2 - kimg.current.getSize().height / 2;
    kimg.current?.position({ x, y });
  };

  const resize = () => {
    if (!autocanvas || !workspace_ref.current) return;
    setW(workspace_ref.current.clientWidth - 50);
    setH(workspace_ref.current.clientHeight - 50);
    setGradientDir(
      JSON.stringify({
        start: { x: 0, y: 0 },
        end: { x: workspace_ref.current.clientWidth - 50, y: workspace_ref.current.clientHeight - 50 },
      }),
    );
  };

  useEffect(() => {
    if (!workspace_ref.current) return;
    workspace_ref.current.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [autocanvas]);

  return (
    <div className="app">
      <div className="sidebar">
        <div className="control">
          <span className="title">Canvas size</span>
          <div className="flex-h">
            <label htmlFor="autocanvas">Auto</label>
            <input type="checkbox" name="autocanvas" checked={autocanvas} onChange={() => setAutocanvas(!autocanvas)} />
          </div>
          <div className="flex-h">
            <label htmlFor="width">Width</label>
            <input
              type="number"
              name="width"
              min={1}
              value={w}
              onChange={(e) => {
                setAutocanvas(false);
                setW(e.currentTarget.valueAsNumber < 1 ? 1 : e.currentTarget.valueAsNumber);
              }}
            />
          </div>
          <div className="flex-h">
            <label htmlFor="height">Height</label>
            <input
              type="number"
              name="height"
              min={1}
              value={h}
              onChange={(e) => {
                setAutocanvas(false);
                setH(e.currentTarget.valueAsNumber < 1 ? 1 : e.currentTarget.valueAsNumber);
              }}
            />
          </div>
        </div>
        <div className="control">
          <span className="title">Position image horizantally</span>
          <div className="flex-h">
            <button type="button" onClick={() => positionX("left")}>
              Left
            </button>
            <button type="button" onClick={() => positionX("center")}>
              Center
            </button>
            <button type="button" onClick={() => positionX("right")}>
              Right
            </button>
          </div>
        </div>
        <div className="control">
          <span className="title">Position image vertically</span>
          <div className="flex-h">
            <button type="button" onClick={() => positionY("top")}>
              Top
            </button>
            <button type="button" onClick={() => positionY("center")}>
              Center
            </button>
            <button type="button" onClick={() => positionY("bottom")}>
              Bottom
            </button>
          </div>
        </div>
        <div className="control">
          <label htmlFor="roundness" className="title">
            Roundness
          </label>
          <div className="flex-h">
            <span>Square</span>
            <input
              type="range"
              name="roundness"
              min={0}
              max={500}
              value={roundness}
              onChange={(e) => setRoundness(e.currentTarget.valueAsNumber)}
            />
            <span>Round</span>
          </div>
        </div>
        <div className="control">
          <span className="title">Shadow</span>
          <div className="flex-h">
            <label htmlFor="shadowcolor">Color</label>
            <input
              type="color"
              name="shadowcolor"
              onChange={(e) => setShdcolor(e.currentTarget.value)}
              value={shdcolor}
            />
          </div>
          <div className="flex-h">
            <label htmlFor="shadowblur">Blur: {shdblur}px</label>
            <input
              type="range"
              name="shadowblur"
              min={0}
              max={100}
              onChange={(e) => setShdblur(e.currentTarget.valueAsNumber)}
              value={shdblur}
            />
          </div>
          <div className="flex-h">
            <label htmlFor="shadowopacity">Opacity {shdopacity}%</label>
            <input
              type="range"
              min={0}
              max={100}
              name="shadowopacity"
              onChange={(e) => setShdopacity(e.currentTarget.valueAsNumber)}
              value={shdopacity}
            />
          </div>
        </div>
        <div className="control">
          <span className="title">Background</span>
          <div className="flex-h">
            <label>Solid color</label>
            <input
              type="radio"
              name="usegradient"
              checked={useGradient ? false : true}
              onChange={() => setUseGradient(false)}
            />
          </div>
          <div className="flex-h">
            <label>Gradient</label>
            <input
              type="radio"
              name="usegradient"
              checked={useGradient ? true : false}
              onChange={() => setUseGradient(true)}
            />
          </div>
          {useGradient ? (
            <>
              <div className="flex-h">
                <label htmlFor="gradientdir">Direction</label>
                <select name="gradientdir" value={gradientDir} onChange={(e) => setGradientDir(e.currentTarget.value)}>
                  <option value={JSON.stringify({ start: { x: 0, y: h }, end: { x: 0, y: 0 } })}>To top</option>
                  <option value={JSON.stringify({ start: { x: 0, y: 0 }, end: { x: 0, y: h } })}>To bottom</option>
                  <option value={JSON.stringify({ start: { x: w, y: 0 }, end: { x: 0, y: 0 } })}>To left</option>
                  <option value={JSON.stringify({ start: { x: w, y: h }, end: { x: 0, y: 0 } })}>To top left</option>
                  <option value={JSON.stringify({ start: { x: w, y: 0 }, end: { x: 0, y: h } })}>To bottom left</option>
                  <option value={JSON.stringify({ start: { x: 0, y: 0 }, end: { x: w, y: 0 } })}>To right</option>
                  <option value={JSON.stringify({ start: { x: 0, y: h }, end: { x: w, y: 0 } })}>To top right</option>
                  <option value={JSON.stringify({ start: { x: 0, y: 0 }, end: { x: w, y: h } })}>
                    To bottom right
                  </option>
                </select>
              </div>
              <div className="flex-h">
                <label htmlFor="addgradient">Add color</label>
                <input
                  type="color"
                  name="addgradient"
                  onChange={(e) => setNewColor(e.currentTarget.value)}
                  value={newColor}
                />
                <button onClick={() => setColors([...colors, { color: newColor, id: uuidv4() }])}>Add</button>
              </div>
              <span className="title">Gradient colors</span>
              <div className="flex-v">
                {colors.map((clr) => (
                  <div key={clr.id} className="flex-h">
                    <span
                      onClick={() => swap_color(clr.id)}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: clr.color,
                        cursor: "pointer",
                        display: "inline-block",
                      }}></span>
                    <button onClick={() => setColors(colors.filter((a) => a.id !== clr.id))}>remove</button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-h">
              <label htmlFor="bg">Color</label>
              <input type="color" name="bg" value={bg} onChange={(e) => setBg(e.currentTarget.value)} />
            </div>
          )}
        </div>
        <div className="control">
          <span className="title">Export scale (resolution)</span>
          <div className="flex-h">
            <label htmlFor="scale">Scale factor</label>
            <input type="number" name="scale" value={scale} onChange={(e) => setScale(e.currentTarget.valueAsNumber)} />
          </div>
        </div>
        <button type="button" onClick={save} className="save_btn">
          Export
        </button>
      </div>
      <div className="workspace" ref={workspace_ref}>
        {!source ? (
          <div
            className="file_zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              const fileList = Array.from(e.dataTransfer.files);
              const files: string[] = await Promise.all(fileList.map((ab) => readFileAsync(ab)));
              if (files.length > 0) {
                const img = new Image();
                img.src = files[0];
                setSource(img);
              }
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                const input = e.currentTarget.firstElementChild as HTMLInputElement;
                input.click();
              }
            }}>
            <input
              type="file"
              multiple={false}
              accept=".jpg,.jpeg,.png,.bmp,.gif,.webp"
              onChange={async (e) => {
                if (e.currentTarget.files) {
                  const fileList = Array.from(e.currentTarget.files);
                  const files: string[] = await Promise.all(Array.from(fileList).map((ab) => readFileAsync(ab)));
                  if (files.length > 0) {
                    const img = new Image();
                    img.src = files[0];
                    setSource(img);
                  }
                }
              }}
            />
            <span>Click or drop your file here!</span>
          </div>
        ) : (
          <div
            className="artboard"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              const fileList = Array.from(e.dataTransfer.files);
              const files: string[] = await Promise.all(fileList.map((ab) => readFileAsync(ab)));
              if (files.length > 0) {
                const img = new Image();
                img.src = files[0];
                setSource(img);
              }
            }}
            ref={artboard}>
            <Stage width={w} height={h} onWheel={(e) => e.evt.preventDefault()}>
              <Layer>
                <Rect
                  width={w}
                  height={h}
                  fillLinearGradientStartPoint={JSON.parse(gradientDir)["start"]}
                  fillLinearGradientEndPoint={JSON.parse(gradientDir)["end"]}
                  fillLinearGradientColorStops={
                    colors.length >= 2
                      ? colors.reduce((acc: (string | number)[], cur, i) => {
                          const index = (i * colors.length) / (colors.length - 1) - i;
                          acc.push(index, cur.color);
                          return acc;
                        }, [])
                      : undefined
                  }
                  fill={useGradient ? undefined : bg}
                />
                <Kimage
                  image={source}
                  draggable={true}
                  shadowBlur={shdblur}
                  shadowColor={shdcolor}
                  shadowOpacity={shdopacity / 100}
                  shadowForStrokeEnabled={true}
                  cornerRadius={roundness}
                  stroke="transparent"
                  onMouseOver={() => (document.body.style.cursor = "pointer")}
                  onMouseOut={() => (document.body.style.cursor = "")}
                  ref={kimg}
                  onWheel={(e) => {
                    e.evt.preventDefault();
                    const oldScale = e.target.scaleX();
                    const pointer = e.target.getPosition();
                    const mousePointTo = {
                      x: (pointer.x - e.target.x()) / oldScale,
                      y: (pointer.y - e.target.y()) / oldScale,
                    };
                    let direction = e.evt.deltaY > 0 ? 1 : -1;
                    if (e.evt.ctrlKey) {
                      direction = -direction;
                    }
                    const newScale = direction > 0 ? oldScale * 1.1 : oldScale / 1.1;
                    e.target.scale({ x: newScale, y: newScale });
                    const newPos = {
                      x: pointer.x - mousePointTo.x * newScale,
                      y: pointer.y - mousePointTo.y * newScale,
                    };
                    e.target.position(newPos);
                  }}
                />
              </Layer>
            </Stage>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
