import React, { useState, useEffect } from "react";
import { read, utils } from "xlsx";
import QrReader from "react-qr-reader";
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
    if (data) {
      if (!scannedCodes.includes(data)) {
        setScannedCodes([...scannedCodes, data]);
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

  return (
    <div className="App">
      <h1>QuickPriceCheck</h1>
      <div className="scanner">
        <QrReader
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: "100%" }}
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
