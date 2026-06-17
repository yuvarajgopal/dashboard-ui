#!/usr/bin/env python3
import sys
import os

def load_properties(path):
    props = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, _, value = line.partition('=')
                props[key.strip()] = value.strip()
    return props

def get_hosts(service, env='dev', region='ca'):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    props_path = os.path.join(script_dir, 'envcfg', env, region, 'host.properties')

    if not os.path.exists(props_path):
        print(f"Error: properties file not found: {props_path}", file=sys.stderr)
        sys.exit(1)

    props = load_properties(props_path)
    prefix = f"{service}."
    servers = [v for k, v in sorted(props.items()) if k.startswith(prefix)]

    if not servers:
        print(f"No hosts found for service: {service}", file=sys.stderr)
        sys.exit(1)

    for server in servers:
        print(server)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <service> [env] [region]", file=sys.stderr)
        print(f"  env defaults to 'dev', region defaults to 'ca'", file=sys.stderr)
        sys.exit(1)

    service = sys.argv[1]
    env = sys.argv[2] if len(sys.argv) > 2 else 'dev'
    region = sys.argv[3] if len(sys.argv) > 3 else 'ca'

    get_hosts(service, env, region)
