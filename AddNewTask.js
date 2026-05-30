const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const DAYS_FULL = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const today = new Date();
  let viewYear = today.getFullYear(), viewMonth = today.getMonth();
  let selDay = null, selMonth = null, selYear = null;
  let hr = 12, mn = 0, ampm = 'AM';

  function pad(n){ return String(n).padStart(2,'0'); }

  function openPicker(){
    document.getElementById('dt-overlay').classList.add('open');
    renderCal(); updateHeader();
  }
  function closePicker(){
    document.getElementById('dt-overlay').classList.remove('open');
  }

  function switchTab(t){
    document.getElementById('tab-cal').classList.toggle('active', t==='cal');
    document.getElementById('tab-time').classList.toggle('active', t==='time');
    document.getElementById('panel-cal').classList.toggle('active', t==='cal');
    document.getElementById('panel-time').classList.toggle('active', t==='time');
  }

  function changeMonth(d){
    viewMonth += d;
    if(viewMonth < 0){ viewMonth=11; viewYear--; }
    if(viewMonth > 11){ viewMonth=0; viewYear++; }
    renderCal();
  }

  function renderCal(){
    document.getElementById('cal-month-lbl').textContent = MONTHS[viewMonth]+' '+viewYear;
    const grid = document.getElementById('cal-grid');
    grid.innerHTML = '';
    DAYS_SHORT.forEach(d=>{
      const el=document.createElement('div');
      el.className='cal-dn'; el.textContent=d; grid.appendChild(el);
    });
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
    const prevDays = new Date(viewYear, viewMonth, 0).getDate();
    for(let i=firstDay-1;i>=0;i--){
      const el=document.createElement('div');
      el.className='cal-d other'; el.textContent=prevDays-i; grid.appendChild(el);
    }
    for(let d=1;d<=daysInMonth;d++){
      const el=document.createElement('div');
      let cls='cal-d';
      if(d===today.getDate()&&viewMonth===today.getMonth()&&viewYear===today.getFullYear()) cls+=' today';
      if(selDay===d&&selMonth===viewMonth&&selYear===viewYear) cls+=' selected';
      el.className=cls; el.textContent=d;
      el.onclick=()=>{ selDay=d; selMonth=viewMonth; selYear=viewYear; updateHeader(); renderCal(); };
      grid.appendChild(el);
    }
    const total=firstDay+daysInMonth;
    const cells=total<=35?35:42;
    for(let i=1;i<=cells-total;i++){
      const el=document.createElement('div');
      el.className='cal-d other'; el.textContent=i; grid.appendChild(el);
    }
  }

  function updateHeader(){
    const pd=document.getElementById('ph-date');
    const pt=document.getElementById('ph-time');
    if(selDay!==null){
      const dt=new Date(selYear,selMonth,selDay);
      pd.textContent=DAYS_FULL[dt.getDay()]+', '+MONTHS[selMonth].slice(0,3)+' '+selDay+', '+selYear;
    } else { pd.textContent='—'; }
    pt.textContent=pad(hr)+':'+pad(mn)+' '+ampm;
  }

  function changeHr(d){
    hr=hr+d; if(hr>12) hr=1; if(hr<1) hr=12;
    document.getElementById('hr-box').textContent=pad(hr); updateHeader();
  }
  function changeMn(d){
    mn=(mn+d*5+60)%60;
    document.getElementById('mn-box').textContent=pad(mn); updateHeader();
  }
  function setAmPm(v){
    ampm=v;
    document.getElementById('am-btn').classList.toggle('active',v==='AM');
    document.getElementById('pm-btn').classList.toggle('active',v==='PM');
    updateHeader();
  }

  function confirmPicker(){
    if(!selDay){ alert('Please select a date.'); return; }
    const dt=new Date(selYear,selMonth,selDay);
    const dateStr=DAYS_FULL[dt.getDay()]+', '+MONTHS[selMonth]+' '+selDay+', '+selYear;
    const timeStr=pad(hr)+':'+pad(mn)+' '+ampm;
    const txt=document.getElementById('dt-display-text');
    txt.textContent=dateStr+' at '+timeStr;
    txt.classList.add('filled');
    closePicker();
  }

  function saveTask(){
    const title=document.getElementById('task-title').value.trim();
    if(!title){ alert('Please enter a task title.'); document.getElementById('task-title').focus(); return; }
    const dt=document.getElementById('dt-display-text').textContent;
    let msg='Task saved!';
    if(dt!=='Select date & time') msg+='\nDeadline & Time: '+dt;
    alert(msg);
  }

  function cancelTask(){
    document.getElementById('task-title').value='';
    document.getElementById('description').value='';
    document.getElementById('category').selectedIndex=0;
    selDay=null; selMonth=null; selYear=null;
    hr=12; mn=0; ampm='AM';
    document.getElementById('hr-box').textContent='12';
    document.getElementById('mn-box').textContent='00';
    document.getElementById('am-btn').classList.add('active');
    document.getElementById('pm-btn').classList.remove('active');
    const txt=document.getElementById('dt-display-text');
    txt.textContent='Select date & time';
    txt.classList.remove('filled');
  }

  document.getElementById('dt-overlay').addEventListener('click', function(e){
    if(e.target===this) closePicker();
  });
