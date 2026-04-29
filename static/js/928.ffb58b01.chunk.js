"use strict";(globalThis.webpackChunkbrandme=globalThis.webpackChunkbrandme||[]).push([[928],{611(e,r,t){t.d(r,{A:()=>N});var a=t(8587),o=t(8168),i=t(5043),n=t(8387),s=t(8610),l=t(3290),c=t(7266),d=t(875),u=t(6803),m=t(4535),h=t(6431),b=t(2532),p=t(2372);function f(e){return(0,p.Ay)("MuiLinearProgress",e)}(0,b.A)("MuiLinearProgress",["root","colorPrimary","colorSecondary","determinate","indeterminate","buffer","query","dashed","dashedColorPrimary","dashedColorSecondary","bar","barColorPrimary","barColorSecondary","bar1Indeterminate","bar1Determinate","bar1Buffer","bar2Indeterminate","bar2Buffer"]);var v=t(579);const g=["className","color","value","valueBuffer","variant"];let w,y,A,k,$,S,C=e=>e;const x=(0,l.i7)(w||(w=C`
  0% {
    left: -35%;
    right: 100%;
  }

  60% {
    left: 100%;
    right: -90%;
  }

  100% {
    left: 100%;
    right: -90%;
  }
`)),z=(0,l.i7)(y||(y=C`
  0% {
    left: -200%;
    right: 100%;
  }

  60% {
    left: 107%;
    right: -8%;
  }

  100% {
    left: 107%;
    right: -8%;
  }
`)),B=(0,l.i7)(A||(A=C`
  0% {
    opacity: 1;
    background-position: 0 -23px;
  }

  60% {
    opacity: 0;
    background-position: 0 -23px;
  }

  100% {
    opacity: 1;
    background-position: -200px -23px;
  }
`)),M=(e,r)=>"inherit"===r?"currentColor":e.vars?e.vars.palette.LinearProgress[`${r}Bg`]:"light"===e.palette.mode?(0,c.a)(e.palette[r].main,.62):(0,c.e$)(e.palette[r].main,.5),R=(0,m.Ay)("span",{name:"MuiLinearProgress",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.root,r[`color${(0,u.A)(t.color)}`],r[t.variant]]}})(e=>{let{ownerState:r,theme:t}=e;return(0,o.A)({position:"relative",overflow:"hidden",display:"block",height:4,zIndex:0,"@media print":{colorAdjust:"exact"},backgroundColor:M(t,r.color)},"inherit"===r.color&&"buffer"!==r.variant&&{backgroundColor:"none","&::before":{content:'""',position:"absolute",left:0,top:0,right:0,bottom:0,backgroundColor:"currentColor",opacity:.3}},"buffer"===r.variant&&{backgroundColor:"transparent"},"query"===r.variant&&{transform:"rotate(180deg)"})}),I=(0,m.Ay)("span",{name:"MuiLinearProgress",slot:"Dashed",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.dashed,r[`dashedColor${(0,u.A)(t.color)}`]]}})(e=>{let{ownerState:r,theme:t}=e;const a=M(t,r.color);return(0,o.A)({position:"absolute",marginTop:0,height:"100%",width:"100%"},"inherit"===r.color&&{opacity:.3},{backgroundImage:`radial-gradient(${a} 0%, ${a} 16%, transparent 42%)`,backgroundSize:"10px 10px",backgroundPosition:"0 -23px"})},(0,l.AH)(k||(k=C`
    animation: ${0} 3s infinite linear;
  `),B)),P=(0,m.Ay)("span",{name:"MuiLinearProgress",slot:"Bar1",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.bar,r[`barColor${(0,u.A)(t.color)}`],("indeterminate"===t.variant||"query"===t.variant)&&r.bar1Indeterminate,"determinate"===t.variant&&r.bar1Determinate,"buffer"===t.variant&&r.bar1Buffer]}})(e=>{let{ownerState:r,theme:t}=e;return(0,o.A)({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left",backgroundColor:"inherit"===r.color?"currentColor":(t.vars||t).palette[r.color].main},"determinate"===r.variant&&{transition:"transform .4s linear"},"buffer"===r.variant&&{zIndex:1,transition:"transform .4s linear"})},e=>{let{ownerState:r}=e;return("indeterminate"===r.variant||"query"===r.variant)&&(0,l.AH)($||($=C`
      width: auto;
      animation: ${0} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    `),x)}),j=(0,m.Ay)("span",{name:"MuiLinearProgress",slot:"Bar2",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.bar,r[`barColor${(0,u.A)(t.color)}`],("indeterminate"===t.variant||"query"===t.variant)&&r.bar2Indeterminate,"buffer"===t.variant&&r.bar2Buffer]}})(e=>{let{ownerState:r,theme:t}=e;return(0,o.A)({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left"},"buffer"!==r.variant&&{backgroundColor:"inherit"===r.color?"currentColor":(t.vars||t).palette[r.color].main},"inherit"===r.color&&{opacity:.3},"buffer"===r.variant&&{backgroundColor:M(t,r.color),transition:"transform .4s linear"})},e=>{let{ownerState:r}=e;return("indeterminate"===r.variant||"query"===r.variant)&&(0,l.AH)(S||(S=C`
      width: auto;
      animation: ${0} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
    `),z)}),N=i.forwardRef(function(e,r){const t=(0,h.b)({props:e,name:"MuiLinearProgress"}),{className:i,color:l="primary",value:c,valueBuffer:m,variant:b="indeterminate"}=t,p=(0,a.A)(t,g),w=(0,o.A)({},t,{color:l,variant:b}),y=(e=>{const{classes:r,variant:t,color:a}=e,o={root:["root",`color${(0,u.A)(a)}`,t],dashed:["dashed",`dashedColor${(0,u.A)(a)}`],bar1:["bar",`barColor${(0,u.A)(a)}`,("indeterminate"===t||"query"===t)&&"bar1Indeterminate","determinate"===t&&"bar1Determinate","buffer"===t&&"bar1Buffer"],bar2:["bar","buffer"!==t&&`barColor${(0,u.A)(a)}`,"buffer"===t&&`color${(0,u.A)(a)}`,("indeterminate"===t||"query"===t)&&"bar2Indeterminate","buffer"===t&&"bar2Buffer"]};return(0,s.A)(o,f,r)})(w),A=(0,d.I)(),k={},$={bar1:{},bar2:{}};if("determinate"===b||"buffer"===b)if(void 0!==c){k["aria-valuenow"]=Math.round(c),k["aria-valuemin"]=0,k["aria-valuemax"]=100;let e=c-100;A&&(e=-e),$.bar1.transform=`translateX(${e}%)`}else 0;if("buffer"===b)if(void 0!==m){let e=(m||0)-100;A&&(e=-e),$.bar2.transform=`translateX(${e}%)`}else 0;return(0,v.jsxs)(R,(0,o.A)({className:(0,n.A)(y.root,i),ownerState:w,role:"progressbar"},k,{ref:r},p,{children:["buffer"===b?(0,v.jsx)(I,{className:y.dashed,ownerState:w}):null,(0,v.jsx)(P,{className:y.bar1,ownerState:w,style:$.bar1}),"determinate"===b?null:(0,v.jsx)(j,{className:y.bar2,ownerState:w,style:$.bar2})]}))})},4598(e,r,t){t.d(r,{A:()=>$});var a=t(8587),o=t(8168),i=t(5043),n=t(8387),s=t(8610),l=t(7266),c=t(6803),d=t(3064),u=t(4535),m=t(6431),h=t(2532),b=t(2372);function p(e){return(0,b.Ay)("MuiSwitch",e)}const f=(0,h.A)("MuiSwitch",["root","edgeStart","edgeEnd","switchBase","colorPrimary","colorSecondary","sizeSmall","sizeMedium","checked","disabled","input","thumb","track"]);var v=t(579);const g=["className","color","edge","size","sx"],w=(0,u.Ay)("span",{name:"MuiSwitch",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.root,t.edge&&r[`edge${(0,c.A)(t.edge)}`],r[`size${(0,c.A)(t.size)}`]]}})({display:"inline-flex",width:58,height:38,overflow:"hidden",padding:12,boxSizing:"border-box",position:"relative",flexShrink:0,zIndex:0,verticalAlign:"middle","@media print":{colorAdjust:"exact"},variants:[{props:{edge:"start"},style:{marginLeft:-8}},{props:{edge:"end"},style:{marginRight:-8}},{props:{size:"small"},style:{width:40,height:24,padding:7,[`& .${f.thumb}`]:{width:16,height:16},[`& .${f.switchBase}`]:{padding:4,[`&.${f.checked}`]:{transform:"translateX(16px)"}}}}]}),y=(0,u.Ay)(d.A,{name:"MuiSwitch",slot:"SwitchBase",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.switchBase,{[`& .${f.input}`]:r.input},"default"!==t.color&&r[`color${(0,c.A)(t.color)}`]]}})(e=>{let{theme:r}=e;return{position:"absolute",top:0,left:0,zIndex:1,color:r.vars?r.vars.palette.Switch.defaultColor:`${"light"===r.palette.mode?r.palette.common.white:r.palette.grey[300]}`,transition:r.transitions.create(["left","transform"],{duration:r.transitions.duration.shortest}),[`&.${f.checked}`]:{transform:"translateX(20px)"},[`&.${f.disabled}`]:{color:r.vars?r.vars.palette.Switch.defaultDisabledColor:`${"light"===r.palette.mode?r.palette.grey[100]:r.palette.grey[600]}`},[`&.${f.checked} + .${f.track}`]:{opacity:.5},[`&.${f.disabled} + .${f.track}`]:{opacity:r.vars?r.vars.opacity.switchTrackDisabled:""+("light"===r.palette.mode?.12:.2)},[`& .${f.input}`]:{left:"-100%",width:"300%"}}},e=>{let{theme:r}=e;return{"&:hover":{backgroundColor:r.vars?`rgba(${r.vars.palette.action.activeChannel} / ${r.vars.palette.action.hoverOpacity})`:(0,l.X4)(r.palette.action.active,r.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}},variants:[...Object.entries(r.palette).filter(e=>{let[,r]=e;return r.main&&r.light}).map(e=>{let[t]=e;return{props:{color:t},style:{[`&.${f.checked}`]:{color:(r.vars||r).palette[t].main,"&:hover":{backgroundColor:r.vars?`rgba(${r.vars.palette[t].mainChannel} / ${r.vars.palette.action.hoverOpacity})`:(0,l.X4)(r.palette[t].main,r.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}},[`&.${f.disabled}`]:{color:r.vars?r.vars.palette.Switch[`${t}DisabledColor`]:`${"light"===r.palette.mode?(0,l.a)(r.palette[t].main,.62):(0,l.e$)(r.palette[t].main,.55)}`}},[`&.${f.checked} + .${f.track}`]:{backgroundColor:(r.vars||r).palette[t].main}}}})]}}),A=(0,u.Ay)("span",{name:"MuiSwitch",slot:"Track",overridesResolver:(e,r)=>r.track})(e=>{let{theme:r}=e;return{height:"100%",width:"100%",borderRadius:7,zIndex:-1,transition:r.transitions.create(["opacity","background-color"],{duration:r.transitions.duration.shortest}),backgroundColor:r.vars?r.vars.palette.common.onBackground:`${"light"===r.palette.mode?r.palette.common.black:r.palette.common.white}`,opacity:r.vars?r.vars.opacity.switchTrack:""+("light"===r.palette.mode?.38:.3)}}),k=(0,u.Ay)("span",{name:"MuiSwitch",slot:"Thumb",overridesResolver:(e,r)=>r.thumb})(e=>{let{theme:r}=e;return{boxShadow:(r.vars||r).shadows[1],backgroundColor:"currentColor",width:20,height:20,borderRadius:"50%"}}),$=i.forwardRef(function(e,r){const t=(0,m.b)({props:e,name:"MuiSwitch"}),{className:i,color:l="primary",edge:d=!1,size:u="medium",sx:h}=t,b=(0,a.A)(t,g),f=(0,o.A)({},t,{color:l,edge:d,size:u}),$=(e=>{const{classes:r,edge:t,size:a,color:i,checked:n,disabled:l}=e,d={root:["root",t&&`edge${(0,c.A)(t)}`,`size${(0,c.A)(a)}`],switchBase:["switchBase",`color${(0,c.A)(i)}`,n&&"checked",l&&"disabled"],thumb:["thumb"],track:["track"],input:["input"]},u=(0,s.A)(d,p,r);return(0,o.A)({},r,u)})(f),S=(0,v.jsx)(k,{className:$.thumb,ownerState:f});return(0,v.jsxs)(w,{className:(0,n.A)($.root,i),sx:h,ownerState:f,children:[(0,v.jsx)(y,(0,o.A)({type:"checkbox",icon:S,checkedIcon:S,ref:r,ownerState:f},b,{classes:(0,o.A)({},$,{root:$.switchBase})})),(0,v.jsx)(A,{className:$.track,ownerState:f})]})})}}]);
//# sourceMappingURL=928.ffb58b01.chunk.js.map