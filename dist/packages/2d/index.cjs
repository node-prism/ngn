var w=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var f=Object.getOwnPropertyNames;var y=Object.prototype.hasOwnProperty;var p=(e,r)=>{for(var a in r)w(e,a,{get:r[a],enumerable:!0})},v=(e,r,a,s)=>{if(r&&typeof r=="object"||typeof r=="function")for(let n of f(r))!y.call(e,n)&&n!==a&&w(e,n,{get:()=>r[n],enumerable:!(s=u(r,n))||s.enumerable});return e};var b=e=>v(w({},"__esModule",{value:!0}),e);var C={};p(C,{create2D:()=>m,createCanvas:()=>h,createDraw:()=>c});module.exports=b(C);var h=e=>{let r=document.createElement("canvas"),{target:a,fullscreen:s}=e,{body:n}=window.document;a&&s?e.target=null:!a&&!s&&(e.fullscreen=!0),s&&(Object.assign(r.style,{position:"absolute",top:"0",left:"0"}),r.width=window.innerWidth,r.height=window.innerHeight,n.appendChild(r),Object.assign(n.style,{margin:"0",padding:"0",width:"100%",height:"100%",overflow:"hidden"})),a&&(a.appendChild(r),a.style.overflow="hidden",r.width=r.offsetWidth,r.height=r.offsetHeight),r.width=r.offsetWidth,r.height=r.offsetHeight,r.style.width="100%",r.style.height="100%";let t=window.document.querySelector('meta[name="viewport"]');if(t)Object.assign(t,{content:"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"});else{let i=Object.assign(window.document.createElement("meta"),{name:"viewport",content:"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"});window.document.head.appendChild(i)}return r};var g=e=>~~(.5+e),d=e=>({x:g(e.x),y:g(e.y)}),c=e=>({text:(t,i,l="gray",o=16)=>{t=d(t),e.save(),e.fillStyle=l,e.font=`${o}px sans-serif`,e.fillText(i,t.x,t.y),e.restore()},line:(t,i,l="gray",o=1)=>{t=d(t),i=d(i),e.save(),e.beginPath(),e.moveTo(t.x,t.y),e.lineTo(i.x,i.y),e.lineWidth=o,e.stroke(),e.closePath(),e.restore()},rectangle:(t,i,l="gray",o=1)=>{t=d(t),i=d(i),e.save(),e.beginPath(),e.rect(t.x,t.y,i.x,i.y),e.lineWidth=o,e.strokeStyle=l,e.stroke(),e.closePath(),e.restore()},circle:(t,i=25,l="gray",o=1)=>{t=d(t),e.save(),e.beginPath(),e.strokeStyle=l,e.lineWidth=o,e.arc(t.x,t.y,i,0,Math.PI*2,!0),e.stroke(),e.closePath(),e.restore()}});var m=e=>{let{width:r=800,height:a=600,fullscreen:s=!1,target:n=null}=e.canvas,t=h({width:r,height:a,fullscreen:s,target:n}),i=t.getContext("2d"),l=c(i),o=()=>{if(s){t.style.width="100%",t.style.height="100%",t.width=window.innerWidth,t.height=window.innerHeight;return}t.width=t.offsetWidth,t.height=t.offsetHeight};return window.addEventListener("resize",o),{canvas:t,context:i,draw:l,destroy:()=>{window.removeEventListener("resize",o),t.parentElement.removeChild(t)}}};0&&(module.exports={create2D,createCanvas,createDraw});