import socket

host = "verbal-sleep.picoctf.net"
port = 50702

# Buka koneksi TCP
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host, port))

print(f"[+] Terhubung ke {host}:{port}\n")

try:
    while True:
        # Terima respon dari server
        data = s.recv(4096)
        if not data:
            break
        print(data.decode('utf-8', errors='ignore'), end='')
        
        # Kirim input user ke server
        user_input = input()
        s.sendall((user_input + "\n").encode('utf-8'))
except KeyboardInterrupt:
    print("\n[+] Koneksi ditutup.")
finally:
    s.close()