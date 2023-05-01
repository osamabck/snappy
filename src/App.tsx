import { useRef, useState } from "react";
import "./app.scss";
import domtoimage from "dom-to-image";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [roundness, setRoundness] = useState(12);
  const [bg, setBg] = useState("#fafafa");
  const [gradientDir, setGradientDir] = useState("to right");
  const [useGradient, setUseGradient] = useState(false);
  const [newColor, setNewColor] = useState("#000000");
  const [pdl, setPdl] = useState(50);
  const [pdr, setPdr] = useState(50);
  const [pdt, setPdt] = useState(50);
  const [pdb, setPdb] = useState(50);
  const [colors, setColors] = useState<{ color: string; id: string }[]>([]);
  const [shdblur, setShdblur] = useState(20);
  const [shdopacity, setShdopacity] = useState(50);
  const [shdcolor, setShdcolor] = useState("#000000");
  const [uniform, setUniform] = useState(true);
  const artboard = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState("");

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
  };

  const save = async () => {
    if (!artboard.current) return;
    await domtoimage.toPng(artboard.current).then((data) => {
      const link = document.createElement("a");
      link.download = "image.png";
      link.href = data;
      link.click();
    });
  };

  const swap_color = (id: string ) => {
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

  return (
    <div className="app">
      <div className="controls">
        <button type="button" onClick={save}>
          Export
        </button>
        <div className="control">
          <label htmlFor="roundness">Roundness</label>
          <input
            type="range"
            name="roundness"
            min={0}
            max={200}
            value={roundness}
            onChange={(e) => setRoundness(e.currentTarget.valueAsNumber)}
          />
        </div>
        <div className="control">
          <span>Padding {uniform ? `${pdl}px` : ""}</span>
          <label>
            Uniform
            <input
              type="radio"
              name="uniform"
              checked={uniform ? true : false}
              onChange={() => {
                setUniform(true);
                setPdl(pdl);
                setPdr(pdl);
                setPdb(pdl);
                setPdt(pdl);
              }}
            />
          </label>
          <label>
            Separate
            <input type="radio" name="uniform" checked={uniform ? false : true} onChange={() => setUniform(false)} />
          </label>
          {uniform ? (
            <>
              <input
                type="range"
                name="pdl"
                value={pdl}
                min={0}
                max={500}
                onChange={(e) => {
                  setPdl(e.currentTarget.valueAsNumber);
                  setPdr(e.currentTarget.valueAsNumber);
                  setPdb(e.currentTarget.valueAsNumber);
                  setPdt(e.currentTarget.valueAsNumber);
                }}
              />
            </>
          ) : (
            <>
              <label htmlFor="pdl">left: {pdl}px</label>
              <input
                type="range"
                name="pdl"
                value={pdl}
                min={0}
                max={500}
                onChange={(e) => setPdl(e.currentTarget.valueAsNumber)}
              />
              <label htmlFor="pdr">right: {pdr}px</label>
              <input
                type="range"
                name="pdr"
                value={pdr}
                min={0}
                max={500}
                onChange={(e) => setPdr(e.currentTarget.valueAsNumber)}
              />
              <label htmlFor="pdt">top: {pdt}px</label>
              <input
                type="range"
                name="pdt"
                value={pdt}
                min={0}
                max={500}
                onChange={(e) => setPdt(e.currentTarget.valueAsNumber)}
              />
              <label htmlFor="pdb">bottom: {pdb}px</label>
              <input
                type="range"
                name="pdb"
                value={pdb}
                min={0}
                max={500}
                onChange={(e) => setPdb(e.currentTarget.valueAsNumber)}
              />
            </>
          )}
        </div>
        <div className="control">
          <label htmlFor="shadowcolor">Shadow color</label>
          <input
            type="color"
            name="shadowcolor"
            onChange={(e) => setShdcolor(e.currentTarget.value)}
            value={shdcolor}
          />
          <label htmlFor="shadowblur">Shadow blur: {shdblur}px</label>
          <input
            type="range"
            name="shadowblur"
            min={0}
            max={100}
            onChange={(e) => setShdblur(e.currentTarget.valueAsNumber)}
            value={shdblur}
          />
          <label htmlFor="shadowopacity">Shadow opacity {shdopacity}%</label>
          <input
            type="range"
            min={0}
            max={100}
            name="shadowopacity"
            onChange={(e) => setShdopacity(e.currentTarget.valueAsNumber)}
            value={shdopacity}
          />
        </div>
        <div className="control">
          <label>
            Use solid color
            <input
              type="radio"
              name="usegradient"
              checked={useGradient ? false : true}
              onChange={() => setUseGradient(false)}
            />
          </label>
          <span>
            Use Gradient
            <input
              type="radio"
              name="usegradient"
              checked={useGradient ? true : false}
              onChange={() => setUseGradient(true)}
            />
          </span>
        </div>
        {useGradient ? (
          <>
            <div className="control">
              <label htmlFor="addgradient">Add gradient color</label>
              <input
                type="color"
                name="addgradient"
                onChange={(e) => setNewColor(e.currentTarget.value)}
                value={newColor}
              />
              <button onClick={() => setColors([...colors, { color: newColor, id: uuidv4() }])}>Add</button>
            </div>
            <div className="control">
              <span>Gradient colors</span>
              {colors.map((clr) => (
                <div key={clr.id}>
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
            <div className="control">
              <label htmlFor="gradientdir">Gradient direction</label>
              <select name="gradientdir" value={gradientDir} onChange={(e) => setGradientDir(e.currentTarget.value)}>
                <option value="to top">Towards top</option>
                <option value="to bottom">Towards bottom</option>
                <option value="to left">Towards left</option>
                <option value="to top left">Towards top left</option>
                <option value="to bottom left">Towards bottom left</option>
                <option value="to right">Towards right</option>
                <option value="to top right">Towards top right</option>
                <option value="to bottom right">Towards bottom right</option>
              </select>
            </div>
          </>
        ) : (
          <div className="control">
            <label htmlFor="bg">Background color</label>
            <input type="color" name="bg" value={bg} onChange={(e) => setBg(e.currentTarget.value)} />
          </div>
        )}
      </div>
      <div className="workspace">
        {source === "" ? (
          <div
            className="file_zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              const fileList = Array.from(e.dataTransfer.files);
              const files: string[] = await Promise.all(fileList.map((ab) => readFileAsync(ab)));
              if (files.length > 0) {
                setSource(files[0]);
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
                    setSource(files[0]);
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
                setSource(files[0]);
              }
            }}
            ref={artboard}
            style={{
              background:
                useGradient && colors.length >= 2
                  ? `linear-gradient(${gradientDir}, ${colors.map((cl) => `${cl.color}`)})`
                  : bg,
              paddingLeft: `${pdl}px`,
              paddingRight: `${pdr}px`,
              paddingTop: `${pdt}px`,
              paddingBottom: `${pdb}px`,
            }}>
            <img
              src={source}
              style={{
                borderRadius: `${roundness}px`,
                filter: `drop-shadow(0 0 ${shdblur}px rgba(${hexToRgb(shdcolor)}, ${shdopacity / 100}))`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
