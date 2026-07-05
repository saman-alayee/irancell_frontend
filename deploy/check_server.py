#!/usr/bin/env python3
import paramiko

HOST, PORT, USER, PASSWORD = '85.208.253.193', 3031, 'root', '3Z3w0c8)6Ok0iQe5'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=30)

cmds = [
    'uname -a',
    'export LANG=C; pm2 list 2>&1 | head -30',
    'systemctl is-active nginx 2>&1',
    'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>&1; echo',
    'curl -s http://127.0.0.1:3001/api/health 2>&1',
    'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/ 2>&1; echo',
    'tail -30 /root/.pm2/logs/irancell-web-error.log 2>/dev/null || echo no-web-log',
    'tail -30 /root/.pm2/logs/irancell-api-error.log 2>/dev/null || echo no-api-log',
]

def safe_print(s):
    try:
        print(s)
    except UnicodeEncodeError:
        print(s.encode('ascii', errors='replace').decode('ascii'))

for c in cmds:
    safe_print('\n=== ' + c + ' ===')
    _, stdout, stderr = client.exec_command(c, timeout=120)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    safe_print(out or err)

client.close()
