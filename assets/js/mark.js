/* panopti.org - assets/js/mark.js - generated from src/js/mark.js by tools/shape.mjs; edit the source, not this file */

                                                                                const  STYLES = ['door',
                                                                                'code','tag','byte',/**/
                                                                                'folder'];const WAVE_MS=
                                        800 ;const HOLD_MS=1200;                const  HOP_MS =240;const                TICK_MS=40;const TARGETS
                                        =[195,95,245,20,160,300]                ;const HOME=5;const/*p*/                REDUCE=/*noptipanoptip*/
                                        '(prefers-reduced-'+/**/                'motion: reduce)' ;const                INNER = [['T',6,0,1,2],[
                                        'TR',10,2,0,2],['R',12,6                , 0,1],[        'BR',10,                10,0,0],['B',6,12,1,0],[
                                        'BL',2,10,2,0],['L',0,6,                2 , 1],[        'TL',2,2                , 2,2],];const CODE={T:[
                                        '##.' ,'.##','###'],TR:[                '###'  ,        '.#.'  ,                '##.' ] ,R:['#..','.##',
                                        '.##' ],        BR:[/**/                                                        '###'  ,        '##.'  ,
                                        '.#.'],B        :['##.',                                                        '###'  ,        '#..' ],
                                        BL:[/**/        '###'  ,                                                        '.##'  ,        '##.'],L
                                                                                :['#..','.##','###'],TL:
                                                                                [ '##.' ,'.#.','.##'],};
                                                                                const CODE8=Object./*o*/
        values(CODE);const TAG={                                                L:['.##','##.','.##'],R:                                                [ '##.','.##','##.'],B:[
        '..#' , '.#.' ,'#..'],};                                                const FULL=['###','###',                                                '###' ] ; const HOLLOW=[
        '###','#.#','###'];const                                                FOLDER=['##.','###',/**/                                                '###' ] ; const BITS_IN=
        '01110000';const                        BITS_MID='011011110111';        /*tipa*/        /*ipan*/        const  BITS_OUT = Array.                        from(/*panopti*/
        'panopti.org ',(                        ch )=> ch.charCodeAt(0).        toString        (2)./**/        padStart(8,'0')).join(''                        );const pixel=(x
        ,y)=>'M'+x+' '+y                        +'h1v1h-1z';const TOWER=        /*anop*/        /*nopt*/        'M10 10h3v3h-3z' ; const                        PROMPT=[[10,10],
        [11,11],[10,12],[12,12]]                .map(([x,y])=>pixel(x,y)                                        ).join('');function seed                (id){const s=Math.sin(id
        *12.9898+78.233)*/*opt*/                43758.5453;return s-Math                                        .floor(s);}function sign                ( c){return Math.abs(c)>
        0.6?Math.sign(c):0;}/**/                function  buildCells (){                                        const cells=[];const add                =(cell)=>{cell.id=cells.
                                                length ; cells .                                                        push ( cell );};
                                                INNER.forEach(([                                                        key,x,y,dx,dy],i
                                                )=> add({ring:0,                                                        key,i,x:x+4,y:y+



4,dx,dy}));for(let k=0;k        < 12;k++){const a=(k*30-                        /*####################*/                        90)*Math.PI/180;const c=        Math.cos(a);const s=Math
.sin(a);add({ring:1,key:        'O' +k,i:k,x:Math.round(                        /*####################*/                        10+10*c),y:Math.round(10        +10*s),dx:1-sign(c),dy:1
-sign(s)});}for(let k=0;        k < 20;k++){const a=((k+                        /*####################*/                        0.5)*360/20-90)*Math.PI/        180;const c=Math.cos(a);
const s=Math.sin                (a);add({ring:2,                                /*####################*/                                key:'S'+k,i:k,x:                Math.floor(10+15
* c+0.5),y:Math.                floor ( 10+15*s+                                /*####################*/                                0.5),dx:1-sign(c                ),dy:1-sign(s)})
;}for(const c of                cells ) {c.scr=(                                /*####################*/                                Math.atan2(c.y+1                -11.5,c.x+1-11.5
)*180/Math.PI+360)%360;}        return cells ; }function                        /*####################*/                        buildPlan ( cells){const        near=(a,b)=>a!==b&&Math.
abs ( a.x-b.x)<=5&&Math.        abs ( a .y-b.y)<=5;const                        /*####################*/                        next=cells.map((a)=>/**/        cells.filter((b)=>near(a
, b ) ).map((b)=>b.id));        const  prev = new Map([[                        /*####################*/                        HOME,-1]]);const queue=[        HOME];for(let q=0;q</**/



                                                /*taint~taint~*/                                                        queue.length;q++
                                                /*int~taint~ta*/                                                        ) { for(const id
                                                /*t~taint~tain*/                                                        of next[queue[q]
        ] ) { if(!prev.has(id)){                /*taint~taint~taint~ta*/                                        prev . set(id,queue[q]);                queue .push(id);}}}const
        walkTo=(to)=>{const path                /*int~taint~taint~tain*/                                        =[];for(let id=to;id!==-                1 && id !==undefined;id=
        prev.get(id))path./*an*/                /*t~taint~taint~taint~*/                                        unshift(id);return path;                };const outer=cells./**/
        filter ( (c)=>c.                        /*taint~taint~taint~ta*/        ring===2        ) ;const        routes=[];const steps=[]                        ; for (const deg
        of  TARGETS){let                        /*int~taint~taint~tain*/        best={d:        999 ,id:        outer[0].id};for(const c                        of  outer){const
        d =Math.abs(((c.                        /*t~taint~taint~taint~*/        scr-deg+        540)%360        )-180);if(d<best.d)best=                        { d , id:c.id};}
        const route=walkTo(best.                                                id);const r=routes.push(                                                route)-1;const hold=Math
        . max ( 1 ,Math.round(5/                                                route.length));for(let p                                                = 0 ;p<route.length;p++)
        for (let h=0;h<hold;h++)                                                steps . push([r,p]);for(                                                let p=route.length-2;p>=
                                                                                0;p--)for(let h=0;h<hold
                                                                                ; h++)steps.push([r,p]);
                                                                                for(let k=0;k<5;k++)/**/
                                        steps  .        push([r,                                                        0 ] ) ;}        /*anop*/
                                        /*nopt*/        /*opti*/                                                        /*ptip*/        /*tipa*/
                                        /*ipan*/        /*pano*/                                                        /*anop*/        /*nopt*/
                                        return{ routes ,steps};}                function        pattern(                c,style){if(style===/**/
                                        'code')return c.ring===0                ?CODE[c.        key  ] :                CODE8[(c.i*3+c.ring)%8];
                                        if(style==='tag'&&c.ring                === 0 &&        TAG [ c.                key ])return TAG[c.key];
                                        if ( style==='byte'){let                bit=BITS_OUT[c.id%/*pa*/                BITS_OUT . length];if(c.
                                        ring===0)bit=BITS_IN[c.i                ];if(c.ring===1)bit=/**/                BITS_MID[c.i];return bit
                                        === '1'?FULL:HOLLOW;}if(                style==='folder')/*opt*/                return FOLDER;return[0,1
                                                                                ,2].map((y)=>[0,1,2].map
                                                                                ( (x)=>(x===c.dx&&y===c.
                                                                                dy?'.':'#')).join(''));}



                                                                                function/*opti*/
                                                                                cellPath(c,rows)
                                                                                { let d='';rows.
                                        forEach ( (row,y)=>{for(                        let x=0;x<3;){if                (row[x]!=='#'){x++;/*p*/
                                        continue; } const  x0=x;                        while(x<3&&row[x                ]==='#')x++;d+='M'+(c.x+
                                        x0 )+' '+(c.y+y)+'h'+(x-                        x0)+'v1h-'+(x-x0                )+'z';}});return d;}/**/
                                                /*ipan*/                        export  function  frame(                cells ,plan,ms){
                                                /*pano*/                        const  period = WAVE_MS+                HOLD_MS  ; const
                                                styleAt=                        ( angle)=>{if(ms===null)                return'door'   ;
                                        const  n = Math.                                                                        floor ((
                                        ms -(angle/360)*                                                                        WAVE_MS)
                                        /period);/*ano*/                                                                        /*anop*/
                                                                                return STYLES[((
                                                                                n%STYLES.length)
                                                                                +STYLES.length)%
        STYLES .                                                                        length ] ; };let                                                red  = [
        HOME];if                                                                        (ms!==null){/**/                                                const[r,
        p]=plan.                                                                        steps[Math.floor                                                (  ms  /
                HOP_MS ) % plan.                steps . length];                red=plan.routes[r].slice        (0,p+1);}const out={/**/                        ring0 :'',ring1:
                '',ring2:'',red:                '',tower:''};for                (const c of cells){const        d =cellPath(c,pattern(c,                        styleAt (seed(c.
                id+7)*360)));if(                red .includes(c.                id))out.red+=d;else out[        'ring' +c.ring]+=d;}out.                        tower=styleAt(0)
        === 'code'?PROMPT:TOWER;                        /*opti*/                                                        /*ptip*/                        return out;}export/*ti*/
        function  setup (){const                        cells  =                                                        /*ptip*/                        buildCells();return{/**/
        cells , plan :buildPlan(                        cells)};                                                        }/*nop*/                        function  animate ( svg,
                                                        model){const/**/                                        layers = {};for(
                                                        const el of svg.                                        querySelectorAll
                                                        ('[data-layer]')                                        )layers[el./*i*/



dataset .layer]=el;const        /*t~ta*/                                        /*####*/                                        motion =                        window.matchMedia(REDUCE
);const toggle=svg./*p*/        /*tain*/                                        /*####*/                                        closest(                        '[data-mark-toggle]' ) ;
let elapsed=0;let last=0        /*int~*/                                        /*####*/                                        ;let/**/                        timer=0;let visible=true
;let paused=/**/                        /*~taint~taint*/                                /*####*/                                        false;const draw                =(ms)=>{
const paths=/**/                        /*aint~taint~t*/                                /*####*/                                        frame(model./**/                cells  ,
model .plan,ms);                        /*nt~taint~tai*/                                /*####*/                                        for(const key of                Object .
        keys   (                /*t~taint~taint~taint~*/                        /*####*/        /*####*/                                layers ))layers[        key]./*ptipano*/
        /*anop*/                /*taint~taint~taint~ta*/                        /*####*/        /*####*/                                setAttribute('d'        , paths[key]);};
        /*nopt*/                /*int~taint~taint~tain*/                        /*####*/        /*####*/                                const tick=()=>{        const now=/*op*/



                                                /*taint~taint~taint~ta*/                                        performance.now();/*no*/
                                                /*int~taint~taint~tain*/                                        elapsed +=now-last;last=
                                                /*t~taint~taint~taint~*/                                        now;draw(elapsed);};/**/
        const sync=()=>{                                /*aint~taint~t*/                                        const run=/*ti*/                        visible&&!paused
        &&!document./**/                                /*nt~taint~tai*/                                        hidden&&!motion.                        matches;if(run&&
        ! timer ) {last=                                /*~taint~taint*/                                        performance.now(                        );timer=/*anop*/
                setInterval(tick                /*taint~taint~*/                , TICK_MS);}else                        if (!run                        && timer){clearInterval(
                timer);timer=0;}                /*int~taint~ta*/                if(motion./*no*/                        matches)                        draw ( null);if(toggle){
                toggle.disabled=                /*t~taint~tain*/                motion .matches;                        toggle .                        setAttribute(/*anoptip*/
        'aria-pressed' , String(                                                paused ));}};if(toggle){                                                toggle .
        addEventListener('click'                                                , ( )=> {paused=!paused;                                                sync();}
        );}if(/*tipanoptipanop*/                                                'IntersectionObserver'in                                                window){
                                                                                new/*n*/
                                                                                /*pano*/
                                                                                /*anop*/
                                        IntersectionObserver ( (                                                        entries)=>{/*n*/
                                        visible=entries[entries.                                                        length-1]./*pa*/
                                        isIntersecting;sync();})                                                        . observe(svg);}
                                                document./*ipa*/                /*ipan*/                                        /*pano*/
                                                addEventListener                (/*ano*/                                        /*anop*/
                                                /*noptipanopti*/                /*ptip*/                                        /*tipa*/
                                        /*ipanoptipano*/                                /*anoptipanopt*/                        /*optipanoptip*/
                                        /*tipanoptipan*/                                /*panoptipanop*/                        /*noptipanopti*/
                                        /*ptipanoptipa*/                                /*ipanoptipano*/                        /*anoptipanopt*/
                                                                                        /*optipanoptip*/
                                                                                        /*tipanoptipan*/
                                                                                        /*panoptipanop*/



                                                                                'visibilitychange',sync)
                                                                                ;motion.addEventListener
                                                                                ('change',sync);sync();}
                                        if ( typeof  document!==                'undefined'){const svgs=                document./*noptipanopt*/
                                        querySelectorAll(/*opt*/                'svg[data-live]' ) ; if(                svgs.length){const model
                                        = setup();svgs.forEach((                svg)=>animate(svg,model)                );}}/*optipanoptipanop*/
                                        /*noptipanoptipanoptip*/                /*tipa*/        /*ipan*/                /*panoptipanoptipanopt*/
                                        /*optipanoptipanoptipa*/                /*ipan*/        /*pano*/                /*anoptipanoptipanopti*/
                                        /*ptipanoptipanoptipan*/                /*pano*/        /*anop*/                /*noptipanoptipanoptip*/
                                        /*tipa*/        /*ipan*/                                                        /*pano*/        /*anop*/
                                        /*nopt*/        /*opti*/                                                        /*ptip*/        /*tipa*/
                                        /*ipan*/        /*pano*/                                                        /*anop*/        /*nopt*/
                                                                                /*optipanoptipanoptipa*/
                                                                                /*ipanoptipanoptipanop*/
                                                                                /*noptipanoptipanoptip*/
        /*tipanoptipanoptipano*/                                                /*anoptipanoptipanopti*/                                                /*ptipanoptipanoptipan*/
        /*panoptipanoptipanopt*/                                                /*optipanoptipanoptipa*/                                                /*ipanoptipanoptipanop*/
        /*noptipanoptipanoptip*/                                                /*tipanoptipanoptipano*/                                                /*anoptipanoptipanopti*/
        /*ptipanoptipa*/                        /*ipanoptipanoptipanop*/        /*nopt*/        /*opti*/        /*ptipanoptipanoptipan*/                        /*panoptipanop*/
        /*noptipanopti*/                        /*ptipanoptipanoptipan*/        /*pano*/        /*anop*/        /*noptipanoptipanoptip*/                        /*tipanoptipan*/
        /*panoptipanop*/                        /*noptipanoptipanoptip*/        /*tipa*/        /*ipan*/        /*panoptipanoptipanopt*/                        /*optipanoptip*/
        /*tipanoptipanoptipano*/                /*anoptipanoptipanopti*/                                        /*ptipanoptipanoptipan*/                /*panoptipanoptipanopt*/
        /*optipanoptipanoptipa*/                /*ipanoptipanoptipanop*/                                        /*noptipanoptipanoptip*/                /*tipanoptipanoptipano*/
        /*anoptipanoptipanopti*/                /*ptipanoptipanoptipan*/                                        /*panoptipanoptipanopt*/                /*optipanoptipanoptipa*/
                                                /*ipanoptipano*/                                                        /*anoptipanopt*/
                                                /*optipanoptip*/                                                        /*tipanoptipan*/
                                                /*panoptipanop*/                                                        /*noptipanopti*/



