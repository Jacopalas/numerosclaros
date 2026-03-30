(function(E,K){typeof exports=="object"&&typeof module<"u"?K(exports):typeof define=="function"&&define.amd?define(["exports"],K):(E=typeof globalThis<"u"?globalThis:E||self,K(E.NumerosClaros={}))})(this,(function(E){"use strict";const K=`
  :host {
    --nc-primary: #1a56db;
    --nc-bg: #ffffff;
    --nc-text: #111827;
    --nc-border: #e5e7eb;
    --nc-accent: #059669;
    --nc-error: #dc2626;
    --nc-surface: #f9fafb;
    --nc-muted: #6b7280;
    --nc-radius: 8px;
    --nc-shadow: 0 1px 3px rgba(0,0,0,0.1);

    display: block;
    font-family: system-ui, -apple-system, sans-serif;
    color: var(--nc-text);
    background: var(--nc-bg);
    border: 1px solid var(--nc-border);
    border-radius: var(--nc-radius);
    padding: 1.5rem;
    box-sizing: border-box;
    line-height: 1.5;
  }

  :host([theme="dark"]) {
    --nc-bg: #1f2937;
    --nc-text: #f9fafb;
    --nc-border: #374151;
    --nc-surface: #111827;
    --nc-muted: #9ca3af;
    --nc-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  * { box-sizing: border-box; }

  .nc-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--nc-primary);
  }

  .nc-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
  }

  @media (min-width: 480px) {
    .nc-grid { grid-template-columns: 1fr 1fr; }
  }

  .nc-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .nc-field label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--nc-muted);
  }

  .nc-field input, .nc-field select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--nc-border);
    border-radius: var(--nc-radius);
    font-size: 1rem;
    background: var(--nc-bg);
    color: var(--nc-text);
    transition: border-color 0.15s;
  }

  .nc-field input:focus, .nc-field select:focus {
    outline: none;
    border-color: var(--nc-primary);
    box-shadow: 0 0 0 3px rgba(26,86,219,0.15);
  }

  .nc-results {
    margin-top: 1.25rem;
    padding: 1rem;
    background: var(--nc-surface);
    border-radius: var(--nc-radius);
    border: 1px solid var(--nc-border);
  }

  .nc-result-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--nc-border);
  }

  .nc-result-row:last-child { border-bottom: none; }

  .nc-result-label {
    font-size: 0.85rem;
    color: var(--nc-muted);
  }

  .nc-result-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--nc-text);
  }

  .nc-result-value.nc-highlight {
    color: var(--nc-primary);
    font-size: 1.3rem;
  }

  .nc-result-value.nc-accent {
    color: var(--nc-accent);
  }

  .nc-chart {
    margin-top: 1rem;
    width: 100%;
    overflow: hidden;
  }

  .nc-chart svg {
    width: 100%;
    height: auto;
  }

  .nc-badge {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .nc-badge-primary {
    background: rgba(26,86,219,0.1);
    color: var(--nc-primary);
  }

  .nc-badge-accent {
    background: rgba(5,150,105,0.1);
    color: var(--nc-accent);
  }

  .nc-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
    margin-top: 0.75rem;
  }

  .nc-table th {
    text-align: left;
    padding: 0.5rem;
    border-bottom: 2px solid var(--nc-border);
    color: var(--nc-muted);
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  .nc-table td {
    padding: 0.4rem 0.5rem;
    border-bottom: 1px solid var(--nc-border);
  }

  .nc-table tbody tr:hover {
    background: var(--nc-surface);
  }

  .nc-table-scroll {
    max-height: 300px;
    overflow-y: auto;
  }

  .nc-full-width {
    grid-column: 1 / -1;
  }

  .nc-columns {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .nc-columns > * {
    flex: 1;
    min-width: 200px;
  }

  .nc-separator {
    height: 1px;
    background: var(--nc-border);
    margin: 1rem 0;
    grid-column: 1 / -1;
  }
`;let F=class extends HTMLElement{constructor(){super(),this._debounceTimer=null,this.shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["lang","theme"]}connectedCallback(){this.hasAttribute("lang")||this.setAttribute("lang","es"),this.hasAttribute("theme")||this.setAttribute("theme","light"),this.render(),this.attachInputListeners()}attributeChangedCallback(){this.isConnected&&(this.render(),this.attachInputListeners())}render(){this.shadow.innerHTML=`
      <style>${K}</style>
      <h2 class="nc-title"><slot name="title">${this.getTitle()}</slot></h2>
      ${this.getTemplate()}
    `,this.calculate()}attachInputListeners(){this.shadow.querySelectorAll("input, select").forEach(a=>{a.addEventListener("input",()=>this.debouncedCalculate()),a.addEventListener("change",()=>this.debouncedCalculate())})}debouncedCalculate(){this._debounceTimer&&clearTimeout(this._debounceTimer),this._debounceTimer=setTimeout(()=>this.calculate(),50)}getInput(t){const a=this.shadow.getElementById(t);if(!a)return 0;const e=parseFloat(a.value);return isNaN(e)?0:e}getInputString(t){const a=this.shadow.getElementById(t);return(a==null?void 0:a.value)??""}setText(t,a){const e=this.shadow.getElementById(t);e&&(e.textContent=a)}setHtml(t,a){const e=this.shadow.getElementById(t);e&&(e.innerHTML=a)}formatCurrency(t){return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2}).format(t)}formatNumber(t,a=2){return new Intl.NumberFormat("es-ES",{minimumFractionDigits:a,maximumFractionDigits:a}).format(t)}formatPercent(t){return new Intl.NumberFormat("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2}).format(t)+"%"}createBarChart(t,a=200){if(t.length===0)return"";const e=Math.max(...t.map(s=>s.value),1),i=100/t.length,o=i*.15,n=t.map((s,c)=>{const l=s.value/e*(a-40),u=c*i+o,d=i-o*2,p=a-30-l;return`
          <rect x="${u}%" y="${p}" width="${d}%" height="${l}" fill="${s.color}" rx="3"/>
          <text x="${u+(i-o*2)/2+o}%" y="${a-10}"
                text-anchor="middle" font-size="11" fill="var(--nc-muted)">${s.label}</text>
        `}).join("");return`<svg viewBox="0 0 100 ${a}" preserveAspectRatio="none" class="nc-bar-chart"
                 style="width:100%;height:${a}px">${n}</svg>`}createLineChart(t,a=400,e=150,i="var(--nc-primary)",o=.15){if(t.length<2)return"";const n=Math.max(...t,1),s=Math.min(...t,0),c=n-s||1,l=a/(t.length-1),u=t.map((m,h)=>({x:h*l,y:e-10-(m-s)/c*(e-20)})),d=u.map((m,h)=>`${h===0?"M":"L"} ${m.x} ${m.y}`).join(" "),p=`${d} L ${u[u.length-1].x} ${e-10} L 0 ${e-10} Z`;return`
      <svg viewBox="0 0 ${a} ${e}" preserveAspectRatio="none"
           style="width:100%;height:${e}px">
        <path d="${p}" fill="${i}" opacity="${o}"/>
        <path d="${d}" fill="none" stroke="${i}" stroke-width="2"/>
      </svg>
    `}createDonutChart(t,a=180){const e=t.reduce((h,v)=>h+v.value,0);if(e===0)return"";const i=a/2,o=a/2,n=a*.38,s=a*.15,c=2*Math.PI*n;let l=0;const u=t.map(h=>{const f=h.value/e*c,b=-l;return l+=f,`<circle cx="${i}" cy="${o}" r="${n}"
                fill="none" stroke="${h.color}" stroke-width="${s}"
                stroke-dasharray="${f} ${c-f}"
                stroke-dashoffset="${b}"
                transform="rotate(-90 ${i} ${o})"/>`}),d=a+10,p=t.map((h,v)=>`
        <rect x="0" y="${d+v*20}" width="12" height="12" rx="2" fill="${h.color}"/>
        <text x="18" y="${d+v*20+11}" font-size="12" fill="var(--nc-text)">
          ${h.label}: ${this.formatCurrency(h.value)}
        </text>
      `),m=a+15+t.length*20;return`
      <svg viewBox="0 0 ${a} ${m}" style="width:${a}px;max-width:100%;height:auto">
        ${u.join("")}
        ${p.join("")}
      </svg>
    `}};function aa(r){const{principal:t,annualRate:a,years:e}=r,i=e*12,o=a/100/12;let n;o===0?n=t/i:n=t*(o*Math.pow(1+o,i))/(Math.pow(1+o,i)-1);const s=[];let c=t;for(let d=1;d<=i;d++){const p=c*o,m=n-p;c=Math.max(0,c-m),s.push({month:d,payment:q(n),principal:q(m),interest:q(p),balance:q(c)})}const l=n*i,u=l-t;return{monthlyPayment:q(n),totalPayment:q(l),totalInterest:q(u),amortization:s}}function q(r){return Math.round(r*100)/100}function ea(r){const{principal:t,annualRate:a,years:e,monthlyContribution:i=0,compoundingFrequency:o=12}=r,n=a/100,s=o,c=n/s,l=i*(12/s),u=[];let d=t,p=t;for(let m=1;m<=e;m++){for(let h=0;h<s;h++)d=d*(1+c)+l;p+=i*12,u.push({year:m,balance:Z(d),totalContributions:Z(p),totalInterest:Z(d-p)})}return{finalBalance:Z(d),totalContributions:Z(p),totalInterest:Z(d-p),yearByYear:u}}function Z(r){return Math.round(r*100)/100}function sa(r){const t=r.map(e=>{const i=e.years*12,o=e.annualRate/100/12;let n;o===0?n=e.principal/i:n=e.principal*(o*Math.pow(1+o,i))/(Math.pow(1+o,i)-1);const s=n*i,c=s-e.principal;return{name:e.name,monthlyPayment:st(n),totalPayment:st(s),totalInterest:st(c),effectiveRate:st(c/e.principal*100)}});let a=0;for(let e=1;e<t.length;e++)t[e].totalPayment<t[a].totalPayment&&(a=e);return{loans:t,cheapestIndex:a}}function st(r){return Math.round(r*100)/100}function oa(r){const{initialInvestment:t,finalValue:a,years:e}=r,i=a-t,o=i/t*100;let n;return e<=0?n=o:n=(Math.pow(a/t,1/e)-1)*100,{totalRoi:rt(o),annualizedRoi:rt(n),netProfit:rt(i)}}function rt(r){return Math.round(r*100)/100}function ia(r){const{amount:t,annualInflation:a,years:e}=r,i=a/100,o=[];let n=t;for(let l=1;l<=e;l++)n=n*(1+i),o.push({year:l,value:lt(n)});const s=lt(n),c=lt((s-t)/s*100);return{adjustedAmount:s,purchasingPowerLost:c,yearByYear:o}}function lt(r){return Math.round(r*100)/100}function na(r,t){const a=bt(r,t,"snowball"),e=bt(r,t,"avalanche"),i=e.totalPaid<=a.totalPaid?"avalanche":"snowball",o=tt(Math.abs(a.totalPaid-e.totalPaid));return{snowball:a,avalanche:e,savings:o,recommended:i}}function bt(r,t,a){const e=r.map(l=>({...l,balance:l.balance,monthlyRate:l.annualRate/100/12}));a==="snowball"?e.sort((l,u)=>l.balance-u.balance):e.sort((l,u)=>u.annualRate-l.annualRate);let i=0,o=0;const n=[],s=1200;for(;e.some(l=>l.balance>.01)&&o<s;){o++;let l=t;for(const d of e)d.balance>0&&(d.balance+=d.balance*d.monthlyRate);for(const d of e){if(d.balance<=0)continue;const p=Math.min(d.minimumPayment,d.balance);d.balance-=p,l-=p,i+=p}for(const d of e){if(d.balance<=0||l<=0)continue;const p=Math.min(l,d.balance);d.balance-=p,l-=p,i+=p}const u=e.reduce((d,p)=>d+Math.max(0,p.balance),0);o%1===0&&n.push({month:o,totalBalance:tt(u),totalPaid:tt(i)})}const c=r.reduce((l,u)=>l+u.balance,0);return{strategy:a,totalMonths:o,totalPaid:tt(i),totalInterest:tt(i-c),timeline:n}}function tt(r){return Math.round(r*100)/100}function ra(r){const{monthlyIncome:t}=r,a=H(t*.5),e=H(t*.3),i=H(t*.2);return{needs:a,wants:e,savings:i,yearly:{needs:H(a*12),wants:H(e*12),savings:H(i*12),total:H(t*12)}}}function H(r){return Math.round(r*100)/100}function la(r){const{monthlyExpenses:t,targetMonths:a,currentSavings:e=0,monthlySavingsCapacity:i}=r,o=ct(t*a),n=ct(Math.max(0,o-e)),s=o>0?ct(Math.min(e,o)/o*100):100;let c=null;return i&&i>0&&n>0?c=Math.ceil(n/i):n===0&&(c=0),{goal:o,remaining:n,percentComplete:s,monthsToGoal:c}}function ct(r){return Math.round(r*100)/100}function ca(r){const{goal:t,months:a,currentSavings:e=0,annualReturn:i=0}=r,o=Math.max(0,t-e),n=i/100/12;let s;if(n===0||a===0)s=a>0?o/a:o;else{const p=e*Math.pow(1+n,a);s=(t-p)*n/(Math.pow(1+n,a)-1),s=Math.max(0,s)}const c=[];let l=e,u=0,d=0;for(let p=1;p<=a;p++){const m=l*n;d+=m,l+=m+s,u+=s,c.push({month:p,contribution:_(s),interest:_(m),balance:_(l),percentComplete:_(Math.min(100,l/t*100))})}return{monthlyContribution:_(s),totalContributed:_(u),totalInterest:_(d),timeline:c}}function _(r){return Math.round(r*100)/100}const Q=[{hasta:12450,tipo:.095},{hasta:20200,tipo:.12},{hasta:35200,tipo:.15},{hasta:6e4,tipo:.185},{hasta:3e5,tipo:.225},{hasta:1/0,tipo:.245}],gt=[{hasta:6e3,tipo:.19},{hasta:5e4,tipo:.21},{hasta:2e5,tipo:.23},{hasta:3e5,tipo:.27},{hasta:1/0,tipo:.3}],$t=5550,X={andalucia:{nombre:"Andalucía",irpfTramos:[{hasta:13e3,tipo:.095},{hasta:21100,tipo:.12},{hasta:35200,tipo:.15},{hasta:6e4,tipo:.185},{hasta:1/0,tipo:.225}],itpGeneral:.07,ajd:.012,patrimonioMinExento:7e5,patrimonioTramos:[{hasta:167129,tipo:.002},{hasta:333252,tipo:.003},{hasta:668500,tipo:.005},{hasta:1336999,tipo:.009},{hasta:2673999,tipo:.013},{hasta:5347999,tipo:.017},{hasta:10695996,tipo:.021},{hasta:1/0,tipo:.025}],sucesionesBonificacion:.99},aragon:{nombre:"Aragón",irpfTramos:[{hasta:13972.5,tipo:.095},{hasta:21210,tipo:.12},{hasta:36959.9,tipo:.15},{hasta:52499.9,tipo:.185},{hasta:6e4,tipo:.205},{hasta:7e4,tipo:.23},{hasta:9e4,tipo:.24},{hasta:13e4,tipo:.25},{hasta:1/0,tipo:.255}],itpGeneral:.08,ajd:.015,patrimonioMinExento:7e5,patrimonioTramos:[{hasta:167129,tipo:.002},{hasta:333252,tipo:.003},{hasta:668500,tipo:.005},{hasta:1336999,tipo:.009},{hasta:2673999,tipo:.013},{hasta:5347999,tipo:.017},{hasta:10695996,tipo:.021},{hasta:1/0,tipo:.025}],sucesionesBonificacion:.65},asturias:{nombre:"Asturias",irpfTramos:[{hasta:12450,tipo:.1},{hasta:17707,tipo:.12},{hasta:33007,tipo:.14},{hasta:53407,tipo:.185},{hasta:7e4,tipo:.215},{hasta:9e4,tipo:.225},{hasta:175e3,tipo:.25},{hasta:1/0,tipo:.255}],itpGeneral:.08,ajd:.012,patrimonioMinExento:7e5,patrimonioTramos:[{hasta:167129,tipo:.002},{hasta:333252,tipo:.003},{hasta:668500,tipo:.005},{hasta:1336999,tipo:.009},{hasta:2673999,tipo:.013},{hasta:5347999,tipo:.017},{hasta:10695996,tipo:.021},{hasta:1/0,tipo:.035}],sucesionesBonificacion:0},baleares:{nombre:"Islas Baleares",irpfTramos:[{hasta:1e4,tipo:.09},{hasta:18e3,tipo:.1125},{hasta:3e4,tipo:.1425},{hasta:48e3,tipo:.175},{hasta:7e4,tipo:.19},{hasta:9e4,tipo:.2175},{hasta:12e4,tipo:.2275},{hasta:175e3,tipo:.2375},{hasta:1/0,tipo:.2475}],itpGeneral:.08,ajd:.012,patrimonioMinExento:7e5,patrimonioTramos:[{hasta:167129,tipo:.002},{hasta:333252,tipo:.003},{hasta:668500,tipo:.005},{hasta:1336999,tipo:.009},{hasta:2673999,tipo:.013},{hasta:5347999,tipo:.017},{hasta:10695996,tipo:.021},{hasta:1/0,tipo:.035}],sucesionesBonificacion:0},canarias:{nombre:"Canarias",irpfTramos:[{hasta:12450,tipo:.09},{hasta:17707,tipo:.115},{hasta:33007,tipo:.14},{hasta:53407,tipo:.185},{hasta:9e4,tipo:.235},{hasta:12e4,tipo:.25},{hasta:1/0,tipo:.26}],itpGeneral:.065,ajd:.0075,patrimonioMinExento:7e5,patrimonioTramos:[{hasta:167129,tipo:.002},{hasta:333252,tipo:.003},{hasta:668500,tipo:.005},{hasta:1336999,tipo:.009},{hasta:2673999,tipo:.013},{hasta:5347999,tipo:.017},{hasta:10695996,tipo:.021},{hasta:1/0,tipo:.025}],sucesionesBonificacion:.998},cantabria:{nombre:"Cantabria",irpfTramos:[{hasta:13e3,tipo:.085},{hasta:21e3,tipo:.11},{hasta:35200,tipo:.145},{hasta:6e4,tipo:.18},{hasta:9e4,tipo:.225},{hasta:1/0,tipo:.245}],itpGeneral:.1,ajd:.015,patrimonioMinExento:7e5,patrimonioTramos:[{hasta:167129,tipo:.002},{hasta:333252,tipo:.003},{hasta:668500,tipo:.005},{hasta:1336999,tipo:.009},{hasta:2673999,tipo:.013},{hasta:5347999,tipo:.017},{hasta:10695996,tipo:.021},{hasta:1/0,tipo:.025}],sucesionesBonificacion:0},castilla_mancha:{nombre:"Castilla-La Mancha",irpfTramos:[{hasta:12450,tipo:.095},{hasta:20200,tipo:.12},{hasta:35200,tipo:.15},{hasta:6e4,tipo:.185},{hasta:1/0,tipo:.225}],itpGeneral:.09,ajd:.015,patrimonioMinExento:7e5,patrimonioTramos:[{hasta:167129,tipo:.002},{hasta:333252,tipo:.003},{hasta:668500,tipo:.005},{hasta:1336999,tipo:.009},{hasta:2673999,tipo:.013},{hasta:5347999,tipo:.017},{hasta:10695996,tipo:.021},{hasta:1/0,tipo:.025}],sucesionesBonificacion:0},castilla_leon:{nombre:"Castilla y León",irpfTramos:[{hasta:12450,tipo:.09},{hasta:20200,tipo:.12},{hasta:35200,tipo:.14},{hasta:53407,tipo:.185},{hasta:1/0,tipo:.215}],itpGeneral:.08,ajd:.015,patrimonioMinExento:7e5,patrimonioTramos:[{hasta:167129,tipo:.002},{hasta:333252,tipo:.003},{hasta:668500,tipo:.005},{hasta:1336999,tipo:.009},{hasta:2673999,tipo:.013},{hasta:5347999,tipo:.017},{hasta:10695996,tipo:.021},{hasta:1/0,tipo:.025}],sucesionesBonificacion:.99},cataluna:{nombre:"Cataluña",irpfTramos:[{hasta:12450,tipo:.105},{hasta:17707,tipo:.12},{hasta:21e3,tipo:.14},{hasta:33007,tipo:.15},{hasta:53407,tipo:.188},{hasta:9e4,tipo:.215},{hasta:12e4,tipo:.235},{hasta:175e3,tipo:.245},{hasta:1/0,tipo:.255}],itpGeneral:.1,ajd:.015,patrimonioMinExento:5e5,patrimonioTramos:[{hasta:167129,tipo:.002},{hasta:333252,tipo:.003},{hasta:668500,tipo:.005},{hasta:1336999,tipo:.009},{hasta:2673999,tipo:.013},{hasta:5347999,tipo:.017},{hasta:10695996,tipo:.021},{hasta:1/0,tipo:.025}],sucesionesBonificacion:0},extremadura:{nombre:"Extremadura",irpfTramos:[{hasta:12450,tipo:.08},{hasta:20200,tipo:.1},{hasta:24200,tipo:.16},{hasta:35200,tipo:.175},{hasta:6e4,tipo:.21},{hasta:80200,tipo:.235},{hasta:99200,tipo:.24},{hasta:120200,tipo:.245},{hasta:3e5,tipo:.25},{hasta:1/0,tipo:.25}],itpGeneral:.08,ajd:.015,patrimonioMinExento:7e5,patrimonioTramos:[{hasta:167129,tipo:.003},{hasta:333252,tipo:.005},{hasta:668500,tipo:.008},{hasta:1336999,tipo:.011},{hasta:2673999,tipo:.015},{hasta:5347999,tipo:.02},{hasta:10695996,tipo:.025},{hasta:1/0,tipo:.03}],sucesionesBonificacion:0},galicia:{nombre:"Galicia",irpfTramos:[{hasta:12985,tipo:.09},{hasta:21068,tipo:.1165},{hasta:35200,tipo:.149},{hasta:47600,tipo:.184},{hasta:1/0,tipo:.225}],itpGeneral:.08,itpReducido:.07,ajd:.015,patrimonioMinExento:7e5,patrimonioTramos:[{hasta:167129,tipo:.002},{hasta:333252,tipo:.003},{hasta:668500,tipo:.005},{hasta:1336999,tipo:.009},{hasta:2673999,tipo:.013},{hasta:5347999,tipo:.017},{hasta:10695996,tipo:.021},{hasta:1/0,tipo:.025}],sucesionesBonificacion:0},madrid:{nombre:"Madrid",irpfTramos:[{hasta:13362,tipo:.085},{hasta:18004,tipo:.107},{hasta:35425,tipo:.128},{hasta:57320,tipo:.174},{hasta:1/0,tipo:.205}],itpGeneral:.06,ajd:.007,patrimonioMinExento:7e5,patrimonioTramos:[{hasta:1/0,tipo:0}],sucesionesBonificacion:.99},murcia:{nombre:"Murcia",irpfTramos:[{hasta:12450,tipo:.095},{hasta:20200,tipo:.112},{hasta:34e3,tipo:.133},{hasta:6e4,tipo:.179},{hasta:1/0,tipo:.225}],itpGeneral:.08,ajd:.015,patrimonioMinExento:7e5,patrimonioTramos:[{hasta:167129,tipo:.002},{hasta:333252,tipo:.003},{hasta:668500,tipo:.005},{hasta:1336999,tipo:.009},{hasta:2673999,tipo:.013},{hasta:5347999,tipo:.017},{hasta:10695996,tipo:.021},{hasta:1/0,tipo:.025}],sucesionesBonificacion:.99},navarra:{nombre:"Navarra",irpfTramos:[{hasta:4458,tipo:.13},{hasta:10030,tipo:.22},{hasta:21175,tipo:.25},{hasta:35663,tipo:.28},{hasta:51266,tipo:.365},{hasta:66869,tipo:.415},{hasta:89159,tipo:.44},{hasta:139310,tipo:.47},{hasta:195034,tipo:.49},{hasta:334344,tipo:.505},{hasta:1/0,tipo:.54}],itpGeneral:.06,ajd:.005,patrimonioMinExento:8e5,patrimonioTramos:[{hasta:167129,tipo:.0016},{hasta:333252,tipo:.0024},{hasta:668500,tipo:.004},{hasta:1336999,tipo:.0072},{hasta:2673999,tipo:.0104},{hasta:1/0,tipo:.02}],sucesionesBonificacion:0},pais_vasco:{nombre:"País Vasco",irpfTramos:[{hasta:17720,tipo:.23},{hasta:35440,tipo:.28},{hasta:53160,tipo:.35},{hasta:75910,tipo:.4},{hasta:105130,tipo:.45},{hasta:140130,tipo:.46},{hasta:204270,tipo:.47},{hasta:1/0,tipo:.47}],itpGeneral:.07,ajd:.005,patrimonioMinExento:8e5,patrimonioTramos:[{hasta:2e5,tipo:.002},{hasta:4e5,tipo:.003},{hasta:8e5,tipo:.005},{hasta:16e5,tipo:.009},{hasta:1/0,tipo:.013}],sucesionesBonificacion:0},rioja:{nombre:"La Rioja",irpfTramos:[{hasta:12450,tipo:.08},{hasta:20200,tipo:.106},{hasta:35200,tipo:.136},{hasta:4e4,tipo:.178},{hasta:5e4,tipo:.183},{hasta:6e4,tipo:.19},{hasta:12e4,tipo:.245},{hasta:1/0,tipo:.27}],itpGeneral:.07,ajd:.01,patrimonioMinExento:7e5,patrimonioTramos:[{hasta:1/0,tipo:0}],sucesionesBonificacion:.99},valencia:{nombre:"Comunidad Valenciana",irpfTramos:[{hasta:12e3,tipo:.09},{hasta:22e3,tipo:.12},{hasta:32e3,tipo:.15},{hasta:42e3,tipo:.175},{hasta:52e3,tipo:.2},{hasta:65e3,tipo:.225},{hasta:72e3,tipo:.25},{hasta:1e5,tipo:.265},{hasta:15e4,tipo:.275},{hasta:2e5,tipo:.285},{hasta:1/0,tipo:.295}],itpGeneral:.1,ajd:.015,patrimonioMinExento:5e5,patrimonioTramos:[{hasta:167129,tipo:.0025},{hasta:333252,tipo:.0037},{hasta:668500,tipo:.0068},{hasta:1336999,tipo:.0118},{hasta:2673999,tipo:.0164},{hasta:5347999,tipo:.0217},{hasta:10695996,tipo:.0269},{hasta:1/0,tipo:.035}],sucesionesBonificacion:.5},ceuta:{nombre:"Ceuta",irpfTramos:[{hasta:12450,tipo:.095},{hasta:20200,tipo:.12},{hasta:35200,tipo:.15},{hasta:6e4,tipo:.185},{hasta:3e5,tipo:.225},{hasta:1/0,tipo:.245}],itpGeneral:.06,ajd:.005,patrimonioMinExento:7e5,patrimonioTramos:[{hasta:167129,tipo:.002},{hasta:333252,tipo:.003},{hasta:668500,tipo:.005},{hasta:1336999,tipo:.009},{hasta:2673999,tipo:.013},{hasta:5347999,tipo:.017},{hasta:10695996,tipo:.021},{hasta:1/0,tipo:.025}],sucesionesBonificacion:.5},melilla:{nombre:"Melilla",irpfTramos:[{hasta:12450,tipo:.095},{hasta:20200,tipo:.12},{hasta:35200,tipo:.15},{hasta:6e4,tipo:.185},{hasta:3e5,tipo:.225},{hasta:1/0,tipo:.245}],itpGeneral:.06,ajd:.005,patrimonioMinExento:7e5,patrimonioTramos:[{hasta:167129,tipo:.002},{hasta:333252,tipo:.003},{hasta:668500,tipo:.005},{hasta:1336999,tipo:.009},{hasta:2673999,tipo:.013},{hasta:5347999,tipo:.017},{hasta:10695996,tipo:.021},{hasta:1/0,tipo:.025}],sucesionesBonificacion:.5}},G=Object.entries(X).map(([r,t])=>[r,t.nombre]).sort((r,t)=>r[1].localeCompare(t[1],"es")),dt=["navarra","pais_vasco"];function S(r,t){let a=0,e=r,i=0;for(const o of t){const n=o.hasta===1/0?e:o.hasta-i,s=Math.min(e,n);if(a+=s*o.tipo,e-=s,i=o.hasta===1/0?i:o.hasta,e<=0)break}return a}function N(r,t){for(const a of t)if(r<=a.hasta)return a.tipo;return t[t.length-1].tipo}function O(r,t,a=$t){if(r<=0)return{baseImponible:0,cuotaEstatal:0,cuotaAutonomica:0,cuotaTotal:0,tipoEfectivo:0,tipoMarginal:0,tramosDetalle:[]};const e=X[t],i=dt.includes(t),o=e.irpfTramos,n=Math.max(0,r-a);let s,c,l,u;if(i)s=0,c=S(n,o),l=0,u=N(n,o);else{s=S(n,Q),c=S(n,o);const h=S(a,Q);S(a,o),s=Math.max(0,s-h),s=S(n,Q),c=S(n,o),l=N(n,Q),u=N(n,o)}const d=s+c,p=r>0?d/r:0,m=da(n,i?[]:Q,o,i);return{baseImponible:r,cuotaEstatal:s,cuotaAutonomica:c,cuotaTotal:d,tipoEfectivo:p,tipoMarginal:i?u:l+u,tramosDetalle:m}}function yt(r){if(r<=0)return{cuota:0,tipoEfectivo:0,tipoMarginal:0};const t=S(r,gt);return{cuota:t,tipoEfectivo:t/r,tipoMarginal:N(r,gt)}}function da(r,t,a,e){if(e){const s=[];let c=0,l=r;for(const u of a){if(l<=0)break;const d=u.hasta===1/0?l:u.hasta-c,p=Math.min(l,d);s.push({desde:c,hasta:c+p,tipoEstatal:0,tipoAutonomico:u.tipo,tipoTotal:u.tipo,cuota:p*u.tipo}),l-=p,c=u.hasta===1/0?c+p:u.hasta}return s}const i=new Set;i.add(0);for(const s of t)s.hasta!==1/0&&s.hasta<=r&&i.add(s.hasta);for(const s of a)s.hasta!==1/0&&s.hasta<=r&&i.add(s.hasta);i.add(r);const o=[...i].sort((s,c)=>s-c),n=[];for(let s=0;s<o.length-1;s++){const c=o[s],l=o[s+1],u=(c+l)/2,d=N(u,t),p=N(u,a);n.push({desde:c,hasta:l,tipoEstatal:d,tipoAutonomico:p,tipoTotal:d+p,cuota:(l-c)*(d+p)})}return n}const ut=[{rendimientoMin:0,rendimientoMax:670,cuotaMinima:200,baseCotizacion:653.59},{rendimientoMin:670,rendimientoMax:900,cuotaMinima:220,baseCotizacion:718.95},{rendimientoMin:900,rendimientoMax:1166.7,cuotaMinima:260,baseCotizacion:849.67},{rendimientoMin:1166.7,rendimientoMax:1300,cuotaMinima:291,baseCotizacion:950.98},{rendimientoMin:1300,rendimientoMax:1500,cuotaMinima:294,baseCotizacion:960.78},{rendimientoMin:1500,rendimientoMax:1700,cuotaMinima:294,baseCotizacion:960.78},{rendimientoMin:1700,rendimientoMax:1850,cuotaMinima:350,baseCotizacion:1143.79},{rendimientoMin:1850,rendimientoMax:2030,cuotaMinima:370,baseCotizacion:1209.15},{rendimientoMin:2030,rendimientoMax:2330,cuotaMinima:390,baseCotizacion:1274.51},{rendimientoMin:2330,rendimientoMax:2760,cuotaMinima:415,baseCotizacion:1356.21},{rendimientoMin:2760,rendimientoMax:3190,cuotaMinima:440,baseCotizacion:1437.91},{rendimientoMin:3190,rendimientoMax:3620,cuotaMinima:465,baseCotizacion:1519.61},{rendimientoMin:3620,rendimientoMax:4050,cuotaMinima:491,baseCotizacion:1601.31},{rendimientoMin:4050,rendimientoMax:6e3,cuotaMinima:531,baseCotizacion:1732.03},{rendimientoMin:6e3,rendimientoMax:1/0,cuotaMinima:591,baseCotizacion:1928.1}],ua=314,pa=.25;function xt(r){const t=r/12;let a=ut[0];for(const e of ut){if(t>=e.rendimientoMin&&t<e.rendimientoMax){a=e;break}a=e}return{rendimientoNetoMensual:t,cuotaMensual:a.cuotaMinima,cuotaAnual:a.cuotaMinima*12,baseCotizacion:a.baseCotizacion,tramo:`${a.rendimientoMin}€ - ${a.rendimientoMax===1/0?"∞":a.rendimientoMax+"€"}`}}function ma(r,t,a,e=24e3){const i=r-t,o=xt(i),n=i-o.cuotaAnual,s=O(Math.max(0,n),a),c=i-o.cuotaAnual-s.cuotaTotal,l=ua*12,u=t+e+l,d=Math.max(0,r-u),p=d*pa,m=d-p,h=m,v=yt(h),f=O(Math.max(0,e-l),a),b=e-l-f.cuotaTotal+h-v.cuota,g=b-c;return{autonomo:{ingresosBrutos:r,gastos:t,rendimientoNeto:i,cuotaRETAAnual:o.cuotaAnual,baseIRPF:Math.max(0,n),irpf:s.cuotaTotal,netoFinal:c,tipoEfectivo:r>0?(r-t-c)/(r-t):0},sl:{ingresosBrutos:r,gastos:t,salarioAdmin:e,baseIS:d,impuestoSociedades:p,beneficioNeto:m,dividendos:h,impuestoDividendos:v.cuota,cuotaSSAdmin:l,irpfSalario:f.cuotaTotal,netoFinal:b,tipoEfectivo:r>0?(r-t-b)/(r-t):0},diferencia:g,recomendacion:b>c?"sl":"autonomo"}}const wt=4909.5,Et=3267.6,ha=835.8;function Mt(r){if(r<15)return{porcentaje:0,mesesAdicionales:0};const t=Math.round(r*12)-180;if(t<=0)return{porcentaje:.5,mesesAdicionales:0};let a=.5;const e=Math.min(t,49);if(a+=e*.0021,t>49){const i=Math.min(t-49,209);a+=i*.0019}return{porcentaje:Math.min(1,a),mesesAdicionales:t}}function va(r,t,a){if(r>=t)return 1+(r-t)*.04;const e=(t-r)*12,i=Math.ceil(e/3),o=a>=38.5?.01625:.01875;return Math.max(.5,1-i*o)}function Ct(r){return r>=38.25?65:67}function fa(r,t,a,e){const i=Math.min(r,wt),o=i*300/350,n=i*324/350,s=o>=n?"A":"B",c=Math.max(o,n),{porcentaje:l}=Mt(t),u=Ct(t),d=va(a,u,t);let p=c*l*d;p=Math.min(p,Et),p=Math.max(p,t>=15?ha:0);const m=p*14;return{baseReguladora:c,baseReguladoraFormulaA:o,baseReguladoraFormulaB:n,porcentajePorAnios:l,pensionMensual:p,pensionAnual:m,tasaSustitucion:e?p/e:0,formulaAplicada:s,coeficienteEdad:d,detalleAnios:{aniosCotizados:t,mesesAdicionales:Mt(t).mesesAdicionales,porcentajeBase:l}}}const pt={1:.15,2:.14,3:.14,4:.14,5:.18,6:.19,7:.2,8:.19,9:.15,10:.12,11:.1,12:.09,13:.09,14:.09,15:.09,16:.1,17:.13,18:.17,19:.23,20:.4},ba=.3;function ga(r,t,a,e,i,o){const n=Math.max(1,Math.min(20,Math.floor(t))),s=Math.min(a,ba),c=pt[n]||pt[20],l=r*c,u=l*s,d=i-e,p=o||r*2,m=r/p,h=d>0?d*m:0,v=h*s,f=d<=0;let b,g;return f?(b="real",g=0):v<=u?(b="real",g=v):(b="objetivo",g=u),{metodoObjetivo:{baseImponible:l,cuota:u,tipoAplicado:s},metodoReal:{gananciaReal:d,proporcionSuelo:m,baseImponible:h,cuota:v,tipoAplicado:s},metodoElegido:b,cuotaFinal:g,sinPlusvalia:f}}const $a=.1,ya=.04;function At(r){if(r<=0)return 0;let t=0;return r<=6010.12?t=90:r<=30050.61?t=90+(r-6010.12)*.0045:r<=60101.21?t=90+108.18+(r-30050.61)*.0015:r<=150253.03?t=90+108.18+45.08+(r-60101.21)*.001:r<=601012.1?t=90+108.18+45.08+90.15+(r-150253.03)*5e-4:t=90+108.18+45.08+90.15+225.38+(r-601012.1)*25e-5,Math.max(600,Math.round(t*100)/100)}function xa(r){if(r<=0)return 0;let t=0;return r<=6010.12?t=24.04:r<=30050.61?t=24.04+(r-6010.12)*.00175:r<=60101.21?t=24.04+42.07+(r-30050.61)*.00125:r<=150253.03?t=24.04+42.07+37.56+(r-60101.21)*75e-5:r<=601012.1?t=24.04+42.07+37.56+67.61+(r-150253.03)*3e-4:t=24.04+42.07+37.56+67.61+135.23,Math.max(300,Math.round(t*100)/100)}function wa(r,t,a=!1,e=0,i=!1){const o=X[t];let n,s,c,l,u;a?(s=i?ya:$a,n=r*s,c="IVA",u=o.ajd,l=r*u):(s=o.itpGeneral,n=r*s,c="ITP",u=0,l=0);const d=At(r),p=xa(r),m=400,h=e>0?350:0,v=e>0?At(e)*.5:0,f=v,b=n+l,g=d+p+m+h+f,y=b+g;return{precioVivienda:r,esNueva:a,ccaa:t,impuestoTransmision:n,tipoTransmision:s,nombreImpuesto:c,ajd:l,tipoAJD:u,notaria:d,registro:p,gestoria:m,tasacion:h,gastoHipoteca:f,notariaHipoteca:v,totalImpuestos:b,totalGastos:g,totalCoste:y,porcentajeSobrePrecio:r>0?y/r:0}}class Rt extends F{getTitle(){return"Calculadora de Hipoteca"}getTemplate(){return`
      <div class="nc-grid">
        <div class="nc-field">
          <label for="principal">Importe del préstamo (€)</label>
          <input id="principal" type="number" value="200000" min="0" step="1000">
        </div>
        <div class="nc-field">
          <label for="rate">Tipo de interés anual (%)</label>
          <input id="rate" type="number" value="3" min="0" max="30" step="0.1">
        </div>
        <div class="nc-field">
          <label for="years">Plazo (años)</label>
          <input id="years" type="number" value="25" min="1" max="50" step="1">
        </div>
      </div>
      <div class="nc-results">
        <div class="nc-result-row">
          <span class="nc-result-label">Cuota mensual</span>
          <span class="nc-result-value nc-highlight" id="monthly"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Total a pagar</span>
          <span class="nc-result-value" id="total"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Total intereses</span>
          <span class="nc-result-value" id="interest"></span>
        </div>
      </div>
      <div class="nc-chart" id="chart"></div>
      <div class="nc-table-scroll" id="tableContainer" style="margin-top:1rem"></div>
    `}calculate(){const t=this.getInput("principal"),a=this.getInput("rate"),e=this.getInput("years");if(t<=0||e<=0)return;const i=aa({principal:t,annualRate:a,years:e});this.setText("monthly",this.formatCurrency(i.monthlyPayment)),this.setText("total",this.formatCurrency(i.totalPayment)),this.setText("interest",this.formatCurrency(i.totalInterest));const o=Math.max(1,Math.floor(i.amortization.length/60)),n=i.amortization.filter(($,x)=>x%o===0||x===i.amortization.length-1),s=400,c=150,l=n.length;if(l<2)return;const u=s/(l-1),d=i.monthlyPayment,p=n.map(($,x)=>({x:x*u,y:c-10-$.interest/d*(c-20)})),m=n.map(($,x)=>({x:x*u,y:c-10-($.interest+$.principal)/d*(c-20)})),h=p.map(($,x)=>`${x===0?"M":"L"} ${$.x} ${$.y}`).join(" ")+` L ${p[l-1].x} ${c-10} L 0 ${c-10} Z`,v=m.map(($,x)=>`${x===0?"M":"L"} ${$.x} ${$.y}`).join(" ")+` L ${m[l-1].x} ${c-10} L 0 ${c-10} Z`;this.setHtml("chart",`
      <svg viewBox="0 0 ${s} ${c+25}" style="width:100%;height:${c+25}px">
        <path d="${v}" fill="var(--nc-primary)" opacity="0.2"/>
        <path d="${h}" fill="var(--nc-accent)" opacity="0.3"/>
        <text x="10" y="${c+20}" font-size="11" fill="var(--nc-muted)">
          <tspan fill="var(--nc-primary)">■</tspan> Capital
          <tspan dx="10" fill="var(--nc-accent)">■</tspan> Intereses
        </text>
      </svg>
    `);const f=[];let b=0,g=0;for(const $ of i.amortization)b+=$.interest,g+=$.principal,$.month%12===0&&(f.push({year:$.month/12,interest:b,principal:g,balance:$.balance}),b=0,g=0);const y=`
      <table class="nc-table">
        <thead><tr>
          <th>Año</th><th>Capital</th><th>Intereses</th><th>Saldo</th>
        </tr></thead>
        <tbody>
          ${f.map($=>`<tr>
            <td>${$.year}</td>
            <td>${this.formatCurrency($.principal)}</td>
            <td>${this.formatCurrency($.interest)}</td>
            <td>${this.formatCurrency($.balance)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    `;this.setHtml("tableContainer",y)}}customElements.define("calc-hipoteca",Rt);class Tt extends F{getTitle(){return"Calculadora de Interés Compuesto"}getTemplate(){return`
      <div class="nc-grid">
        <div class="nc-field">
          <label for="principal">Capital inicial (€)</label>
          <input id="principal" type="number" value="10000" min="0" step="1000">
        </div>
        <div class="nc-field">
          <label for="rate">Rentabilidad anual (%)</label>
          <input id="rate" type="number" value="7" min="0" max="50" step="0.1">
        </div>
        <div class="nc-field">
          <label for="years">Años</label>
          <input id="years" type="number" value="20" min="1" max="100" step="1">
        </div>
        <div class="nc-field">
          <label for="monthly">Aportación mensual (€)</label>
          <input id="monthly" type="number" value="200" min="0" step="50">
        </div>
      </div>
      <div class="nc-results">
        <div class="nc-result-row">
          <span class="nc-result-label">Balance final</span>
          <span class="nc-result-value nc-highlight" id="finalBalance"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Total aportado</span>
          <span class="nc-result-value" id="totalContrib"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Intereses ganados</span>
          <span class="nc-result-value nc-accent" id="totalInterest"></span>
        </div>
      </div>
      <div class="nc-chart" id="chart"></div>
    `}calculate(){const t=this.getInput("principal"),a=this.getInput("rate"),e=this.getInput("years"),i=this.getInput("monthly");if(e<=0)return;const o=ea({principal:t,annualRate:a,years:e,monthlyContribution:i});this.setText("finalBalance",this.formatCurrency(o.finalBalance)),this.setText("totalContrib",this.formatCurrency(o.totalContributions)),this.setText("totalInterest",this.formatCurrency(o.totalInterest));const n=400,s=160,c=o.yearByYear.length;if(c<2)return;const l=o.finalBalance,u=n/(c-1),d=o.yearByYear.map((b,g)=>({x:g*u,y:s-10-b.totalContributions/l*(s-20)})),p=o.yearByYear.map((b,g)=>({x:g*u,y:s-10-b.balance/l*(s-20)})),m=p.map((b,g)=>`${g===0?"M":"L"} ${b.x} ${b.y}`).join(" "),h=d.map((b,g)=>`${g===0?"M":"L"} ${b.x} ${b.y}`).join(" "),v=`${m} L ${p[c-1].x} ${s-10} L 0 ${s-10} Z`,f=`${h} L ${d[c-1].x} ${s-10} L 0 ${s-10} Z`;this.setHtml("chart",`
      <svg viewBox="0 0 ${n} ${s+25}" style="width:100%;height:${s+25}px">
        <path d="${v}" fill="var(--nc-primary)" opacity="0.15"/>
        <path d="${m}" fill="none" stroke="var(--nc-primary)" stroke-width="2"/>
        <path d="${f}" fill="var(--nc-accent)" opacity="0.2"/>
        <path d="${h}" fill="none" stroke="var(--nc-accent)" stroke-width="2"/>
        <text x="10" y="${s+20}" font-size="11" fill="var(--nc-muted)">
          <tspan fill="var(--nc-primary)">■</tspan> Balance total
          <tspan dx="10" fill="var(--nc-accent)">■</tspan> Aportaciones
        </text>
      </svg>
    `)}}customElements.define("calc-interes-compuesto",Tt);class It extends F{getTitle(){return"Comparador de Préstamos"}getTemplate(){return`
      <div style="display:flex;flex-direction:column;gap:1rem">
        <div style="display:flex;align-items:center;gap:0.5rem">
          <span class="nc-badge nc-badge-primary">Préstamo A</span>
        </div>
        <div class="nc-grid">
          <div class="nc-field">
            <label for="a-principal">Importe A (€)</label>
            <input id="a-principal" type="number" value="200000" min="0" step="1000">
          </div>
          <div class="nc-field">
            <label for="a-rate">Interés A (%)</label>
            <input id="a-rate" type="number" value="2.5" min="0" step="0.1">
          </div>
          <div class="nc-field">
            <label for="a-years">Plazo A (años)</label>
            <input id="a-years" type="number" value="25" min="1" step="1">
          </div>
        </div>
        <div class="nc-separator"></div>
        <div style="display:flex;align-items:center;gap:0.5rem">
          <span class="nc-badge nc-badge-accent">Préstamo B</span>
        </div>
        <div class="nc-grid">
          <div class="nc-field">
            <label for="b-principal">Importe B (€)</label>
            <input id="b-principal" type="number" value="200000" min="0" step="1000">
          </div>
          <div class="nc-field">
            <label for="b-rate">Interés B (%)</label>
            <input id="b-rate" type="number" value="3" min="0" step="0.1">
          </div>
          <div class="nc-field">
            <label for="b-years">Plazo B (años)</label>
            <input id="b-years" type="number" value="30" min="1" step="1">
          </div>
        </div>
      </div>
      <div class="nc-results" id="results"></div>
      <div class="nc-chart" id="chart"></div>
    `}calculate(){const t=[{name:"Préstamo A",principal:this.getInput("a-principal"),annualRate:this.getInput("a-rate"),years:this.getInput("a-years")},{name:"Préstamo B",principal:this.getInput("b-principal"),annualRate:this.getInput("b-rate"),years:this.getInput("b-years")}];if(t.some(s=>s.principal<=0||s.years<=0))return;const a=sa(t),e=["var(--nc-primary)","var(--nc-accent)"],i=a.loans.map((s,c)=>{const l=c===a.cheapestIndex;return`
          <div style="margin-bottom:${c<a.loans.length-1?"0.75rem":"0"};
                      padding:0.75rem;border-radius:var(--nc-radius);
                      ${l?"border:2px solid var(--nc-accent);":"border:1px solid var(--nc-border);"}">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
              <strong style="color:${e[c]}">${s.name}</strong>
              ${l?'<span class="nc-badge nc-badge-accent">Más barato</span>':""}
            </div>
            <div class="nc-result-row">
              <span class="nc-result-label">Cuota mensual</span>
              <span class="nc-result-value">${this.formatCurrency(s.monthlyPayment)}</span>
            </div>
            <div class="nc-result-row">
              <span class="nc-result-label">Total a pagar</span>
              <span class="nc-result-value">${this.formatCurrency(s.totalPayment)}</span>
            </div>
            <div class="nc-result-row">
              <span class="nc-result-label">Total intereses</span>
              <span class="nc-result-value">${this.formatCurrency(s.totalInterest)}</span>
            </div>
          </div>
        `}).join(""),o=Math.abs(a.loans[0].totalPayment-a.loans[1].totalPayment);this.setHtml("results",i+`
      <div style="text-align:center;margin-top:0.75rem;font-size:0.9rem;color:var(--nc-muted)">
        Diferencia total: <strong style="color:var(--nc-accent)">${this.formatCurrency(o)}</strong>
      </div>
    `);const n=a.loans.map((s,c)=>({label:s.name,value:s.totalPayment,color:e[c]}));this.setHtml("chart",this.createBarChart(n,120))}}customElements.define("calc-comparador-prestamos",It);class Pt extends F{getTitle(){return"Calculadora de ROI"}getTemplate(){return`
      <div class="nc-grid">
        <div class="nc-field">
          <label for="initial">Inversión inicial (€)</label>
          <input id="initial" type="number" value="10000" min="0" step="1000">
        </div>
        <div class="nc-field">
          <label for="final">Valor final (€)</label>
          <input id="final" type="number" value="15000" min="0" step="1000">
        </div>
        <div class="nc-field">
          <label for="years">Período (años)</label>
          <input id="years" type="number" value="3" min="0.1" step="0.5">
        </div>
      </div>
      <div class="nc-results">
        <div class="nc-result-row">
          <span class="nc-result-label">ROI Total</span>
          <span class="nc-result-value nc-highlight" id="totalRoi"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">ROI Anualizado (CAGR)</span>
          <span class="nc-result-value nc-accent" id="annualRoi"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Beneficio neto</span>
          <span class="nc-result-value" id="profit"></span>
        </div>
      </div>
      <div class="nc-chart" id="chart"></div>
    `}calculate(){const t=this.getInput("initial"),a=this.getInput("final"),e=this.getInput("years");if(t<=0||e<=0)return;const i=oa({initialInvestment:t,finalValue:a,years:e});this.setText("totalRoi",this.formatPercent(i.totalRoi)),this.setText("annualRoi",this.formatPercent(i.annualizedRoi)),this.setText("profit",this.formatCurrency(i.netProfit));const o=[];for(let n=0;n<=Math.ceil(e);n++)o.push(t*Math.pow(1+i.annualizedRoi/100,n));this.setHtml("chart",this.createLineChart(o,400,130,"var(--nc-primary)",.15))}}customElements.define("calc-roi",Pt);class Lt extends F{getTitle(){return"Calculadora de Inflación"}getTemplate(){return`
      <div class="nc-grid">
        <div class="nc-field">
          <label for="amount">Cantidad original (€)</label>
          <input id="amount" type="number" value="100" min="0" step="10">
        </div>
        <div class="nc-field">
          <label for="inflation">Inflación anual (%)</label>
          <input id="inflation" type="number" value="3" min="0" max="50" step="0.1">
        </div>
        <div class="nc-field">
          <label for="years">Años</label>
          <input id="years" type="number" value="10" min="1" max="100" step="1">
        </div>
      </div>
      <div class="nc-results">
        <div class="nc-result-row">
          <span class="nc-result-label" id="explanation"></span>
          <span class="nc-result-value nc-highlight" id="adjusted"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Poder adquisitivo perdido</span>
          <span class="nc-result-value" style="color:var(--nc-error)" id="lost"></span>
        </div>
      </div>
      <div class="nc-chart" id="chart"></div>
    `}calculate(){const t=this.getInput("amount"),a=this.getInput("inflation"),e=this.getInput("years");if(t<=0||e<=0)return;const i=ia({amount:t,annualInflation:a,years:e});this.setText("explanation",`${this.formatCurrency(t)} de hace ${e} años equivalen hoy a`),this.setText("adjusted",this.formatCurrency(i.adjustedAmount)),this.setText("lost",this.formatPercent(i.purchasingPowerLost));const o=[t,...i.yearByYear.map(n=>n.value)];this.setHtml("chart",this.createLineChart(o,400,130,"#dc2626",.1))}}customElements.define("calc-inflacion",Lt);class Ft extends F{getTitle(){return"Calculadora de Deuda: Snowball vs Avalanche"}getTemplate(){return`
      <div style="margin-bottom:1rem">
        <div class="nc-grid" id="debts-grid">
          <div class="nc-field">
            <label for="d1-name">Deuda 1</label>
            <input id="d1-name" type="text" value="Tarjeta A" placeholder="Nombre">
          </div>
          <div class="nc-field">
            <label for="d1-balance">Saldo (€)</label>
            <input id="d1-balance" type="number" value="5000" min="0" step="100">
          </div>
          <div class="nc-field">
            <label for="d1-rate">Interés (%)</label>
            <input id="d1-rate" type="number" value="20" min="0" step="0.5">
          </div>
          <div class="nc-field">
            <label for="d1-min">Pago mínimo (€)</label>
            <input id="d1-min" type="number" value="100" min="0" step="10">
          </div>

          <div class="nc-field">
            <label for="d2-name">Deuda 2</label>
            <input id="d2-name" type="text" value="Tarjeta B" placeholder="Nombre">
          </div>
          <div class="nc-field">
            <label for="d2-balance">Saldo (€)</label>
            <input id="d2-balance" type="number" value="3000" min="0" step="100">
          </div>
          <div class="nc-field">
            <label for="d2-rate">Interés (%)</label>
            <input id="d2-rate" type="number" value="15" min="0" step="0.5">
          </div>
          <div class="nc-field">
            <label for="d2-min">Pago mínimo (€)</label>
            <input id="d2-min" type="number" value="75" min="0" step="10">
          </div>

          <div class="nc-field">
            <label for="d3-name">Deuda 3</label>
            <input id="d3-name" type="text" value="Préstamo" placeholder="Nombre">
          </div>
          <div class="nc-field">
            <label for="d3-balance">Saldo (€)</label>
            <input id="d3-balance" type="number" value="10000" min="0" step="100">
          </div>
          <div class="nc-field">
            <label for="d3-rate">Interés (%)</label>
            <input id="d3-rate" type="number" value="8" min="0" step="0.5">
          </div>
          <div class="nc-field">
            <label for="d3-min">Pago mínimo (€)</label>
            <input id="d3-min" type="number" value="200" min="0" step="10">
          </div>
        </div>
        <div class="nc-separator"></div>
        <div class="nc-field" style="max-width:250px">
          <label for="budget">Presupuesto mensual total (€)</label>
          <input id="budget" type="number" value="600" min="0" step="50">
        </div>
      </div>
      <div class="nc-results" id="results"></div>
      <div class="nc-chart" id="chart"></div>
    `}calculate(){const t=[];for(let f=1;f<=3;f++){const b=this.getInput(`d${f}-balance`);b>0&&t.push({name:this.getInputString(`d${f}-name`)||`Deuda ${f}`,balance:b,annualRate:this.getInput(`d${f}-rate`),minimumPayment:this.getInput(`d${f}-min`)})}const a=this.getInput("budget");if(t.length===0||a<=0)return;const e=na(t,a),i=e.snowball,o=e.avalanche;this.setHtml("results",`
      <div class="nc-columns">
        <div style="padding:0.75rem;border-radius:var(--nc-radius);border:1px solid var(--nc-border);
                    ${e.recommended==="snowball"?"border-color:var(--nc-accent);border-width:2px":""}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
            <strong style="color:var(--nc-primary)">❄️ Snowball</strong>
            ${e.recommended==="snowball"?'<span class="nc-badge nc-badge-accent">Recomendado</span>':""}
          </div>
          <div class="nc-result-row">
            <span class="nc-result-label">Meses</span>
            <span class="nc-result-value">${i.totalMonths}</span>
          </div>
          <div class="nc-result-row">
            <span class="nc-result-label">Total pagado</span>
            <span class="nc-result-value">${this.formatCurrency(i.totalPaid)}</span>
          </div>
          <div class="nc-result-row">
            <span class="nc-result-label">Intereses</span>
            <span class="nc-result-value">${this.formatCurrency(i.totalInterest)}</span>
          </div>
        </div>
        <div style="padding:0.75rem;border-radius:var(--nc-radius);border:1px solid var(--nc-border);
                    ${e.recommended==="avalanche"?"border-color:var(--nc-accent);border-width:2px":""}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
            <strong style="color:var(--nc-accent)">🏔️ Avalanche</strong>
            ${e.recommended==="avalanche"?'<span class="nc-badge nc-badge-accent">Recomendado</span>':""}
          </div>
          <div class="nc-result-row">
            <span class="nc-result-label">Meses</span>
            <span class="nc-result-value">${o.totalMonths}</span>
          </div>
          <div class="nc-result-row">
            <span class="nc-result-label">Total pagado</span>
            <span class="nc-result-value">${this.formatCurrency(o.totalPaid)}</span>
          </div>
          <div class="nc-result-row">
            <span class="nc-result-label">Intereses</span>
            <span class="nc-result-value">${this.formatCurrency(o.totalInterest)}</span>
          </div>
        </div>
      </div>
      ${e.savings>0?`
        <div style="text-align:center;margin-top:0.75rem;font-size:0.9rem;color:var(--nc-muted)">
          Ahorras <strong style="color:var(--nc-accent)">${this.formatCurrency(e.savings)}</strong>
          con ${e.recommended==="avalanche"?"Avalanche":"Snowball"}
        </div>
      `:""}
    `);const n=Math.max(i.totalMonths,o.totalMonths),s=Math.max(1,Math.floor(n/50)),c=i.timeline.filter((f,b)=>b%s===0).map(f=>f.totalBalance),l=o.timeline.filter((f,b)=>b%s===0).map(f=>f.totalBalance),u=Math.max(c.length,l.length);for(;c.length<u;)c.push(0);for(;l.length<u;)l.push(0);const d=Math.max(...c,...l,1),p=400,m=130,h=p/(u-1||1),v=f=>f.map((b,g)=>`${g===0?"M":"L"} ${g*h} ${m-10-b/d*(m-20)}`).join(" ");this.setHtml("chart",`
      <svg viewBox="0 0 ${p} ${m+25}" style="width:100%;height:${m+25}px">
        <path d="${v(c)}" fill="none" stroke="var(--nc-primary)" stroke-width="2"/>
        <path d="${v(l)}" fill="none" stroke="var(--nc-accent)" stroke-width="2"/>
        <text x="10" y="${m+20}" font-size="11" fill="var(--nc-muted)">
          <tspan fill="var(--nc-primary)">■</tspan> Snowball
          <tspan dx="10" fill="var(--nc-accent)">■</tspan> Avalanche
        </text>
      </svg>
    `)}}customElements.define("calc-deuda",Ft);class St extends F{getTitle(){return"Calculadora de Presupuesto 50/30/20"}getTemplate(){return`
      <div class="nc-grid">
        <div class="nc-field">
          <label for="income">Ingresos mensuales netos (€)</label>
          <input id="income" type="number" value="2500" min="0" step="100">
        </div>
      </div>
      <div class="nc-results">
        <div class="nc-result-row">
          <span class="nc-result-label">🏠 Necesidades (50%)</span>
          <span class="nc-result-value" id="needs"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">🎯 Deseos (30%)</span>
          <span class="nc-result-value" id="wants"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">💰 Ahorro (20%)</span>
          <span class="nc-result-value nc-accent" id="savings"></span>
        </div>
        <div class="nc-separator"></div>
        <div class="nc-result-row">
          <span class="nc-result-label">Ahorro anual</span>
          <span class="nc-result-value nc-highlight" id="yearlySavings"></span>
        </div>
      </div>
      <div class="nc-chart" id="chart" style="display:flex;justify-content:center"></div>
    `}calculate(){const t=this.getInput("income");if(t<=0)return;const a=ra({monthlyIncome:t});this.setText("needs",this.formatCurrency(a.needs)),this.setText("wants",this.formatCurrency(a.wants)),this.setText("savings",this.formatCurrency(a.savings)),this.setText("yearlySavings",this.formatCurrency(a.yearly.savings)),this.setHtml("chart",this.createDonutChart([{label:"Necesidades",value:a.needs,color:"var(--nc-primary)"},{label:"Deseos",value:a.wants,color:"#f59e0b"},{label:"Ahorro",value:a.savings,color:"var(--nc-accent)"}]))}}customElements.define("calc-presupuesto",St);class jt extends F{getTitle(){return"Calculadora de Fondo de Emergencia"}getTemplate(){return`
      <div class="nc-grid">
        <div class="nc-field">
          <label for="expenses">Gastos mensuales esenciales (€)</label>
          <input id="expenses" type="number" value="1500" min="0" step="100">
        </div>
        <div class="nc-field">
          <label for="months">Meses de colchón</label>
          <input id="months" type="number" value="6" min="1" max="24" step="1">
        </div>
        <div class="nc-field">
          <label for="current">Ahorros actuales (€)</label>
          <input id="current" type="number" value="2000" min="0" step="100">
        </div>
        <div class="nc-field">
          <label for="capacity">Capacidad de ahorro mensual (€)</label>
          <input id="capacity" type="number" value="300" min="0" step="50">
        </div>
      </div>
      <div class="nc-results">
        <div class="nc-result-row">
          <span class="nc-result-label">Objetivo del fondo</span>
          <span class="nc-result-value nc-highlight" id="goal"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Te falta</span>
          <span class="nc-result-value" id="remaining"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Progreso</span>
          <span class="nc-result-value nc-accent" id="percent"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Meses hasta completar</span>
          <span class="nc-result-value" id="monthsToGoal"></span>
        </div>
      </div>
      <div id="progressBar" style="margin-top:1rem"></div>
    `}calculate(){const t=this.getInput("expenses"),a=this.getInput("months"),e=this.getInput("current"),i=this.getInput("capacity");if(t<=0||a<=0)return;const o=la({monthlyExpenses:t,targetMonths:a,currentSavings:e,monthlySavingsCapacity:i});this.setText("goal",this.formatCurrency(o.goal)),this.setText("remaining",this.formatCurrency(o.remaining)),this.setText("percent",this.formatPercent(o.percentComplete)),this.setText("monthsToGoal",o.monthsToGoal===null?"—":o.monthsToGoal===0?"¡Completado!":`${o.monthsToGoal} meses`);const n=Math.min(100,o.percentComplete);this.setHtml("progressBar",`
      <div style="background:var(--nc-border);border-radius:999px;height:24px;overflow:hidden;position:relative">
        <div style="background:var(--nc-accent);height:100%;width:${n}%;border-radius:999px;
                    transition:width 0.3s ease;min-width:${n>0?"2rem":"0"}"></div>
        <span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
                     font-size:0.75rem;font-weight:700;color:${n>50?"#fff":"var(--nc-text)"}">
          ${this.formatPercent(o.percentComplete)}
        </span>
      </div>
    `)}}customElements.define("calc-fondo-emergencia",jt);class zt extends F{getTitle(){return"Calculadora de Meta de Ahorro"}getTemplate(){return`
      <div class="nc-grid">
        <div class="nc-field">
          <label for="goal">Meta de ahorro (€)</label>
          <input id="goal" type="number" value="15000" min="0" step="1000">
        </div>
        <div class="nc-field">
          <label for="months">Plazo (meses)</label>
          <input id="months" type="number" value="24" min="1" max="600" step="1">
        </div>
        <div class="nc-field">
          <label for="current">Ahorro actual (€)</label>
          <input id="current" type="number" value="2000" min="0" step="500">
        </div>
        <div class="nc-field">
          <label for="return">Rentabilidad anual (%)</label>
          <input id="return" type="number" value="3" min="0" max="30" step="0.5">
        </div>
      </div>
      <div class="nc-results">
        <div class="nc-result-row">
          <span class="nc-result-label">Aportación mensual necesaria</span>
          <span class="nc-result-value nc-highlight" id="monthly"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Total aportado</span>
          <span class="nc-result-value" id="totalContrib"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Intereses ganados</span>
          <span class="nc-result-value nc-accent" id="totalInterest"></span>
        </div>
      </div>
      <div class="nc-chart" id="chart"></div>
      <div id="progressBar" style="margin-top:0.75rem"></div>
    `}calculate(){const t=this.getInput("goal"),a=this.getInput("months"),e=this.getInput("current"),i=this.getInput("return");if(t<=0||a<=0)return;const o=ca({goal:t,months:a,currentSavings:e,annualReturn:i});this.setText("monthly",this.formatCurrency(o.monthlyContribution)),this.setText("totalContrib",this.formatCurrency(o.totalContributed+e)),this.setText("totalInterest",this.formatCurrency(o.totalInterest));const n=o.timeline.map(c=>c.balance);if(n.length>1){const u=Math.max(...n,t),d=400/(n.length-1),p=n.map((h,v)=>`${v===0?"M":"L"} ${v*d} ${120-h/u*110}`).join(" "),m=120-t/u*110;this.setHtml("chart",`
        <svg viewBox="0 0 400 155" style="width:100%;height:155px">
          <line x1="0" y1="${m}" x2="400" y2="${m}"
                stroke="var(--nc-accent)" stroke-width="1" stroke-dasharray="5,5"/>
          <text x="395" y="${m-5}" text-anchor="end" font-size="10"
                fill="var(--nc-accent)">Meta</text>
          <path d="${p} L ${(n.length-1)*d} 120 L 0 120 Z"
                fill="var(--nc-primary)" opacity="0.12"/>
          <path d="${p}" fill="none" stroke="var(--nc-primary)" stroke-width="2"/>
        </svg>
      `)}const s=n.length>0?Math.min(100,n[n.length-1]/t*100):0;this.setHtml("progressBar",`
      <div style="background:var(--nc-border);border-radius:999px;height:20px;overflow:hidden;position:relative">
        <div style="background:var(--nc-primary);height:100%;width:${s}%;border-radius:999px;
                    transition:width 0.3s ease"></div>
        <span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
                     font-size:0.7rem;font-weight:700;color:${s>50?"#fff":"var(--nc-text)"}">
          ${this.formatPercent(s)}
        </span>
      </div>
    `)}}customElements.define("calc-meta-ahorro",zt);const Ea=`
  :host {
    --nc-primary: #1a56db;
    --nc-bg: #ffffff;
    --nc-text: #111827;
    --nc-border: #e5e7eb;
    --nc-accent: #059669;
    --nc-error: #dc2626;
    --nc-surface: #f9fafb;
    --nc-muted: #6b7280;
    --nc-radius: 8px;
    --nc-shadow: 0 1px 3px rgba(0,0,0,0.1);

    display: block;
    font-family: system-ui, -apple-system, sans-serif;
    color: var(--nc-text);
    background: var(--nc-bg);
    border: 1px solid var(--nc-border);
    border-radius: var(--nc-radius);
    padding: 1.5rem;
    box-sizing: border-box;
    line-height: 1.5;
  }

  :host([theme="dark"]) {
    --nc-bg: #1f2937;
    --nc-text: #f9fafb;
    --nc-border: #374151;
    --nc-surface: #111827;
    --nc-muted: #9ca3af;
    --nc-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  * { box-sizing: border-box; }

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    color: var(--nc-primary);
  }

  h3 {
    font-size: 1.05rem;
    font-weight: 700;
    margin: 0.75rem 0 0.5rem;
    color: var(--nc-text);
  }

  .nc-subtitle {
    font-size: 0.9rem;
    color: var(--nc-muted);
    margin: 0 0 1rem 0;
  }

  .nc-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  @media (max-width: 480px) {
    .nc-row { grid-template-columns: 1fr; }
  }

  .nc-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
  }

  .nc-field label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--nc-muted);
  }

  .nc-field input, .nc-field select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--nc-border);
    border-radius: var(--nc-radius);
    font-size: 1rem;
    background: var(--nc-bg);
    color: var(--nc-text);
    transition: border-color 0.15s;
  }

  .nc-field input:focus, .nc-field select:focus {
    outline: none;
    border-color: var(--nc-primary);
    box-shadow: 0 0 0 3px rgba(26,86,219,0.15);
  }

  .nc-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.6rem 1.5rem;
    background: var(--nc-primary);
    color: white;
    border: none;
    border-radius: var(--nc-radius);
    font-size: 1rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    margin: 0.5rem 0;
    transition: opacity 0.15s;
  }

  .nc-btn:hover { opacity: 0.9; }

  .nc-hidden { display: none !important; }

  .nc-results {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--nc-surface);
    border-radius: var(--nc-radius);
    border: 1px solid var(--nc-border);
  }

  .nc-result-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.4rem 0;
    border-bottom: 1px solid var(--nc-border);
  }

  .nc-result-row:last-child { border-bottom: none; }

  .nc-result-label {
    font-size: 0.85rem;
    color: var(--nc-muted);
  }

  .nc-result-value {
    font-size: 1rem;
    font-weight: 700;
    color: var(--nc-text);
  }

  .nc-result-row.nc-highlight .nc-result-value {
    color: var(--nc-primary);
    font-size: 1.2rem;
  }

  .nc-divider {
    height: 1px;
    background: var(--nc-border);
    margin: 0.75rem 0;
  }

  .nc-note {
    font-size: 0.8rem;
    color: var(--nc-muted);
    margin-top: 1rem;
    line-height: 1.5;
  }

  .nc-badge {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    background: rgba(26,86,219,0.1);
    color: var(--nc-primary);
    margin-left: 0.5rem;
  }

  .nc-comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 1rem 0;
  }

  @media (max-width: 480px) {
    .nc-comparison { grid-template-columns: 1fr; }
  }

  .nc-comparison-col {
    padding: 1rem;
    border: 1px solid var(--nc-border);
    border-radius: var(--nc-radius);
    background: var(--nc-bg);
  }

  .nc-comparison-col.nc-winner {
    border-color: var(--nc-accent);
    background: rgba(5,150,105,0.03);
  }

  .nc-comparison-col h4 {
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: var(--nc-text);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
    margin-top: 0.75rem;
  }

  th {
    text-align: left;
    padding: 0.5rem;
    border-bottom: 2px solid var(--nc-border);
    color: var(--nc-muted);
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  td {
    padding: 0.4rem 0.5rem;
    border-bottom: 1px solid var(--nc-border);
  }

  tbody tr:hover {
    background: var(--nc-surface);
  }
`;let j=class extends HTMLElement{constructor(){super(),this.shadow=this.attachShadow({mode:"open"}),this.fmtInt=new Intl.NumberFormat("es-ES",{maximumFractionDigits:0}),this._eurFmt=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2}),this._pctFmt=new Intl.NumberFormat("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2});const t=document.createElement("style");t.textContent=Ea,this.container=document.createElement("div"),this.shadow.appendChild(t),this.shadow.appendChild(this.container)}connectedCallback(){this.render(),this.setupListeners()}render(){}setupListeners(){}qs(t){return this.shadow.querySelector(t)}numVal(t){const a=this.shadow.getElementById(t);if(!a)return 0;const e=parseFloat(a.value);return isNaN(e)?0:e}strVal(t){const a=this.shadow.getElementById(t);return(a==null?void 0:a.value)??""}fmtEur(t){return this._eurFmt.format(t)}fmtPercent(t){return this._pctFmt.format(t*100)+"%"}fieldNum(t,a,e,i){return`
      <div class="nc-field">
        <label for="${t}">${a}</label>
        <input type="number" id="${t}" placeholder="${e}" value="${i}">
      </div>
    `}fieldSelect(t,a,e){const i=e.map(([o,n])=>`<option value="${o}">${n}</option>`).join("");return`
      <div class="nc-field">
        <label for="${t}">${a}</label>
        <select id="${t}">${i}</select>
      </div>
    `}resultRow(t,a,e=!1){return`
      <div class="nc-result-row${e?" nc-highlight":""}">
        <span class="nc-result-label">${t}</span>
        <span class="nc-result-value">${a}</span>
      </div>
    `}};class Vt extends j{render(){G.map(([t,a])=>`<option value="${t}">${a}</option>`).join(""),this.container.innerHTML=`
      <h2>Calculadora IRPF 2025</h2>
      <p class="nc-subtitle">Calcula tu IRPF con tramos estatales y autonómicos</p>

      ${this.fieldNum("base","Base imponible general (€)","Ej: 35000","35000")}

      ${this.fieldSelect("ccaa","Comunidad Autónoma",G)}

      <button class="nc-btn" id="calcular">Calcular IRPF</button>

      <div id="resultados" class="nc-hidden"></div>
    `}setupListeners(){var t,a;(t=this.qs("#calcular"))==null||t.addEventListener("click",()=>this.calcular()),(a=this.qs("#base"))==null||a.addEventListener("keydown",e=>{e.key==="Enter"&&this.calcular()})}calcular(){const t=this.numVal("base"),a=this.strVal("ccaa");if(t<=0)return;const e=O(t,a),i=X[a],o=dt.includes(a),n=this.qs("#resultados");n.classList.remove("nc-hidden");let s="";e.tramosDetalle.length>0&&(s=`
        <table>
          <thead>
            <tr>
              <th>Tramo</th>
              ${o?"":"<th>Estatal</th><th>Auton.</th>"}
              <th>Total</th>
              <th>Cuota</th>
            </tr>
          </thead>
          <tbody>
            ${e.tramosDetalle.map(c=>`
              <tr>
                <td>${this.fmtInt.format(c.desde)} - ${this.fmtInt.format(c.hasta)} €</td>
                ${o?"":`<td>${this.fmtPercent(c.tipoEstatal)}</td><td>${this.fmtPercent(c.tipoAutonomico)}</td>`}
                <td>${this.fmtPercent(c.tipoTotal)}</td>
                <td>${this.fmtEur(c.cuota)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `),n.innerHTML=`
      <div class="nc-results">
        <h3>Resultado IRPF — ${i.nombre}</h3>
        ${this.resultRow("Base imponible",this.fmtEur(e.baseImponible))}
        ${o?"":this.resultRow("Cuota estatal",this.fmtEur(e.cuotaEstatal))}
        ${this.resultRow(o?"Cuota íntegra":"Cuota autonómica",this.fmtEur(e.cuotaAutonomica))}
        ${o?"":this.resultRow("Cuota total",this.fmtEur(e.cuotaTotal))}
        <div class="nc-divider"></div>
        ${this.resultRow("Tipo efectivo",this.fmtPercent(e.tipoEfectivo),!0)}
        ${this.resultRow("Tipo marginal",this.fmtPercent(e.tipoMarginal),!0)}
        ${s}
        <p class="nc-note">
          ${o?`${i.nombre} tiene régimen foral con tramos propios.`:"El IRPF se reparte entre la cuota estatal y la autonómica. Los tramos varían según tu comunidad."}
          Datos fiscales 2025. Fuente: AEAT, BOE.
        </p>
      </div>
    `}}customElements.define("calc-irpf",Vt);const Ma=.0648,Ca=.305,Aa=4909.5*12;class Nt extends j{render(){this.container.innerHTML=`
      <h2>Calculadora Sueldo Neto</h2>
      <p class="nc-subtitle">De bruto anual a neto mensual con detalle de retenciones</p>

      ${this.fieldNum("bruto","Salario bruto anual (€)","Ej: 30000","30000")}

      <div class="nc-row">
        ${this.fieldSelect("pagas","Pagas anuales",[["12","12 pagas"],["14","14 pagas"]])}
        ${this.fieldSelect("ccaa","Comunidad Autónoma",G)}
      </div>

      <button class="nc-btn" id="calcular">Calcular neto</button>

      <div id="resultados" class="nc-hidden"></div>
    `}setupListeners(){var t,a;(t=this.qs("#calcular"))==null||t.addEventListener("click",()=>this.calcular()),(a=this.qs("#bruto"))==null||a.addEventListener("keydown",e=>{e.key==="Enter"&&this.calcular()})}calcular(){const t=this.numVal("bruto"),a=parseInt(this.strVal("pagas"))||14,e=this.strVal("ccaa");if(t<=0)return;const i=Math.min(t,Aa),o=i*Ma;let n=0;t<=14852?n=6498:t<=17673.52?n=6498-1.14*(t-14852):n=2e3;const s=Math.max(0,t-o-n),c=O(s,e),l=c.cuotaTotal,u=t-o-l,d=u/a,p=t>0?l/t:0,m=i*Ca,h=t+m,v=this.qs("#resultados");v.classList.remove("nc-hidden"),v.innerHTML=`
      <div class="nc-results">
        <h3>Tu sueldo neto</h3>
        ${this.resultRow("Neto mensual ("+a+" pagas)",this.fmtEur(d),!0)}
        ${this.resultRow("Neto anual",this.fmtEur(u))}

        <div class="nc-divider"></div>
        <h3>Desglose anual</h3>
        ${this.resultRow("Salario bruto",this.fmtEur(t))}
        ${this.resultRow("Seguridad Social (6,48%)","- "+this.fmtEur(o))}
        ${this.resultRow("IRPF ("+this.fmtPercent(p)+")","- "+this.fmtEur(l))}
        ${this.resultRow("Neto anual",this.fmtEur(u),!0)}

        <div class="nc-divider"></div>
        <h3>Tipos impositivos</h3>
        ${this.resultRow("Retención IRPF efectiva",this.fmtPercent(p))}
        ${this.resultRow("Tipo marginal IRPF",this.fmtPercent(c.tipoMarginal))}
        ${this.resultRow("Tipo efectivo total (IRPF+SS)",this.fmtPercent((o+l)/t))}

        <div class="nc-divider"></div>
        <h3>Coste para la empresa</h3>
        ${this.resultRow("SS empresa (~30,4%)",this.fmtEur(m))}
        ${this.resultRow("Coste total empresa",this.fmtEur(h),!0)}

        <p class="nc-note">
          Cálculo simplificado con mínimo personal de ${this.fmtEur($t)}.
          No incluye deducciones autonómicas ni situación familiar.
          Datos fiscales 2025. Fuente: AEAT, Seguridad Social.
        </p>
      </div>
    `}}customElements.define("calc-sueldo-neto",Nt);const Bt=.0325,Dt=.025,Ra=.07;class kt extends j{render(){this.container.innerHTML=`
      <h2>Calculadora FIRE España</h2>
      <p class="nc-subtitle">Independencia financiera adaptada a la realidad fiscal española</p>

      <div class="nc-row">
        ${this.fieldNum("edad","Edad actual","","35")}
        ${this.fieldNum("edad_fire","Edad FIRE objetivo","","50")}
      </div>

      ${this.fieldNum("gastos","Gastos anuales actuales (€)","Ej: 24000","24000")}

      <div class="nc-row">
        ${this.fieldNum("patrimonio","Patrimonio invertido actual (€)","","50000")}
        ${this.fieldNum("aportacion","Aportación mensual (€)","","1000")}
      </div>

      <div class="nc-row">
        ${this.fieldNum("pension","Pensión pública estimada (€/mes)","Ej: 1200","1200")}
        ${this.fieldNum("edad_pension","Edad jubilación","","67")}
      </div>

      <button class="nc-btn" id="calcular">Calcular FIRE</button>

      <div id="resultados" class="nc-hidden"></div>
    `}setupListeners(){var t;(t=this.qs("#calcular"))==null||t.addEventListener("click",()=>this.calcular())}calcular(){const t=this.numVal("edad"),a=this.numVal("edad_fire"),e=this.numVal("gastos"),i=this.numVal("patrimonio"),o=this.numVal("aportacion"),n=this.numVal("pension");if(this.numVal("edad_pension"),e<=0||t<=0)return;const s=Math.max(0,a-t),c=Ra-Dt;let l=i;for(let A=0;A<s*12;A++)l=l*(1+c/12)+o;const u=e*Math.pow(1+Dt,s),p=u*.5,m=yt(p),h=u+m.cuota,v=h/Bt,f=n*14,g=Math.max(0,h-f)/Bt,y=Math.min(1,l/v);let $=0,x=i;for(;x<v&&$<80;)x=x*(1+c)+o*12,$++;const I=t+$,w=this.qs("#resultados");w.classList.remove("nc-hidden"),w.innerHTML=`
      <div class="nc-results">
        <h3>Tu plan FIRE España</h3>
        ${this.resultRow("Número FIRE (antes de pensión)",this.fmtEur(v),!0)}
        ${this.resultRow("Patrimonio proyectado a los "+a+" años",this.fmtEur(l))}
        ${this.resultRow("Progreso al objetivo",this.fmtPercent(y))}

        <div class="nc-divider"></div>
        <h3>Retiro seguro</h3>
        ${this.resultRow("Gastos anuales (ajustados inflación)",this.fmtEur(u))}
        ${this.resultRow("Impuestos sobre retiradas (ahorro)",this.fmtEur(m.cuota))}
        ${this.resultRow("Retirada bruta necesaria/año",this.fmtEur(h))}
        ${this.resultRow("Tasa de retirada segura (SWR)","3,25%")}

        <div class="nc-divider"></div>
        <h3>Efecto pensión pública</h3>
        ${this.resultRow("Pensión estimada (14 pagas)",this.fmtEur(f)+"/año")}
        ${this.resultRow("Patrimonio necesario post-jubilación",this.fmtEur(g))}
        ${this.resultRow("Ahorro por pensión pública",this.fmtEur(v-g))}

        <div class="nc-divider"></div>
        <h3>Proyección</h3>
        ${this.resultRow("Años hasta FIRE (ritmo actual)",$>=80?"+80 años":$+" años")}
        ${this.resultRow("Edad FIRE estimada",$>=80?"Inalcanzable":I+" años")}

        <p class="nc-note">
          SWR español: 3,25% (más conservador que el 4% americano por menor crecimiento histórico europeo).
          Ventajas España: sanidad pública gratuita, pensión pública, menor coste de vida.
          Rentabilidad nominal 7%, inflación 2,5%. Fiscalidad ahorro: 19-28%.
        </p>
      </div>
    `}}customElements.define("calc-fire-espana",kt);class qt extends j{render(){this.container.innerHTML=`
      <h2>Autónomo vs Sociedad Limitada</h2>
      <p class="nc-subtitle">Compara cuánto te queda en cada forma jurídica</p>

      ${this.fieldNum("ingresos","Ingresos brutos anuales (€)","Ej: 80000","80000")}
      ${this.fieldNum("gastos","Gastos deducibles anuales (€)","Ej: 15000","15000")}

      <div class="nc-row">
        ${this.fieldSelect("ccaa","Comunidad Autónoma",G)}
        ${this.fieldNum("salario_admin","Salario administrador SL (€/año)","24000","24000")}
      </div>

      <button class="nc-btn" id="calcular">Comparar</button>

      <div id="resultados" class="nc-hidden"></div>
    `}setupListeners(){var t;(t=this.qs("#calcular"))==null||t.addEventListener("click",()=>this.calcular())}calcular(){const t=this.numVal("ingresos"),a=this.numVal("gastos"),e=this.strVal("ccaa"),i=this.numVal("salario_admin")||24e3;if(t<=0)return;const o=ma(t,a,e,i),n=o.recomendacion==="autonomo",s=this.qs("#resultados");s.classList.remove("nc-hidden"),s.innerHTML=`
      <div class="nc-results">
        <h3>Resultado: ${n?"Autónomo más favorable":"SL más favorable"}
          <span class="nc-badge">${n?"Autónomo":"SL"}</span>
        </h3>
        ${this.resultRow("Diferencia anual",this.fmtEur(Math.abs(o.diferencia)),!0)}
      </div>

      <div class="nc-comparison">
        <div class="nc-comparison-col ${n?"nc-winner":""}">
          <h4>Autónomo ${n?"✓":""}</h4>
          ${this.resultRow("Ingresos brutos",this.fmtEur(o.autonomo.ingresosBrutos))}
          ${this.resultRow("Gastos deducibles","- "+this.fmtEur(o.autonomo.gastos))}
          ${this.resultRow("Rendimiento neto",this.fmtEur(o.autonomo.rendimientoNeto))}
          ${this.resultRow("Cuota RETA","- "+this.fmtEur(o.autonomo.cuotaRETAAnual))}
          ${this.resultRow("IRPF","- "+this.fmtEur(o.autonomo.irpf))}
          <div class="nc-divider"></div>
          ${this.resultRow("Neto final",this.fmtEur(o.autonomo.netoFinal),!0)}
          ${this.resultRow("Tipo efectivo",this.fmtPercent(o.autonomo.tipoEfectivo))}
        </div>

        <div class="nc-comparison-col ${n?"":"nc-winner"}">
          <h4>SL ${n?"":"✓"}</h4>
          ${this.resultRow("Ingresos brutos",this.fmtEur(o.sl.ingresosBrutos))}
          ${this.resultRow("Gastos deducibles","- "+this.fmtEur(o.sl.gastos))}
          ${this.resultRow("Salario admin",this.fmtEur(o.sl.salarioAdmin))}
          ${this.resultRow("IS (25%)","- "+this.fmtEur(o.sl.impuestoSociedades))}
          ${this.resultRow("SS admin","- "+this.fmtEur(o.sl.cuotaSSAdmin))}
          ${this.resultRow("IRPF salario","- "+this.fmtEur(o.sl.irpfSalario))}
          ${this.resultRow("Dividendos",this.fmtEur(o.sl.dividendos))}
          ${this.resultRow("IRPF dividendos","- "+this.fmtEur(o.sl.impuestoDividendos))}
          <div class="nc-divider"></div>
          ${this.resultRow("Neto final",this.fmtEur(o.sl.netoFinal),!0)}
          ${this.resultRow("Tipo efectivo",this.fmtPercent(o.sl.tipoEfectivo))}
        </div>
      </div>

      <p class="nc-note">
        SL: IS 25% + dividendos al 19-28%. Autónomo: IRPF hasta 47% + cuota RETA por tramos.
        La SL tiene costes de gestoría y constitución no incluidos (~3.000-5.000€ anuales).
        Datos 2025. Fuentes: AEAT, Seguridad Social.
      </p>
    `}}customElements.define("calc-autonomo-vs-sl",qt);class Ht extends j{render(){this.container.innerHTML=`
      <h2>Calculadora de Pensión</h2>
      <p class="nc-subtitle">Estima tu pensión de jubilación de la Seguridad Social</p>

      <div class="nc-row">
        ${this.fieldNum("anios","Años cotizados","Ej: 35","35")}
        ${this.fieldNum("edad","Edad de jubilación","Ej: 65","65")}
      </div>

      ${this.fieldNum("base_cot","Base de cotización media mensual (€)","Ej: 2500","2500")}
      ${this.fieldNum("ultimo_sueldo","Último sueldo bruto mensual (€)","Para tasa de sustitución","3000")}

      <button class="nc-btn" id="calcular">Calcular pensión</button>

      <div id="resultados" class="nc-hidden"></div>
    `}setupListeners(){var t;(t=this.qs("#calcular"))==null||t.addEventListener("click",()=>this.calcular())}calcular(){const t=this.numVal("anios"),a=this.numVal("edad"),e=this.numVal("base_cot"),i=this.numVal("ultimo_sueldo");if(t<=0||e<=0)return;const o=fa(e,t,a,i),n=Ct(t),s=this.qs("#resultados");s.classList.remove("nc-hidden"),s.innerHTML=`
      <div class="nc-results">
        <h3>Tu pensión estimada</h3>
        ${this.resultRow("Pensión mensual",this.fmtEur(o.pensionMensual),!0)}
        ${this.resultRow("Pensión anual (14 pagas)",this.fmtEur(o.pensionAnual))}
        ${i>0?this.resultRow("Tasa de sustitución",this.fmtPercent(o.tasaSustitucion)):""}

        <div class="nc-divider"></div>
        <h3>Cálculo detallado</h3>
        ${this.resultRow("Base reguladora (Fórmula "+o.formulaAplicada+")",this.fmtEur(o.baseReguladora))}
        ${this.resultRow("Fórmula A (25 años)",this.fmtEur(o.baseReguladoraFormulaA))}
        ${this.resultRow("Fórmula B (29 años - 2 peores)",this.fmtEur(o.baseReguladoraFormulaB))}
        ${this.resultRow("% por años cotizados ("+t+" años)",this.fmtPercent(o.porcentajePorAnios))}
        ${this.resultRow("Coeficiente por edad",(o.coeficienteEdad*100).toFixed(1)+"%")}

        <div class="nc-divider"></div>
        <h3>Información</h3>
        ${this.resultRow("Edad legal jubilación",n+" años"+(t>=38.25?" (38+ años cotizados)":""))}
        ${o.coeficienteEdad<1?this.resultRow("Penalización jubilación anticipada",this.fmtPercent(1-o.coeficienteEdad)):o.coeficienteEdad>1?this.resultRow("Bonus jubilación demorada","+"+this.fmtPercent(o.coeficienteEdad-1)):""}
        ${this.resultRow("Pensión máxima 2025",this.fmtEur(Et))}
        ${this.resultRow("Base cotización máxima",this.fmtEur(wt)+"/mes")}

        <p class="nc-note">
          Sistema dual 2025: la SS calcula con 2 fórmulas y aplica la más favorable.
          Fórmula A: últimos 25 años / 350. Fórmula B: últimos 29 años menos los 2 peores / 350.
          15 años mínimo para tener derecho a pensión. 36,5 años para el 100%.
          Fuente: LGSS art. 209-210, Ley 21/2021 de reforma de pensiones.
        </p>
      </div>
    `}}customElements.define("calc-pension",Ht);class _t extends j{render(){this.container.innerHTML=`
      <h2>Gastos de compra de vivienda</h2>
      <p class="nc-subtitle">Calcula el coste REAL de comprar una vivienda en España</p>

      ${this.fieldNum("precio","Precio de la vivienda (€)","Ej: 250000","250000")}

      <div class="nc-row">
        ${this.fieldSelect("ccaa","Comunidad Autónoma",G)}
        ${this.fieldSelect("tipo","Tipo de vivienda",[["segunda","Segunda mano"],["nueva","Obra nueva"],["vpo","VPO (obra nueva)"]])}
      </div>

      ${this.fieldNum("hipoteca","Importe hipoteca (€, 0 si sin hipoteca)","0","200000")}

      <button class="nc-btn" id="calcular">Calcular gastos</button>

      <div id="resultados" class="nc-hidden"></div>
    `}setupListeners(){var t;(t=this.qs("#calcular"))==null||t.addEventListener("click",()=>this.calcular())}calcular(){const t=this.numVal("precio"),a=this.strVal("ccaa"),e=this.strVal("tipo"),i=this.numVal("hipoteca");if(t<=0)return;const o=e==="nueva"||e==="vpo",n=e==="vpo",s=wa(t,a,o,i,n),c=this.qs("#resultados");c.classList.remove("nc-hidden"),c.innerHTML=`
      <div class="nc-results">
        <h3>Coste total de la compra</h3>
        ${this.resultRow("Precio vivienda",this.fmtEur(s.precioVivienda))}
        ${this.resultRow("Total gastos e impuestos",this.fmtEur(s.totalCoste),!0)}
        ${this.resultRow("Desembolso total",this.fmtEur(s.precioVivienda+s.totalCoste),!0)}
        ${this.resultRow("% sobre precio",this.fmtPercent(s.porcentajeSobrePrecio))}

        <div class="nc-divider"></div>
        <h3>Impuestos</h3>
        ${this.resultRow(s.nombreImpuesto+" ("+this.fmtPercent(s.tipoTransmision)+")",this.fmtEur(s.impuestoTransmision))}
        ${s.ajd>0?this.resultRow("AJD ("+this.fmtPercent(s.tipoAJD)+")",this.fmtEur(s.ajd)):""}
        ${this.resultRow("Total impuestos",this.fmtEur(s.totalImpuestos))}

        <div class="nc-divider"></div>
        <h3>Gastos</h3>
        ${this.resultRow("Notaría",this.fmtEur(s.notaria))}
        ${this.resultRow("Registro de la propiedad",this.fmtEur(s.registro))}
        ${this.resultRow("Gestoría",this.fmtEur(s.gestoria))}
        ${s.tasacion>0?this.resultRow("Tasación",this.fmtEur(s.tasacion)):""}
        ${s.notariaHipoteca>0?this.resultRow("Notaría hipoteca (tu parte)",this.fmtEur(s.notariaHipoteca)):""}
        ${this.resultRow("Total gastos",this.fmtEur(s.totalGastos))}

        ${i>0?`
          <div class="nc-divider"></div>
          <h3>Ahorro necesario</h3>
          ${this.resultRow("Entrada (precio - hipoteca)",this.fmtEur(t-i))}
          ${this.resultRow("Gastos e impuestos",this.fmtEur(s.totalCoste))}
          ${this.resultRow("Total ahorro necesario",this.fmtEur(t-i+s.totalCoste),!0)}
        `:""}

        <p class="nc-note">
          ${o?"Obra nueva: IVA "+(n?"4%":"10%")+" + AJD.":"Segunda mano: ITP (varía por CCAA)."}
          Desde 2019 el AJD de la hipoteca lo paga el banco.
          Gastos notariales y registrales son estimaciones según aranceles oficiales.
          Datos 2025. Fuente: AEAT, aranceles RD 1426/1989 y RD 1427/1989.
        </p>
      </div>
    `}}customElements.define("calc-gastos-vivienda",_t);class Gt extends j{render(){this.container.innerHTML=`
      <h2>Calculadora Plusvalía Municipal</h2>
      <p class="nc-subtitle">IIVTNU — elige el método más favorable</p>

      <div class="nc-row">
        ${this.fieldNum("vc_suelo","Valor catastral del suelo (€)","Ej: 50000","50000")}
        ${this.fieldNum("vc_total","Valor catastral total (€)","Ej: 120000","120000")}
      </div>

      <div class="nc-row">
        ${this.fieldNum("compra","Precio de compra (€)","Ej: 180000","180000")}
        ${this.fieldNum("venta","Precio de venta (€)","Ej: 250000","250000")}
      </div>

      <div class="nc-row">
        ${this.fieldNum("anios","Años de propiedad","Ej: 10","10")}
        ${this.fieldNum("tipo_municipal","Tipo municipal (%)","Max 30%","30")}
      </div>

      <button class="nc-btn" id="calcular">Calcular plusvalía</button>

      <div id="resultados" class="nc-hidden"></div>
    `}setupListeners(){var t;(t=this.qs("#calcular"))==null||t.addEventListener("click",()=>this.calcular())}calcular(){const t=this.numVal("vc_suelo"),a=this.numVal("vc_total"),e=this.numVal("compra"),i=this.numVal("venta"),o=this.numVal("anios"),n=this.numVal("tipo_municipal")/100;if(t<=0||o<=0)return;const s=ga(t,o,n,e,i,a),c=Math.max(1,Math.min(20,Math.floor(o))),l=pt[c]||0,u=this.qs("#resultados");u.classList.remove("nc-hidden"),u.innerHTML=`
      <div class="nc-results">
        ${s.sinPlusvalia?`
          <h3>Sin plusvalía — no hay que pagar</h3>
          <p class="nc-note">Si no hay ganancia patrimonial, no se genera plusvalía municipal (STC 59/2017).</p>
        `:`
          <h3>Plusvalía a pagar</h3>
          ${this.resultRow("Método elegido",s.metodoElegido==="objetivo"?"Objetivo (más favorable)":"Real (más favorable)")}
          ${this.resultRow("Cuota a pagar",this.fmtEur(s.cuotaFinal),!0)}
        `}

        <div class="nc-divider"></div>
        <h3>Método objetivo</h3>
        ${this.resultRow("Valor catastral suelo",this.fmtEur(t))}
        ${this.resultRow("Coeficiente ("+c+" años)",l.toFixed(2))}
        ${this.resultRow("Base imponible",this.fmtEur(s.metodoObjetivo.baseImponible))}
        ${this.resultRow("Tipo municipal",this.fmtPercent(s.metodoObjetivo.tipoAplicado))}
        ${this.resultRow("Cuota objetivo",this.fmtEur(s.metodoObjetivo.cuota))}

        <div class="nc-divider"></div>
        <h3>Método real</h3>
        ${this.resultRow("Ganancia patrimonial",this.fmtEur(s.metodoReal.gananciaReal))}
        ${this.resultRow("Proporción suelo",this.fmtPercent(s.metodoReal.proporcionSuelo))}
        ${this.resultRow("Base imponible",this.fmtEur(s.metodoReal.baseImponible))}
        ${this.resultRow("Tipo municipal",this.fmtPercent(s.metodoReal.tipoAplicado))}
        ${this.resultRow("Cuota real",this.fmtEur(s.metodoReal.cuota))}

        <p class="nc-note">
          El contribuyente elige el método más favorable (RDL 26/2021).
          Coeficientes vigentes: RDL 8/2023 (LPGE). Tipo municipal máximo: 30%.
          Si no hay ganancia real, no hay obligación de pago (STC 59/2017, STC 182/2021).
        </p>
      </div>
    `}}customElements.define("calc-plusvalia",Gt);class Ot extends j{render(){this.container.innerHTML=`
      <h2>Cuota de Autónomos 2025</h2>
      <p class="nc-subtitle">Sistema por tramos de rendimientos netos</p>

      ${this.fieldNum("rendimiento","Rendimiento neto anual (€)","Ingresos - gastos deducibles","30000")}

      <button class="nc-btn" id="calcular">Calcular cuota</button>

      <div id="resultados" class="nc-hidden"></div>
    `}setupListeners(){var t,a;(t=this.qs("#calcular"))==null||t.addEventListener("click",()=>this.calcular()),(a=this.qs("#rendimiento"))==null||a.addEventListener("keydown",e=>{e.key==="Enter"&&this.calcular()})}calcular(){const t=this.numVal("rendimiento");if(t<=0)return;const a=xt(t),e=ut.map(o=>`<tr${a.rendimientoNetoMensual>=o.rendimientoMin&&a.rendimientoNetoMensual<o.rendimientoMax?' style="background:rgba(5,150,105,0.1);font-weight:600"':""}>
        <td>${this.fmtInt.format(o.rendimientoMin)} - ${o.rendimientoMax===1/0?"∞":this.fmtInt.format(o.rendimientoMax)} €</td>
        <td>${this.fmtEur(o.cuotaMinima)}</td>
        <td>${this.fmtEur(o.baseCotizacion)}</td>
      </tr>`).join(""),i=this.qs("#resultados");i.classList.remove("nc-hidden"),i.innerHTML=`
      <div class="nc-results">
        <h3>Tu cuota de autónomos</h3>
        ${this.resultRow("Rendimiento neto mensual",this.fmtEur(a.rendimientoNetoMensual))}
        ${this.resultRow("Cuota mensual",this.fmtEur(a.cuotaMensual),!0)}
        ${this.resultRow("Cuota anual",this.fmtEur(a.cuotaAnual))}
        ${this.resultRow("Base de cotización",this.fmtEur(a.baseCotizacion))}
        ${this.resultRow("Tramo",a.tramo)}
      </div>

      <div class="nc-results" style="margin-top:1rem">
        <h3>Tabla completa de tramos 2025</h3>
        <table>
          <thead>
            <tr>
              <th>Rendimiento neto/mes</th>
              <th>Cuota mín.</th>
              <th>Base cotiz.</th>
            </tr>
          </thead>
          <tbody>${e}</tbody>
        </table>
        <p class="nc-note">
          Sistema de cotización por ingresos reales (RDL 13/2022).
          Rendimiento neto = ingresos - gastos deducibles.
          Los tramos se revisan anualmente. Datos 2025.
          Fuente: Seguridad Social, disposición transitoria 1ª RDL 13/2022.
        </p>
      </div>
    `}}customElements.define("calc-cuota-autonomos",Ot);class Ut extends j{render(){this.container.innerHTML=`
      <h2>Optimizador Rescate Plan de Pensiones</h2>
      <p class="nc-subtitle">Minimiza tu IRPF distribuyendo el rescate en varios años</p>

      ${this.fieldNum("saldo","Saldo del plan de pensiones (€)","Ej: 100000","100000")}
      ${this.fieldNum("otros_ingresos","Otros ingresos anuales (€)","Salario, pensión, etc.","25000")}

      <div class="nc-row">
        ${this.fieldNum("anios_rescate","Años para el rescate","Ej: 5","5")}
        ${this.fieldSelect("ccaa","Comunidad Autónoma",G)}
      </div>

      <button class="nc-btn" id="calcular">Optimizar rescate</button>

      <div id="resultados" class="nc-hidden"></div>
    `}setupListeners(){var t;(t=this.qs("#calcular"))==null||t.addEventListener("click",()=>this.calcular())}calcular(){const t=this.numVal("saldo"),a=this.numVal("otros_ingresos"),e=Math.max(1,Math.min(30,Math.floor(this.numVal("anios_rescate")))),i=this.strVal("ccaa");if(t<=0)return;const o=this.simularRescate(t,a,e,i,"uniforme"),n=this.simularRescate(t,a,e,i,"optimizado"),s=this.simularRescate(t,a,1,i,"uniforme"),c=this.qs("#resultados");c.classList.remove("nc-hidden");const l=n.totalIRPF<=o.totalIRPF?n:o,u=s.totalIRPF-l.totalIRPF;c.innerHTML=`
      <div class="nc-results">
        <h3>Resultado optimizado</h3>
        ${this.resultRow("Saldo del plan",this.fmtEur(t))}
        ${this.resultRow("IRPF rescatando todo de golpe",this.fmtEur(s.totalIRPF))}
        ${this.resultRow("IRPF rescate optimizado ("+e+" años)",this.fmtEur(l.totalIRPF),!0)}
        ${this.resultRow("Ahorro fiscal por distribuir",this.fmtEur(u),!0)}
      </div>

      <div class="nc-results" style="margin-top:1rem">
        <h3>Plan de rescate año a año</h3>
        <table>
          <thead>
            <tr>
              <th>Año</th>
              <th>Rescate</th>
              <th>Base total</th>
              <th>IRPF rescate</th>
              <th>Marginal</th>
            </tr>
          </thead>
          <tbody>
            ${l.anios.map((d,p)=>`
              <tr>
                <td>Año ${p+1}</td>
                <td>${this.fmtEur(d.rescate)}</td>
                <td>${this.fmtEur(d.baseTotal)}</td>
                <td>${this.fmtEur(d.irpfRescate)}</td>
                <td>${this.fmtPercent(d.tipoMarginalRescate)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="nc-divider"></div>
        <h3>Comparativa de estrategias</h3>
        ${this.resultRow("Todo de golpe (1 año)",this.fmtEur(s.totalIRPF))}
        ${this.resultRow("Uniforme ("+e+" años)",this.fmtEur(o.totalIRPF))}
        ${this.resultRow("Optimizado ("+e+" años)",this.fmtEur(n.totalIRPF))}

        <p class="nc-note">
          Los planes de pensiones tributan como rendimientos del trabajo al rescatarlos (no como ahorro).
          Desde 2025, se pueden rescatar aportaciones con más de 10 años de antigüedad.
          Distribuir el rescate en varios años puede reducir significativamente el IRPF al evitar los tramos más altos.
          Datos 2025. Fuente: Art. 17.2.a.3ª y DT 22ª LIRPF.
        </p>
      </div>
    `}simularRescate(t,a,e,i,o){const n=[];let s=t,c=0;const l=dt.includes(i),u=X[i];for(let d=0;d<e&&s>0;d++){let p;if(o==="uniforme")p=t/e;else{const f=l?u.irpfTramos:this.combinarTramos(Q,u.irpfTramos);let b=0;for(const g of f){if(a<g.hasta){b=g.hasta===1/0?a+s/(e-d):g.hasta;break}g.hasta}p=Math.min(s,Math.max(b-a,s/(e-d)))}p=Math.min(p,s);const m=O(a,i),h=O(a+p,i),v=h.cuotaTotal-m.cuotaTotal;n.push({anio:d+1,rescate:p,otrosIngresos:a,baseTotal:a+p,irpfTotal:h.cuotaTotal,irpfSinRescate:m.cuotaTotal,irpfRescate:v,tipoMarginalRescate:h.tipoMarginal}),c+=v,s-=p}return{anios:n,totalIRPF:c}}combinarTramos(t,a){const e=new Set;for(const n of t)n.hasta!==1/0&&e.add(n.hasta);for(const n of a)n.hasta!==1/0&&e.add(n.hasta);const i=[...e].sort((n,s)=>n-s);i.push(1/0);const o=[];for(const n of i){const s=n===1/0?(i[i.length-2]||0)+1:n-1,c=N(s,t),l=N(s,a);o.push({hasta:n,tipo:c+l})}return o}}customElements.define("calc-rescate-pensiones",Ut);class Wt extends j{render(){this.container.innerHTML=`
      <h2>Comparador fiscal por CCAA</h2>
      <p class="nc-subtitle">Ranking de carga fiscal total entre comunidades autónomas</p>

      ${this.fieldNum("salario","Salario bruto anual (€)","Ej: 50000","50000")}

      <div class="nc-row">
        ${this.fieldNum("patrimonio","Patrimonio neto (€)","Ej: 500000","500000")}
        ${this.fieldNum("vivienda","Valor vivienda a comprar (€)","Para ITP. 0 si no aplica","250000")}
      </div>

      ${this.fieldNum("herencia","Herencia esperada (€)","De padres a hijo. 0 si no aplica","200000")}

      <button class="nc-btn" id="calcular">Comparar comunidades</button>

      <div id="resultados" class="nc-hidden"></div>
    `}setupListeners(){var t;(t=this.qs("#calcular"))==null||t.addEventListener("click",()=>this.calcular())}calcular(){const t=this.numVal("salario"),a=this.numVal("patrimonio"),e=this.numVal("vivienda"),i=this.numVal("herencia");if(t<=0)return;const o=[];for(const[l,u]of G){const d=X[l],m=O(t,l).cuotaTotal,h=e>0?e*d.itpGeneral:0;let v=0;if(a>d.patrimonioMinExento){const g=a-d.patrimonioMinExento;v=S(g,d.patrimonioTramos)}let f=0;if(i>0){const y=Math.max(0,i-15956.87);f=this.calcularSucesionesBase(y)*(1-d.sucesionesBonificacion)}const b=m+h+v+f;o.push({id:l,nombre:u,irpf:m,itp:h,patrimonio:v,sucesiones:f,total:b})}o.sort((l,u)=>l.total-u.total);const n=this.qs("#resultados");n.classList.remove("nc-hidden");const s=o[0],c=o[o.length-1];n.innerHTML=`
      <div class="nc-results">
        <h3>Ranking fiscal por CCAA</h3>
        ${this.resultRow("Más favorable",s.nombre+" ("+this.fmtEur(s.total)+")",!0)}
        ${this.resultRow("Menos favorable",c.nombre+" ("+this.fmtEur(c.total)+")")}
        ${this.resultRow("Diferencia máxima",this.fmtEur(c.total-s.total))}
      </div>

      <div class="nc-results" style="margin-top:1rem">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>CCAA</th>
              <th>IRPF</th>
              ${e>0?"<th>ITP</th>":""}
              ${a>0?"<th>Patrim.</th>":""}
              ${i>0?"<th>Suces.</th>":""}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${o.map((l,u)=>`
              <tr${u===0?' style="background:rgba(5,150,105,0.1);font-weight:600"':""}>
                <td>${u+1}</td>
                <td>${l.nombre}</td>
                <td>${this.fmtEur(l.irpf)}</td>
                ${e>0?`<td>${this.fmtEur(l.itp)}</td>`:""}
                ${a>0?`<td>${this.fmtEur(l.patrimonio)}</td>`:""}
                ${i>0?`<td>${this.fmtEur(l.sucesiones)}</td>`:""}
                <td>${this.fmtEur(l.total)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <p class="nc-note">
          Comparativa simplificada. IRPF: cuota total (estatal + autonómica).
          ITP: tipo general de transmisiones onerosas.
          Patrimonio: tarifa autonómica (algunas CCAA lo han bonificado al 100%).
          Sucesiones: grupo II (hijo > 21), con bonificación autonómica.
          Navarra y País Vasco tienen régimen foral propio.
          Datos 2025. Fuente: normativa fiscal de cada CCAA.
        </p>
      </div>
    `}calcularSucesionesBase(t){return S(t,[{hasta:7993.46,tipo:.0765},{hasta:15980.91,tipo:.085},{hasta:23968.36,tipo:.0935},{hasta:31955.81,tipo:.102},{hasta:39943.26,tipo:.1105},{hasta:47930.72,tipo:.119},{hasta:55918.17,tipo:.1275},{hasta:63905.62,tipo:.136},{hasta:71893.07,tipo:.1445},{hasta:79880.52,tipo:.153},{hasta:119820.77,tipo:.1615},{hasta:159757.03,tipo:.187},{hasta:239636.53,tipo:.2125},{hasta:398940.88,tipo:.255},{hasta:797814.33,tipo:.2975},{hasta:1/0,tipo:.34}])}}customElements.define("calc-comparador-ccaa",Wt);class at extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._fmt=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:0}),this._fmtDec=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:2}),this._pctFmt=new Intl.NumberFormat("es-ES",{style:"percent",minimumFractionDigits:1,maximumFractionDigits:2})}connectedCallback(){this.shadowRoot.innerHTML=`<style>${this.baseStyles()}</style>${this.render()}`,this.setupListeners()}formatEur(t){return this._fmt.format(t)}formatEurDec(t){return this._fmtDec.format(t)}formatPct(t){return this._pctFmt.format(t)}$(t){return this.shadowRoot.querySelector(t)}$$(t){return this.shadowRoot.querySelectorAll(t)}getVal(t){const a=this.$(`#${t}`);return a&&parseFloat(a.value)||0}baseStyles(){return`
      :host {
        --nc-primary: #1a56db;
        --nc-bg: #ffffff;
        --nc-text: #111827;
        --nc-border: #e5e7eb;
        --nc-accent: #059669;
        --nc-option-a: #1a56db;
        --nc-option-b: #9333ea;
        --nc-danger: #dc2626;
        --nc-warning: #d97706;
        --nc-success: #059669;
        --nc-muted: #6b7280;
        --nc-bg-subtle: #f9fafb;
        --nc-radius: 12px;
        --nc-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
        --nc-shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);

        display: block;
        font-family: system-ui, -apple-system, sans-serif;
        color: var(--nc-text);
        background: var(--nc-bg);
        max-width: 900px;
        margin: 0 auto;
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }

      .card {
        background: var(--nc-bg);
        border: 1px solid var(--nc-border);
        border-radius: var(--nc-radius);
        padding: 24px;
        box-shadow: var(--nc-shadow);
      }

      .title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--nc-text);
        margin-bottom: 4px;
      }

      .subtitle {
        font-size: 0.95rem;
        color: var(--nc-muted);
        margin-bottom: 24px;
      }

      /* Form inputs */
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 24px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .form-group.full { grid-column: 1 / -1; }

      label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--nc-muted);
      }

      input, select {
        padding: 10px 12px;
        border: 1px solid var(--nc-border);
        border-radius: 8px;
        font-size: 1rem;
        font-family: inherit;
        color: var(--nc-text);
        background: var(--nc-bg);
        transition: border-color 0.15s;
      }

      input:focus, select:focus {
        outline: none;
        border-color: var(--nc-primary);
        box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.15s;
      }

      .btn-primary {
        background: var(--nc-primary);
        color: white;
      }
      .btn-primary:hover { opacity: 0.9; }

      /* Two-column comparison layout */
      .comparison {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin: 24px 0;
      }

      .option-card {
        border-radius: var(--nc-radius);
        padding: 20px;
        border: 2px solid;
      }

      .option-a {
        border-color: var(--nc-option-a);
        background: rgba(26, 86, 219, 0.03);
      }

      .option-b {
        border-color: var(--nc-option-b);
        background: rgba(147, 51, 234, 0.03);
      }

      .option-header {
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 12px;
      }

      .option-a .option-header { color: var(--nc-option-a); }
      .option-b .option-header { color: var(--nc-option-b); }

      .option-value {
        font-size: 1.8rem;
        font-weight: 800;
        margin-bottom: 4px;
      }

      .option-a .option-value { color: var(--nc-option-a); }
      .option-b .option-value { color: var(--nc-option-b); }

      .option-label {
        font-size: 0.85rem;
        color: var(--nc-muted);
        margin-bottom: 12px;
      }

      .stat-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--nc-border);
        font-size: 0.9rem;
      }

      .stat-row:last-child { border-bottom: none; }
      .stat-label { color: var(--nc-muted); }
      .stat-value { font-weight: 600; }

      /* Verdict bar */
      .verdict {
        background: linear-gradient(135deg, #059669, #047857);
        color: white;
        border-radius: var(--nc-radius);
        padding: 24px;
        margin: 24px 0;
        box-shadow: var(--nc-shadow-lg);
      }

      .verdict-label {
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        opacity: 0.85;
        margin-bottom: 8px;
      }

      .verdict-option {
        font-size: 1.5rem;
        font-weight: 800;
        margin-bottom: 8px;
      }

      .verdict-text {
        font-size: 1.05rem;
        line-height: 1.5;
        opacity: 0.95;
      }

      /* Why section (collapsible) */
      .why-section {
        margin-top: 16px;
      }

      .why-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        background: none;
        border: 1px solid var(--nc-border);
        border-radius: 8px;
        padding: 10px 16px;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--nc-muted);
        cursor: pointer;
        font-family: inherit;
        width: 100%;
        text-align: left;
      }

      .why-toggle:hover { background: var(--nc-bg-subtle); }

      .why-toggle .arrow {
        transition: transform 0.2s;
        font-size: 0.7rem;
      }

      .why-toggle.open .arrow { transform: rotate(90deg); }

      .why-content {
        display: none;
        padding: 16px;
        margin-top: 8px;
        background: var(--nc-bg-subtle);
        border-radius: 8px;
        font-size: 0.9rem;
        line-height: 1.6;
        color: var(--nc-muted);
      }

      .why-content.open { display: block; }

      .why-content p {
        margin-bottom: 8px;
      }

      .why-content p:last-child { margin-bottom: 0; }

      /* Chart area */
      .chart-container {
        margin: 24px 0;
        padding: 16px;
        background: var(--nc-bg-subtle);
        border-radius: var(--nc-radius);
        overflow-x: auto;
      }

      .chart-container svg {
        width: 100%;
        height: auto;
      }

      .chart-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--nc-muted);
        margin-bottom: 12px;
      }

      /* Results hidden initially */
      .results { display: none; }
      .results.visible { display: block; }

      /* Responsive */
      @media (max-width: 640px) {
        .form-grid { grid-template-columns: 1fr; }
        .comparison { grid-template-columns: 1fr; }
        .option-value { font-size: 1.4rem; }
        .verdict-option { font-size: 1.2rem; }
        .card { padding: 16px; }
      }
    `}render(){return""}setupListeners(){}renderLineChart({series:t,labels:a,width:e=800,height:i=300,title:o=""}){const n={top:30,right:20,bottom:40,left:70},s=e-n.left-n.right,c=i-n.top-n.bottom,l=t.flatMap(w=>w.data),u=Math.max(...l)*1.1,d=Math.min(0,Math.min(...l)),p=u-d||1,m=a.length,h=w=>n.left+w/Math.max(1,m-1)*s,v=w=>n.top+c-(w-d)/p*c,f=5;let b="";for(let w=0;w<=f;w++){const A=d+p*w/f,L=v(A);b+=`<line x1="${n.left}" y1="${L}" x2="${e-n.right}" y2="${L}" stroke="#e5e7eb" stroke-width="1"/>`,b+=`<text x="${n.left-8}" y="${L+4}" text-anchor="end" fill="#6b7280" font-size="11">${this.formatEur(A)}</text>`}let g="";const y=Math.max(1,Math.floor(m/10));for(let w=0;w<m;w+=y)g+=`<text x="${h(w)}" y="${i-8}" text-anchor="middle" fill="#6b7280" font-size="11">${a[w]}</text>`;const $=["#1a56db","#9333ea","#059669","#dc2626","#d97706"];let x="",I="";return t.forEach((w,A)=>{const L=$[A%$.length],W=w.data.map((ot,it)=>`${h(it)},${v(ot)}`).join(" ");x+=`<polyline points="${W}" fill="none" stroke="${L}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;const D=n.left+A*180;I+=`<rect x="${D}" y="8" width="12" height="12" rx="2" fill="${L}"/>`,I+=`<text x="${D+16}" y="18" fill="#374151" font-size="12" font-weight="500">${w.name}</text>`}),`
      <div class="chart-container">
        ${o?`<div class="chart-title">${o}</div>`:""}
        <svg viewBox="0 0 ${e} ${i}" xmlns="http://www.w3.org/2000/svg">
          ${b}
          ${x}
          ${g}
          ${I}
        </svg>
      </div>
    `}renderVerdict(t){return`
      <div class="verdict">
        <div class="verdict-label">Nuestro veredicto</div>
        <div class="verdict-option">${t.opcion}</div>
        <div class="verdict-text">${t.texto}</div>
      </div>
    `}renderWhy(t){return`
      <div class="why-section">
        <button class="why-toggle" data-toggle="why">
          <span class="arrow">&#9654;</span> ¿Por qué? — Explicación matemática detallada
        </button>
        <div class="why-content" data-content="why">
          ${(Array.isArray(t)?t:[t]).map(e=>`<p>${e}</p>`).join("")}
        </div>
      </div>
    `}setupWhyToggle(){const t=this.$('[data-toggle="why"]'),a=this.$('[data-content="why"]');t&&a&&t.addEventListener("click",()=>{t.classList.toggle("open"),a.classList.toggle("open")})}}function Ta({precioVivienda:r,alquilerMensual:t,ahorroDisponible:a,anosHorizonte:e,revalorizacionAnual:i=.02,euribor:o=.035,diferencialHipoteca:n=.01,anosHipoteca:s=30,gastosCompra:c=.1,ibi:l=.005,mantenimientoAnual:u=.01,seguroHogar:d=600,comunidad:p=100,incrementoAlquilerAnual:m=.03,rentabilidadInversion:h=.06}){const v=o+n,f=r*.2,b=Math.max(a,f),g=r*c,y=r-b,$=v/12,x=s*12,I=y*($*Math.pow(1+$,x))/(Math.pow(1+$,x)-1),w=[10,20,30].filter(M=>M<=Math.max(e,30));!w.includes(e)&&e<=30&&(w.push(e),w.sort((M,z)=>M-z));const A=Math.max(...w)*12;let L=b+g,W=0,D=y,ot=r,it=a,vt=0,Xt=t;const k=[];for(let M=1;M<=A;M++){const z=Math.ceil(M/12);let T=0;if(D>0&&M<=x){const Qa=D*$,Xa=I-Qa;D=Math.max(0,D-Xa),T+=I}T+=r*l/12,T+=r*u/12,T+=d/12,T+=p,L+=T,M%12===0&&(ot*=1+i);const Ja=ot-D;M%12===1&&M>1&&(Xt*=1+m);const ft=Xt;W+=ft;const Kt=T-ft;Kt>0&&(vt+=Kt);const ta=Math.pow(1+h,1/12)-1;it*=1+ta,vt*=1+ta;const Za=it+vt;M%12===0&&k.push({ano:z,patrimonioCompra:Ja,patrimonioAlquiler:Za,costeCompra:L,costeAlquiler:W,cuotaCompra:T,cuotaAlquiler:ft})}let Y=null;for(let M=0;M<k.length;M++){const z=k[M];if(z.patrimonioCompra>z.patrimonioAlquiler){Y=z.ano;break}}const Wa=w.map(M=>{const z=M-1;if(z>=k.length)return null;const T=k[z];return{anos:M,patrimonioCompra:T.patrimonioCompra,patrimonioAlquiler:T.patrimonioAlquiler,costeCompra:T.costeCompra,costeAlquiler:T.costeAlquiler,mejorOpcion:T.patrimonioCompra>T.patrimonioAlquiler?"COMPRAR":"ALQUILAR",diferencia:Math.abs(T.patrimonioCompra-T.patrimonioAlquiler)}}).filter(Boolean),Ya=Math.min(e,k.length)-1,J=k[Ya];let nt;if(!J)nt={opcion:"ALQUILAR",texto:"No hay suficientes datos para el horizonte indicado."};else if(J.patrimonioCompra>J.patrimonioAlquiler){const M=J.patrimonioCompra-J.patrimonioAlquiler;nt={opcion:"COMPRAR",texto:Y?`Con estos números, COMPRAR te sale mejor a partir del año ${Y}. En ${e} años acumulas ${U(M)} más de patrimonio comprando.`:`Con estos números, COMPRAR es mejor. En ${e} años acumulas ${U(M)} más de patrimonio.`}}else{const M=J.patrimonioAlquiler-J.patrimonioCompra;nt={opcion:"ALQUILAR",texto:Y?`Con estos números, ALQUILAR es mejor hasta el año ${Y}. En ${e} años, alquilar e invertir te deja ${U(M)} más de patrimonio.`:`Con estos números, ALQUILAR e invertir la diferencia te deja ${U(M)} más de patrimonio en ${e} años.`}}return{cuotaMensualHipoteca:I,entrada:b,gastosIniciales:g,importeHipoteca:y,puntoCruce:Y,resumenes:Wa,datosAnuales:k,veredicto:nt,explicacion:Ia({entrada:b,gastosIniciales:g,cuotaMensual:I,alquilerMensual:t,tipoHipoteca:v,rentabilidadInversion:h,revalorizacionAnual:i,puntoCruce:Y,anosHorizonte:e})}}function Ia({entrada:r,gastosIniciales:t,cuotaMensual:a,alquilerMensual:e,tipoHipoteca:i,rentabilidadInversion:o,revalorizacionAnual:n,puntoCruce:s,anosHorizonte:c}){return[`La entrada + gastos iniciales suman ${U(r+t)}. Ese dinero, si no compras, se invierte al ${(o*100).toFixed(1)}% anual.`,`La cuota hipotecaria es ${U(a)}/mes al ${(i*100).toFixed(2)}% (Euríbor + diferencial). El alquiler empieza en ${U(e)}/mes.`,`La vivienda se revaloriza al ${(n*100).toFixed(1)}% anual. La diferencia mensual entre cuota e alquiler se invierte.`,s?`El punto de cruce donde comprar supera a alquilar es el año ${s}.`:`En el horizonte de ${c} años, no se alcanza un punto de cruce.`,"Estos cálculos no incluyen deducciones fiscales por vivienda habitual ni posibles subidas del Euríbor."]}function U(r){return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(r)}class Pa extends at{render(){return`
      <div class="card">
        <div class="title">Comprar vs Alquilar</div>
        <div class="subtitle">Compara el coste real y patrimonio acumulado de ambas opciones</div>

        <div class="form-grid">
          <div class="form-group">
            <label for="precioVivienda">Precio de la vivienda (€)</label>
            <input type="number" id="precioVivienda" value="250000" min="0" step="1000">
          </div>
          <div class="form-group">
            <label for="alquilerMensual">Alquiler mensual (€)</label>
            <input type="number" id="alquilerMensual" value="900" min="0" step="50">
          </div>
          <div class="form-group">
            <label for="ahorroDisponible">Ahorro disponible (€)</label>
            <input type="number" id="ahorroDisponible" value="50000" min="0" step="1000">
          </div>
          <div class="form-group">
            <label for="anosHorizonte">Horizonte temporal (años)</label>
            <input type="number" id="anosHorizonte" value="20" min="1" max="30" step="1">
          </div>
          <div class="form-group">
            <label for="revalorizacionAnual">Revalorización anual (%)</label>
            <input type="number" id="revalorizacionAnual" value="2" min="0" max="20" step="0.1">
          </div>
          <div class="form-group">
            <label for="euribor">Euríbor (%)</label>
            <input type="number" id="euribor" value="3.5" min="0" max="15" step="0.1">
          </div>
        </div>

        <button class="btn btn-primary" id="btnComparar">Comparar</button>

        <div class="results" id="results"></div>
      </div>
    `}setupListeners(){this.$("#btnComparar").addEventListener("click",()=>this.calcular())}calcular(){const t=this.getVal("precioVivienda"),a=this.getVal("alquilerMensual"),e=this.getVal("ahorroDisponible"),i=this.getVal("anosHorizonte"),o=this.getVal("revalorizacionAnual")/100,n=this.getVal("euribor")/100,s=Ta({precioVivienda:t,alquilerMensual:a,ahorroDisponible:e,anosHorizonte:i,revalorizacionAnual:o,euribor:n}),c=Math.min(i,s.datosAnuales.length)-1,l=s.datosAnuales[c];s.resumenes.find(d=>d.anos===i)||s.resumenes[s.resumenes.length-1];const u=this.$("#results");u.innerHTML=`
      <div class="comparison">
        <div class="option-card option-a">
          <div class="option-header">Comprar</div>
          <div class="option-value">${this.formatEur(l.patrimonioCompra)}</div>
          <div class="option-label">Patrimonio en ${i} años</div>
          <div class="stat-row">
            <span class="stat-label">Cuota hipoteca</span>
            <span class="stat-value">${this.formatEur(s.cuotaMensualHipoteca)}/mes</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Entrada + gastos</span>
            <span class="stat-value">${this.formatEur(s.entrada+s.gastosIniciales)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Coste total acumulado</span>
            <span class="stat-value">${this.formatEur(l.costeCompra)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Cuota mes ${i*12}</span>
            <span class="stat-value">${this.formatEur(l.cuotaCompra)}/mes</span>
          </div>
        </div>

        <div class="option-card option-b">
          <div class="option-header">Alquilar</div>
          <div class="option-value">${this.formatEur(l.patrimonioAlquiler)}</div>
          <div class="option-label">Patrimonio en ${i} años</div>
          <div class="stat-row">
            <span class="stat-label">Alquiler inicial</span>
            <span class="stat-value">${this.formatEur(a)}/mes</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Ahorro invertido</span>
            <span class="stat-value">${this.formatEur(e)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Coste total acumulado</span>
            <span class="stat-value">${this.formatEur(l.costeAlquiler)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Alquiler mes ${i*12}</span>
            <span class="stat-value">${this.formatEur(l.cuotaAlquiler)}/mes</span>
          </div>
        </div>
      </div>

      ${this.renderLineChart({series:[{name:"Patrimonio Comprar",data:s.datosAnuales.map(d=>d.patrimonioCompra)},{name:"Patrimonio Alquilar",data:s.datosAnuales.map(d=>d.patrimonioAlquiler)}],labels:s.datosAnuales.map(d=>`Año ${d.ano}`),title:"Evolución del patrimonio neto"})}

      ${this.renderVerdict(s.veredicto)}

      ${this.renderWhy(s.explicacion)}
    `,u.classList.add("visible"),this.setupWhyToggle()}}customElements.define("calc-comprar-vs-alquilar",Pa);function La({importeHipoteca:r,anosHipoteca:t,tipoFijo:a,euriborActual:e,diferencialVariable:i}){const o=t*12,n=Yt(r,a/12,o),s=n*o,l=[{nombre:"Euríbor sube",trayectoria:mt(e,.005,t)},{nombre:"Euríbor estable",trayectoria:mt(e,0,t)},{nombre:"Euríbor baja",trayectoria:mt(e,-.003,t)}].map(y=>Fa(r,o,y.trayectoria,i,y.nombre)),u=[];for(let y=1;y<=t;y++){const $={ano:y,costeFijo:n*y*12};l.forEach(x=>{$[`coste_${x.nombre}`]=x.costeAcumuladoAnual[y-1],$[`cuota_${x.nombre}`]=x.cuotasAnuales[y-1]}),u.push($)}const d=l.find(y=>y.nombre==="Euríbor estable"),p=l.find(y=>y.nombre==="Euríbor sube"),m=l.find(y=>y.nombre==="Euríbor baja"),h=d.costeTotal-s,v=p.costeTotal-s,f=p.cuotaMaxima-n;let b,g;if(h>0&&v>0)b="FIJO",g=`El tipo fijo te sale más barato incluso con Euríbor estable. Te ahorras ${R(Math.abs(h))} y evitas el riesgo de subidas donde perderías ${R(v)}.`;else if(h<0&&v<0)b="VARIABLE",g=`El variable te ahorra ${R(Math.abs(h))} con Euríbor estable. Incluso si sube, pagas ${R(Math.abs(v))} menos en total. Ventaja clara.`;else{const y=Math.abs(h),$=Math.abs(v);$>y*2?(b="FIJO",g=`El fijo te cuesta ${R(y)} más si el Euríbor se mantiene, pero te protege de subidas donde perderías ${R($)}. La cuota variable podría subir ${R(f)}/mes. Recomendamos FIJO por seguridad.`):(b="VARIABLE",g=`El variable te ahorra ${R(y)} si el Euríbor se mantiene. El riesgo de subida es de ${R($)} en el peor caso. La diferencia de cuota máxima es ${R(f)}/mes. Si puedes absorber esa subida, el VARIABLE tiene mejor expectativa.`)}return{cuotaFija:n,costeTotalFijo:s,tipoFijo:a,resultadosVariable:l,datosAnuales:u,veredicto:{opcion:b,texto:g},explicacion:[`Hipoteca de ${R(r)} a ${t} años.`,`Tipo fijo: ${(a*100).toFixed(2)}% → cuota fija de ${R(n)}/mes. Coste total: ${R(s)}.`,`Variable: Euríbor ${(e*100).toFixed(2)}% + diferencial ${(i*100).toFixed(2)}% = ${((e+i)*100).toFixed(2)}% inicial.`,`Escenario sube: Euríbor sube ~0.5% anual. Cuota máxima: ${R(p.cuotaMaxima)}/mes. Coste total: ${R(p.costeTotal)}.`,`Escenario estable: Euríbor se mantiene. Coste total: ${R(d.costeTotal)}.`,`Escenario baja: Euríbor baja ~0.3% anual. Coste total: ${R(m.costeTotal)}.`]}}function Yt(r,t,a){return t===0?r/a:r*(t*Math.pow(1+t,a))/(Math.pow(1+t,a)-1)}function mt(r,t,a){const e=[];for(let i=0;i<a;i++){const o=Math.max(0,r+t*i);e.push(o)}return e}function Fa(r,t,a,e,i){let o=r,n=0,s=0;const c=[],l=[];let u=0;for(let d=0;d<t;d++){const p=Math.floor(d/12),v=(a[Math.min(p,a.length-1)]+e)/12,f=t-d,b=Yt(o,v,f),g=o*v,y=b-g;o=Math.max(0,o-y),n+=b,u+=b,s=Math.max(s,b),(d+1)%12===0&&(c.push(b),l.push(u))}return{nombre:i,costeTotal:n,cuotaMaxima:s,cuotasAnuales:c,costeAcumuladoAnual:l}}function R(r){return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(r)}class Sa extends at{render(){return`
      <div class="card">
        <div class="title">Hipoteca: Tipo Fijo vs Variable</div>
        <div class="subtitle">Compara cuotas y coste total en 3 escenarios de Euríbor</div>

        <div class="form-grid">
          <div class="form-group">
            <label for="importeHipoteca">Importe de la hipoteca (€)</label>
            <input type="number" id="importeHipoteca" value="200000" min="0" step="1000">
          </div>
          <div class="form-group">
            <label for="anosHipoteca">Plazo (años)</label>
            <input type="number" id="anosHipoteca" value="25" min="1" max="40">
          </div>
          <div class="form-group">
            <label for="tipoFijo">Tipo fijo ofrecido (%)</label>
            <input type="number" id="tipoFijo" value="2.5" min="0" step="0.01">
          </div>
          <div class="form-group">
            <label for="euriborActual">Euríbor actual (%)</label>
            <input type="number" id="euriborActual" value="3.5" min="0" step="0.01">
          </div>
          <div class="form-group">
            <label for="diferencialVariable">Diferencial variable (%)</label>
            <input type="number" id="diferencialVariable" value="0.80" min="0" step="0.01">
          </div>
        </div>

        <button class="btn btn-primary" id="btnComparar">Comparar</button>

        <div class="results" id="resultados"></div>
      </div>
    `}setupListeners(){this.$("#btnComparar").addEventListener("click",()=>{const t={importeHipoteca:this.getVal("importeHipoteca"),anosHipoteca:this.getVal("anosHipoteca"),tipoFijo:this.getVal("tipoFijo")/100,euriborActual:this.getVal("euriborActual")/100,diferencialVariable:this.getVal("diferencialVariable")/100},a=La(t);this.showResults(a,t.anosHipoteca)})}showResults(t,a){const e=this.$("#resultados"),i=t.resultadosVariable.map(d=>`
      <div class="stat-row">
        <span class="stat-label">${d.nombre}</span>
        <span class="stat-value">${this.formatEurDec(d.cuotasAnuales[0])}/mes</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">&nbsp;&nbsp;Cuota máxima</span>
        <span class="stat-value">${this.formatEurDec(d.cuotaMaxima)}/mes</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">&nbsp;&nbsp;Coste total</span>
        <span class="stat-value">${this.formatEur(d.costeTotal)}</span>
      </div>
    `).join(""),o=`
      <div class="comparison">
        <div class="option-card option-a">
          <div class="option-header">Tipo Fijo</div>
          <div class="option-value">${this.formatEurDec(t.cuotaFija)}</div>
          <div class="option-label">cuota mensual fija</div>
          <div class="stat-row">
            <span class="stat-label">Tipo de interés</span>
            <span class="stat-value">${(t.tipoFijo*100).toFixed(2)}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Coste total</span>
            <span class="stat-value">${this.formatEur(t.costeTotalFijo)}</span>
          </div>
        </div>
        <div class="option-card option-b">
          <div class="option-header">Tipo Variable</div>
          <div class="option-value">${this.formatEurDec(t.resultadosVariable[1].cuotasAnuales[0])}</div>
          <div class="option-label">cuota inicial (Euríbor estable)</div>
          ${i}
        </div>
      </div>
    `,n=t.datosAnuales.map(d=>`Año ${d.ano}`),s=[{name:"Fijo",data:t.datosAnuales.map(d=>d.costeFijo)},...t.resultadosVariable.map(d=>({name:d.nombre,data:t.datosAnuales.map(p=>p[`coste_${d.nombre}`])}))],c=this.renderLineChart({series:s,labels:n,title:"Coste acumulado a lo largo de los años"}),l=this.renderVerdict(t.veredicto),u=this.renderWhy(t.explicacion);e.innerHTML=o+c+l+u,e.classList.add("visible"),this.setupWhyToggle()}}customElements.define("calc-fijo-vs-variable",Sa);function ja({deudaPendiente:r,tipoInteres:t,anosRestantes:a,cantidadExtra:e,rentabilidadEsperada:i=.07,deduccionFiscal:o=!1,tipoMarginalIRPF:n=.3,maxDeduccion:s=9040}){const c=a*12,l=t/12,u=za(r,l,c),d=Jt(r,l,c,e,u);let p=0;o&&(p=Math.min(e,s)*.15);const m=Va(e,i,a),h=m.valorFinal-e,v=ht(h),f=m.valorFinal-v,b=d.ahorroIntereses+p*a,g=f-e;let y=Na(r,l,c,e,u,a);const $=[];let x=0;for(let A=1;A<=a;A++){x=e*Math.pow(1+i,A);const L=x-e,W=ht(L);$.push({ano:A,beneficioAmortizar:d.ahorroInteresesAnual[A-1]||d.ahorroIntereses,beneficioInvertir:x-W-e,valorInversion:x-W})}let I,w;if(g>b){const A=g-b;I="INVERTIR",w=`Matemáticamente, invertir te genera ${P(A)} más que amortizar. Pero recuerda: amortizar es rentabilidad segura al ${(t*100).toFixed(2)}%, invertir tiene riesgo.`}else{const A=b-g;I="AMORTIZAR",w=`Amortizar te ahorra ${P(A)} más que invertir al ${(i*100).toFixed(1)}% esperado. Además, es riesgo cero: reduces deuda garantizadamente.`}return{cuotaActual:u,amortizacion:{ahorroIntereses:d.ahorroIntereses,mesesAhorrados:d.mesesAhorrados,nuevoPlazo:d.nuevosPlazoMeses,ahorroFiscal:p*a},inversion:{valorFinal:m.valorFinal,impuestos:v,valorNeto:f,gananciaReal:g},rentabilidadEquilibrio:y,datosAnuales:$,veredicto:{opcion:I,texto:w},explicacion:[`Deuda: ${P(r)} al ${(t*100).toFixed(2)}%, quedan ${a} años. Cuota: ${P(u)}/mes.`,`Amortizar ${P(e)} te ahorra ${P(d.ahorroIntereses)} en intereses y ${d.mesesAhorrados} meses de hipoteca.`,`Invertir ${P(e)} al ${(i*100).toFixed(1)}% anual genera ${P(m.valorFinal)} brutos en ${a} años.`,`Tras impuestos sobre ganancias (19-23%), te quedan ${P(f)} netos. Ganancia real: ${P(g)}.`,`Punto de equilibrio: necesitas una rentabilidad > ${(y*100).toFixed(2)}% anual para que invertir supere a amortizar.`,o?`Con deducción por vivienda habitual (pre-2013), amortizar tiene un ahorro fiscal extra de ${P(p)}/año.`:"No aplica deducción fiscal por vivienda habitual."]}}function za(r,t,a){return t===0?r/a:r*(t*Math.pow(1+t,a))/(Math.pow(1+t,a)-1)}function Jt(r,t,a,e,i){const o=r-e;if(o<=0)return{ahorroIntereses:i*a-r,mesesAhorrados:a,nuevosPlazoMeses:0,ahorroInteresesAnual:[]};let n=o,s=0,c=0;const l=[];let u=0;for(;n>0&&s<a;){const h=n*t,v=i-h;if(v<=0)break;n=Math.max(0,n-v),c+=h,u+=h,s++,s%12===0&&(l.push(u),u=0)}let d=r,p=0;for(let h=0;h<a;h++){const v=d*t,f=i-v;d=Math.max(0,d-f),p+=v}const m=[];for(let h=0;h<l.length;h++)m.push(Math.max(0,p-c)*((h+1)/Math.ceil(s/12)));return{ahorroIntereses:p-c,mesesAhorrados:a-s,nuevosPlazoMeses:s,ahorroInteresesAnual:m}}function Va(r,t,a){return{valorFinal:r*Math.pow(1+t,a)}}function ht(r){if(r<=0)return 0;let t=0;const a=[{hasta:6e3,tipo:.19},{hasta:5e4,tipo:.21},{hasta:2e5,tipo:.23},{hasta:3e5,tipo:.27},{hasta:1/0,tipo:.28}];let e=r,i=0;for(const o of a){const n=Math.min(e,o.hasta-i);if(t+=n*o.tipo,e-=n,i+=n,e<=0)break}return t}function Na(r,t,a,e,i,o){const s=Jt(r,t,a,e,i).ahorroIntereses+e;let c=0,l=.3;for(let u=0;u<50;u++){const d=(c+l)/2,p=e*Math.pow(1+d,o),m=p-e,h=ht(m);p-h<s?c=d:l=d}return(c+l)/2}function P(r){return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(r)}class Ba extends at{render(){return`
      <div class="card">
        <div class="title">Amortizar hipoteca vs Invertir</div>
        <div class="subtitle">Descubre qué te conviene más con tu dinero extra</div>

        <div class="form-grid">
          <div class="form-group">
            <label for="deudaPendiente">Deuda pendiente (€)</label>
            <input type="number" id="deudaPendiente" value="150000" min="0" step="1000">
          </div>
          <div class="form-group">
            <label for="tipoInteres">Tipo de interés (%)</label>
            <input type="number" id="tipoInteres" value="2.5" min="0" step="0.1">
          </div>
          <div class="form-group">
            <label for="anosRestantes">Años restantes</label>
            <input type="number" id="anosRestantes" value="20" min="1" step="1">
          </div>
          <div class="form-group">
            <label for="cantidadExtra">Cantidad extra (€)</label>
            <input type="number" id="cantidadExtra" value="20000" min="0" step="1000">
          </div>
          <div class="form-group">
            <label for="rentabilidadEsperada">Rentabilidad esperada (%)</label>
            <input type="number" id="rentabilidadEsperada" value="7" min="0" step="0.1">
          </div>
          <div class="form-group" style="justify-content: flex-end;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="deduccionFiscal">
              Deducción vivienda habitual (compra pre-2013)
            </label>
          </div>
        </div>

        <button class="btn btn-primary" id="btnComparar">Comparar</button>

        <div class="results" id="results"></div>
      </div>
    `}setupListeners(){this.$("#btnComparar").addEventListener("click",()=>{const t=this.getVal("deudaPendiente"),a=this.getVal("tipoInteres")/100,e=this.getVal("anosRestantes"),i=this.getVal("cantidadExtra"),o=this.getVal("rentabilidadEsperada")/100,n=this.$("#deduccionFiscal").checked,s=ja({deudaPendiente:t,tipoInteres:a,anosRestantes:e,cantidadExtra:i,rentabilidadEsperada:o,deduccionFiscal:n}),c=this.$("#results");c.classList.add("visible");const l=Math.floor(s.amortizacion.nuevoPlazo/12),u=s.amortizacion.nuevoPlazo%12,d=l>0?`${l} años${u>0?` y ${u} meses`:""}`:`${u} meses`,p=s.datosAnuales.map(h=>`Año ${h.ano}`),m=this.renderLineChart({series:[{name:"Beneficio amortizar",data:s.datosAnuales.map(h=>h.beneficioAmortizar)},{name:"Beneficio invertir",data:s.datosAnuales.map(h=>h.beneficioInvertir)}],labels:p,title:"Beneficio acumulado a lo largo del tiempo"});c.innerHTML=`
        <div class="comparison">
          <div class="option-card option-a">
            <div class="option-header">Amortizar</div>
            <div class="option-value">${this.formatEur(s.amortizacion.ahorroIntereses)}</div>
            <div class="option-label">Ahorro en intereses</div>
            <div class="stat-row">
              <span class="stat-label">Meses ahorrados</span>
              <span class="stat-value">${s.amortizacion.mesesAhorrados} meses</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Nuevo plazo</span>
              <span class="stat-value">${d}</span>
            </div>
            ${s.amortizacion.ahorroFiscal>0?`
            <div class="stat-row">
              <span class="stat-label">Ahorro fiscal</span>
              <span class="stat-value">${this.formatEur(s.amortizacion.ahorroFiscal)}</span>
            </div>`:""}
          </div>

          <div class="option-card option-b">
            <div class="option-header">Invertir</div>
            <div class="option-value">${this.formatEur(s.inversion.gananciaReal)}</div>
            <div class="option-label">Ganancia neta de inversión</div>
            <div class="stat-row">
              <span class="stat-label">Valor bruto</span>
              <span class="stat-value">${this.formatEur(s.inversion.valorFinal)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Impuestos</span>
              <span class="stat-value">-${this.formatEur(s.inversion.impuestos)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Valor neto</span>
              <span class="stat-value">${this.formatEur(s.inversion.valorNeto)}</span>
            </div>
          </div>
        </div>

        <div class="card" style="background: var(--nc-bg-subtle); border: 1px solid var(--nc-border); margin: 24px 0; padding: 16px;">
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--nc-muted); margin-bottom: 8px;">Punto de equilibrio</div>
          <div style="font-size: 1.2rem; font-weight: 700; color: var(--nc-text);">
            Rentabilidad necesaria: ${this.formatPct(s.rentabilidadEquilibrio)}
          </div>
          <div style="font-size: 0.85rem; color: var(--nc-muted); margin-top: 4px;">
            Por encima de este porcentaje, invertir supera a amortizar
          </div>
        </div>

        ${m}

        ${this.renderVerdict(s.veredicto)}

        ${this.renderWhy(s.explicacion)}
      `,this.setupWhyToggle()})}}customElements.define("calc-amortizar-vs-invertir",Ba);function Da({deudas:r,pagoExtraMensual:t}){if(!r||r.length===0)return{veredicto:{opcion:"N/A",texto:"No hay deudas para comparar."}};const a=Zt(r,t,"snowball"),e=Zt(r,t,"avalanche"),i=a.totalIntereses-e.totalIntereses,o=a.mesesTotal-e.mesesTotal;let n,s;return i>100?(n="AVALANCHE",s=`Avalanche te ahorra ${B(i)} en intereses`,o>0&&(s+=` y te libera ${o} meses antes`),s+=`. Snowball liquida la primera deuda en ${a.primeraDeudaLiquidada} meses (motivación extra). `,s+=e.totalIntereses<a.totalIntereses?"Recomendación: AVALANCHE si puedes mantener la disciplina.":""):i<-100?(n="SNOWBALL",s=`Sorpresa: Snowball te ahorra ${B(Math.abs(i))} en intereses en este caso. Además liquida la primera deuda en solo ${a.primeraDeudaLiquidada} meses para darte motivación.`):(n="AMBAS SIMILARES",s=`La diferencia es solo ${B(Math.abs(i))}. Snowball te da una victoria rápida (primera deuda en ${a.primeraDeudaLiquidada} meses), Avalanche es ${o>0?o+" meses más rápido":"igual de rápido"}. Elige la que te motive más.`),{snowball:{totalIntereses:a.totalIntereses,totalPagado:a.totalPagado,mesesTotal:a.mesesTotal,primeraDeudaLiquidada:a.primeraDeudaLiquidada,ordenPago:a.ordenPago,timeline:a.timeline},avalanche:{totalIntereses:e.totalIntereses,totalPagado:e.totalPagado,mesesTotal:e.mesesTotal,primeraDeudaLiquidada:e.primeraDeudaLiquidada,ordenPago:e.ordenPago,timeline:e.timeline},datosAnuales:ka(a,e),veredicto:{opcion:n,texto:s},explicacion:[`Tienes ${r.length} deudas con un saldo total de ${B(r.reduce((c,l)=>c+l.saldo,0))}.`,`Pagas ${B(r.reduce((c,l)=>c+l.cuotaMinima,0))}/mes en cuotas mínimas + ${B(t)} extra.`,`SNOWBALL: paga primero la deuda más pequeña. Orden: ${a.ordenPago.join(" → ")}.`,`AVALANCHE: paga primero la deuda con más interés. Orden: ${e.ordenPago.join(" → ")}.`,`Snowball: ${a.mesesTotal} meses, ${B(a.totalIntereses)} en intereses.`,`Avalanche: ${e.mesesTotal} meses, ${B(e.totalIntereses)} en intereses.`]}}function Zt(r,t,a){let e=r.map(m=>({...m,saldoActual:m.saldo}));const i=()=>{const m=e.filter(h=>h.saldoActual>0);return a==="snowball"?m.sort((h,v)=>h.saldoActual-v.saldoActual):m.sort((h,v)=>v.tipoInteres-h.tipoInteres),m},o=i().map(m=>m.nombre);let n=0,s=0,c=0,l=null;const u=[],d=[],p=600;for(;e.some(m=>m.saldoActual>0)&&n<p;){n++;let m=t;for(const v of e){if(v.saldoActual<=0)continue;const f=v.saldoActual*(v.tipoInteres/12);v.saldoActual+=f,s+=f}for(const v of e){if(v.saldoActual<=0)continue;const f=Math.min(v.cuotaMinima,v.saldoActual);v.saldoActual-=f,c+=f}const h=i();for(const v of h){if(v.saldoActual<=0||m<=0)continue;const f=Math.min(m,v.saldoActual);v.saldoActual-=f,m-=f,c+=f}for(const v of e)v.saldoActual<=0&&!d.find(f=>f.nombre===v.nombre)&&(d.push({mes:n,nombre:v.nombre}),l||(l=n));(n%3===0||!e.some(v=>v.saldoActual>0))&&u.push({mes:n,deudas:e.map(v=>({nombre:v.nombre,saldo:Math.max(0,v.saldoActual)})),totalRestante:e.reduce((v,f)=>v+Math.max(0,f.saldoActual),0)})}return{totalIntereses:s,totalPagado:c,mesesTotal:n,primeraDeudaLiquidada:l||n,ordenPago:o,liquidaciones:d,timeline:u}}function ka(r,t){var e;const a=[];for(let i=0;i<r.timeline.length&&i<t.timeline.length;i++)a.push({mes:r.timeline[i].mes,restanteSnowball:r.timeline[i].totalRestante,restanteAvalanche:((e=t.timeline[i])==null?void 0:e.totalRestante)||0});return a}function B(r){return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(r)}const qa=[{nombre:"Tarjeta VISA",saldo:3e3,tipoInteres:22,cuotaMinima:60},{nombre:"Préstamo coche",saldo:8e3,tipoInteres:7,cuotaMinima:200},{nombre:"Préstamo personal",saldo:5e3,tipoInteres:12,cuotaMinima:150}];class Ha extends at{render(){return`
      <div class="card">
        <div class="title">Snowball vs Avalanche</div>
        <div class="subtitle">Compara las dos estrategias más populares para liquidar deudas y descubre cuál te conviene más.</div>

        <div class="debts-section">
          <label style="display:block; margin-bottom:8px;">Tus deudas</label>
          <div id="debt-list">
            ${qa.map((a,e)=>this._debtRowHTML(e,a)).join("")}
          </div>
          <button class="btn" id="btn-add-debt" style="margin-top:8px; padding:8px 16px; font-size:0.85rem; background:var(--nc-bg-subtle); color:var(--nc-primary); border:1px solid var(--nc-border);">
            + Añadir deuda
          </button>
        </div>

        <div class="form-grid" style="margin-top:24px;">
          <div class="form-group">
            <label for="pagoExtraMensual">Pago extra mensual</label>
            <input type="number" id="pagoExtraMensual" value="300" min="0" step="50">
          </div>
        </div>

        <button class="btn btn-primary" id="btn-calc" style="width:100%;">Comparar</button>

        <div class="results" id="results"></div>
      </div>
    `}_debtRowHTML(t,a={}){const{nombre:e="",saldo:i="",tipoInteres:o="",cuotaMinima:n=""}=a;return`
      <div class="debt-row form-grid" style="margin-bottom:8px; align-items:end;" data-index="${t}">
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" class="debt-nombre" value="${e}" placeholder="Nombre de la deuda">
        </div>
        <div class="form-group">
          <label>Saldo</label>
          <input type="number" class="debt-saldo" value="${i}" min="0" step="100" placeholder="0">
        </div>
        <div class="form-group">
          <label>Tipo interés (%)</label>
          <input type="number" class="debt-interes" value="${o}" min="0" step="0.1" placeholder="0">
        </div>
        <div class="form-group">
          <label>Cuota mínima</label>
          <input type="number" class="debt-cuota" value="${n}" min="0" step="10" placeholder="0">
        </div>
      </div>
    `}setupListeners(){this.$("#btn-add-debt").addEventListener("click",()=>{const t=this.$("#debt-list"),a=this.$$(".debt-row").length,e=document.createElement("div");e.innerHTML=this._debtRowHTML(a),t.appendChild(e.firstElementChild)}),this.$("#btn-calc").addEventListener("click",()=>this._calculate())}_readDebts(){const t=this.$$(".debt-row"),a=[];return t.forEach(e=>{const i=e.querySelector(".debt-nombre").value.trim(),o=parseFloat(e.querySelector(".debt-saldo").value)||0,n=(parseFloat(e.querySelector(".debt-interes").value)||0)/100,s=parseFloat(e.querySelector(".debt-cuota").value)||0;i&&o>0&&a.push({nombre:i,saldo:o,tipoInteres:n,cuotaMinima:s})}),a}_calculate(){const t=this._readDebts(),a=this.getVal("pagoExtraMensual");if(t.length===0){const m=this.$("#results");m.innerHTML=`
        <div class="verdict" style="background:var(--nc-warning); margin-top:24px;">
          <div class="verdict-text">Introduce al menos una deuda con nombre y saldo para comparar.</div>
        </div>
      `,m.classList.add("visible");return}const e=Da({deudas:t,pagoExtraMensual:a});if(!e.snowball){const m=this.$("#results");m.innerHTML=this.renderVerdict(e.veredicto),m.classList.add("visible");return}const{snowball:i,avalanche:o,datosAnuales:n,veredicto:s,explicacion:c}=e,l=n.map(m=>`Mes ${m.mes}`),u=this.renderLineChart({series:[{name:"Snowball",data:n.map(m=>m.restanteSnowball)},{name:"Avalanche",data:n.map(m=>m.restanteAvalanche)}],labels:l,title:"Deuda restante a lo largo del tiempo"}),d=`
      <div class="comparison">
        <div class="option-card option-a">
          <div class="option-header">Snowball</div>
          <div class="option-value">${this.formatEur(i.totalIntereses)}</div>
          <div class="option-label">Total intereses pagados</div>
          <div class="stat-row">
            <span class="stat-label">Meses hasta libre de deuda</span>
            <span class="stat-value">${i.mesesTotal}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Primera deuda liquidada</span>
            <span class="stat-value">Mes ${i.primeraDeudaLiquidada}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Orden de pago</span>
            <span class="stat-value" style="text-align:right;">${i.ordenPago.join(" → ")}</span>
          </div>
        </div>
        <div class="option-card option-b">
          <div class="option-header">Avalanche</div>
          <div class="option-value">${this.formatEur(o.totalIntereses)}</div>
          <div class="option-label">Total intereses pagados</div>
          <div class="stat-row">
            <span class="stat-label">Meses hasta libre de deuda</span>
            <span class="stat-value">${o.mesesTotal}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Primera deuda liquidada</span>
            <span class="stat-value">Mes ${o.primeraDeudaLiquidada}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Orden de pago</span>
            <span class="stat-value" style="text-align:right;">${o.ordenPago.join(" → ")}</span>
          </div>
        </div>
      </div>

      ${u}
      ${this.renderVerdict(s)}
      ${this.renderWhy(c)}
    `,p=this.$("#results");p.innerHTML=d,p.classList.add("visible"),this.setupWhyToggle()}}customElements.define("calc-snowball-vs-avalanche",Ha);function _a({aportacionAnual:r,anosHastaJubilacion:t,tipoMarginalActual:a,tipoMarginalJubilacion:e,rentabilidadAnual:i=.07,maxAportacionPension:o=1500}){const n=Ga({aportacionAnual:Math.min(r,o),anos:t,tipoMarginalActual:a,tipoMarginalJubilacion:e,rentabilidad:i}),s=Qt({aportacionAnual:r,anos:t,rentabilidad:i}),c=Math.max(0,r-o);let l=null;if(c>0){const h=Qt({aportacionAnual:c,anos:t,rentabilidad:i});l={valorBruto:n.valorBruto+h.valorBruto,impuestos:n.impuestoRescate+h.impuestoVenta,valorNeto:n.valorNeto+h.valorNeto,ahorroFiscalTotal:n.ahorroFiscalTotal}}const u=[];for(let h=1;h<=t;h++){const v=et(Math.min(r,o),i,h),f=et(r,i,h),b=Math.min(r,o)*a*h;u.push({ano:h,valorPension:v,valorFondo:f,ahorroFiscalPension:b})}const d=n.valorNeto+n.ahorroFiscalReinvertido-s.valorNeto;let p,m;return a>e+.05?(p="PLAN DE PENSIONES",m=`Tu tipo marginal baja del ${V(a)} al ${V(e)} en jubilación. `,m+=`El plan de pensiones te ahorra ${C(n.ahorroFiscalTotal)} en impuestos durante la fase de ahorro. `,m+=`Neto, el plan te deja ${C(n.valorNeto)} vs ${C(s.valorNeto)} del fondo. `,r>o&&(m+=`Aporta ${C(o)}/año al plan (máximo legal) y el resto (${C(c)}/año) a un fondo indexado.`)):a<=e?(p="FONDO INDEXADO",m=`Tu tipo marginal no baja en jubilación (${V(a)} → ${V(e)}). `,m+="El plan de pensiones desgrava ahora pero tributas igual o más al rescatar. ",m+="El fondo indexado tributa como ahorro (19-28%) en vez de como renta del trabajo. ",m+=`Neto, el fondo te deja ${C(s.valorNeto)} vs ${C(n.valorNeto)} del plan.`):d>0?(p="PLAN DE PENSIONES",m=`Por poco margen, el plan de pensiones gana: tu tipo baja del ${V(a)} al ${V(e)}. `,m+=`Ventaja neta: ${C(Math.abs(d))}. Pero la diferencia es ajustada.`,r>o&&(m+=` Combina: ${C(o)}/año al plan + ${C(c)}/año a fondo indexado.`)):(p="FONDO INDEXADO",m="Aunque el plan desgrava, la tributación al rescate como renta del trabajo reduce la ventaja. ",m+=`El fondo indexado te deja ${C(Math.abs(d))} más neto gracias a la tributación como ahorro.`),{pension:{aportacionEfectiva:Math.min(r,o),valorBruto:n.valorBruto,ahorroFiscalTotal:n.ahorroFiscalTotal,ahorroFiscalAnual:n.ahorroFiscalAnual,impuestoRescate:n.impuestoRescate,valorNeto:n.valorNeto},fondo:{aportacionEfectiva:r,valorBruto:s.valorBruto,totalAportado:s.totalAportado,ganancia:s.ganancia,impuestoVenta:s.impuestoVenta,valorNeto:s.valorNeto},mixto:l,datosAnuales:u,veredicto:{opcion:p,texto:m},explicacion:[`Aportación anual: ${C(r)}. Horizonte: ${t} años. Rentabilidad estimada: ${V(i)}.`,`PLAN DE PENSIONES: máximo deducible ${C(o)}/año. Desgrava al ${V(a)} → ahorro de ${C(n.ahorroFiscalAnual)}/año (${C(n.ahorroFiscalTotal)} total).`,`Al rescatar, tributa como renta del trabajo al ${V(e)} → impuestos de ${C(n.impuestoRescate)}. Valor neto: ${C(n.valorNeto)}.`,`FONDO INDEXADO: ${C(r)}/año sin deducción. Valor bruto: ${C(s.valorBruto)}. Ganancias: ${C(s.ganancia)}.`,`Tributación como ahorro (19-28%): ${C(s.impuestoVenta)} en impuestos. Valor neto: ${C(s.valorNeto)}.`,"Ventaja clave del fondo: los traspasos entre fondos no tributan en España (diferimiento fiscal).",r>o?"Como aportas más del máximo de pensiones, la estrategia óptima puede ser combinar ambos.":""].filter(Boolean)}}function Ga({aportacionAnual:r,anos:t,tipoMarginalActual:a,tipoMarginalJubilacion:e,rentabilidad:i}){const o=et(r,i,t),n=r*t,s=r*a,c=s*t,l=et(s,i,t),u=o*e,d=o-u;return{valorBruto:o,totalAportado:n,ahorroFiscalAnual:s,ahorroFiscalTotal:c,ahorroFiscalReinvertido:l,impuestoRescate:u,valorNeto:d}}function Qt({aportacionAnual:r,anos:t,rentabilidad:a}){const e=et(r,a,t),i=r*t,o=e-i,n=Oa(o),s=e-n;return{valorBruto:e,totalAportado:i,ganancia:o,impuestoVenta:n,valorNeto:s}}function et(r,t,a){return t===0?r*a:r*((Math.pow(1+t,a)-1)/t)*(1+t)}function Oa(r){if(r<=0)return 0;let t=0;const a=[{hasta:6e3,tipo:.19},{hasta:5e4,tipo:.21},{hasta:2e5,tipo:.23},{hasta:3e5,tipo:.27},{hasta:1/0,tipo:.28}];let e=r,i=0;for(const o of a){const n=Math.min(e,o.hasta-i);if(t+=n*o.tipo,e-=n,i+=n,e<=0)break}return t}function V(r){return(r*100).toFixed(1)+"%"}function C(r){return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(r)}class Ua extends at{render(){return`
      <div class="card">
        <div class="title">Plan de Pensiones vs Fondo Indexado</div>
        <div class="subtitle">Compara la ventaja fiscal real de cada opción para tu situación</div>

        <div class="form-grid">
          <div class="form-group">
            <label for="aportacionAnual">Aportación anual (€)</label>
            <input type="number" id="aportacionAnual" value="3000" min="0" step="100">
          </div>

          <div class="form-group">
            <label for="anosHastaJubilacion">Años hasta jubilación</label>
            <input type="number" id="anosHastaJubilacion" value="25" min="1" max="50">
          </div>

          <div class="form-group">
            <label for="tipoMarginalActual">Tipo marginal actual</label>
            <select id="tipoMarginalActual">
              <option value="0.19">19%</option>
              <option value="0.24">24%</option>
              <option value="0.30" selected>30%</option>
              <option value="0.37">37%</option>
              <option value="0.45">45%</option>
              <option value="0.47">47%</option>
            </select>
          </div>

          <div class="form-group">
            <label for="tipoMarginalJubilacion">Tipo marginal en jubilación</label>
            <select id="tipoMarginalJubilacion">
              <option value="0.19" selected>19%</option>
              <option value="0.24">24%</option>
              <option value="0.30">30%</option>
              <option value="0.37">37%</option>
              <option value="0.45">45%</option>
              <option value="0.47">47%</option>
            </select>
          </div>

          <div class="form-group">
            <label for="rentabilidadAnual">Rentabilidad anual estimada (%)</label>
            <input type="number" id="rentabilidadAnual" value="7" min="0" max="30" step="0.5">
          </div>
        </div>

        <button class="btn btn-primary" id="btnComparar">Comparar</button>

        <div class="results" id="results"></div>
      </div>
    `}setupListeners(){this.$("#btnComparar").addEventListener("click",()=>this.calcular())}calcular(){const t=this.getVal("aportacionAnual"),a=this.getVal("anosHastaJubilacion"),e=parseFloat(this.$("#tipoMarginalActual").value),i=parseFloat(this.$("#tipoMarginalJubilacion").value),o=this.getVal("rentabilidadAnual")/100,n=_a({aportacionAnual:t,anosHastaJubilacion:a,tipoMarginalActual:e,tipoMarginalJubilacion:i,rentabilidadAnual:o}),{pension:s,fondo:c,mixto:l,datosAnuales:u,veredicto:d,explicacion:p}=n,m=u.map(g=>`Año ${g.ano}`),h=this.renderLineChart({series:[{name:"Plan de Pensiones",data:u.map(g=>g.valorPension)},{name:"Fondo Indexado",data:u.map(g=>g.valorFondo)}],labels:m,title:"Valor acumulado a lo largo del tiempo"});let v="";l&&(v=`
        <div class="card" style="margin-top: 16px; background: var(--nc-bg-subtle);">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--nc-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
            Estrategia mixta recomendada
          </div>
          <div style="font-size: 0.9rem; color: var(--nc-muted); line-height: 1.6;">
            Combinando plan de pensiones (hasta el máximo legal) + fondo indexado con el exceso:
          </div>
          <div style="margin-top: 12px;">
            <div class="stat-row">
              <span class="stat-label">Valor bruto combinado</span>
              <span class="stat-value">${this.formatEur(l.valorBruto)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Impuestos totales</span>
              <span class="stat-value">${this.formatEur(l.impuestos)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Valor neto combinado</span>
              <span class="stat-value" style="color: var(--nc-success);">${this.formatEur(l.valorNeto)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Ahorro fiscal total</span>
              <span class="stat-value">${this.formatEur(l.ahorroFiscalTotal)}</span>
            </div>
          </div>
        </div>
      `);const f=`
      <div class="comparison">
        <div class="option-card option-a">
          <div class="option-header">Plan de Pensiones</div>
          <div class="option-value">${this.formatEur(s.valorNeto)}</div>
          <div class="option-label">Valor neto tras impuestos</div>
          <div class="stat-row">
            <span class="stat-label">Valor bruto</span>
            <span class="stat-value">${this.formatEur(s.valorBruto)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Impuestos al rescate</span>
            <span class="stat-value" style="color: var(--nc-danger);">-${this.formatEur(s.impuestoRescate)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Valor neto</span>
            <span class="stat-value">${this.formatEur(s.valorNeto)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Ahorro fiscal acumulado</span>
            <span class="stat-value" style="color: var(--nc-success);">${this.formatEur(s.ahorroFiscalTotal)}</span>
          </div>
        </div>

        <div class="option-card option-b">
          <div class="option-header">Fondo Indexado</div>
          <div class="option-value">${this.formatEur(c.valorNeto)}</div>
          <div class="option-label">Valor neto tras impuestos</div>
          <div class="stat-row">
            <span class="stat-label">Valor bruto</span>
            <span class="stat-value">${this.formatEur(c.valorBruto)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Impuestos sobre ganancias</span>
            <span class="stat-value" style="color: var(--nc-danger);">-${this.formatEur(c.impuestoVenta)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Valor neto</span>
            <span class="stat-value">${this.formatEur(c.valorNeto)}</span>
          </div>
        </div>
      </div>

      ${v}

      ${h}

      ${this.renderVerdict(d)}

      ${this.renderWhy(p)}
    `,b=this.$("#results");b.innerHTML=f,b.classList.add("visible"),this.setupWhyToggle()}}customElements.define("calc-pension-vs-fondo",Ua),E.CalcAutonomoVsSL=qt,E.CalcBase=F,E.CalcComparadorCCAA=Wt,E.CalcComparadorPrestamos=It,E.CalcCuotaAutonomos=Ot,E.CalcDeuda=Ft,E.CalcFireEspana=kt,E.CalcFondoEmergencia=jt,E.CalcGastosVivienda=_t,E.CalcHipoteca=Rt,E.CalcIRPF=Vt,E.CalcInflacion=Lt,E.CalcInteresCompuesto=Tt,E.CalcMetaAhorro=zt,E.CalcPension=Ht,E.CalcPlusvalia=Gt,E.CalcPresupuesto=St,E.CalcRescatePensiones=Ut,E.CalcRoi=Pt,E.CalcSueldoNeto=Nt,Object.defineProperty(E,Symbol.toStringTag,{value:"Module"})}));
