#!/usr/bin/env python3
import paramiko

HOST, PORT, USER, PASSWORD = '85.208.253.193', 3031, 'root', '3Z3w0c8)6Ok0iQe5'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=30)

cmds = [
    'ls -la /root/.pm2/logs/ | head -20',
    'tail -40 /root/.pm2/logs/irancell-web-error*.log 2>/dev/null',
    'tail -20 /root/.pm2/logs/irancell-web-out*.log 2>/dev/null',
    'cat /var/www/irancell/frontend/.env 2>/dev/null || echo no-env',
    'head -5 /var/www/irancell/frontend/error.vue 2>/dev/null',
    'grep -n apiBaseInternal /var/www/irancell/frontend/nuxt.config.ts 2>/dev/null || echo no-nuxt-config',
    'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/admin/login; echo',
    'curl -s http://127.0.0.1:3000/admin/login 2>&1 | head -5',
    'node -v; npm -v',
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
