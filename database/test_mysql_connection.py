import os
import mysql.connector

connection = mysql.connector.connect(
    host=os.environ.get("DB_HOST", "localhost"),
    port=int(os.environ.get("DB_PORT", 3306)),
    user=os.environ.get("DB_USER", "root"),
    password=os.environ.get("DB_PASSWORD", ""),
    database=os.environ.get("DB_NAME", "network_traffic_dw")
)

print("Connected to MySQL successfully!")
print("Database:", connection.database)

connection.close()
print("Connection closed.")