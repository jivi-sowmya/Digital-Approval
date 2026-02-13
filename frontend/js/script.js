/* ================= LOGIN / LOGOUT ================= */

function login(event){
    event.preventDefault();

    const role = document.getElementById("role")?.value;
    if(!role){
        alert("Please select a role");
        return;
    }

    localStorage.setItem("userRole", role);

    window.location.href =
        role === "employee"
        ? "employee-dashboard.html"
        : "manager-dashboard.html";
}

function logout(){
    localStorage.clear();
    window.location.href="login.html";
}


/* ================= DASHBOARD STATS ================= */

function loadDashboardStats(){
    const requests = JSON.parse(localStorage.getItem("requests")) || [];

    const total = document.getElementById("total");
    if(!total) return;

    document.getElementById("total").innerText = requests.length;
    document.getElementById("pending").innerText =
        requests.filter(r=>r.status==="Pending").length;
    document.getElementById("approved").innerText =
        requests.filter(r=>r.status==="Approved").length;
    document.getElementById("rejected").innerText =
        requests.filter(r=>r.status==="Rejected").length;
}


/* ================= TYPE SWITCH ================= */

function handleTypeChange(){

    const type=document.getElementById("requestType").value;

    document.querySelectorAll(".conditional-section")
        .forEach(el=>el.style.display="none");

    if(type==="Leave"){
        document.getElementById("leaveFields").style.display="block";
    }

    else if(type==="Purchase"||type==="Expense"){
        document.getElementById("purchaseDateField").style.display="block";
        document.getElementById("amountField").style.display="block";
        document.getElementById("fileField").style.display="block";
    }

    else if(type==="Loan"){
        document.getElementById("loanFields").style.display="block";
    }
}



/* ================= SUBMIT REQUEST ================= */

function submitRequest(e){
    e.preventDefault();

    const req={
        id:Date.now(),
        type:document.getElementById("requestType")?.value,
        title:document.getElementById("title")?.value,
        description:document.getElementById("description")?.value,

        fromDate:document.getElementById("fromDate")?.value||null,
        toDate:document.getElementById("toDate")?.value||null,

        purchaseDate:document.getElementById("purchaseDate")?.value||null,
        amount:document.getElementById("amount")?.value||null,

        loanType:document.getElementById("loanType")?.value||null,
        loanAmount:document.getElementById("loanAmount")?.value||null,

        status:"Pending",
        createdAt:new Date().toLocaleString()
    };

    const list=JSON.parse(localStorage.getItem("requests"))||[];
    list.push(req);
    localStorage.setItem("requests",JSON.stringify(list));

    alert("Request submitted successfully");
    window.location.href="employee-dashboard.html";
}


/* ================= MY REQUESTS ================= */

function loadMyRequests(){
    const box=document.getElementById("requestList");
    if(!box) return;

    const requests=JSON.parse(localStorage.getItem("requests"))||[];
    box.innerHTML="";

    if(requests.length===0){
        box.innerHTML="<p>No requests yet</p>";
        return;
    }

    [...requests].reverse().forEach(r=>{
        const card=document.createElement("div");
        card.className="request-card";

        card.innerHTML=`
        <div class="request-left">
            <div class="request-type">${r.type}</div>
            <div class="request-title">${r.title}</div>
            <div class="request-meta">${getInfo(r)}</div>
        </div>
        <div class="status ${r.status}">${r.status}</div>
        `;
        box.appendChild(card);
    });
}


/* ================= MANAGER DASHBOARD ================= */

function loadManagerDashboard(){
    const requests=JSON.parse(localStorage.getItem("requests"))||[];

    const total=document.getElementById("m-total");
    if(!total) return;

    document.getElementById("m-total").innerText=requests.length;
    document.getElementById("m-pending").innerText=
        requests.filter(r=>r.status==="Pending").length;
    document.getElementById("m-approved").innerText=
        requests.filter(r=>r.status==="Approved").length;
    document.getElementById("m-rejected").innerText=
        requests.filter(r=>r.status==="Rejected").length;
}


/* ================= APPROVAL PAGE ================= */

