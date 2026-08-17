const opportunities = [
  {
    rank: "01",
    title: "Open-source migration bounty",
    source: "Maintainer-funded issue",
    cash: "$200",
    score: 88,
    deadline: "13 days",
    evidence: "Direct funded-bounty statement",
    tone: "green",
  },
  {
    rank: "02",
    title: "Document intelligence challenge",
    source: "Official hackathon brief",
    cash: "$250",
    score: 79,
    deadline: "17 days",
    evidence: "Second-place cash-equivalent card",
    tone: "cyan",
  },
  {
    rank: "03",
    title: "Self-healing scraper challenge",
    source: "Organizer launch email",
    cash: "$0 verified",
    score: 42,
    deadline: "6 days",
    evidence: "Hardware and credits only in latest email",
    tone: "amber",
  },
];

const audit = [
  ["14:30:02", "Collector returned structured output", "ok"],
  ["14:30:03", "Evidence gate verified cash claims", "ok"],
  ["14:31:44", "DOM drift removed eligibility", "bad"],
  ["14:31:44", "Publication blocked; repair queued", "warn"],
];

function renderOpportunities() {
  const container = document.querySelector("#opportunityList");
  container.innerHTML = opportunities.map((item) => `
    <article class="opportunity-card ${item.tone}">
      <span class="rank">${item.rank}</span>
      <div class="opportunity-main">
        <h3>${item.title}</h3>
        <p>${item.source}</p>
        <div class="evidence"><span>Evidence</span>${item.evidence}</div>
      </div>
      <div class="opportunity-meta">
        <strong>${item.cash}</strong>
        <span>score ${item.score}</span>
        <small>${item.deadline} left</small>
      </div>
    </article>
  `).join("");
}

function renderAudit() {
  document.querySelector("#auditTimeline").innerHTML = audit.map(([time, message, state]) => `
    <li class="${state}"><time>${time}</time><p>${message}</p></li>
  `).join("");
}

document.querySelector("#refreshButton").addEventListener("click", (event) => {
  const button = event.currentTarget;
  button.textContent = "Evidence gate passed";
  button.classList.add("success");
  window.setTimeout(() => {
    button.textContent = "Re-run evidence gate";
    button.classList.remove("success");
  }, 1800);
});

renderOpportunities();
renderAudit();
