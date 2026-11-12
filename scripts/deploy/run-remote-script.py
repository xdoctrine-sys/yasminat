"""Run a reviewed Medusa exec script through the existing Railway SSH identity.
No environment variables or credentials are printed. Raw logs stay in /private/tmp.
"""
import base64, pathlib, shlex, subprocess, sys
source=pathlib.Path(sys.argv[1]).resolve()
name=source.name
if name not in {'catalog-inventory.ts','seed-yasminat-preview.ts'}:raise SystemExit('Unsupported script')
encoded=base64.b64encode(source.read_bytes()).decode('ascii')
remote='/tmp/yasminat-'+name
apply='--apply' in sys.argv[2:]
if apply and name!='seed-yasminat-preview.ts':raise SystemExit('Apply is only valid for the preview seed')
command='printf %s '+shlex.quote(encoded)+' | base64 -d > '+shlex.quote(remote)+' && cd /app/packages/api && '+('YASMINAT_PREVIEW_SEED_APPLY=1 ' if apply else '')+'XDG_CONFIG_HOME=/tmp/yasminat-config ./node_modules/.bin/medusa exec '+shlex.quote(remote)
args=['railway','ssh','--project','76943e20-4ade-4d90-b5db-adafc37b2cdd','--service','backend','--environment','production',command]
run=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
log=pathlib.Path('/private/tmp/yasminat-remote-'+name+'.log');log.write_text(run.stdout)
for line in run.stdout.splitlines():
 if line.startswith('YASMINAT_'):print(line)
print('Remote exit:',run.returncode,'Log:',log)
sys.exit(run.returncode)
