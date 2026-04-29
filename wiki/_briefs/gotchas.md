## Brief: gotchas.md

Focus: Sharp edges that will bite a contributor — ranked by severity.

Recent fix / revert / bug commits (for Critical / High candidates):
```
(no matching commits)
```

TODO / FIXME / HACK / XXX comments (raw material for Medium / Low):
```
/home/ubuntu/apps/encar-parser/web/.next/server/chunks/[root-of-the-server]__0j8-xkl._.js:1:module.exports=[61724,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-route-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-route-turbo.runtime.prod.js"))},47909,(e,t,r)=>{t.exports=e.r(61724)},17413,(e,t,r)=>{(()=>{"use strict";let r,n,a,i,o;var s,c,u,l,d,h,p,f,g,m,b,v,_,y,E,R,w={491:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.ContextAPI=void 0;let n=r(223),a=r(172),i=r(930),o="context",s=new n.NoopContextManager;class c{static getInstance(){return this._instance||(this._instance=new c),this._instance}setGlobalContextManager(e){return(0,a.registerGlobal)(o,e,i.DiagAPI.instance())}active(){return this._getContextManager().active()}with(e,t,r,...n){return this._getContextManager().with(e,t,r,...n)}bind(e,t){return this._getContextManager().bind(e,t)}_getContextManager(){return(0,a.getGlobal)(o)||s}disable(){this._getContextManager().disable(),(0,a.unregisterGlobal)(o,i.DiagAPI.instance())}}t.ContextAPI=c},930:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.DiagAPI=void 0;let n=r(56),a=r(912),i=r(957),o=r(172);class s{constructor(){function e(e){return function(...t){let r=(0,o.getGlobal)("diag");if(r)return r[e](...t)}}const t=this;t.setLogger=(e,r={logLevel:i.DiagLogLevel.INFO})=>{var n,s,c;if(e===t){let e=Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a c
```

GitNexus queries for context:
- `gitnexus_impact` on any symbol whose change caused a past fix commit
- `gitnexus_cypher` with `MATCH (f:Function)-[:CALLS]->(g:Function) WHERE f.name CONTAINS "try" OR f.name CONTAINS "retry"`

Do NOT cover:
- Architectural decisions (`decisions.md`)
- Deployment issues (`deployment.md`)

MUST have ## Critical / ## High / ## Medium / ## Low sections with ≥10 entries total. Each entry: **Problem** / **Risk** / **Workaround**.
