const STLBL={available:"Available",qc:"In QC",backlog:"In-backlog"};
const LV={mn:"Mầm non",th:"Tiểu học",thcs:"THCS",thpt:"THPT"};
const PLAT={mobile:"Mobile",web:"Web",both:"Mobile + Web"};
const PCHIP={mobile:"M",web:"W",both:"M+W"};
const TAGTXT={seen:"Confirmed from your screens or feature list",store:"Confirmed from a public store listing",prop:"Proposed grouping, please confirm",gap:"Not visible yet, to capture",mkt:"Market addition: found in research, not in your lines today",audit:"From the business-progress audit report (22/10/2026)"};
const TXT_EN={what:"What it does",uv:"Value for end users",bv:"Value for Finviet",buy:"Build or buy",status:"Feature status",insight:"Key points",planned:"New features on the roadmap (not built yet)",data:"Data comes from",feeds:"Feeds",basis:"Basis",roles:{admin:"School admin",teacher:"Teacher",parent:"Parent",student:"Student"},who:"Who uses it",audmn:"Mầm non only",audk12:"K12 only",both:"Both audiences",plat:"Platform (my recommendation)",today:"Today",vendors:"Vendors offering it",fv:"In your lines",read:"My read",src:"Sources",ev:TAGTXT};
const TXT_VI={what:"Module này làm gì",uv:"Giá trị cho người dùng cuối",bv:"Giá trị cho Finviet",buy:"Gợi ý mua nguồn hoặc hợp tác",status:"Trạng thái tính năng",insight:"Điểm cần hiểu đúng",planned:"Tính năng mới trong lộ trình (chưa xây)",data:"Dữ liệu lấy từ",feeds:"Cấp dữ liệu cho",basis:"Cơ sở",roles:{admin:"Quản trị trường / kế toán",teacher:"Giáo viên",parent:"Phụ huynh",student:"Học sinh"},who:"Ai dùng",audmn:"Chỉ Mầm non",audk12:"Chỉ K12",both:"Cả hai nhóm",plat:"Nền tảng (đề xuất của tôi)",today:"Hiện tại",vendors:"Nhà cung cấp khác có tính năng này",fv:"Hiện trạng ở Finviet",read:"Nhận định của tôi",src:"Nguồn",ev:{seen:"Đã xác nhận từ ảnh chụp màn hình hoặc danh sách tính năng hiện có",store:"Đã xác nhận từ trang cửa hàng ứng dụng",prop:"Đề xuất (phân nhóm hoặc tính năng), cần xác nhận",gap:"Chưa thấy, cần bổ sung",mkt:"Bổ sung từ thị trường: tìm thấy khi nghiên cứu, chưa có trong sản phẩm hiện tại",audit:"Từ báo cáo nghiệp vụ và tiến độ (audit 22/10/2026), không phải ảnh chụp"}};
function el(t,c){const e=document.createElement(t);if(c)e.className=c;return e;}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function deepFreeze(o){if(o&&typeof o==="object"&&!Object.isFrozen(o)){Object.freeze(o);Object.getOwnPropertyNames(o).forEach(k=>deepFreeze(o[k]));}return o;}

const PANEL_HTML=`
  <div class="banner" data-role="banner"></div>
  <div class="stats" data-role="stats"></div>
  <div class="split collapsed" data-role="split">
    <section class="pane left" aria-label="Mindmap">
      <div class="vbar" data-role="vbar">
        <button type="button" class="itoggle" data-role="itoggle" aria-expanded="true" aria-label="Ẩn thông tin tổng quan" title="Ẩn thông tin tổng quan"><svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <div class="seg" role="group" aria-label="Chế độ xem" data-role="seg-view">
          <button type="button" data-view="mm" class="on">Mindmap</button>
          <button type="button" data-view="rm">Roadmap</button>
          <button type="button" data-view="rb" hidden>Rebuild School Portal Roadmap</button>
        </div>
        <button type="button" class="ptoggle" data-role="ptoggle" aria-expanded="false">Mở khung giải thích ▸</button>
      </div>
      <div class="lhead" data-role="mmhead">
        <div class="toolbar">
          <div class="seg" role="group" aria-label="Detail level" data-role="seg-depth">
            <button type="button" data-depth="2" class="on">Lines</button>
            <button type="button" data-depth="3">Modules</button>
            <button type="button" data-depth="99">Everything</button>
          </div>
          <div class="seg" role="group" aria-label="Audience filter" data-role="seg-aud">
            <button type="button" data-aud="all" class="on">All</button>
            <button type="button" data-aud="mn">Mầm non</button>
            <button type="button" data-aud="k12">K12</button>
            <button type="button" data-aud="cross">Cross-level</button>
            <button type="button" data-aud="int">Internal</button>
          </div>
          <span class="tlabel">Platform</span>
          <div class="seg" role="group" aria-label="Platform filter" data-role="seg-plat">
            <button type="button" data-plat="all" class="on">All</button>
            <button type="button" data-plat="mobile">Mobile</button>
            <button type="button" data-plat="web">Web</button>
          </div>
          <span class="tlabel">Level</span>
          <div class="seg" role="group" aria-label="School level" data-role="seg-lv">
            <button type="button" data-lv="all" class="on">All</button>
            <button type="button" data-lv="mn">Mầm non</button>
            <button type="button" data-lv="th">Tiểu học</button>
            <button type="button" data-lv="thcs">THCS</button>
            <button type="button" data-lv="thpt">THPT</button>
          </div>
          <span class="tlabel">Highlight</span>
          <div class="seg" role="group" aria-label="Highlight" data-role="seg-focus">
            <button type="button" data-focus="all" class="on">Everything</button>
            <button type="button" data-focus="mkt">Market additions</button>
          </div>
        </div>
        <div class="legend">
          <span><i></i>Confirmed</span>
          <span><i class="p"></i>Proposed (grouping or feature)</span>
          <span><i class="g"></i>Not visible yet</span>
          <span><i class="m"></i>Market addition</span>
          <span><b class="st available">Available</b><b class="st qc">In QC</b><b class="st backlog">In-backlog</b>Feature status</span>
          <span><span class="pl">M</span><span class="pl">W</span><span class="pl">M+W</span>Platform</span>
        </div>
      </div>
      <div class="map" data-role="mmmap"><div class="tree" data-role="tree"></div></div>
      <div class="rmview" data-role="rmview" hidden></div>
      <div class="rmview" data-role="rmview2" hidden></div>
    </section>
    <div class="gutter" data-role="gutter" role="separator" aria-orientation="vertical" aria-label="Resize panels (drag, or use the left and right arrow keys)" tabindex="0"></div>
    <aside class="pane right" aria-label="Explanation">
      <div class="rtabs">
        <div class="seg" role="group" aria-label="Right panel" data-role="seg-right">
          <button type="button" data-right="detail" class="on">Detail</button>
          <button type="button" data-right="beh">Behaviour</button>
        </div>
        <button type="button" class="ptoggle pclose" data-role="pclose" aria-label="Ẩn khung giải thích">Ẩn ✕</button>
      </div>
      <div class="detail" data-role="detail" aria-live="polite"></div>
      <div class="behview" data-role="beh-body" hidden></div>
    </aside>
  </div>
  <div class="bmodal-bg" data-role="built-modal" hidden>
    <div class="bmodal" role="dialog" aria-modal="true">
      <div class="bmodal-t" data-role="bmodal-title">Xác nhận đã build xong module</div>
      <div class="bmodal-b" data-role="bmodal-body"></div>
      <div class="bmodal-act">
        <button type="button" class="bmodal-cancel" data-role="bmodal-cancel">Huỷ</button>
        <button type="button" class="bmodal-ok" data-role="bmodal-ok">Xác nhận</button>
      </div>
    </div>
  </div>
`;

