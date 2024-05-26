import { useState, useEffect } from "react";
import { read, utils } from "xlsx";
import QrScanner from "react-qr-scanner";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [scannedCodes, setScannedCodes] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/products.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = utils.sheet_to_json(sheet);
      setProducts(data);
    };
    fetchData();
  }, []);

  const handleScan = (data) => {
    if (data && data.text) {
      if (!scannedCodes.includes(data.text)) {
        setScannedCodes([...scannedCodes, data.text]);
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  useEffect(() => {
    let total = 0;
    scannedCodes.forEach((code) => {
      const product = products.find((p) => p.barcode === code);
      if (product) {
        total += parseFloat(product.price);
      }
    });
    setTotalPrice(total);
  }, [scannedCodes, products]);

  const previewStyle = {
    height: 240,
    width: 320,
  };

  return (
    <div className="App">
      <h1>Quick Price Check</h1>
      <div className="scanner">
        <QrScanner
          delay={300}
          style={previewStyle}
          onError={handleError}
          onScan={handleScan}
        />
      </div>
      <div className="results">
        <h2>Scanned Products</h2>
        <ul>
          {scannedCodes.map((code) => {
            const product = products.find((p) => p.barcode === code);
            return product ? (
              <li key={code}>
                {product.product_name}: ${product.price}
              </li>
            ) : (
              <li key={code}>Unknown product (Barcode: {code})</li>
            );
          })}
        </ul>
        <h2>Total Price: ${totalPrice.toFixed(2)}</h2>
      </div>
    </div>
  );
}

export default App;
