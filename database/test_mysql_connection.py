import mysql.connector

connection = mysql.connector.connect(
    host="localhost",
    port=3306,
    user="root",
    password="Lohith@444",
    database="network_traffic_dw"
)

print("Connected to MySQL successfully!")
print("Database:", connection.database)

connection.close()
print("Connection closed.")