function loadManagerApprovals(){

    const container=document.getElementById("managerRequestList");
    const history=document.getElementById("historyList");
    if(!container) return;

    const requests=JSON.parse(localStorage.getItem("requests"))||[];
    container.innerHTML="";
    history && (history.innerHTML="");

    const pending=requests.map((r,i)=>({...r,index:i}))
        .filter(r=>r.status==="Pending");

    const done=requests.map((r,i)=>({...r,index:i}))
        .filter(r=>r.status!=="Pending");

    if(pending.length===0)
        container.innerHTML="<p>No pending approvals 🎉</p>";

    pending.forEach(r=>{
        const card=document.createElement("div");
        card.className="request-card modern";

        card.innerHTML=`
        <div class="left">
            <div class="tag">${r.type}</div>
            <h3>${r.title}</h3>
            <p>${getInfo(r)}</p>
        </div>

        <div class="actions">
            <button class="btn view" onclick="viewDetails(${r.index})">View</button>
            <button class="btn approve" onclick="updateStatus(${r.index},'Approved')">Approve</button>
            <button class="btn reject" onclick="updateStatus(${r.index},'Rejected')">Reject</button>
            <button class="btn delete" onclick="deleteRequest(${r.index})">Delete</button>
        </div>
        `;
        container.appendChild(card);
    });

    done.forEach(r=>{
        const row=document.createElement("div");
        row.className="history-card";

        row.innerHTML=`
        <div>
            <b>${r.title}</b>
            <span class="small">${getInfo(r)}</span>
        </div>
        <span class="badge ${r.status.toLowerCase()}">${r.status}</span>
        `;
        history.appendChild(row);
    });
}


/* ================= HELPERS ================= */

function getInfo(r){
    if(r.type==="Leave") return `${r.fromDate} → ${r.toDate}`;
    if(r.type==="Loan") return `₹${r.loanAmount} • ${r.loanType}`;
    return r.purchaseDate||"";
}


/* ================= ACTIONS ================= */

function updateStatus(i,status){
    const list=JSON.parse(localStorage.getItem("requests"))||[];
    list[i].status=status;
    localStorage.setItem("requests",JSON.stringify(list));
    loadManagerApprovals();
}

function deleteRequest(i){
    if(!confirm("Delete this request?")) return;

    const list=JSON.parse(localStorage.getItem("requests"))||[];
    list.splice(i,1);
    localStorage.setItem("requests",JSON.stringify(list));
    loadManagerApprovals();
}


/* ================= VIEW DRAWER ================= */

function viewDetails(i){

    const list = JSON.parse(localStorage.getItem("requests")) || [];
    const r = list[i];
    if(!r) return;

    const body=document.getElementById("drawerContent");
    const drawer=document.getElementById("detailsDrawer");
    const overlay=document.getElementById("drawerOverlay");

    if(!body || !drawer || !overlay){
        alert("Drawer HTML missing");
        return;
    }

    body.innerHTML=`
    <div class="drawer-row">📌 <b>Type:</b> ${r.type}</div>
    <div class="drawer-row">📝 <b>Title:</b> ${r.title}</div>
    <div class="drawer-row">📖 <b>Description:</b> ${r.description}</div>

    ${r.type==="Leave"
        ? `<div class="drawer-row">📅 <b>Leave:</b> ${r.fromDate} → ${r.toDate}</div>`
        : ""}

    ${r.type==="Loan"
        ? `<div class="drawer-row">💰 <b>Loan:</b> ₹${r.loanAmount} • ${r.loanType}</div>`
        : ""}

    <div class="drawer-row">📊 <b>Status:</b> ${r.status}</div>
    <div class="drawer-row">⏱ <b>Created:</b> ${r.createdAt}</div>
    `;

    drawer.classList.add("show");
    overlay.classList.add("show");
}


function closeDrawer(){
    document.getElementById("detailsDrawer")?.classList.remove("show");
    document.getElementById("drawerOverlay")?.classList.remove("show");
}


/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded",()=>{

    loadDashboardStats();
    loadMyRequests();
    loadManagerDashboard();
    loadManagerApprovals();

    const select=document.getElementById("requestType");
    if(select){
        select.addEventListener("change",handleTypeChange);
        handleTypeChange();
    }
});
document.querySelectorAll('.upload-box input').forEach(input=>{
input.addEventListener("change",()=>{
const span=document.getElementById(input.id+"Name");

if(input.files.length>0){
span.textContent="✔ "+input.files[0].name;
span.style.color="#2e7d32";
}
});
});
<script>
const select = document.getElementById("requestSelect");
const box = document.getElementById("selectedOption");
const options = document.querySelectorAll("#optionsList div");
const hiddenInput = document.getElementById("requestType");

box.onclick = () => select.classList.toggle("open");

options.forEach(opt=>{
opt.onclick=()=>{
box.innerHTML = opt.innerHTML + '<span class="arrow">⌄</span>';
hiddenInput.value = opt.dataset.value;
select.classList.remove("open");

handleTypeChange(); // IMPORTANT → triggers form sections
};
});

document.addEventListener("click",(e)=>{
if(!select.contains(e.target))
select.classList.remove("open");
});
</script>