function mount(root,model,bannerHtml,bannerClass){
  const S=model.S,TREE=model.TREE,BEH=model.BEH;
  root.innerHTML=PANEL_HTML;
  const $=r=>root.querySelector('[data-role="'+r+'"]');
  const $$=sel=>root.querySelectorAll(sel);
  const banner=$("banner");banner.className="banner "+bannerClass;banner.innerHTML=bannerHtml;
  const detail=$("detail"),tree=$("tree"),reg=new Map();
  let rbBoard=null,pendingBuilt=null;

  function showRight(which){
    $$('[data-role="seg-right"] button').forEach(x=>x.classList.toggle("on",x.dataset.right===which));
    detail.hidden=(which!=="detail");
    $("beh-body").hidden=(which!=="beh");
  }

  function setPanel(open){
    const sp=$("split");
    sp.classList.toggle("collapsed",!open);
    const t=$("ptoggle");
    t.textContent=open?"Ẩn khung giải thích ◂":"Mở khung giải thích ▸";
    t.setAttribute("aria-expanded",open?"true":"false");
  }

  function showDetail(node,path,btn,inh,extra){
    showRight("detail");
    $$(".node.sel").forEach(x=>x.classList.remove("sel"));
    if(btn)btn.classList.add("sel");
    const vi=!!((inh&&inh.vi)||node.vi);
    const T=Object.assign({},vi?TXT_VI:TXT_EN,(model.LABELS&&model.LABELS[vi?"vi":"en"])||{});
    const tag=node.tag||"seen";
    let h='<div class="crumb">'+path.map(esc).join(" › ")+'</div><div class="dt">'+esc(node.label)+"</div>";
    if(extra)h+=extra;
    if(node.dep){
      const D=node.dep,isB=id=>!!(rbBoard&&rbBoard.isBuilt(id)),meBuilt=isB(D.id);
      const hard=D.hard||[],doneN=hard.filter(x=>isB(x.id)).length;
      const leadTxt=!hard.length?D.lead:(doneN===hard.length?"✅ Tất cả module phụ thuộc ("+doneN+"/"+hard.length+") đã build xong — Có thể tiếp tục với module “"+node.label+" ("+D.code+")” ngay:":(doneN>0?"Trước khi build module “"+node.label+" ("+D.code+")”, còn "+(hard.length-doneN)+"/"+hard.length+" module phụ thuộc BẮT BUỘC phải build trước (đã build xong "+doneN+"/"+hard.length+"):":D.lead));
      h+='<div class="buildbar'+(meBuilt?" done":"")+'" data-card-id="'+esc(D.id)+'"><label class="buildchk"><input type="checkbox" data-role="built-chk" data-id="'+esc(D.id)+'"'+(meBuilt?" checked":"")+'><span>Đã build xong module này</span></label><span class="buildst '+(meBuilt?"done":"todo")+'">'+(meBuilt?"✓ Đã build xong":"Chưa build xong")+'</span><button type="button" class="buildbtn" data-role="built-confirm" data-id="'+esc(D.id)+'" disabled>Xác nhận</button></div>';
      h+='<div class="depbox"><div class="dephdr"><span class="depbadge">PHỤ THUỘC &amp; THỨ TỰ BUILD</span>'+(D.m4Badge?'<span class="depm4 '+esc(D.m4Badge.cls)+'">'+esc(D.m4Badge.text)+"</span>":"")+'</div><div class="depsec"><b class="deptitle">'+esc(leadTxt)+"</b>";
      if(hard.length)h+='<div class="depchips">'+hard.map(x=>{const b=isB(x.id);return '<button type="button" class="depchip hard'+(b?" done":"")+'" data-goto="'+esc(x.id)+'" data-status="'+(b?"done":"todo")+'" title="'+(b?"Đã build xong / Đã built xong":"Cần build trước")+" - "+esc(x.label)+'"><span class="depstep">'+(b?"✓ Đã build xong":"Cần build trước")+"</span><b>"+esc(x.label)+"</b></button>";}).join("")+"</div>";
      if(D.why)h+='<p class="depwhy"><b>Lý do:</b> '+esc(D.why)+"</p>";
      h+="</div>";
      if(D.unlocks&&D.unlocks.length)h+='<div class="depsec sub"><span class="depsub">Sau khi build xong <b>'+esc(node.label)+"</b>, sẽ mở khoá / cấp dữ liệu cho ("+D.unlocks.length+' module):</span><div class="depchips">'+D.unlocks.map(x=>{const ub=isB(x.id),uc=rbBoard&&rbBoard.card(x.id),ur=!ub&&uc&&(uc.after||[]).every(pid=>isB(pid));return '<button type="button" class="depchip unlock'+(x.m4?" m4":"")+(ub?" done":(ur?" ready":""))+'" data-goto="'+esc(x.id)+'" title="Nhấn để xem '+esc(x.label)+'">'+(ub?'<span class="depust done">✓ Đã build xong</span>':(ur?'<span class="depust ready">Sẵn sàng build</span>':""))+esc(x.label)+(x.m4?" ★":"")+"</button>";}).join("")+"</div></div>";
      if(D.soft&&D.soft.length)h+='<div class="depsec sub"><span class="depsub">Liên kết mềm / tích hợp bổ sung (không chặn việc bắt đầu build):</span><div class="depchips">'+D.soft.map(x=>'<span class="depchip soft">'+esc(x)+"</span>").join("")+"</div></div>";
      h+="</div>";
    }
    if(node.planned&&node.planned.length)h+='<div class="newchip">'+(inh&&inh.vi?"Có "+node.planned.length+" tính năng mới trong lộ trình":node.planned.length+" new features on the roadmap")+"</div>";
    if(node.meta){
      const D=node.dep,isB=id=>!!(rbBoard&&rbBoard.isBuilt(id));
      h+="<dl>"+Object.keys(node.meta).map(k=>{
        let v=node.meta[k];
        if(D&&k==="Tích hợp core"&&isB(D.id))v="Đã build xong (đã xác nhận hoàn thành)";
        else if(D&&k==="Cần xong trước (cứng, theo PRD)"&&D.hard&&D.hard.length)v=D.hard.map(x=>x.short+" — "+(isB(x.id)?"Đã build xong":"Cần build trước")).join(", ");
        return "<dt>"+esc(k)+"</dt><dd>"+esc(v)+"</dd>";
      }).join("")+"</dl>";
    }
    if(node.insight)h+='<span class="k">'+T.insight+'</span><div class="ins">'+node.insight.split("\n").map(p=>"<p>"+esc(p)+"</p>").join("")+"</div>";
    if(node.what)h+=((node.uv||node.bv)?'<span class="k">'+T.what+"</span>":"")+"<p>"+esc(node.what)+"</p>";
    if(node.note)h+="<p>"+esc(node.note)+"</p>";
    if(node.d)h+="<p>"+esc(node.d)+"</p>";
    if(node.st)h+='<div class="stline"><span class="k">'+T.status+'</span><span class="st '+node.st+'">'+STLBL[node.st]+"</span></div>";
    if(node.children&&node.children.some(c=>c.st)){const sc={available:0,qc:0,backlog:0};node.children.forEach(c=>{if(c.st)sc[c.st]++;});h+='<div class="stline"><span class="k">'+T.status+"</span>"+Object.keys(sc).filter(k=>sc[k]).map(k=>'<span class="st '+k+'">'+STLBL[k]+" "+sc[k]+"</span>").join(" ")+"</div>";}
    if(node.uv)h+='<span class="k">'+T.uv+'</span><dl class="roles">'+Object.keys(node.uv).map(k=>"<dt>"+esc(T.roles[k]||k)+"</dt><dd>"+esc(node.uv[k])+"</dd>").join("")+"</dl>";
    if(node.bv)h+='<span class="k">'+T.bv+"</span><p>"+esc(node.bv)+"</p>";
    if(node.blocks)node.blocks.forEach(bk=>{h+='<span class="k">'+esc(bk.h)+"</span>";if(bk.items&&bk.items.length)h+=(bk.ol?'<ol class="bl">':'<ul class="bl">')+bk.items.map(x=>"<li>"+esc(x)+"</li>").join("")+(bk.ol?"</ol>":"</ul>");if(bk.muted)h+='<p class="muted">'+esc(bk.muted)+"</p>";});
    if(node.data)h+='<span class="k">'+T.data+"</span><p>"+esc(node.data)+"</p>";
    if(node.feeds)h+='<span class="k">'+T.feeds+"</span><p>"+esc(node.feeds)+"</p>";
    if(node.planned&&node.planned.length)h+='<div class="newbox"><span class="k"><i class="nbadge">'+(inh&&inh.vi?"MỚI":"NEW")+"</i> "+T.planned+' ('+node.planned.length+')</span><ul class="plan">'+node.planned.map(p=>"<li><b>"+esc(p.t)+"</b>"+(p.when?' <span class="when">'+esc(p.when)+"</span>":"")+"<br>"+esc(p.v)+"</li>").join("")+"</ul></div>";
    if(node.buy)h+='<span class="k">'+T.buy+"</span>"+node.buy.split("\n").map(p=>"<p>"+esc(p)+"</p>").join("");
    if(node.table){h+='<span class="k">'+esc(node.tableTitle||"")+'</span><div class="tw"><table><thead><tr>'+node.table.head.map(x=>"<th>"+esc(x)+"</th>").join("")+'</tr></thead><tbody>'+node.table.rows.map(r=>"<tr>"+r.map(c=>"<td>"+esc(c)+"</td>").join("")+"</tr>").join("")+'</tbody></table></div>';if(node.tableNote)h+='<p class="basis">'+esc(node.tableNote)+"</p>";}
    const chips=[];
    if(node.aud)chips.push('<span class="chip aud-'+node.aud+'">'+(node.aud==="mn"?T.audmn:T.audk12)+"</span>");
    else if(node.type==="mod"||node.type==="leaf")if(inh&&inh.shared)chips.push('<span class="chip">'+T.both+"</span>");
    (node.lv||[]).forEach(v=>chips.push('<span class="chip lvl">'+LV[v]+"</span>"));
    if(chips.length)h+='<span class="k">'+T.who+'</span><div class="chips">'+chips.join("")+"</div>";
    const eff=inh&&inh.eff;
    if(eff&&(node.type==="mod"||node.type==="leaf")){
      h+='<span class="k">'+T.plat+'</span><div class="chips"><span class="chip plat">'+PLAT[eff]+"</span></div>";
      const why=node.platWhy||(inh&&inh.why);
      if(why)h+="<p>"+esc(why)+"</p>";
      if(inh&&inh.now)h+='<p><span class="k">'+T.today+"</span>"+esc(inh.now)+"</p>";
    }
    if(node.vendors&&node.vendors.length)h+='<span class="k">'+T.vendors+'</span><div class="chips">'+node.vendors.map(v=>'<span class="chip">'+esc(v)+"</span>").join("")+"</div>";
    if(node.fvNote)h+='<p><span class="k">'+T.fv+"</span>"+esc(node.fvNote)+"</p>";
    if(node.read)h+='<p><span class="k">'+T.read+"</span>"+esc(node.read)+"</p>";
    if(node.basis)h+='<p class="basis"><span class="k">'+T.basis+"</span>"+esc(node.basis)+"</p>";
    const keys=[].concat(node.src||[],node.psrc||[],(inh&&node.type!=="line"&&!node.psrc&&inh.psrc)||[]);
    const uniq=keys.filter((k,i)=>keys.indexOf(k)===i&&S[k]);
    if(uniq.length)h+='<span class="k">'+T.src+'</span><ul class="srcs">'+uniq.map(k=>'<li><a href="'+S[k][1]+'">'+esc(S[k][0])+"</a></li>").join("")+"</ul>";
    if(node.type!=="root"&&node.type!=="aud")h+='<span class="ev" data-tag="'+tag+'">'+T.ev[tag]+"</span>";
    detail.innerHTML=h;
  }

  function build(node,depth,path,inh){
    const branch=el("div","branch");
    branch.dataset.depth=depth;
    const kids=node.children||[];
    const btn=el("button","node t-"+node.type);
    btn.type="button";
    btn.dataset.tag=node.tag||"seen";
    if(node.lv&&node.lv.length)btn.dataset.lv=node.lv.join(" ");
    if(node.shared)btn.dataset.shared="1";
    let eff=null,childInh=inh||{};
    if(node.type==="line"){
      childInh={eff:node.platDefault||null,why:node.platWhy||null,now:node.platNow||null,psrc:null,shared:!!node.shared,vi:!!node.vi};
    }else if(node.type==="mod"||node.type==="leaf"){
      eff=node.plat||(inh&&inh.eff)||null;
      childInh={eff:eff,why:node.platWhy||(inh&&inh.why)||null,now:inh&&inh.now,psrc:node.psrc||(inh&&inh.psrc)||null,shared:inh&&inh.shared,vi:!!(node.vi||(inh&&inh.vi))};
    }
    if(eff)btn.dataset.plat=eff;
    const nodeInh=(node.type==="mod"||node.type==="leaf")?{eff:eff,why:node.platWhy||(inh&&inh.why),now:inh&&inh.now,psrc:node.psrc||(inh&&inh.psrc),shared:inh&&inh.shared,vi:!!(node.vi||(inh&&inh.vi))}:Object.assign({},inh||{},{vi:!!(node.vi||(inh&&inh.vi))});
    let html='<span class="txt"><span class="lbl">'+esc(node.label)+"</span>"+(node.sub?'<span class="sub">'+esc(node.sub)+"</span>":"")+"</span>";
    if(eff)html+='<span class="pl" title="'+PLAT[eff]+'">'+PCHIP[eff]+"</span>";
    if(node.st)html+='<span class="st '+node.st+'" title="Feature status">'+STLBL[node.st]+'</span>';
    if(kids.length)html+='<span class="cnt">'+kids.length+'</span><span class="car" aria-hidden="true"></span>';
    btn.innerHTML=html;
    if(kids.length)btn.setAttribute("aria-expanded","true");
    const here=path.concat(node.label);
    if(node.type==="line"){if(!reg.has(node.label))reg.set(node.label,{node:node,path:here,inh:nodeInh});}
    else if(node.type==="mod"){const rk=path[2]+"›"+node.label;if(!reg.has(rk))reg.set(rk,{node:node,path:here,inh:nodeInh});}
    btn.addEventListener("click",()=>{
      showDetail(node,here,btn,nodeInh);
      if(kids.length){
        const c=branch.classList.toggle("collapsed");
        btn.setAttribute("aria-expanded",String(!c));
      }
    });
    branch.appendChild(btn);
    if(kids.length){
      const wrap=el("div","kids");
      kids.forEach(k=>{
        const kid=el("div","kid");
        if(k.aud)kid.dataset.aud=k.aud;
        if(k.tone)kid.dataset.tone=k.tone;
        kid.appendChild(build(k,depth+1,here,childInh));
        wrap.appendChild(kid);
      });
      branch.appendChild(wrap);
    }
    return branch;
  }

  function setDepth(n){
    $$(".branch").forEach(b=>{
      if(!b.querySelector(":scope > .kids"))return;
      const collapsed=Number(b.dataset.depth)>=n;
      b.classList.toggle("collapsed",collapsed);
      b.querySelector(":scope > .node").setAttribute("aria-expanded",String(!collapsed));
    });
  }

  function stats(){
    const c={line:0,mod:0,leaf:0,seen:0,store:0,prop:0,gap:0,mkt:0,mnOnly:0,k12Only:0};
    const seen=new Set();
    (function walk(n){
      if(seen.has(n))return;
      seen.add(n);
      if(n.type==="line"||n.type==="mod"||n.type==="leaf"){
        c[n.type]++;c[n.tag||"seen"]++;
        if(n.type==="mod"){if(n.aud==="mn")c.mnOnly++;else if(n.aud==="k12")c.k12Only++;}
      }
      (n.children||[]).forEach(k=>walk(k));
    })(TREE);
    const items=[[c.line,"product lines"],[c.mod,"modules"],[c.leaf,"sub-modules and features"],[c.mnOnly+" · "+c.k12Only,"[MN] · [K12] modules"],[c.seen+c.store,"confirmed nodes"],[c.prop,"proposed nodes"],[c.gap,"not visible yet"],[c.mkt,"market additions"],[Object.keys(S).length,"sources"]];
    $("stats").innerHTML=items.map(i=>'<div class="stat"><b>'+i[0]+"</b><span>"+i[1]+"</span></div>").join("");
  }

  function behTable(){
    const order=[];
    const ref=k=>{let i=order.indexOf(k);if(i<0){order.push(k);i=order.length-1;}return i+1;};
    const cell=c=>{
      if(!c)return "";
      const r=(c.s||[]).map(k=>'<span class="ref"><a href="'+S[k][1]+'" title="'+esc(S[k][0])+'">['+ref(k)+"]</a></span>").join("");
      return esc(c.t)+" "+r;
    };
    const BL=(model.LABELS&&model.LABELS.beh)||{title:"How Mầm non and K12 users behave",pl:"Mobile versus web",mn:"Mầm non",k12:"K12"};
    const block=(cls,label,c)=>c?'<div class="bc '+cls+'"><b>'+label+"</b>"+cell(c)+"</div>":"";
    let h='<h4 style="font-size:15px;margin-bottom:8px">'+esc(BL.title)+'</h4>';
    BEH.forEach(r=>{h+='<div class="who"><h4>'+esc(r.who)+"</h4>"+block("mn",esc(BL.mn),r.mn)+block("k12",esc(BL.k12),r.k12)+block("pl",esc(BL.pl),r.pl)+"</div>";});
    const legacy="Evidence caveat: I found no Vietnamese survey of how often parents check school apps by school level. The K12 parent pattern rests on US research plus what Vietnamese K12 apps emphasise, so treat it as a strong hypothesis to test with your own analytics. Platform recommendations are mine, reasoned from these behaviours.";
    h+='<p class="note">'+esc(model.BEHNOTE||legacy)+"</p>";
    h+="<ol>"+order.map(k=>'<li><a href="'+S[k][1]+'">'+esc(S[k][0])+"</a></li>").join("")+"</ol>";
    $("beh-body").innerHTML=h;
  }

  function makeBoard(cfg){
    const RM=cfg.RM,rmview=cfg.host;
    const MONTHS=RM.months||6,MINMW=RM.minMonthW||150,NB=RM.buckets.length,FIRSTM=1,AFTER=MONTHS+1,NONE=MONTHS+2,Q=0.25,MINSPAN=0.5,ROWH=50,CARDH=42,LABW=168,HEADH=RM.weekLabels?54:40,PADT=6;
    const xOf=v=>v<=1?v*sideW:(v<=AFTER?sideW+(v-1)*monthW:sideW+MONTHS*monthW+(v-AFTER)*sideW);
    const vOf=x=>x<=sideW?x/sideW:(x<=sideW+MONTHS*monthW?1+(x-sideW)/monthW:AFTER+(x-sideW-MONTHS*monthW)/sideW);
    const bw=i=>(i>=FIRSTM&&i<AFTER)?monthW:sideW;
    const snap=v=>Math.round(v/Q)*Q,r2=v=>Math.round(v*1000)/1000,inM=c=>c>=FIRSTM&&c<AFTER;
    const cards=RM.cards,lanes=RM.lanes,ms=RM.milestones||[],brk=RM.breaks||[];
    const byId={};cards.forEach(c=>{byId[c.id]=c;});
    const laneById={};lanes.forEach(l=>{laneById[l.id]=l;});
    const KEY=cfg.key,BKEY=cfg.builtKey||null;
    let ov={},built={},mode="local",canWrite=true,dbRef=null,saveTimer=null,saving=false,pending=false,selId=null,monthW=156,sideW=112,lastL={},lastW={};
    const isBuilt=id=>!!(BKEY&&built[id]);
    const clone=o=>JSON.parse(JSON.stringify(o||{}));
    const keyOf=c=>c.ref.length>1?c.ref[0]+"›"+c.ref[1]:c.ref[0];
    const titleOf=c=>c.title||c.ref[c.ref.length-1];
    const refTitle=c=>(laneById[c.lane].short||laneById[c.lane].label)+": "+titleOf(c);
    const eff=c=>{
      const o=ov[c.id]||{};
      const col=o.col!=null?o.col:c.col;
      let span=o.span!=null?o.span:c.span;
      span=inM(col)?Math.max(Q,Math.min(span,AFTER-col)):1;
      return {col:col,span:span,row:o.row!=null?o.row:null};
    };
    function layout(){
      const out={};
      lanes.forEach(l=>{
        const lc=cards.filter(c=>c.lane===l.id).map(c=>Object.assign({c:c},eff(c)));
        const placed=[];
        const free=(col,span,row)=>!placed.some(p=>p.row===row&&col<p.col+p.span-1e-6&&p.col<col+span-1e-6);
        const fixed=lc.filter(x=>x.row!==null).sort((a,b)=>a.row-b.row||a.col-b.col);
        const auto=lc.filter(x=>x.row===null).sort((a,b)=>a.col-b.col||cards.indexOf(a.c)-cards.indexOf(b.c));
        fixed.concat(auto).forEach(x=>{
          let r=x.row===null?0:x.row;
          while(!free(x.col,x.span,r))r++;
          placed.push({id:x.c.id,col:x.col,span:x.span,row:r});
        });
        placed.forEach(p=>{out[p.id]=p;});
        out["lane:"+l.id]=Math.max(1,placed.reduce((m,p)=>Math.max(m,p.row+1),0));
      });
      return out;
    }
    function fmtPoint(e){
      const idx=Math.max(FIRSTM,Math.min(AFTER-1,Math.ceil(e-1e-9)-1)),f=e-idx,lb=RM.buckets[idx].label;
      return f>=0.99?"hết "+lb:(Math.abs(f-0.5)<0.01?"giữa "+lb:"tuần "+Math.max(1,Math.round(f*4))+" của "+lb);
    }
    function fmtStart(s){
      const idx=Math.max(FIRSTM,Math.min(AFTER-1,Math.floor(s+1e-9))),f=s-idx,lb=RM.buckets[idx].label;
      return f<0.01?"đầu "+lb:(Math.abs(f-0.5)<0.01?"giữa "+lb:"tuần "+(Math.round(f*4)+1)+" của "+lb);
    }
    function warnings(L){
      const w={};
      cards.forEach(c=>{
        if(!c.after||!L[c.id]||isBuilt(c.id))return;
        const me=L[c.id];
        const start=inM(me.col)?me.col:(me.col===0?0:Infinity);
        if(start===Infinity)return;
        c.after.forEach(pid=>{
          if(isBuilt(pid))return;
          const p=byId[pid],pp=L[pid];
          if(!p||!pp)return;
          const pend=inM(pp.col)?(RM.depMode==="start"?pp.col:pp.col+pp.span):(pp.col===0?0:Infinity);
          const msg=pend===Infinity?"Phụ thuộc vào “"+refTitle(p)+"” nhưng module đó chưa có lịch trong giai đoạn này.":(start<pend-1e-6?(RM.depMode==="start"?"Bắt đầu trước khi “"+refTitle(p)+"” bắt đầu ("+fmtStart(pend)+").":"Bắt đầu trước khi “"+refTitle(p)+"” hoàn thành ("+fmtPoint(pend)+")."):"");
          if(msg)(w[c.id]=w[c.id]||[]).push(msg);
        });
      });
      brk.forEach(b=>{
        cards.forEach(c=>{
          const me=L[c.id];
          if(!me||!inM(me.col))return;
          if(me.col<b.to-1e-6&&me.col+me.span>b.from+1e-6)(w[c.id]=w[c.id]||[]).push("Trùng kỳ nghỉ: "+b.title+".");
        });
      });
      return w;
    }
    const when=(p)=>inM(p.col)?fmtStart(p.col)+" → "+fmtPoint(p.col+p.span)+" ("+String(r2(p.span)).replace(".",",")+" tháng)":RM.buckets[p.col].label+(RM.buckets[p.col].sub?" ("+RM.buckets[p.col].sub+")":"");
    function boxHtml(c){
      const l=laneById[c.lane],p=lastL[c.id]||eff(c);
      const ent=cfg.resolve(c);
      const n=ent&&ent.node.planned?ent.node.planned.length:0;
      let h='<div class="rbox"><b>'+esc(cfg.boxTitle)+"</b>"+(BKEY?(isBuilt(c.id)?' <span class="rbox-b done">✓ Đã build xong</span>':' <span class="rbox-b todo">Chưa build xong</span>'):"")+"<br>"+esc(cfg.laneWord)+": "+esc(l.label)+(cfg.showPrio&&l.prio&&l.prio!=="–"?" · ưu tiên "+esc(l.prio):"")+"<br>Lịch: "+esc(when(p))+"<br>Nguồn lịch: "+esc(cfg.sourceText(c))+(n?"<br>Tính năng mới trong lộ trình: "+n:"");
      if(c.after&&c.after.length)h+="<br>Phụ thuộc: "+c.after.map(id=>{const nm=byId[id]?refTitle(byId[id]):id;return esc(nm+(BKEY?(isBuilt(id)?" (Đã build xong)":" (Cần build trước)"):""));}).join("; ");
      (lastW[c.id]||[]).forEach(m=>{h+='<br><span class="wn">'+esc(m)+"</span>";});
      if(c.note)h+="<br>"+esc(c.note);
      return h+"</div>";
    }
    function select(id){
      selId=id;
      rmview.querySelectorAll(".rmcard").forEach(e=>e.classList.toggle("sel",e.dataset.id===id));
      const c=byId[id];if(!c)return;
      const ent=cfg.resolve(c);
      if(!ent){detail.innerHTML='<div class="dt">'+esc(titleOf(c))+"</div><p>Chưa có mô tả trong mindmap.</p>";return;}
      showDetail(ent.node,ent.path,null,ent.inh,boxHtml(c));
    }
    function setStatus(){
      const el=rmview.querySelector('[data-role="rmstat"]');if(!el)return;
      el.textContent=mode==="shared"?(canWrite?"Đã lưu và chia sẻ cho nhóm":"Chỉ xem (không có quyền chỉnh)"):"Lưu trên trình duyệt này";
    }
    const today=()=>{
      const n=new Date(),dim=new Date(n.getFullYear(),n.getMonth()+1,0).getDate();
      const x=1+(n.getFullYear()-2026)*12+(n.getMonth()-9)+(n.getDate()-1)/dim;
      return (x>=1&&x<AFTER)?x:null;
    };
    function renderRoadmap(){
      if(rmview.hidden)return;
      const sc=rmview.querySelector(".rmscroll"),sl=sc?sc.scrollLeft:0,stp=sc?sc.scrollTop:0;
      const avail=(sc&&sc.clientWidth)||rmview.clientWidth||900;
      monthW=Math.max(MINMW,Math.floor((avail-LABW-3*sideW-2)/MONTHS));
      const AREAW=3*sideW+MONTHS*monthW;
      const L=layout(),WN=warnings(L);lastL=L;lastW=WN;
      let h='<div class="rmtop"><div class="rmleg">'+cfg.legend+'</div><div class="rmact"><span class="rmstat" data-role="rmstat"></span><button type="button" data-act="reset">Khôi phục lịch mặc định</button>'+(cfg.actions||"")+'<button type="button" data-act="copy">Sao chép bố cục</button></div></div>';
      h+='<div class="rmscroll"><div class="rmboard" style="width:'+(LABW+AREAW)+'px">';
      h+='<div class="rmhead" style="height:'+HEADH+'px"><div class="rmcorner" style="width:'+LABW+'px">'+esc(cfg.corner)+'</div>';
      RM.buckets.forEach((b,i)=>{h+='<div class="rmbh b'+i+(i>=FIRSTM&&i<AFTER?'':' side')+'" style="width:'+bw(i)+'px"><b>'+esc(b.label)+"</b>"+(b.sub?"<small>"+esc(b.sub)+"</small>":"")+(RM.weekLabels&&i>=FIRSTM&&i<AFTER?'<span class="rmwk"><i>1</i><i>8</i><i>15</i><i>22</i></span>':"")+"</div>";});
      h+='</div><div class="rmflags" style="margin-left:'+LABW+'px;width:'+AREAW+'px">';
      ms.forEach((m,i)=>{h+='<button type="button" class="rmflag'+(m.hl?" hl":"")+'" data-ms="'+i+'" style="left:'+Math.round(xOf(m.at))+'px" title="'+esc(m.title)+'">'+esc(m.label)+"</button>";});
      brk.forEach((b,i)=>{h+='<button type="button" class="rmflag brk" data-br="'+i+'" style="left:'+Math.round((xOf(b.from)+xOf(b.to))/2)+'px" title="'+esc(b.title)+'">'+esc(b.label)+"</button>";});
      const tx=today();
      if(tx!==null)h+='<span class="rmflag now" style="left:'+Math.round(xOf(tx))+'px">Hôm nay</span>';
      h+="</div>";
      lanes.forEach(l=>{
        const rows=L["lane:"+l.id];
        h+='<div class="rmlane t-'+l.tone+'"><button type="button" class="rmlabel" data-lane="'+l.id+'" style="width:'+LABW+'px"><span class="rmprio">'+esc(l.prio||"")+"</span><b>"+esc(l.label)+"</b><small>"+esc(l.sub||"")+'</small></button><div class="rmarea" data-lane="'+l.id+'" style="width:'+AREAW+"px;height:"+(rows*ROWH+PADT*2)+'px">';
        for(let i=0;i<NB;i++)h+='<div class="rmcol c'+i+(i>=FIRSTM&&i<AFTER?' m':' side')+'" style="left:'+Math.round(xOf(i))+"px;width:"+bw(i)+'px"></div>';
        brk.forEach(b=>{h+='<div class="rmbreak" style="left:'+Math.round(xOf(b.from))+'px;width:'+Math.round(xOf(b.to)-xOf(b.from))+'px"></div>';});
        ms.forEach(m=>{h+='<div class="rmline'+(m.hl?" hl":"")+'" style="left:'+Math.round(xOf(m.at))+'px"></div>';});
        if(tx!==null)h+='<div class="rmline now" style="left:'+Math.round(xOf(tx))+'px"></div>';
        cards.filter(c=>c.lane===l.id).forEach(c=>{
          const p=L[c.id],ent=cfg.resolve(c),n=ent&&ent.node.planned?ent.node.planned.length:0,wn=WN[c.id],bd=isBuilt(c.id);
          const inMonths=inM(p.col);
          h+='<div class="rmcard'+(c.plan==="prop"?" prop":"")+(c.kind?" k-"+c.kind:"")+(bd?" built":"")+(wn?" warn":"")+(selId===c.id?" sel":"")+'" tabindex="0" role="button" data-id="'+c.id+'" style="left:'+Math.round(xOf(p.col)+4)+"px;top:"+(p.row*ROWH+PADT)+"px;width:"+Math.max(24,Math.round((inM(p.col)?p.span*monthW:sideW)-8))+"px;height:"+CARDH+'px" title="'+esc(titleOf(c)+(bd?" · ✓ Đã build xong":"")+" · "+when(p))+'"><span class="rmt">'+esc(titleOf(c))+'</span><span class="rmm">'+(bd?'<b class="bbadge" title="Đã build xong">✓</b>':"")+(c.badge?'<b class="pbadge" title="'+esc(c.badgeTip||"")+'">'+esc(c.badge)+"</b>":(n?'<b class="pbadge">+'+n+"</b>":""))+(wn?'<b class="wbadge">!</b>':"")+"</span>"+(inMonths?'<i class="rz" title="Kéo để đổi độ dài (theo tuần)"></i>':"")+"</div>";
        });
        h+="</div></div>";
      });
      h+="</div></div>";
      rmview.innerHTML=h;
      const sc2=rmview.querySelector(".rmscroll");sc2.scrollLeft=sl;sc2.scrollTop=stp;
      setStatus();
    }
    function setBuilt(id,val){
      if(!BKEY||!byId[id]||!canWrite)return;
      if(val)built[id]=true;else delete built[id];
      renderRoadmap();
      if(selId)select(selId);
      scheduleSave();
    }
    function commit(id,patch){
      const c=byId[id];if(!c||!canWrite)return;
      const o=ov[id]=ov[id]||{};
      Object.assign(o,patch);
      if(o.span==null)o.span=c.span;
      renderRoadmap();select(id);scheduleSave();
    }
    function persistLocal(){try{localStorage.setItem(KEY,JSON.stringify(ov));if(BKEY)localStorage.setItem(BKEY,JSON.stringify(built));}catch(err){}}
    function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(doSave,500);}
    function doSave(){
      if(mode==="shared"&&dbRef){
        if(saving){pending=true;return;}
        saving=true;
        const payload={cards:clone(ov),updatedAt:Date.now()};
        if(BKEY)payload.built=clone(built);
        dbRef.set(payload).then(()=>{saving=false;if(pending){pending=false;doSave();}}).catch(e=>{
          saving=false;
          if(e&&e.code==="invalid_argument"){canWrite=false;}else{mode="local";persistLocal();}
          setStatus();
        });
      }else persistLocal();
    }
    function moveCol(p,card,dir,step){
      const s0=(ov[card.id]&&ov[card.id].span!=null)?ov[card.id].span:card.span;
      if(p.col===0)return dir>0?FIRSTM:0;
      if(p.col===AFTER)return dir>0?NONE:Math.max(FIRSTM,r2(AFTER-Math.min(s0,MONTHS)));
      if(p.col===NONE)return dir<0?AFTER:NONE;
      const n=p.col+dir*step;
      if(n<FIRSTM-1e-6)return 0;
      if(n+p.span>AFTER+1e-6)return dir>0?AFTER:r2(AFTER-p.span);
      return r2(n);
    }
    let drag=null;
    rmview.addEventListener("pointerdown",ev=>{
      const card=ev.target.closest(".rmcard");
      if(!card||ev.button!==0)return;
      drag={id:card.dataset.id,card:card,resize:!!ev.target.closest(".rz"),x:ev.clientX,y:ev.clientY,left:card.offsetLeft,top:card.offsetTop,width:card.offsetWidth,moved:false,pid:ev.pointerId};
      try{card.setPointerCapture(ev.pointerId);}catch(err){}
    });
    rmview.addEventListener("pointermove",ev=>{
      if(!drag||ev.pointerId!==drag.pid)return;
      const dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;
      if(!drag.moved&&Math.abs(dx)+Math.abs(dy)<5)return;
      if(!canWrite)return;
      drag.moved=true;drag.card.classList.add("drag");
      if(drag.resize)drag.card.style.width=Math.max(40,drag.width+dx)+"px";
      else{drag.card.style.left=(drag.left+dx)+"px";drag.card.style.top=(drag.top+dy)+"px";}
    });
    const endDrag=ev=>{
      if(!drag||(ev&&ev.pointerId!==drag.pid))return;
      const d=drag;drag=null;
      d.card.classList.remove("drag");
      if(!d.moved){select(d.id);return;}
      if(d.resize){commit(d.id,{span:Math.max(MINSPAN,snap((d.card.offsetWidth+8)/monthW))});return;}
      const left=parseFloat(d.card.style.left),top=parseFloat(d.card.style.top);
      const lane=byId[d.id].lane,maxRow=lastL["lane:"+lane];
      const v=vOf(left-4);
      let col;
      if(v<0.6)col=0;
      else if(v<1)col=FIRSTM;
      else if(v>=AFTER+0.5)col=NONE;
      else if(v>AFTER-0.25)col=AFTER;
      else col=r2(Math.max(FIRSTM,Math.min(AFTER-MINSPAN,snap(v))));
      commit(d.id,{col:col,row:Math.max(0,Math.min(maxRow,Math.round((top-PADT)/ROWH)))});
    };
    rmview.addEventListener("pointerup",endDrag);
    rmview.addEventListener("pointercancel",endDrag);
    rmview.addEventListener("keydown",ev=>{
      const card=ev.target.closest&&ev.target.closest(".rmcard");
      if(!card)return;
      const id=card.dataset.id,p=lastL[id];
      if(ev.key==="Enter"||ev.key===" "){select(id);ev.preventDefault();return;}
      if(!canWrite)return;
      const k=ev.key;
      if(k==="ArrowLeft"||k==="ArrowRight"){
        const dir=k==="ArrowRight"?1:-1,step=(ev.ctrlKey||ev.metaKey)?1:Q;
        if(ev.shiftKey){if(inM(p.col))commit(id,{span:Math.max(MINSPAN,p.span+dir*step)});}
        else commit(id,{col:moveCol(p,byId[id],dir,step),row:p.row});
        ev.preventDefault();
        const again=rmview.querySelector('.rmcard[data-id="'+id+'"]');if(again)again.focus();
      }else if(k==="ArrowUp"||k==="ArrowDown"){
        commit(id,{row:Math.max(0,p.row+(k==="ArrowDown"?1:-1))});
        ev.preventDefault();
        const again=rmview.querySelector('.rmcard[data-id="'+id+'"]');if(again)again.focus();
      }
    });
    rmview.addEventListener("click",ev=>{
      const act=ev.target.closest("[data-act]");
      if(act){
        if(act.dataset.act==="reset"){if(canWrite){ov={};renderRoadmap();scheduleSave();}}
        else if(act.dataset.act==="clear"){if(canWrite){cards.forEach(c=>{ov[c.id]={col:NONE,span:c.span};});renderRoadmap();scheduleSave();}}
        else if(act.dataset.act==="copy"){try{navigator.clipboard.writeText(JSON.stringify(ov,null,1));act.textContent="Đã sao chép";setTimeout(()=>{act.textContent="Sao chép bố cục";},1500);}catch(err){}}
        return;
      }
      const fl=ev.target.closest(".rmflag[data-ms]");
      if(fl){
        const m=ms[Number(fl.dataset.ms)];
        showDetail({type:"root",label:m.title,what:m.what,blocks:m.blocks,src:m.src,vi:true},["Lộ trình","Mốc thời gian"],null,{vi:true});
        return;
      }
      const fb=ev.target.closest(".rmflag[data-br]");
      if(fb){
        const b=brk[Number(fb.dataset.br)];
        showDetail({type:"root",label:b.title,what:b.what,src:b.src,vi:true},["Lộ trình","Kỳ nghỉ"],null,{vi:true});
        return;
      }
      const lb=ev.target.closest(".rmlabel");
      if(lb){
        const l=laneById[lb.dataset.lane],ent=cfg.laneEntry(l);
        if(ent)showDetail(ent.node,ent.path,null,ent.inh,cfg.laneBox(l));
      }
    });
    if(typeof ResizeObserver!=="undefined"){
      let t=null;
      new ResizeObserver(()=>{clearTimeout(t);t=setTimeout(()=>{if(!rmview.hidden)renderRoadmap();},120);}).observe(rmview);
    }
    (async function setupStore(){
      try{
        if(cfg.ver&&localStorage.getItem(KEY+"-ver")!==cfg.ver){localStorage.removeItem(KEY);localStorage.setItem(KEY+"-ver",cfg.ver);}
        const s=localStorage.getItem(KEY);if(s)ov=JSON.parse(s)||{};
        if(BKEY){const bs=localStorage.getItem(BKEY);if(bs)built=JSON.parse(bs)||{};}
      }catch(err){}
      try{
        if(!(window.claude&&typeof window.claude.use==="function"))return;
        const db=await window.claude.use("db");
        if(!db)return;
        try{
          const u=await window.claude.use("user");
          if(u&&typeof u.can==="function"){const c=await u.can("data.write");if(c===false)canWrite=false;}
        }catch(err){}
        dbRef=db.doc(cfg.dbPath);mode="shared";
        dbRef.onSnapshot(snap=>{
          const d=snap.exists?snap.data():null;
          ov=d&&d.cards?clone(d.cards):{};
          if(BKEY&&d&&d.built)built=clone(d.built);
          renderRoadmap();
          if(selId)select(selId);
        },()=>{mode="local";setStatus();});
        setStatus();
      }catch(err){}
    })();
    const api={layout:layout,warnings:warnings,get ov(){return ov;},get built(){return built;},isBuilt:isBuilt,setBuilt:setBuilt,card:id=>byId[id],render:renderRoadmap,commit:commit,select:select,when:when};
    window[cfg.expose]=api;
    return api;
  }

  
  function initRoadmap(){
    const mmhead=$("mmhead"),mmmap=$("mmmap"),rmview=$("rmview"),rmview2=$("rmview2");
    const keyOf=c=>c.ref.length>1?c.ref[0]+"›"+c.ref[1]:c.ref[0];
    const boards={};
    if(model.ROADMAP)boards.rm=makeBoard({RM:model.ROADMAP,host:rmview,key:"eco-roadmap-layout-v1",dbPath:"roadmap/layout",expose:"__rm",boxTitle:"Lộ trình",laneWord:"Dòng sản phẩm",showPrio:true,corner:"Ưu tiên · dòng sản phẩm",
      resolve:c=>reg.get(keyOf(c)),laneEntry:l=>reg.get(l.line),
      laneBox:l=>'<div class="rbox"><b>Ưu tiên '+esc(l.prio||"")+"</b><br>"+esc(l.note||"")+"</div>",
      sourceText:c=>c.plan==="prop"?"đề xuất theo thứ tự ưu tiên (viền nét đứt)":"lộ trình hiện tại",
      legend:'<span><i class="rs"></i>Lộ trình hiện tại</span><span><i class="rs p"></i>Đề xuất lịch</span><span><i class="rs w"></i>Cảnh báo phụ thuộc</span><span><b class="pbadge">+N</b>tính năng mới trong module</span>'});
    if(model.ROADMAP2){
      rmview2.classList.add("rb2");
      const R2=model.ROADMAP2,laneOf={};R2.lanes.forEach(l=>{laneOf[l.id]=l;});
      rbBoard=boards.rb=makeBoard({RM:R2,host:rmview2,key:"eco-roadmap-rebuild-layout-v1",ver:"v5",builtKey:"eco-roadmap-rebuild-built-v1",dbPath:"roadmap/layout-rebuild",expose:"__rm2",boxTitle:"Rebuild School Portal",laneWord:"Module",showPrio:false,corner:"Module · sub-module",
        resolve:c=>({node:c.node,path:["Rebuild School Portal",laneOf[c.lane].label],inh:{vi:true}}),
        laneEntry:l=>l.node?{node:l.node,path:["Rebuild School Portal"],inh:{vi:true}}:null,
        laneBox:l=>"",sourceText:c=>"bố cục do chủ sản phẩm sắp xếp (23/10/2026), đã đối chiếu với PRD; báo cáo không có ngày",
        legend:R2.legend,actions:'<button type="button" data-act="clear">Bỏ lịch đề xuất</button>'});
    }
    const rbBtn=$("vbar").querySelector('[data-view="rb"]');if(rbBtn)rbBtn.hidden=!model.ROADMAP2;
    if(!boards.rm&&!boards.rb)return;
    seg("seg-view",b=>{
      const v=b.dataset.view;
      mmhead.hidden=v!=="mm";mmmap.hidden=v!=="mm";rmview.hidden=v!=="rm";rmview2.hidden=v!=="rb";
      if(v==="rm"&&boards.rm)boards.rm.render();
      if(v==="rb"&&boards.rb)boards.rb.render();
    });
  }

