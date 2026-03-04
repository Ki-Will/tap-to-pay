import network
import time
from umqtt.simple import MQTTClient
import ujson as json
from machine import Pin, SPI
from mfrc522 import MFRC522
import binascii

# ----------------- WiFi Configuration -----------------
ssid = 'EdNet'
password = 'Huawei@123'

# ----------------- MQTT Configuration -----------------
# mqtt_server = "mqtt://157.173.101.159"
mqtt_server = "broker.hivemq.com"
MQTT_PORT = 1883
team_id = "vikings"

# ----------------- MQTT Topics -----------------
topic_status = f"rfid/{team_id}/card/status"
topic_balance = f"rfid/{team_id}/card/balance"
topic_topup = f"rfid/{team_id}/card/topup"
topic_payment = f"rfid/{team_id}/card/payment"
topic_health = f"rfid/{team_id}/device/health"
topic_lwt = f"rfid/{team_id}/device/status"
topic_removed = f"rfid/{team_id}/card/removed"

# ----------------- Card Tracking -----------------
lastDetectedUID = ""
cardPresent = False
lastCardCheck = 0
CARD_CHECK_INTERVAL = 500  # Check every 500ms

# ----------------- RFID Reader -----------------
reader = MFRC522(sck=14, mosi=13, miso=12, rst=0, cs=2)

# ----------------- Health Report -----------------
last_health_report = 0
HEALTH_INTERVAL = 60000  # 60 seconds

# ----------------- MQTT Callback -----------------
def on_message(topic, msg):
    print(f"Message arrived [{topic}] {msg}")

    try:
        payload = json.loads(msg)
        uid = payload.get("uid")
        topic_str = topic.decode()

        if topic_str == topic_topup:
            # Handle top-up: "amount" is the NEW total balance from backend
            newBalance = payload.get("amount", 0)

            # Prepare response
            response = {
                "uid": uid,
                "new_balance": newBalance,
                "status": "success",
                "type": "topup",
                "ts": int(time.time())
            }

            client.publish(topic_balance, json.dumps(response))

            print(f"Top-up confirmed for {uid}: balance = {newBalance}")

        elif topic_str == topic_payment:
            # Handle payment: "amount" is the NEW balance, "deducted" is the charge
            newBalance = payload.get("amount", 0)
            deducted = payload.get("deducted", 0)
            desc = payload.get("description", "Payment")

            # Prepare balance update response
            response = {
                "uid": uid,
                "new_balance": newBalance,
                "deducted": deducted,
                "status": "success",
                "type": "payment",
                "ts": int(time.time())
            }

            client.publish(topic_balance, json.dumps(response))

            print(f"Payment processed for {uid}: -${deducted}, new balance = {newBalance}")

    except Exception as e:
        print(f"Failed to parse message: {e}")

# ----------------- WiFi Setup -----------------
sta_if = network.WLAN(network.STA_IF)
sta_if.active(True)
print("Connecting to WiFi...")
sta_if.connect(ssid, password)
while not sta_if.isconnected():
    time.sleep(1)
print("WiFi connected")
print("IP:", sta_if.ifconfig()[0])

# ----------------- MQTT Setup -----------------
client_id = "ESP8266_Shield_" + binascii.hexlify(sta_if.config('mac')[-3:]).decode('ascii').upper()
client = MQTTClient(client_id, mqtt_server, port=MQTT_PORT)
client.set_callback(on_message)
client.set_last_will(topic_lwt, "offline", retain=True, qos=1)
client.connect()
client.publish(topic_lwt, "online", retain=True, qos=1)

# Subscribe to topics
client.subscribe(topic_topup)
client.subscribe(topic_payment)
client.subscribe(topic_health)
client.subscribe(topic_removed)

print("✓ System initialized successfully")

while True:
    client.check_msg()

    # Periodic health report
    now = time.ticks_ms()
    if time.ticks_diff(now, last_health_report) > HEALTH_INTERVAL:
        last_health_report = now
        import gc
        health = {
            "status": "online",
            "ip": sta_if.ifconfig()[0],
            "rssi": sta_if.status('rssi'),
            "free_heap": gc.mem_free(),
            "ts": int(time.time())
        }
        client.publish(topic_health, json.dumps(health))
        print("Health report published")

    # ----------------- RFID Scanning -----------------
    currentMillis = time.ticks_ms()

    # Check for card presence
    if time.ticks_diff(currentMillis, lastCardCheck) >= CARD_CHECK_INTERVAL:
        lastCardCheck = currentMillis

        try:
            (status, TagType) = reader.request(reader.REQIDL)
            if status == reader.OK:
                (status, uid) = reader.anticoll()
                if status == reader.OK:
                    uid_str = ''.join('{:02X}'.format(x) for x in uid)

                    if uid_str != lastDetectedUID or not cardPresent:
                        lastDetectedUID = uid_str
                        cardPresent = True

                        currentBalance = 50.0  # Simulated balance

                        print(f"Card Detected: {uid_str} | Balance: {currentBalance}")

                        # Prepare JSON payload
                        status_msg = {
                            "uid": uid_str,
                            "balance": currentBalance,
                            "status": "detected",
                            "present": True,
                            "ts": int(time.time())
                        }

                        client.publish(topic_status, json.dumps(status_msg))

        except Exception as e:
            # No card or error
            if cardPresent:
                # Card removed
                removed_msg = {
                    "uid": lastDetectedUID,
                    "status": "removed",
                    "present": False,
                    "ts": int(time.time())
                }
                client.publish(topic_removed, json.dumps(removed_msg))
                print(f"Card removed: {lastDetectedUID}")
                cardPresent = False
                lastDetectedUID = ""

    time.sleep_ms(100)
