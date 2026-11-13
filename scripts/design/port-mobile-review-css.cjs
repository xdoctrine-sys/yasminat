// Scope approved review snapshots for the native storefront.
const fs=require('fs');
const postcss=require('../../apps/storefront/node_modules/postcss');
for(const name of ['mobile-review','tablet-review','category-review','desktop-header-review']){
const source=`apps/storefront/src/components/yasminat/approved/${name}.css`;
const root=postcss.parse(fs.readFileSync(source,'utf8'));
function split(s){let depth=0,start=0,out=[];for(let i=0;i<s.length;i++){if(s[i]==='('||s[i]==='[')depth++;if(s[i]===')'||s[i]===']')depth--;if(s[i]===','&&depth===0){out.push(s.slice(start,i));start=i+1;}}out.push(s.slice(start));return out;}
root.walkRules(rule=>{
 if(rule.parent?.type==='atrule'&&/keyframes/.test(rule.parent.name))return;
 const selectors=split(rule.selector).map(s=>s.trim()).filter(s=>s!=='html'&&s!=='body');
 if(!selectors.length){rule.remove();return;}
 rule.selector=selectors.map(s=>s.startsWith('html[')?s.replace(/^(html\[[^\]]+\])\s*/,'$1 .yas-approved '):'.yas-approved '+s).join(',');
});
fs.writeFileSync(`apps/storefront/src/app/approved-${name}.css`,`/* Generated from the approved ${name}; run scripts/design/port-mobile-review-css.cjs. */\n`+root.toString());
}
