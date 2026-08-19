import string

# Raw string dari hexdump
cipher = "=x1{aQe3b)HxkERECUQ.c|al:BV=k+RIHFTP"

print("=== 1. TESTING REVERSE + BASE92 MANUAL ===")
rev = cipher[::-1]
print("Reversed String:", rev)

try:
    import base92
    print("Base92 Decoded (Raw):", base92.decode(cipher))
    print("Base92 Decoded (Reversed):", base92.decode(rev))
except Exception as e:
    print("Base92 Error:", e)

print("\n=== 2. TESTING SINGLE-BYTE XOR (BRUTEFORCE) ===")
# Siapa tahu cuma di-XOR 1 key byte!
for key in range(256):
    res = "".join(chr(ord(c) ^ key) for c in cipher)
    res_rev = "".join(chr(ord(c) ^ key) for c in rev)
    
    if "thryve" in res.lower() or "flag" in res.lower() or "thryve" in res_rev.lower() or "flag" in res_rev.lower():
        print(f"[+] FOUND KEY {key} (hex: {hex(key)}):")
        print("    Forward :", res)
        print("    Reversed:", res_rev)

print("\n=== 3. TESTING CAESAR / ROT SHIFT (1-25) ===")
for shift in range(1, 26):
    shifted = ""
    for char in cipher:
        if 'a' <= char <= 'z':
            shifted += chr((ord(char) - ord('a') + shift) % 26 + ord('a'))
        elif 'A' <= char <= 'Z':
            shifted += chr((ord(char) - ord('A') + shift) % 26 + ord('A'))
        else:
            shifted += char
    
    if "thryve" in shifted.lower() or "flag" in shifted.lower() or "thryve" in shifted[::-1].lower():
        print(f"[+] ROT-{shift}:", shifted)
        print(f"[+] ROT-{shift} (Reversed):", shifted[::-1])

print("\n=== FINISHED ===")