const fs=require('fs');const postcss=require('../../apps/storefront/node_modules/postcss');
const dir='apps/storefront/src/components/yasminat/approved/';
function split(s){let depth=0,start=0,result=[];for(let i=0;i<s.length;i++){if(s[i]==='('||s[i]==='[')depth++;if(s[i]===')'||s[i]===']')depth--;if(s[i]===','&&depth===0){result.push(s.slice(start,i));start=i+1;}}result.push(s.slice(start));return result;}
let result='/* Scoped verbatim approved styles. Source files retained beside the JSX port. */\n';
for(const file of ['styles.css','board.css']){const root=postcss.parse(fs.readFileSync(dir+file,'utf8'));root.walkRules(rule=>{
 if(rule.parent?.type==='atrule'&&/keyframes/.test(rule.parent.name))return;
 const sels=split(rule.selector).map(s=>s.trim()).filter(s=>!/^((html|body)(\s*,?\s*)?|\.workspace[^ ]*|#canvas|#screens)$/.test(s));
 if(!sels.length){rule.remove();return;}
 rule.selector=sels.map(s=>s===':root'?'.yas-approved':s.startsWith('html[')?s.replace(/^(html\[[^\]]+\])\s*/, '$1 .yas-approved '):`.yas-approved ${s}`).join(',');
 });result+=root.toString()+'\n';}
fs.writeFileSync('apps/storefront/src/app/approved-design.css',result);
