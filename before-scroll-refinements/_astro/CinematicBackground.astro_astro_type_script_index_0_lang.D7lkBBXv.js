import{D as e,E as t,O as n,S as r,T as i,a,c as o,f as s,h as c,l,n as u,o as d,s as f,w as p,x as m}from"./three.module.CRE_ywb7.js";var h=450;function g(t,n){let i=new e({vertexShader:`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,fragmentShader:`
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform float uScroll;

        // 3D Noise function for organic warping (high performance hash-based noise)
        float hash(float n) { return fract(sin(n) * 43758.5453123); }
        float noise(in vec3 x) {
            vec3 p = floor(x);
            vec3 f = fract(x);
            f = f*f*(3.0-2.0*f);
            float n = p.x + p.y*57.0 + 113.0*p.z;
            return mix(mix(mix(hash(n+  0.0), hash(n+  1.0), f.x),
                           mix(hash(n+ 57.0), hash(n+ 58.0), f.x), f.y),
                       mix(mix(hash(n+113.0), hash(n+114.0), f.x),
                           mix(hash(n+170.0), hash(n+171.0), f.x), f.y), f.z);
        }

        void main() {
            // Normalize UV coordinates
            vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
            float aspect = uResolution.x / uResolution.y;
            
            float time = uTime * 0.08; // Extremely slow, calm breathing speed
            float scroll = uScroll;
            
            // --- 1. Constant Wave Parameters (Perfect Scroll Stability) ---
            // Keep frequencies and angles constant to prevent compressing/speeding waves on scroll
            float angle1 = 0.6;
            float angle2 = -0.7;
            float angle3 = 1.2;
            
            float freq1 = 2.4;  // Higher frequency = significantly more lines on screen
            float freq2 = 3.2;
            float freq3 = 4.0;
            
            // --- 2. Coordinates Distortion (Smooth Rounded Arcs & Scroll Deformation) ---
            vec2 warpedUv = uv;
            
            // Scroll directly drives the deformation of the wave shapes!
            // As you scroll, the phase of the distortion shifts, smoothly bending the rounded lines.
            float scrollDeform = scroll * 5.0; // 5 radians of smooth sweeping deformation
            
            // Large scale, perfectly smooth sine-wave distortions for clean, even, rounded arcs
            warpedUv.x += sin(uv.y * 2.5 + time * 0.2 + scrollDeform) * 0.35;
            warpedUv.y += cos(uv.x * 2.5 - time * 0.15 - scrollDeform * 0.8) * 0.35;
            
            // Secondary clean curve to create elegant, topographical intersections
            warpedUv.x += sin(uv.y * 1.2 - time * 0.1 - scrollDeform * 1.5) * 0.25;
            warpedUv.y += cos(uv.x * 1.2 + time * 0.18 + scrollDeform * 1.2) * 0.25;
            
            // Soft global sliding shift based on scroll parallax and mouse movement
            // Keep drift multipliers tiny so scroll motion remains extremely gentle
            vec2 scrollDrift = vec2(scroll * 0.04, -scroll * 0.02);
            vec2 mouseShift = vec2(uMouse.x * aspect * 0.05, uMouse.y * 0.05);
            warpedUv += scrollDrift + mouseShift;
            
            // --- 3. Layered Wave Computations ---
            // Wave directions
            vec2 dir1 = vec2(cos(angle1), sin(angle1));
            vec2 dir2 = vec2(cos(angle2), sin(angle2));
            vec2 dir3 = vec2(cos(angle3), sin(angle3));
            
            // Layered sine wave calculations with self-warping
            float w1 = sin(dot(warpedUv, dir1) * freq1 + time * 1.0);
            float w2 = cos(dot(warpedUv, dir2) * freq2 - time * 1.4 + w1 * 0.4);
            float w3 = sin(dot(warpedUv, dir3) * freq3 + time * 1.8 + w2 * 0.5);
            
            // Combine layers into a seamless wave scalar field in [-1.0, 1.0]
            float waveField = w1 * 0.50 + w2 * 0.35 + w3 * 0.15;
            
            // --- 4. Crisp Metallic Lustre ---
            // Wide satin sheen (gives defined body to the folds without haze)
            float wideSheen = pow(max(0.0, 1.0 - abs(waveField - 0.1)), 2.5);
            
            // Crisp, thicker specular reflection (defined metallic shine, ensuring thickness with more lines)
            float crispSpecular = pow(max(0.0, 1.0 - abs(waveField - 0.15)), 8.0);
            
            // Highlight blend: crisp, defined glowing folds
            float crest = wideSheen * 0.5 + crispSpecular * 0.9;
            
            // --- 5. Scroll-Driven Color Palettes: Pure Bronze to Pure Blue ---
            // Top Palette (Scroll = 0.0): Rich Molten Bronze
            vec3 c0_shadow = vec3(0.0010, 0.0006, 0.0004); // Deepest bronze shadow
            vec3 c0_wave1  = vec3(0.085, 0.040, 0.015);    // Rich copper-bronze
            vec3 c0_wave2  = vec3(0.050, 0.022, 0.008);    // Deep bronze body
            vec3 c0_crest  = vec3(0.45, 0.30, 0.18);       // Polished bronze/gold sheen
            
            // Bottom Palette (Scroll = 1.0): Deep Sapphire Blue
            vec3 c1_shadow = vec3(0.0004, 0.0006, 0.0012); // Deepest sapphire shadow
            vec3 c1_wave1  = vec3(0.015, 0.035, 0.065);    // Rich cobalt/teal blue
            vec3 c1_wave2  = vec3(0.008, 0.020, 0.045);    // Deep sapphire body
            vec3 c1_crest  = vec3(0.18, 0.35, 0.55);       // Polished blue-steel sheen
            
            // Interpolate colors smoothly based on scroll progress
            float t = smoothstep(0.0, 1.0, scroll);
            vec3 colShadow = mix(c0_shadow, c1_shadow, t);
            vec3 colWave1  = mix(c0_wave1, c1_wave1, t);
            vec3 colWave2  = mix(c0_wave2, c1_wave2, t);
            vec3 colCrest  = mix(c0_crest, c1_crest, t);
            
            // --- 6. Final Composition ---
            // Blend wave details and wave bodies with deep shadow background
            vec3 color = colShadow;
            color = mix(color, colWave2, smoothstep(-0.6, 0.2, waveField));
            color = mix(color, colWave1, smoothstep(0.0, 0.8, waveField));
            
            // Add the soft satinated crest highlights with rich metallic multiplier
            color += colCrest * crest * 1.4;
            
            // Apply a gentle vignette to match cinematic design
            float vignette = 1.0 - dot(uv, uv) * 0.12;
            color *= vignette;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `,uniforms:n,depthWrite:!1,depthTest:!1}),a=new r(30,30),o=new c(a,i);return o.position.set(0,0,-8),o.renderOrder=-10,t.add(o),{geometry:a,material:i}}function _(){let e=document.createElement(`canvas`);e.width=16,e.height=16;let t=e.getContext(`2d`);if(!t)throw Error(`Canvas 2D unavailable`);let n=t.createRadialGradient(8,8,0,8,8,8);return n.addColorStop(0,`rgba(255, 255, 255, 1)`),n.addColorStop(.25,`rgba(255, 255, 255, 0.85)`),n.addColorStop(.6,`rgba(255, 255, 255, 0.3)`),n.addColorStop(1,`rgba(0, 0, 0, 0)`),t.fillStyle=n,t.fillRect(0,0,16,16),new f(e)}function v(e){let t=new d,n=new Float32Array(h*3),r=new Float32Array(h*3),o=[];for(let e=0;e<h;e++){let t=(Math.random()-.5)*6.5,i=(Math.random()-.5)*5-.5,a=(Math.random()-.5)*6.5;n[e*3]=t,n[e*3+1]=i,n[e*3+2]=a,Math.random()<.6?(r[e*3]=1,r[e*3+1]=.4+Math.random()*.15,r[e*3+2]=.05+Math.random()*.1):(r[e*3]=.55+Math.random()*.15,r[e*3+1]=.82+Math.random()*.12,r[e*3+2]=1),o.push({speedX:(Math.random()-.5)*.4,speedY:.15+Math.random()*.3,speedZ:(Math.random()-.5)*.4,swaySpeed:.5+Math.random()*1.5,swayRadius:.05+Math.random()*.15,phase:Math.random()*Math.PI*2})}t.setAttribute(`position`,new a(n,3)),t.setAttribute(`color`,new a(r,3));let s=_(),c=new i({size:.025,vertexColors:!0,transparent:!0,opacity:.85,blending:2,depthWrite:!1,map:s}),l=new p(t,c);return e.add(l),{particles:l,sparkData:o,geometry:t,material:c,texture:s}}var y=class extends HTMLElement{canvas=null;renderer=null;scene=null;camera=null;plane=null;sparks=null;uniforms=null;clock=new o(!1);frame=0;currentScroll=0;mouseX=0;mouseY=0;targetMouseX=0;targetMouseY=0;motionQuery=null;experience=null;visible=!1;elapsedTime=0;connectedCallback(){if(!this.renderer&&(this.canvas=this.querySelector(`canvas`),this.canvas)){this.motionQuery=window.matchMedia(`(prefers-reduced-motion: reduce)`);try{let e=window.innerWidth,r=window.innerHeight,i=new t;i.background=new l(`#000000`),i.fog=new s(`#000000`,.01);let a=new m(50,e/r,.1,100);a.position.set(0,.2,3),i.add(a);let o={uTime:{value:0},uResolution:{value:new n(e,r)},uMouse:{value:new n(0,0)},uScroll:{value:0}};this.plane=g(a,o);let c=new u({canvas:this.canvas,antialias:!0,alpha:!1,powerPreference:`high-performance`});c.setSize(e,r),c.setPixelRatio(Math.min(window.devicePixelRatio,2)),c.shadowMap.enabled=!0,c.shadowMap.type=2,c.toneMapping=4,c.toneMappingExposure=2.2,this.sparks=v(i),this.scene=i,this.camera=a,this.uniforms=o,this.renderer=c,this.currentScroll=this.getTargetScroll(),this.experience=this.closest(`[data-cinematic-experience]`);let d=this.experience?.getBoundingClientRect();this.visible=!!d&&d.bottom>0&&d.top<window.innerHeight,this.experience?.addEventListener(`cinematic:visibility`,this.onExperienceVisibility),window.addEventListener(`resize`,this.onWindowResize),window.addEventListener(`scroll`,this.onScroll,{passive:!0}),window.addEventListener(`pointermove`,this.onBackgroundPointerMove,{passive:!0}),document.addEventListener(`visibilitychange`,this.onVisibilityChange),this.motionQuery.addEventListener(`change`,this.onMotionChange),this.canvas.addEventListener(`webglcontextlost`,this.onContextLost),this.onMotionChange()}catch(e){console.warn(`Cinematic background unavailable`,e),this.cleanup()}}}disconnectedCallback(){this.cleanup()}getTargetScroll(){let e=document.documentElement.scrollHeight-window.innerHeight,t=window.scrollY===void 0?window.pageYOffset===void 0?document.documentElement.scrollTop:window.pageYOffset:window.scrollY;return e>0?t/e:0}onBackgroundPointerMove=e=>{this.targetMouseX=e.clientX/window.innerWidth*2-1,this.targetMouseY=e.clientY/window.innerHeight*2-1};onScroll=()=>{this.visible&&!document.hidden&&this.motionQuery?.matches&&this.renderStatic()};onWindowResize=()=>{if(!this.camera||!this.renderer||!this.uniforms)return;let e=window.innerWidth,t=window.innerHeight;this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.renderer.setSize(e,t),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.uniforms.uResolution.value.set(e,t),this.visible&&!document.hidden&&this.motionQuery?.matches&&this.renderStatic()};onExperienceVisibility=e=>{let t=e.detail;this.visible!==t&&(this.visible=t,this.onMotionChange())};onVisibilityChange=()=>{document.hidden?(cancelAnimationFrame(this.frame),this.frame=0,this.clock.stop()):this.onMotionChange()};onMotionChange=()=>{cancelAnimationFrame(this.frame),this.frame=0,this.clock.stop(),this.visible&&!document.hidden&&(this.currentScroll=this.getTargetScroll(),this.motionQuery?.matches?this.renderStatic():this.renderer&&(this.clock.start(),this.frame=requestAnimationFrame(this.tick)))};onContextLost=e=>{e.preventDefault(),this.cleanup()};renderStatic(){this.renderer&&this.scene&&this.camera&&this.uniforms&&(this.uniforms.uScroll.value=this.getTargetScroll(),this.uniforms.uMouse.value.set(0,0),this.renderer.render(this.scene,this.camera))}tick=()=>{if(!this.renderer||!this.scene||!this.camera||!this.uniforms||!this.sparks)return;let e=this.clock.getDelta();this.elapsedTime+=e;let t=this.getTargetScroll();this.currentScroll+=(t-this.currentScroll)*.025,this.mouseX+=(this.targetMouseX-this.mouseX)*.05,this.mouseY+=(this.targetMouseY-this.mouseY)*.05;let n=this.sparks.geometry.attributes.position.array,r=this.elapsedTime,i=Math.abs(t-this.currentScroll),a=1+i*9,o=i*.8;for(let t=0;t<h;t++){let i=t*3,s=this.sparks.sparkData[t];n[i]+=s.speedX*e*a,n[i+1]+=s.speedY*e*a,n[i+2]+=s.speedZ*e*a;let c=s.swayRadius*(1+o*4);n[i]+=Math.sin(r*s.swaySpeed+s.phase)*c*e,n[i+2]+=Math.cos(r*s.swaySpeed+s.phase)*c*e,(n[i+1]>3||Math.abs(n[i])>3.5||Math.abs(n[i+2])>3.5)&&(n[i+1]=-2.5,n[i]=(Math.random()-.5)*3,n[i+2]=(Math.random()-.5)*3)}this.sparks.geometry.attributes.position.needsUpdate=!0,this.uniforms.uTime.value=r,this.uniforms.uMouse.value.set(this.mouseX,-this.mouseY),this.uniforms.uScroll.value=this.currentScroll,this.renderer.render(this.scene,this.camera),this.frame=requestAnimationFrame(this.tick)};cleanup(){cancelAnimationFrame(this.frame),this.frame=0,this.clock.stop(),this.experience?.removeEventListener(`cinematic:visibility`,this.onExperienceVisibility),this.experience=null,window.removeEventListener(`resize`,this.onWindowResize),window.removeEventListener(`scroll`,this.onScroll),window.removeEventListener(`pointermove`,this.onBackgroundPointerMove),document.removeEventListener(`visibilitychange`,this.onVisibilityChange),this.motionQuery?.removeEventListener(`change`,this.onMotionChange),this.canvas?.removeEventListener(`webglcontextlost`,this.onContextLost),this.plane?.geometry.dispose(),this.plane?.material.dispose(),this.sparks?.geometry.dispose(),this.sparks?.material.dispose(),this.sparks?.texture.dispose(),this.renderer?.dispose(),this.renderer=null,this.scene=null,this.camera=null,this.plane=null,this.sparks=null,this.uniforms=null}};customElements.get(`cinematic-background`)||customElements.define(`cinematic-background`,y);