function applyLevel(v){
    $$(".node[data-lv]").forEach(n=>{n.classList.toggle("lvdim",v!=="all"&&n.dataset.lv.split(" ").indexOf(v)<0);});
  }
  function applyPlat(v){
    $$(".node[data-plat]").forEach(n=>{n.classList.toggle("pldim",v!=="all"&&n.dataset.plat!=="both"&&n.dataset.plat!==v);});
  }
  function seg(role,fn){
    $(role).addEventListener("click",e=>{
      const b=e.target.closest("button");if(!b)return;
      $$('[data-role="'+role+'"] button').forEach(x=>x.classList.toggle("on",x===b));
      fn(b);
    });
  }

  tree.appendChild(build(TREE,0,[],null));
  $$('[data-role="seg-aud"] button').forEach(b=>{if(b.dataset.aud!=="all"&&!TREE.children.some(c=>c.aud===b.dataset.aud))b.hidden=true;});
  setDepth(2);
  stats();
  behTable();
  initRoadmap();
  if(!model.ROADMAP)$("seg-view").hidden=true;
  (function infoToggle(){
    const b=$("itoggle"),KEY="eco-info-hidden-"+(root.id||"x");
    function setInfo(show){
      banner.hidden=!show;$("stats").hidden=!show;
      root.classList.toggle("info-hidden",!show);
      b.classList.toggle("closed",!show);
      b.setAttribute("aria-expanded",show?"true":"false");
      const t=show?"Ẩn thông tin tổng quan":"Mở thông tin tổng quan";
      b.setAttribute("aria-label",t);b.title=t;
    }
    try{if(localStorage.getItem(KEY)==="1")setInfo(false);}catch(err){}
    b.addEventListener("click",()=>{
      const show=banner.hidden;setInfo(show);
      try{if(show)localStorage.removeItem(KEY);else localStorage.setItem(KEY,"1");}catch(err){}
    });
  })();
  $("ptoggle").addEventListener("click",()=>setPanel($("split").classList.contains("collapsed")));
  $("pclose").addEventListener("click",()=>setPanel(false));
  detail.addEventListener("change",ev=>{
    const chk=ev.target.closest('[data-role="built-chk"]');
    if(!chk||!rbBoard)return;
    const id=chk.dataset.id,cur=rbBoard.isBuilt(id),btn=detail.querySelector('[data-role="built-confirm"]');
    if(btn)btn.disabled=(chk.checked===cur);
  });
  detail.addEventListener("click",ev=>{
    const g=ev.target.closest("[data-goto]");
    if(g&&rbBoard){rbBoard.select(g.dataset.goto);return;}
    const cf=ev.target.closest('[data-role="built-confirm"]');
    if(cf&&!cf.disabled&&rbBoard){
      const id=cf.dataset.id,chk=detail.querySelector('[data-role="built-chk"]');
      const next=chk?chk.checked:!rbBoard.isBuilt(id);
      const c=rbBoard.card(id),D=c&&c.node&&c.node.dep;
      pendingBuilt={id:id,val:next};
      $("bmodal-title").textContent=next?"Xác nhận đã build xong module":"Xác nhận huỷ trạng thái đã build xong";
      const unl=(D&&D.unlocks&&D.unlocks.length)?D.unlocks.map(u=>u.label).join(", "):"Không có module phụ thuộc phía sau";
      $("bmodal-body").innerHTML=next
        ? '<p>Bạn có chắc chắn muốn xác nhận module <b>'+esc(c?c.title:id)+" ("+esc(D?D.code:id)+')</b> đã được <b>build xong</b> lần cuối không?</p><p class="bmodal-sub">Sau khi bấm <b>Xác nhận</b>, hệ thống sẽ tự động cập nhật trạng thái phụ thuộc của module này từ <b>“Cần build trước”</b> sang <b>“✓ Đã build xong”</b> tại tất cả các module liên quan ('+esc(unl)+").</p>"
        : '<p>Bạn có chắc chắn muốn chuyển module <b>'+esc(c?c.title:id)+" ("+esc(D?D.code:id)+')</b> về trạng thái <b>chưa build xong</b> không?</p><p class="bmodal-sub">Các module phụ thuộc vào module này sẽ hiển thị lại yêu cầu <b>“Cần build trước”</b>.</p>';
      $("built-modal").hidden=false;
    }
  });
  $("bmodal-cancel").addEventListener("click",()=>{$("built-modal").hidden=true;pendingBuilt=null;});
  $("bmodal-ok").addEventListener("click",()=>{
    if(pendingBuilt&&rbBoard)rbBoard.setBuilt(pendingBuilt.id,pendingBuilt.val);
    $("built-modal").hidden=true;pendingBuilt=null;
  });
  $("built-modal").addEventListener("click",ev=>{if(ev.target===$("built-modal")){$("built-modal").hidden=true;pendingBuilt=null;}});
  detail.innerHTML='<div class="dt">Start here</div><p>Product lines, who uses them (Mầm non, K12 or both) and where each feature should live (mobile, web or both). ECO Me · Phụ huynh and ECO Teacher serve both audiences, so they sit under both branches; a [MN] or [K12] prefix on a module means only that audience uses it. Amber nodes are market additions.</p><p>Click any node on the left for its explanation, vendors, platform recommendation and sources. Open Behaviour (above) to see why Mầm non and K12 differ. Use Platform, Level and Highlight to fade what you do not need. Drag the divider to resize the panels.</p>';

  seg("seg-depth",b=>setDepth(Number(b.dataset.depth)));
  seg("seg-right",b=>showRight(b.dataset.right));

  (function gutter(){
    const split=$("split"),g=$("gutter");
    const KEY="eco-split-w";
    const setW=w=>{const total=split.getBoundingClientRect().width||1200;w=Math.max(300,Math.min(w,Math.round(total*0.72)));split.style.setProperty("--rw",w+"px");return w;};
    try{const s=parseInt(localStorage.getItem(KEY),10);if(s)setW(s);}catch(err){}
    const save=w=>{try{localStorage.setItem(KEY,String(Math.round(w)));}catch(err){}};
    let drag=false;
    g.addEventListener("pointerdown",ev=>{drag=true;g.classList.add("drag");try{g.setPointerCapture(ev.pointerId);}catch(err){}ev.preventDefault();});
    g.addEventListener("pointermove",ev=>{if(!drag)return;const r=split.getBoundingClientRect();setW(r.right-ev.clientX-6);});
    const end=()=>{if(!drag)return;drag=false;g.classList.remove("drag");const w=parseFloat(getComputedStyle(split).getPropertyValue("--rw"))||0;if(w)save(w);};
    g.addEventListener("pointerup",end);g.addEventListener("pointercancel",end);
    g.addEventListener("keydown",ev=>{
      if(ev.key!=="ArrowLeft"&&ev.key!=="ArrowRight")return;
      const cur=parseFloat(split.style.getPropertyValue("--rw"))||parseFloat(getComputedStyle(split).getPropertyValue("--rw"))||460;
      const w=setW(cur+(ev.key==="ArrowLeft"?24:-24));save(w);ev.preventDefault();
    });
    g.addEventListener("dblclick",()=>{split.style.removeProperty("--rw");try{localStorage.removeItem(KEY);}catch(err){}});
  })();

  seg("seg-aud",b=>{const a=b.dataset.aud;$$(".kid[data-aud]").forEach(k=>{k.style.display=(a==="all"||k.dataset.aud===a)?"":"none";});});
  seg("seg-plat",b=>applyPlat(b.dataset.plat));
  seg("seg-focus",b=>{if(b.dataset.focus==="mkt")tree.setAttribute("data-focus","mkt");else tree.removeAttribute("data-focus");});
  seg("seg-lv",b=>applyLevel(b.dataset.lv));
}

