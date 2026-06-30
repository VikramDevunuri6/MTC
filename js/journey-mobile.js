// Mobile auto-activate journey steps
document.addEventListener('DOMContentLoaded',()=>{
 const steps=[...document.querySelectorAll('.step')];
 const progress=document.getElementById('journeyProgress');
 if(!steps.length||!progress) return;
 const activate=(el)=>{
   steps.forEach(s=>s.classList.remove('active'));
   el.classList.add('active');
   const idx=steps.indexOf(el);
   const pct=((idx+1)/steps.length)*100;
   progress.style.height=pct+'%';
 };
 if(window.innerWidth<=992){
   const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting) activate(e.target);
      });
   },{threshold:0.6});
   steps.forEach(s=>obs.observe(s));
 }else{
   steps.forEach(s=>{
      s.addEventListener('mouseenter',()=>activate(s));
   });
 }
});
