/* panopti.org - assets/js/flow.js - generated from src/js/flow.js by tools/shape.mjs; edit the source, not this file */

                                                                                const STEP_MS=1100;const
                                                                                HOLD_STEPS=2;const/*pa*/
                                                                                REDUCE=/*ipanoptipanop*/
                                        '(prefers-reduced-'+/**/                'motion: reduce)';/*ip*/                function  setup ( root){
                                        const  services = Array.                from(root./*tipanoptip*/                querySelectorAll(/*tip*/
                                        '[data-svc]'));const/**/                edges = Array.from(root.                querySelectorAll(/*nop*/
                                        '[data-edge]' ) ) ;const                status =        root   .                querySelector(/*noptip*/
                                        '[data-status]' ) ;const                button =        root   .                querySelector(/*tipano*/
                                        '[data-toggle]' ) ;const                sinkText        =status.                textContent ;const last=
                                        services        .length-                                                        1 ;const        steps  =
                                        last +2+        /*anop*/                                                        /*nopt*/        /*opti*/
                                        /*ptip*/        /*tipa*/                                                        /*ipan*/        /*pano*/
                                                                                HOLD_STEPS;const motion=
                                                                                window.matchMedia(REDUCE
                                                                                );let step=motion./*an*/
        matches?last+1:0;let/**/                                                playing=!motion.matches;                                                let visible=true;let/**/
        timer = 0;const render=(                                                )=>{const sink=step>last                                                ; services.forEach((el,i
        )=>{let state='idle';if(                                                i <=Math.min(step,last))                                                state ='reached';if(i===
        step)state=/*a*/                        'here';if(i===last&&sink        ) state=        'sink' ;        el.dataset.state=state;}                        );edges.forEach(
        (el,i)=>{el./**/                        dataset . state =i<step?        'on'   :        'off';})        ;status.textContent=sink                        ?sinkText:/*op*/
        /*noptipanopti*/                        'tainted value in '+/**/        services        [ step].        dataset . label ;status.                        dataset . state=
        sink ? 'sink' :'moving';                button.textContent=/*a*/                                        playing?'pause':'play';}                ; const  sync=()=>{const
        run =playing&&visible&&!                document.hidden;if(run&&                                        !timer){timer=/*ipanop*/                setInterval (()=>{step=(
        step+1)%steps;render();}                , STEP_MS);}else if(!run                                        && timer){clearInterval(                timer);timer=0;}};button
                                                ./*noptipanopt*/                                                        addEventListener
                                                ( 'click' ,()=>{                                                        playing=!playing
                                                ;render();sync()                                                        ;});if(/*optip*/



'IntersectionObserver'in        window){new/*tipanopti*/                        /*####################*/                        IntersectionObserver ( (        entries)=>{visible=/*p*/
entries[entries.length-1        ].isIntersecting;sync();                        /*####################*/                        }).observe(root);}/*no*/        document./*anoptipanop*/
addEventListener(/*nop*/        'visibilitychange',sync)                        /*####################*/                        ;motion.addEventListener        ('change',()=>{if(!/*n*/
motion .matches)                return; playing=                                /*####################*/                                false;step=last+                1;render();sync(
);});button./**/                hidden = false ;                                /*####################*/                                render();sync();                }document./*pt*/
querySelectorAll                ('[data-flow]').                                /*####################*/                                forEach (setup);                /*optipanoptip*/
/*tipanoptipanoptipano*/        /*anoptipanoptipanopti*/                        /*####################*/                        /*ptipanoptipanoptipan*/        /*panoptipanoptipanopt*/
/*optipanoptipanoptipa*/        /*ipanoptipanoptipanop*/                        /*####################*/                        /*noptipanoptipanoptip*/        /*tipanoptipanoptipano*/
/*anoptipanoptipanopti*/        /*ptipanoptipanoptipan*/                        /*####################*/                        /*panoptipanoptipanopt*/        /*optipanoptipanoptipa*/



                                                /*taint~taint~*/                                                        /*ipanoptipano*/
                                                /*int~taint~ta*/                                                        /*anoptipanopt*/
                                                /*t~taint~tain*/                                                        /*optipanoptip*/
        /*tipanoptipanoptipano*/                /*taint~taint~taint~ta*/                                        /*anoptipanoptipanopti*/                /*ptipanoptipanoptipan*/
        /*panoptipanoptipanopt*/                /*int~taint~taint~tain*/                                        /*optipanoptipanoptipa*/                /*ipanoptipanoptipanop*/
        /*noptipanoptipanoptip*/                /*t~taint~taint~taint~*/                                        /*tipanoptipanoptipano*/                /*anoptipanoptipanopti*/
        /*ptipanoptipa*/                        /*taint~taint~taint~ta*/        /*ipan*/        /*pano*/        /*anoptipanoptipanopti*/                        /*ptipanoptipa*/
        /*ipanoptipano*/                        /*int~taint~taint~tain*/        /*anop*/        /*nopt*/        /*optipanoptipanoptipa*/                        /*ipanoptipano*/
        /*anoptipanopt*/                        /*t~taint~taint~taint~*/        /*opti*/        /*ptip*/        /*tipanoptipanoptipano*/                        /*anoptipanopt*/
        /*optipanoptipanoptipa*/                                                /*ipanoptipanoptipanop*/                                                /*noptipanoptipanoptip*/
        /*tipanoptipanoptipano*/                                                /*anoptipanoptipanopti*/                                                /*ptipanoptipanoptipan*/
        /*panoptipanoptipanopt*/                                                /*optipanoptipanoptipa*/                                                /*ipanoptipanoptipanop*/
                                                                                /*noptipanoptipanoptip*/
                                                                                /*tipanoptipanoptipano*/
                                                                                /*anoptipanoptipanopti*/
                                        /*ptip*/        /*tipa*/                                                        /*ipan*/        /*pano*/
                                        /*anop*/        /*nopt*/                                                        /*opti*/        /*ptip*/
                                        /*tipa*/        /*ipan*/                                                        /*pano*/        /*anop*/
                                        /*noptipanoptipanoptip*/                /*tipa*/        /*ipan*/                /*panoptipanoptipanopt*/
                                        /*optipanoptipanoptipa*/                /*ipan*/        /*pano*/                /*anoptipanoptipanopti*/
                                        /*ptipanoptipanoptipan*/                /*pano*/        /*anop*/                /*noptipanoptipanoptip*/
                                        /*tipanoptipanoptipano*/                /*anoptipanoptipanopti*/                /*ptipanoptipanoptipan*/
                                        /*panoptipanoptipanopt*/                /*optipanoptipanoptipa*/                /*ipanoptipanoptipanop*/
                                        /*noptipanoptipanoptip*/                /*tipanoptipanoptipano*/                /*anoptipanoptipanopti*/
                                                                                /*ptipanoptipanoptipan*/
                                                                                /*panoptipanoptipanopt*/
                                                                                /*optipanoptipanoptipa*/
