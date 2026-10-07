/* panopti.org - assets/js/how.js - generated from src/js/how.js by tools/shape.mjs; edit the source, not this file */

                                                                                const REDUCE=/*panopti*/
                                                                                '(prefers-reduced-'+/**/
                                                                                'motion: reduce)' ;const
                                        enc = new TextEncoder();                export    async function                hashParts ( parts){const
                                        bytes = parts.map((p)=>(                typeof p==='string'?enc.                encode(p):p));const all=
                                        new  Uint8Array ( bytes.                reduce((n,b)=>n+8+b./**/                length , 0));const view=
                                        new DataView(all.buffer)                ;let at=        0 ; for(                const  b of bytes){view.
                                        setBigUint64(at,BigInt(b                .length)        , true);                all.set(b,at+8);at+=8+b.
                                        length ;}const sum=await                crypto .        subtle .                digest ( 'SHA-256',all);
                                        /*tipa*/        /*ipan*/                                                        /*pano*/        /*anop*/
                                        /*nopt*/        /*opti*/                                                        /*ptip*/        /*tipa*/
                                        /*ipan*/        /*pano*/                                                        /*anop*/        /*nopt*/
                                                                                return Array . from (new
                                                                                Uint8Array (sum),(x)=>x.
                                                                                toString(16).padStart(2,
        '0' ) ).join('');}export                                                function contractId(name                                                ) {return hashParts(['',
        '',name,'grpc']);}/*op*/                                                function rail(nav){const                                                links = Array .from(nav.
        querySelectorAll(/*nop*/                                                'a[href^="#"]' ) );const                                                steps = links .map((a)=>
        document./*nop*/                        getElementById ( a.hash.        slice(1)        ));const        list =nav.querySelector(                        'ol');const mark
        = ( i )=>{links.                        forEach((a,k)=>{if(k<i)a        .dataset        . s='d';        else if(k===i)a.dataset.                        s='h';else/*no*/
        delete a.dataset                        .s;if(k===i)a./*anopti*/        /*ptip*/        /*tipa*/        setAttribute(/*ipanopt*/                        'aria-current' ,
        'step');else a./*optip*/                removeAttribute(/*tipa*/                                        'aria-current');});list.                style.setProperty('--p',
        String(i/(links.length-1                )));};const io=new/*ip*/                                        IntersectionObserver ( (                entries )=> {for(const e
        of entries){if(e./*tip*/                isIntersecting)mark(/**/                                        steps.indexOf(e.target))                ;}},{rootMargin:/*nopt*/
                                                /*optipanoptip*/                                                        /*tipanoptipan*/
                                                /*panoptipanop*/                                                        /*noptipanopti*/
                                                /*ptipanoptipa*/                                                        /*ipanoptipano*/



'-35% 0px -60% 0px' } );        for(const s of steps){if                        /*####################*/                        (s)io.observe(s);}}/*a*/        function tabs(box,motion
){const list=box./*ipa*/        querySelector(/*ipanop*/                        /*####################*/                        '[role=tablist]' );const        btns = Array .from(list.
querySelectorAll(/*nop*/        '[role=tab]'));const/**/                        /*####################*/                        panels = btns .map((b)=>        document.getElementById(
b .getAttribute(                'aria-controls')                                /*####################*/                                ) );const nodes=                Array.from(/*i*/
document./*pti*/                querySelectorAll                                /*####################*/                                ('[data-tab]'));                const  pick =(i,
focus )=> {btns.                forEach((b,k)=>{                                /*####################*/                                b .setAttribute(                'aria-selected',
String(k===i));b./*pti*/        tabIndex=k===i?0:-1;/**/                        /*####################*/                        panels[k].hidden=k!==i;}        );for(const n of nodes){
if ('tab-'+n.dataset.tab        ===btns[i].id)n./*anop*/                        /*####################*/                        setAttribute(/*noptipa*/        'aria-current' ,'true');
else  n.removeAttribute(        'aria-current');}if(/**/                        /*####################*/                        focus)btns[i].focus();};        list . addEventListener(



                                                /*taint~taint~*/                                                        'click' , (e)=>{
                                                /*int~taint~ta*/                                                        const b=e.target
                                                /*t~taint~tain*/                                                        .closest(/*opt*/
        '[role=tab]');if(b)pick(                /*taint~taint~taint~ta*/                                        btns.indexOf(b),false);}                );list.addEventListener(
        'keydown',(e)=>{const i=                /*int~taint~taint~tain*/                                        btns . indexOf(document.                activeElement );let d=0;
        if(e.key==='ArrowRight')                /*t~taint~taint~taint~*/                                        d=1;if(e.key===/*optip*/                'ArrowLeft' )d=-1;if(i<0
        || ! d)return;e.                        /*taint~taint~taint~ta*/        /*tipa*/        /*ipan*/        preventDefault();pick((i                        +d+btns.length)%
        btns.length,true                        /*int~taint~taint~tain*/        );});for        (const n        of nodes){n./*panoptip*/                        addEventListener
        ( 'click',(e)=>{                        /*t~taint~taint~taint~*/        const i=        btns   .        findIndex ( (b)=>b.id===                        'tab-'+n.dataset
        . tab );if(i<0)return;e.                                                preventDefault();pick(i,                                                false);box./*tipanopti*/
        scrollIntoView ( {block:                                                'start',behavior:motion.                                                matches?'auto':'smooth'}
        );});}list.hidden=false;                                                pick (0,false);}function                                                contracts(fig){const/**/
                                                                                pairs = Array .from(fig.
                                                                                querySelectorAll(/*ano*/
                                                                                '[data-pair]' ) ) ;const
                                        name =(s        )=>  s .                                                        /*anop*/        /*nopt*/
                                        /*opti*/        /*ptip*/                                                        /*tipa*/        /*ipan*/
                                        /*pano*/        /*anop*/                                                        /*nopt*/        /*opti*/
                                        querySelector(/*ptipan*/                /*pano*/        /*anop*/                '[data-name]')./*nopti*/
                                        textContent.trim();const                short =(        id)=>id.                slice ( 0 ,16)+'…';const
                                        served = new Map();const                linked =        Promise.                all(pairs.map(async(pair
                                        )=> { const sides=Array.                from(pair./*ptipanopti*/                querySelectorAll(/*pti*/
                                        '[data-side]' ) ) ;const                ids = await Promise.all(                sides.map((s)=>/*ptipa*/
                                        contractId ( name(s))));                sides.forEach((s,k)=>{s.                querySelector(/*ipanop*/
                                                                                '[data-hash]')./*nopti*/
                                                                                textContent=short(ids[k]
                                                                                );});pair.dataset.match=



                                                                                ids[0]===ids[1]?
                                                                                'yes':'no';/*p*/
                                                                                served.set(ids[1
                                        ],sides[1].dataset./*n*/                        handler ) ; }));                const box=fig./*panopt*/
                                        querySelector(/*optipa*/                        '[data-try]' ) ;                const input=box./*ipan*/
                                        querySelector ('input');                        const  hash=box.                querySelector(/*panopt*/
                                                /*opti*/                        '[data-try-hash]');const                out=box./*ptip*/
                                                /*tipa*/                        querySelector(/*ipanop*/                '[data-try-out]'
                                                )  ; let                        run=0;const check=async(                )=> { const mine
                                        =++run;const id=                                                                        /*nopt*/
                                        await contractId                                                                        ( input.
                                        value . trim());                                                                        /*opti*/
                                                                                await linked;if(
                                                                                mine!==run)/*p*/
                                                                                return;const who
        =served.                                                                        get ( id );hash.                                                /*nopt*/
        /*opti*/                                                                        textContent=/**/                                                short(id
        ) ; out.                                                                        textContent=who?                                                /*anop*/
                '→ links to '  +                who:/*noptipan*/                '→ no handler has '+/**/        'this id: the route '  +                        'would end here'
                ; box . dataset.                match=who?'yes':                'no';};input./*ptipano*/        addEventListener('input'                        ,check);box./**/
                hidden = false ;                check();}if(/**/                typeof document!==/*no*/        'undefined'){const/*an*/                        motion = window.
        matchMedia(REDUCE);/*p*/                        document                                                        ./*tip*/                        querySelectorAll(/*tip*/
        '[data-tabs]').forEach((                        t)=>tabs                                                        (t,/*t*/                        motion));const nav=/*o*/
        document .querySelector(                        /*anop*/                                                        /*nopt*/                        '[data-rail]' );if(nav&&
                                                        /*optipanoptip*/                                        /*tipanoptipan*/
                                                        /*panoptipanop*/                                        /*noptipanopti*/
                                                        /*ptipanoptipa*/                                        /*ipanoptipano*/



'IntersectionObserver'in        /*t~ta*/                                        /*####*/                                        window )                        rail(nav);if(window./**/
crypto && window.crypto.        /*tain*/                                        /*####*/                                        subtle){                        document./*tipanoptipa*/
querySelectorAll(/*ipa*/        /*int~*/                                        /*####*/                                        /*ipan*/                        '[data-kn]' ) . forEach(
contracts ) ; }}                        /*~taint~taint*/                                /*####*/                                        /*panoptipanop*/                /*nopt*/
/*optipanoptip*/                        /*aint~taint~t*/                                /*####*/                                        /*tipanoptipan*/                /*pano*/
/*anoptipanopt*/                        /*nt~taint~tai*/                                /*####*/                                        /*optipanoptip*/                /*tipa*/
        /*ipan*/                /*t~taint~taint~taint~*/                        /*####*/        /*####*/                                /*panoptipanop*/        /*noptipanopti*/
        /*ptip*/                /*taint~taint~taint~ta*/                        /*####*/        /*####*/                                /*tipanoptipan*/        /*panoptipanop*/
        /*nopt*/                /*int~taint~taint~tain*/                        /*####*/        /*####*/                                /*optipanoptip*/        /*tipanoptipan*/



                                                /*taint~taint~taint~ta*/                                        /*panoptipanoptipanopt*/
                                                /*int~taint~taint~tain*/                                        /*optipanoptipanoptipa*/
                                                /*t~taint~taint~taint~*/                                        /*ipanoptipanoptipanop*/
        /*noptipanopti*/                                /*aint~taint~t*/                                        /*ptipanoptipa*/                        /*ipanoptipano*/
        /*anoptipanopt*/                                /*nt~taint~tai*/                                        /*optipanoptip*/                        /*tipanoptipan*/
        /*panoptipanop*/                                /*~taint~taint*/                                        /*noptipanopti*/                        /*ptipanoptipa*/
                /*ipanoptipano*/                /*taint~taint~*/                /*anoptipanopt*/                        /*opti*/                        /*ptipanoptipanoptipan*/
                /*panoptipanop*/                /*int~taint~ta*/                /*noptipanopti*/                        /*ptip*/                        /*tipanoptipanoptipano*/
                /*anoptipanopt*/                /*t~taint~tain*/                /*optipanoptip*/                        /*tipa*/                        /*ipanoptipanoptipanop*/
        /*noptipanoptipanoptip*/                                                /*tipanoptipanoptipano*/                                                /*anop*/
        /*noptipanoptipanoptip*/                                                /*tipanoptipanoptipano*/                                                /*anop*/
        /*noptipanoptipanoptip*/                                                /*tipanoptipanoptipano*/                                                /*anop*/
                                                                                /*nopt*/
                                                                                /*opti*/
                                                                                /*ptip*/
                                        /*tipanoptipanoptipano*/                                                        /*anoptipanopt*/
                                        /*optipanoptipanoptipa*/                                                        /*ipanoptipano*/
                                        /*anoptipanoptipanopti*/                                                        /*ptipanoptipa*/
                                                /*ipanoptipano*/                /*anop*/                                        /*nopt*/
                                                /*optipanoptip*/                /*tipa*/                                        /*ipan*/
                                                /*panoptipanop*/                /*nopt*/                                        /*opti*/
                                        /*ptipanoptipa*/                                /*ipanoptipano*/                        /*anoptipanopt*/
                                        /*optipanoptip*/                                /*tipanoptipan*/                        /*panoptipanop*/
                                        /*noptipanopti*/                                /*ptipanoptipa*/                        /*ipanoptipano*/
                                                                                        /*anoptipanopt*/
                                                                                        /*optipanoptip*/
                                                                                        /*tipanoptipan*/
