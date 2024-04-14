var b=Object.defineProperty;var se=Object.getOwnPropertyDescriptor;var ne=Object.getOwnPropertyNames;var oe=Object.prototype.hasOwnProperty;var ae=(e,t)=>{for(var n in t)b(e,n,{get:t[n],enumerable:!0})},re=(e,t,n,u)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of ne(t))!oe.call(e,r)&&r!==n&&b(e,r,{get:()=>t[r],enumerable:!(u=se(t,r))||u.enumerable});return e};var ie=e=>re(b({},"__esModule",{value:!0}),e);var fe={};ae(fe,{destroyInput:()=>ce,gamepad:()=>ee,input:()=>be,inputSystem:()=>le,keyboard:()=>Z,mouse:()=>_});module.exports=ie(fe);var f=()=>({axes:{0:"MoveHorizontal",1:"MoveVertical",2:"LookHorizontal",3:"LookVertical"},buttons:{0:"X",1:"O",2:"Square",3:"Triangle",4:"L1",5:"R1",6:"L2",7:"R2",8:"Select",9:"Start",10:"LeftStick",11:"RightStick",12:"AnalogUp",13:"AnalogDown",14:"AnalogLeft",15:"AnalogRight",16:"Dashboard",17:"Touchpad"}});var M=()=>f(),x=()=>({axes:{0:"MoveHorizontal",1:"MoveVertical",2:"LookHorizontal",3:"LookVertical"},buttons:{0:"A",1:"B",2:"X",3:"Y",4:"LB",5:"RB",6:"LT",7:"RT",8:"Back",9:"Start",10:"LeftStick",11:"RightStick",12:"AnalogUp",13:"AnalogDown",14:"AnalogLeft",15:"AnalogRight",16:"Guide",17:"Touchpad"}});var a={},o={axes:{0:0,1:0,2:0,3:0},buttons:{}},i={},w=.055,g=e=>Math.abs(e)>=w?e:Math.abs(e)<w?0:1,D=()=>{for(let e of navigator.getGamepads()){o[e.index]={axes:{0:g(e.axes[0]),1:g(e.axes[1]),2:g(e.axes[2]),3:g(e.axes[3])},buttons:{}};for(let[t,n]of Object.entries(e.buttons))o[e.index].buttons[t]={pressed:n.pressed,touched:n.touched,value:n.value,justPressed:n.pressed&&!i?.[e.index]?.buttons?.[t]?.pressed&&!i?.[e.index]?.buttons?.[t]?.justPressed,justReleased:!n.pressed&&i?.[e.index]?.buttons?.[t]?.pressed};for(let[t,n]of Object.entries(o[e.index]?.buttons))i[e.index].buttons[t]={...n,justPressed:!1}}},h=()=>({gamepad(e){return a[e]||de(navigator.getGamepads()[e]),{useMapping:t=>a[e]=t(),getButton(t){if(!o[e])return{pressed:!1,touched:!1,value:0,justPressed:!1,justReleased:!1};let n=Object.keys(a[e].buttons)[Object.values(a[e].buttons).indexOf(t)];return o[e].buttons[n]?o[e].buttons[n]:{pressed:!1,touched:!1,value:0,justPressed:!1,justReleased:!1}},getAxis(t){if(!o[e])return 0;let n=Object.keys(a[e].axes)[Object.values(a[e].axes).indexOf(t)];return o[e].axes[n]?o[e].axes[n]:0}}}}),de=e=>{if(!e)return;let t=e.id.toLowerCase(),u=[{ids:["sony","playstation"],mapping:M},{ids:["xbox"],mapping:x},{ids:["scuf"],mapping:f}].find(r=>r.ids.some(te=>t.includes(te)));u?a[e.index]=u.mapping():(console.warn(`couldn't reasonably find a mapping for controller with id ${e.id} - defaulting to xbox mapping.`),a[e.index]=x())},ue=e=>{o[e]={axes:{},buttons:{}},i[e]={axes:{},buttons:{}}},pe=[],ge=[];var L=e=>{pe.forEach(t=>t(e)),ue(e.gamepad.index)},N=e=>{ge.forEach(t=>t(e)),delete o[e.gamepad.index],delete i[e.gamepad.index]};var E=()=>({["KeyW"]:"Forward",["KeyA"]:"Left",["KeyS"]:"Back",["KeyD"]:"Right",["KeyQ"]:"Quickswitch",["KeyE"]:"Use",["KeyR"]:"Reload",["KeyY"]:"ChatAll",["KeyU"]:"ChatTeam",["Tab"]:"Scoreboard",["ControlLeft"]:"Crouch",["Space"]:"Jump",["ShiftLeft"]:"Sprint"});var y=E(),p={keys:{}},l={keys:{}},j={keys:{}},F=()=>({keyboard:{useMapping:e=>{y=e(),S()},getKey(e){let t=Object.keys(y)[Object.values(y).indexOf(e)];return t?p.keys[t]:p.keys[e]?p.keys[e]:{pressed:!1,justPressed:!1,justReleased:!1}}}}),A=()=>{for(let[e,t]of Object.entries(l.keys))p.keys[e]={...t,justReleased:!t.pressed&&j.keys?.[e]?.pressed},j.keys[e]={...t,justPressed:!1},l.keys[e]={...t,justPressed:!1}},S=()=>{for(let e of Object.keys(y))p.keys[e]={pressed:!1,justPressed:!1,justReleased:!1}},R=e=>{e.repeat||(l.keys[e.code]={pressed:!0,justPressed:!0,justReleased:!1})},B=e=>{l.keys[e.code]={pressed:!1,justPressed:!1,justReleased:!0}};var P=()=>({axes:{0:"Horizontal",1:"Vertical",2:"Wheel"},buttons:{0:"Mouse1",1:"Mouse3",2:"Mouse2",3:"Mouse4",4:"Mouse5"}});var d=P(),C=null,s={axes:{},buttons:{},position:[0,0]},K={buttons:{}},G={buttons:{}},O=()=>{for(let[e,t]of Object.entries(K.buttons))s.buttons[e]={...t,justReleased:!t.pressed&&G.buttons?.[e]?.pressed},G.buttons[e]={...t,justPressed:!1},K.buttons[e]={...t,justPressed:!1}},c={},m={},T=()=>({mouse:{useMapping:e=>{d=e(),c={},m={},k()},getButton(e){if(c[e])return s.buttons[c[e]];let t=Object.keys(d.buttons)[Object.values(d.buttons).indexOf(e)];return t?(c[e]=t,s.buttons[t]):s.buttons[e]?s.buttons[e]:{pressed:!1,justPressed:!1,justReleased:!1}},getAxis(e){if(m[e])return s.axes[m[e]];let t=Object.keys(d.axes)[Object.values(d.axes).indexOf(e)];return t?(m[e]=t,s.axes[t]):s.axes[e]?s.axes[e]:0},getPosition(){return s.position}}}),k=()=>{s.axes={0:0,1:0,2:0};for(let e of Object.keys(d.buttons))s.buttons[e]={pressed:!1,justPressed:!1,justReleased:!1}};var U=e=>{clearTimeout(C),C=setTimeout(()=>{s.axes[0]=0,s.axes[1]=0,s.axes[2]=0},30),s.axes[0]=e.movementX,s.axes[1]=e.movementY,s.position[0]=e.clientX,s.position[1]=e.clientY},I=e=>{K.buttons[e.button]={pressed:!0,justPressed:!0,justReleased:!1}},H=e=>{K.buttons[e.button]={pressed:!1,justPressed:!1,justReleased:!0}},$=e=>{s.axes[2]=e.deltaY,globalThis.requestAnimationFrame&&requestAnimationFrame(()=>{s.axes[2]=0})};var q=null,V=null,X=null,Q=null,W=null,Y=null,z=null,J=null,v=!1,ye=()=>{S(),k()},le=e=>(typeof window>"u"||(v||(me(),ye(),v=!0),O(),A(),D()),e),ce=()=>{Ke(),v=!1},me=()=>{q=window.addEventListener("mousemove",U),V=window.addEventListener("mousedown",I),X=window.addEventListener("mouseup",H),Q=window.addEventListener("mousewheel",$),W=window.addEventListener("keydown",R),Y=window.addEventListener("keyup",B),z=window.addEventListener("gamepadconnected",L),J=window.addEventListener("gamepaddisconnected",N)},Ke=()=>{window.removeEventListener("mousemove",q),window.removeEventListener("mousedown",V),window.removeEventListener("mouseup",X),window.removeEventListener("mousewheel",Q),window.removeEventListener("keydown",W),window.removeEventListener("keyup",Y),window.removeEventListener("gamepadconnected",z),window.removeEventListener("gamepaddisconnected",J)},Z={...F()},_={...T()},ee={...h()},be={keyboard:Z,mouse:_,gamepad:ee};0&&(module.exports={destroyInput,gamepad,input,inputSystem,keyboard,mouse});
