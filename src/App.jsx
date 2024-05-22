import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaVolumeUp } from "react-icons/fa";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup,Polyline  } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { Globals } from "../app.config";

const blueIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl: "marker-icon_green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

function App() {
  const [rutas, setRutas] = useState([]);
  const [searchDM, setSearchDM] = useState("");
  const [selectedRuta, setSelectedRuta] = useState(null);
  const [readingIndex, setReadingIndex] = useState(-1);

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const response = await axios.get("/rutas.json");
        setRutas(response.data);
      } catch (error) {
        console.error("Error loading rutas.json:", error);
      }
    };

    fetchRutas();
  }, []);

  const handleSearch = () => {
    const ruta = rutas.find((r) => r.DM.toString() === searchDM);
    setSelectedRuta(ruta);
    if (ruta) {
      readRuta(ruta.RutaTransitar);
    }
  };

  const readRuta = (ruta) => {
    const texts = [
      "Trayecto:", //0
      ...ruta.Trayecto.map((t) => `${t.Nombre},`), //1-2-3-4
      `Distancia de ida: ${ruta.DistanciaIda},`, //5
      `Tiempo de tránsito: ${ruta.TiempoTransito},`, //6
      `Velocidad promedio de carga: ${ruta.VelocidadPromedioCarga},`, //7
      "Condiciones de la ruta:", //8
      ...ruta.CondicionesRuta.map((c) => `${c.Nombre},`), //9-10-11-12-13-14
      "Indicaciones:", //15
      ...ruta.Mensajes.map((c) => `${c.Indicaciones},`), //16-17-18-19-20-21-22-23-24
      "Buen Viaje", //25
    ];

    texts.forEach((text, index) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.onstart = () => setReadingIndex(index);
      window.speechSynthesis.speak(utterance);
    });
  };

  

  return (
    <div className="w-100">
      <h1>Buscar Ruta por DM</h1>
      <input type="text" value={searchDM} onChange={(e) => setSearchDM(e.target.value)} placeholder="Ingrese DM" />
      <button onClick={handleSearch}>Buscar</button>
      {selectedRuta && (
        <div className="row">
          <div className="col-md-6">
            <h2>Ruta Encontrada</h2>
            <MapContainer center={[selectedRuta.CentroCarga.Coordenadas.Lat, selectedRuta.CentroCarga.Coordenadas.Long]} zoom={8} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
              <Marker position={[selectedRuta.CentroCarga.Coordenadas.Lat, selectedRuta.CentroCarga.Coordenadas.Long]} icon={blueIcon}>
                <Popup>{selectedRuta.CentroCarga.Nombre}</Popup>
              </Marker>
              <Marker position={[selectedRuta.Destino.Coordenadas.Lat, selectedRuta.Destino.Coordenadas.Long]} icon={greenIcon}>
                <Popup>{selectedRuta.Destino.Nombre}</Popup>
              </Marker>
            </MapContainer>
          </div>
          <div className="col-md-6">
            <ul className="list-group">
              {selectedRuta.RutaTransitar.Trayecto.map((t, index) => (
                <li key={`trayecto-${index}`} className={`list-group-item ${readingIndex === index + 1 ? "bg-success text-white" : ""}`}>
                  {readingIndex === index + 1 && <FaVolumeUp className="me-2" />}
                  {t.Nombre}
                </li>
              ))}
              <li className={`list-group-item ${readingIndex === selectedRuta.RutaTransitar.Trayecto.length + 1 ? "bg-success text-white" : ""}`}>
                {readingIndex === selectedRuta.RutaTransitar.Trayecto.length + 1 && <FaVolumeUp className="me-2" />}
                Distancia de ida: {selectedRuta.RutaTransitar.DistanciaIda}
              </li>
              <li className={`list-group-item ${readingIndex === selectedRuta.RutaTransitar.Trayecto.length + 2 ? "bg-success text-white" : ""}`}>
                {readingIndex === selectedRuta.RutaTransitar.Trayecto.length + 2 && <FaVolumeUp className="me-2" />}
                Tiempo de tránsito: {selectedRuta.RutaTransitar.TiempoTransito}
              </li>
              <li className={`list-group-item ${readingIndex === selectedRuta.RutaTransitar.Trayecto.length + 3 ? "bg-success text-white" : ""}`}>
                {readingIndex === selectedRuta.RutaTransitar.Trayecto.length + 3 && <FaVolumeUp className="me-2" />}
                Velocidad promedio de carga: {selectedRuta.RutaTransitar.VelocidadPromedioCarga}
              </li>
              {selectedRuta.RutaTransitar.CondicionesRuta.map((c, index) => (
                <li key={`condicion-${index}`} className={`list-group-item ${readingIndex === selectedRuta.RutaTransitar.Trayecto.length + 5 + index ? "bg-success text-white" : ""}`}>
                  {readingIndex === selectedRuta.RutaTransitar.Trayecto.length + 5 + index && <FaVolumeUp className="me-2" />}
                  {c.Nombre}
                </li>
              ))}
              {selectedRuta.RutaTransitar.Mensajes.map((c, index) => (
                <li key={`mensaje-${index}`} className={`list-group-item ${readingIndex === selectedRuta.RutaTransitar.Trayecto.length + selectedRuta.RutaTransitar.CondicionesRuta.length + 6 + index ? "bg-success text-white" : ""}`}>
                  {readingIndex === selectedRuta.RutaTransitar.Trayecto.length + selectedRuta.RutaTransitar.CondicionesRuta.length + 6 + index && <FaVolumeUp className="me-2" />}
                  {c.Indicaciones}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
