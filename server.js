import { SerialPort } from "serialport";
import mysql from "mysql2";

// Serial port configuration (adjust based on your setup)
const port = new SerialPort({
  path: "/dev/cu.usbmodem14201",
  baudRate: 9600,
});

// MySQL connection pool configuration
const pool = createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "aqm",
});

port.on("data", async (data) => {
  // Parse the received data from Arduino
  const sensorData = JSON.parse(data.toString());
  const mq9Value = sensorData.mq9;
  const mq7Value = sensorData.mq7;
  const temperature = sensorData.temperature;
  const latitude = sensorData.latitude || null; // Handle potential missing GPS data
  const longitude = sensorData.longitude || null; // Handle potential missing GPS data

  // Connect to the database pool and insert data
  const connection = await pool.getConnection();
  await connection.query(
    "INSERT INTO sensor_data (mq9_value, mq7_value, temperature, latitude, longitude) VALUES (?, ?, ?, ?, ?)",
    [mq9Value, mq7Value, temperature, latitude, longitude]
  );
  connection.release();
});