/*taint~taint~taint~ta*/                /*~taint~taint*/                        /*####################*/                        /*ptipanoptipa*/                /*ipanoptipanoptipanop*/
/*int~taint~taint~tain*/                /*aint~taint~t*/                        /*####################*/                        /*noptipanopti*/                /*ptipanoptipanoptipan*/
/*t~taint~taint~taint~*/                /*nt~taint~tai*/                        /*####################*/                        /*panoptipanop*/                /*noptipanoptipanoptip*/
/*taint~taint~*/                /*t~taint~tain*/                                /*####################*/                                /*tipanoptipan*/                /*panoptipanop*/
/*int~taint~ta*/                /*taint~taint~*/                                /*####################*/                                /*noptipanopti*/                /*ptipanoptipa*/
/*t~taint~tain*/                /*int~taint~ta*/                                /*####################*/                                /*ipanoptipano*/                /*anoptipanopt*/
/*taint~taint~taint~ta*/                /*~taint~taint*/                        /*####################*/                        /*optipanoptip*/                /*tipanoptipanoptipano*/
/*int~taint~taint~tain*/                /*aint~taint~t*/                        /*####################*/                        /*anoptipanopt*/                /*optipanoptipanoptipa*/
/*t~taint~taint~taint~*/                /*nt~taint~tai*/                        /*####################*/                        /*ipanoptipano*/                /*anoptipanoptipanopti*/



                                                /*taint~taint~*/                                                        /*ptipanoptipa*/
                                                /*int~taint~ta*/                                                        /*ipanoptipano*/
                                                /*t~taint~tain*/                                                        /*anoptipanopt*/
        /*optipanoptipanoptipa*/                /*taint~taint~taint~ta*/                                        /*ipanoptipanoptipanop*/                /*noptipanoptipanoptip*/
        /*tipanoptipanoptipano*/                /*int~taint~taint~tain*/                                        /*anoptipanoptipanopti*/                /*ptipanoptipanoptipan*/
        /*panoptipanoptipanopt*/                /*t~taint~taint~taint~*/                                        /*optipanoptipanoptipa*/                /*ipanoptipanoptipanop*/
        /*noptipanopti*/                        /*taint~taint~taint~ta*/                        /*ptip*/        /*tipanoptipanoptipano*/                        /*anoptipanopt*/
        /*optipanoptip*/                        /*int~taint~taint~tain*/                        /*tipa*/        /*ipanoptipanoptipanop*/                        /*noptipanopti*/
        /*ptipanoptipa*/                        /*t~taint~taint~taint~*/                        /*ipan*/        /*panoptipanoptipanopt*/                        /*optipanoptip*/
        /*tipanoptipanoptipano*/                                                        /*anop*/                                                        /*noptipanoptipanoptip*/
        /*tipanoptipanoptipano*/                                                        /*anop*/                                                        /*noptipanoptipanoptip*/
        /*tipanoptipanoptipano*/                                                        /*anop*/                                                        /*noptipanoptipanoptip*/
                                                                                /*tipa*/
                                                                                /*ipan*/
                                                                                /*pano*/
                                        /*anop*/        /*nopt*/                                                        /*opti*/        /*ptip*/
                                        /*tipa*/        /*ipan*/                                                        /*pano*/        /*anop*/
                                        /*nopt*/        /*opti*/                                                        /*ptip*/        /*tipa*/
                                        /*ipanoptipanoptipanop*/                /*nopt*/        /*opti*/                /*ptipanoptipanoptipan*/
                                        /*panoptipanoptipanopt*/                /*opti*/        /*ptip*/                /*tipanoptipanoptipano*/
                                        /*anoptipanoptipanopti*/                /*ptip*/        /*tipa*/                /*ipanoptipanoptipanop*/
                                        /*noptipanoptipanoptip*/                /*tipanoptipanoptipano*/                /*anoptipanoptipanopti*/
                                        /*ptipanoptipanoptipan*/                /*panoptipanoptipanopt*/                /*optipanoptipanoptipa*/
                                        /*ipanoptipanoptipanop*/                /*noptipanoptipanoptip*/                /*tipanoptipanoptipano*/
                                                                                /*anoptipanoptipanopti*/
                                                                                /*ptipanoptipanoptipan*/
                                                                                /*panoptipanoptipanopt*/
