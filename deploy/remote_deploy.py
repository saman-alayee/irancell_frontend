#!/usr/bin/env python3
"""Deploy irancell project to remote server via SSH/SFTP."""
import os
import sys
import tarfile
import tempfile
import stat

try:
    import paramiko
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'paramiko', '-q'])
    import paramiko

HOST = '85.208.253.193'
PORT = 3031
USER = 'root'
PASSWORD = '3Z3w0c8)6Ok0iQe5'
REMOTE_DIR = '/var/www/irancell'
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SKIP_DIRS = {'node_modules', '.git', '.nuxt', '.output', 'dist', '__pycache__'}
SKIP_FILES = {'.env'}


def should_skip(path: str) -> bool:
    parts = path.replace('\\', '/').split('/')
    for p in parts:
        if p in SKIP_DIRS:
            return True
    if os.path.basename(path) in SKIP_FILES:
        return True
    return False


def create_tarball(tar_path: str) -> None:
    print('Creating deployment archive...')
    with tarfile.open(tar_path, 'w:gz') as tar:
        for root, dirs, files in os.walk(PROJECT_ROOT):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            rel_root = os.path.relpath(root, PROJECT_ROOT)
            if rel_root == '.':
                rel_root = ''
            for name in files:
                full = os.path.join(root, name)
                rel = os.path.join(rel_root, name).replace('\\', '/')
                if should_skip(full) or rel.startswith('deploy/remote_deploy'):
                    continue
                tar.add(full, arcname=rel if rel else name)
    print(f'Archive size: {os.path.getsize(tar_path) / 1024 / 1024:.1f} MB')


def run_ssh(client, cmd: str, timeout=600) -> int:
    print(f'\n$ {cmd[:120]}...' if len(cmd) > 120 else f'\n$ {cmd}')
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    code = stdout.channel.recv_exit_status()
    if out.strip():
        safe = out[-8000:] if len(out) > 8000 else out
        try:
            print(safe)
        except UnicodeEncodeError:
            print(safe.encode('ascii', errors='replace').decode('ascii'))
    if err.strip() and code != 0:
        safe_err = err[-4000:] if len(err) > 4000 else err
        try:
            print('STDERR:', safe_err)
        except UnicodeEncodeError:
            print('STDERR:', safe_err.encode('ascii', errors='replace').decode('ascii'))
    return code


def main():
    tar_fd, tar_path = tempfile.mkstemp(suffix='.tar.gz')
    os.close(tar_fd)
    try:
        create_tarball(tar_path)

        print(f'Connecting to {HOST}:{PORT}...')
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=30)

        run_ssh(client, f'mkdir -p {REMOTE_DIR}')
        print('Uploading archive...')
        sftp = client.open_sftp()
        sftp.put(tar_path, '/tmp/irancell-deploy.tar.gz')
        sftp.close()

        steps = [
            f'mkdir -p {REMOTE_DIR} && tar -xzf /tmp/irancell-deploy.tar.gz -C {REMOTE_DIR}',
            f"sed -i 's/\\r$//' {REMOTE_DIR}/deploy/*.sh {REMOTE_DIR}/deploy/*.cjs 2>/dev/null || true",
            f'chmod +x {REMOTE_DIR}/deploy/server-setup.sh',
            f'bash {REMOTE_DIR}/deploy/server-setup.sh',
        ]
        for cmd in steps:
            code = run_ssh(client, cmd, timeout=900)
            if code != 0:
                print(f'Command failed with code {code}')
                sys.exit(code)

        client.close()
        print('\n✅ Deployment complete!')
        print(f'🌐 http://{HOST}')
        print('Admin: admin@example.com / admin123456')
    finally:
        if os.path.exists(tar_path):
            os.remove(tar_path)


if __name__ == '__main__':
    main()
