'use client';

import {useEffect,useRef,useState} from 'react';
import {clampEducationWidth,educationWidthBounds,EDUCATION_WIDTH_KEY,parseEducationWidth} from './educationLayout';

export function EducationResizeHandle({onResize}:{onResize:(width:number)=>void}) {
  const [width,setWidth]=useState(620);
  const [viewport,setViewport]=useState(1280);
  const [dragging,setDragging]=useState(false);
  const preferred=useRef(620);
  const drag=useRef<{x:number;width:number}|null>(null);
  useEffect(()=>{
    let cancelled=false;
    const resize=()=>{const view=window.innerWidth; const next=clampEducationWidth(preferred.current,view); setViewport(view);setWidth(next);onResize(next);};
    queueMicrotask(()=>{if(cancelled)return;try{preferred.current=parseEducationWidth(localStorage.getItem(EDUCATION_WIDTH_KEY));}catch{/* Local preference is optional. */}resize();});
    window.addEventListener('resize',resize);
    return()=>{cancelled=true;window.removeEventListener('resize',resize);};
  },[onResize]);
  const commit=(value:number)=>{
    const next=clampEducationWidth(value,window.innerWidth);
    preferred.current=next;setWidth(next);onResize(next);
    try{localStorage.setItem(EDUCATION_WIDTH_KEY,String(next));}catch{/* Resizing works without storage. */}
  };
  const bounds=educationWidthBounds(viewport);
  return <div className="education-resize-handle" role="separator" tabIndex={0} aria-label="Resize lesson panel" aria-orientation="vertical" aria-controls="education-reading" aria-valuemin={bounds.min} aria-valuemax={bounds.max} aria-valuenow={width} aria-valuetext={`${width} pixels for the lesson`} data-resizing={dragging} title="Drag to resize. Arrow keys adjust width; double-click or Enter resets."
    onPointerDown={event=>{if(event.button!==0)return;event.preventDefault();event.currentTarget.focus({preventScroll:true});drag.current={x:event.clientX,width};event.currentTarget.setPointerCapture(event.pointerId);setDragging(true);}}
    onPointerMove={event=>{if(drag.current)commit(drag.current.width+drag.current.x-event.clientX);}}
    onPointerUp={event=>{drag.current=null;setDragging(false);if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}
    onPointerCancel={()=>{if(drag.current)commit(drag.current.width);drag.current=null;setDragging(false);}}
    onLostPointerCapture={()=>{drag.current=null;setDragging(false);}}
    onDoubleClick={()=>commit(620)}
    onKeyDown={event=>{
      const step=event.shiftKey?64:24;
      const next=event.key==='ArrowLeft'?width+step:event.key==='ArrowRight'?width-step:event.key==='Home'?bounds.min:event.key==='End'?bounds.max:event.key==='Enter'?620:null;
      if(next!==null){event.preventDefault();event.stopPropagation();commit(next);}
      else if(event.key==='Escape'&&drag.current){event.preventDefault();event.stopPropagation();commit(drag.current.width);drag.current=null;setDragging(false);}
    }} />;
}