const savedModel=deepFreeze(makeSavedModel());
const workingModel=makeWorkingModel();
mount(document.getElementById("panel-saved"),savedModel,"<b>Saved · legacy.</b> Frozen snapshot of the mindmap as of 1 Oct 2026 (version 3). Kept for reference; do not edit.","saved");
mount(document.getElementById("panel-working"),workingModel,"<b>Working.</b> Starts identical to Saved. This is the copy to edit; Saved is not affected by anything done here.","working");

(function tabs(){
  const btns=[...document.querySelectorAll(".tab")];
  const panels={saved:document.getElementById("panel-saved"),working:document.getElementById("panel-working")};
  function show(name){
    btns.forEach(b=>b.setAttribute("aria-selected",String(b.dataset.tab===name)));
    Object.keys(panels).forEach(k=>{panels[k].hidden=(k!==name);});
  }
  btns.forEach(b=>b.addEventListener("click",()=>show(b.dataset.tab)));
  btns.forEach((b,i)=>b.addEventListener("keydown",e=>{
    if(e.key==="ArrowRight"||e.key==="ArrowLeft"){
      const n=btns[(i+(e.key==="ArrowRight"?1:btns.length-1))%btns.length];
      n.focus();show(n.dataset.tab);
    }
  }));
  show("working");
})();
window.ECO={saved:savedModel,working:workingModel};



