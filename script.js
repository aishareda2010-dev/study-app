let currentAccount = null;
let selectedAvatar = "avatar1";

let tasks = [];
let sessions = 0;
let xp = 0;
let streak = 0;
let goal = 0;

let timer = null;
let time = 25 * 60;

let breakTimer = null;
let breakTime = 5 * 60;

let currentFilter = "all";

let quizIndex = 0;
let quizScore = 0;

let flashIndex = 0;

let sound = null;


/* =========================
   ACCOUNTS
========================= */

function getAccounts() {
  return JSON.parse(localStorage.getItem("studyAccounts") || "{}");
}

function saveAccounts(accounts) {
  localStorage.setItem(
    "studyAccounts",
    JSON.stringify(accounts)
  );
}

function chooseAvatar(id, element) {

  selectedAvatar = id;

  document.querySelectorAll(".avatar").forEach(function(btn) {
    btn.classList.remove("selected");
  });

  element.classList.add("selected");
}


function showSetup() {

  document.getElementById("setupScreen")
    .classList.remove("hidden");

  document.getElementById("accountScreen")
    .classList.add("hidden");

  document.getElementById("mainApp")
    .classList.add("hidden");
}


function createAccount() {

  const name =
    document.getElementById("nameInput").value.trim();

  const age =
    document.getElementById("ageInput").value;

  if (!name || !age) {
    alert("اكتب الاسم والسن الأول 😊");
    return;
  }

  const accounts = getAccounts();

  const id =
    "account_" +
    Date.now();

  accounts[id] = {

    name: name,
    age: age,
    avatar: selectedAvatar,

    tasks: [],
    notes: "",
    quickNotes: [],

    xp: 0,
    sessions: 0,
    streak: 0,
    goal: 0,

    exams: [],

    lastReward: "",

    theme: "default",
    dark: false

  };

  saveAccounts(accounts);

  currentAccount = id;

  localStorage.setItem(
    "currentAccount",
    id
  );

  loadAccount();

}


function loadAccount() {

  const accounts = getAccounts();

  if (!currentAccount ||
      !accounts[currentAccount]) {

    showAccounts();
    return;
  }

  const account =
    accounts[currentAccount];

  tasks = account.tasks || [];
  sessions = account.sessions || 0;
  xp = account.xp || 0;
  streak = account.streak || 0;
  goal = account.goal || 0;

  document.getElementById("setupScreen")
    .classList.add("hidden");

  document.getElementById("accountScreen")
    .classList.add("hidden");

  document.getElementById("mainApp")
    .classList.remove("hidden");

  document.getElementById("welcomeText")
    .textContent =
    "أهلاً يا " + account.name + " 👋";

  document.getElementById("dashboardName")
    .textContent =
    "أهلاً يا " + account.name + " 👋";

  document.getElementById("profileAvatar")
    .textContent =
    getAvatar(account.avatar);

  document.getElementById("characterDisplay")
    .textContent =
    getAvatar(account.avatar);

  document.getElementById("profileInfoSettings")
    ?.remove();

  updateDashboard();

  loadNotes();

  renderTasks();

  renderExams();

  renderQuickNotes();

  updateWeekly();

  applyTheme(account.theme || "default");

  if (account.dark) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }

  showPage("dashboard");
}


function getAvatar(id) {

  const avatars = {

    avatar1: "👦",
    avatar2: "🧑",
    avatar3: "👨‍🎓",
    avatar4: "👨‍💻",
    avatar5: "🧑‍🔬",
    avatar6: "🧑‍🎨"

  };

  return avatars[id] || "👦";
}


function showAccounts() {

  const accounts = getAccounts();

  const list =
    document.getElementById("accountList");

  list.innerHTML = "";

  Object.keys(accounts).forEach(function(id) {

    const account = accounts[id];

    const button =
      document.createElement("button");

    button.className = "main-btn";
    button.style.width = "100%";
    button.style.margin = "7px 0";

    button.textContent =
      getAvatar(account.avatar) +
      " " +
      account.name +
      " • " +
      account.age;

    button.onclick = function() {

      currentAccount = id;

      localStorage.setItem(
        "currentAccount",
        id
      );

      loadAccount();

    };

    list.appendChild(button);

  });

  document.getElementById("setupScreen")
    .classList.add("hidden");

  document.getElementById("mainApp")
    .classList.add("hidden");

  document.getElementById("accountScreen")
    .classList.remove("hidden");
}


function switchAccount() {

  stopAllTimers();

  showAccounts();
}


function addNewAccount() {

  stopAllTimers();

  showSetup();

}


function logout() {

  stopAllTimers();

  currentAccount = null;

  localStorage.removeItem(
    "currentAccount"
  );

  showAccounts();
}


/* =========================
   SAVE ACCOUNT
========================= */

function saveCurrentAccount() {

  if (!currentAccount) return;

  const accounts = getAccounts();

  if (!accounts[currentAccount]) return;

  accounts[currentAccount].tasks = tasks;
  accounts[currentAccount].sessions = sessions;
  accounts[currentAccount].xp = xp;
  accounts[currentAccount].streak = streak;
  accounts[currentAccount].goal = goal;

  saveAccounts(accounts);
}


/* =========================
   NAVIGATION
========================= */

function showPage(id) {

  document.querySelectorAll(".page")
    .forEach(function(page) {

      page.classList.remove("active");

    });

  const page =
    document.getElementById(id);

  if (page) {
    page.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================
   DASHBOARD
========================= */

function updateDashboard() {

  document.getElementById("xp")
    .textContent = xp;

  document.getElementById("level")
    .textContent =
    Math.floor(xp / 100) + 1;

  document.getElementById("streak")
    .textContent = streak;

  document.getElementById("sessions")
    .textContent = sessions;

  document.getElementById("goalText")
    .textContent =
    goal
      ? goal + " دقيقة مذاكرة 🎯"
      : "لم تحدد هدفك بعد";

  document.getElementById("characterLevel")
    .textContent =
    "Level " +
    (Math.floor(xp / 100) + 1);

  updateProgress();

}


function addXP(amount) {

  xp += amount;

  saveCurrentAccount();

  updateDashboard();

}


/* =========================
   GOAL
========================= */

function saveGoal() {

  const value =
    Number(
      document.getElementById("goalInput").value
    );

  if (!value) return;

  goal = value;

  saveCurrentAccount();

  updateDashboard();

}


/* =========================
   TASKS
========================= */

function addTask() {

  const input =
    document.getElementById("taskInput");

  const priority =
    document.getElementById("priorityInput");

  const text =
    input.value.trim();

  if (!text) {

    alert("اكتب المهمة الأول ✏️");

    return;
  }

  tasks.push({

    text: text,
    priority: priority.value,
    completed: false,
    date: new Date().toISOString()

  });

  input.value = "";

  saveCurrentAccount();

  renderTasks();

  updateProgress();

}


function renderTasks() {

  const list =
    document.getElementById("taskList");

  list.innerHTML = "";

  tasks.forEach(function(task,index) {

    if (
      currentFilter === "active" &&
      task.completed
    ) return;

    if (
      currentFilter === "completed" &&
      !task.completed
    ) return;

    const li =
      document.createElement("li");

    const text =
      document.createElement("span");

    text.textContent =
      (task.completed ? "✅ " : "⬜ ") +
      task.text +
      " • " +
      task.priority;

    const deleteBtn =
      document.createElement("button");

    deleteBtn.textContent = "🗑️";

    deleteBtn.onclick =
      function(event) {

        event.stopPropagation();

        tasks.splice(index,1);

        saveCurrentAccount();

        renderTasks();

        updateProgress();

      };

    li.onclick =
      function() {

        const wasCompleted =
          task.completed;

        task.completed =
          !task.completed;

        if (
          !wasCompleted &&
          task.completed
        ) {

          addXP(10);

        }

        saveCurrentAccount();

        renderTasks();

        updateProgress();

      };

    li.appendChild(text);

    li.appendChild(deleteBtn);

    list.appendChild(li);

  });

}


function filterTasks(filter) {

  currentFilter = filter;

  renderTasks();

}


/* =========================
   POMODORO
========================= */

function updateTimer() {

  const min =
    Math.floor(time / 60);

  const sec =
    time % 60;

  document.getElementById("timer")
    .textContent =
    String(min).padStart(2,"0") +
    ":" +
    String(sec).padStart(2,"0");

}


function startTimer() {

  if (timer) return;

  timer =
    setInterval(function() {

      if (time > 0) {

        time--;

        updateTimer();

      } else {

        clearInterval(timer);

        timer = null;

        sessions++;

        addXP(20);

        saveCurrentAccount();

        alert(
          "🎉 خلصت جلسة مذاكرة! خد راحة ☕"
        );

        time = 25 * 60;

        updateTimer();

        showPage("break");

      }

    },1000);

}


function pauseTimer() {

  clearInterval(timer);

  timer = null;

}


function resetTimer() {

  pauseTimer();

  time = 25 * 60;

  updateTimer();

}


/* =========================
   QUIZ
========================= */

const quizQuestions = [

  {
    q: "كم يساوي 5 × 6 ؟",
    a: [30,25,35],
    c: 30
  },

  {
    q: "كم يساوي 10 + 15 ؟",
    a: [20,25,30],
    c: 25
  },

  {
    q: "كم يساوي 100 ÷ 10 ؟",
    a: [5,10,20],
    c: 10
  }

];


function loadQuestion() {

  const q =
    quizQuestions[quizIndex];

  document.getElementById("question")
    .textContent = q.q;

  const answers =
    document.getElementById("answers");

  answers.innerHTML = "";

  q.a.forEach(function(answer) {

    const btn =
      document.createElement("button");

    btn.textContent = answer;

    btn.onclick =
      function() {

        if (answer === q.c) {

          quizScore++;

          addXP(10);

          document.getElementById("quizResult")
            .textContent =
            "🎉 إجابة صحيحة!";

        } else {

          document.getElementById("quizResult")
            .textContent =
            "❌ حاول تاني!";

        }

      };

    answers.appendChild(btn);

  });

}


function nextQuestion() {

  quizIndex++;

  if (
    quizIndex >=
    quizQuestions.length
  ) {

    alert(
      "🎉 خلصت الاختبار!\n" +
      "نتيجتك: " +
      quizScore +
      "/" +
      quizQuestions.length
    );

    quizIndex = 0;
    quizScore = 0;

  }

  loadQuestion();

}


/* =========================
   PROGRESS
========================= */

function updateProgress() {

  const total =
    tasks.length;

  const completed =
    tasks.filter(
      t => t.completed
    ).length;

  const percent =
    total
      ? Math.round(
          completed / total * 100
        )
      : 0;

  document.getElementById("progressBar")
    .style.width =
    percent + "%";

  document.getElementById("progressText")
    .textContent =
    percent + "% مكتمل";

}


/* =========================
   SUBJECTS
========================= */

function openSubject(subject) {

  const box =
    document.getElementById("subjectDetails");

  box.classList.remove("hidden");

  box.innerHTML = `
    <h2>📚 ${subject}</h2>
    <p>اختار الأداة اللي عايز تستخدمها للمادة:</p>
    <button onclick="showPage('tasks')">✅ المهام</button>
    <button onclick="showPage('flashcards')">🧠 Flashcards</button>
    <button onclick="showPage('notes')">📝 الملاحظات</button>
    <button onclick="showPage('quiz')">📝 اختبار</button>
  `;

}


/* =========================
   FLASHCARDS
========================= */

const flashcards = [

  {
    q: "ما هو ناتج 2 × 8 ؟",
    a: "16"
  },

  {
    q: "ما عاصمة مصر؟",
    a: "القاهرة"
  },

  {
    q: "ما الكوكب الذي نعيش عليه؟",
    a: "الأرض 🌍"
  }

];


function flipCard() {

  document.getElementById("flashQuestion")
    .classList.toggle("hidden");

  document.getElementById("flashAnswer")
    .classList.toggle("hidden");

}


function nextCard() {

  flashIndex++;

  if (
    flashIndex >=
    flashcards.length
  ) {
    flashIndex = 0;
  }

  document.getElementById("flashQuestion")
    .textContent =
    flashcards[flashIndex].q;

  document.getElementById("flashAnswer")
    .textContent =
    flashcards[flashIndex].a;

  document.getElementById("flashQuestion")
    .classList.remove("hidden");

  document.getElementById("flashAnswer")
    .classList.add("hidden");

}


/* =========================
   NOTES
========================= */

function saveNotes() {

  const notes =
    document.getElementById("notesArea")
      .value;

  const accounts =
    getAccounts();

  accounts[currentAccount].notes =
    notes;

  saveAccounts(accounts);

  document.getElementById("notesSaved")
    .textContent =
    "✅ تم الحفظ!";

}


function loadNotes() {

  const accounts =
    getAccounts();

  const notes =
    accounts[currentAccount]?.notes || "";

  document.getElementById("notesArea")
    .value = notes;

}


/* =========================
   PLANNER
========================= */

function createPlan() {

  const subject =
    document.getElementById("plannerSubject")
      .value.trim();

  const days =
    Number(
      document.getElementById("plannerDays")
        .value
    );

  if (!subject || !days) {

    alert("اكتب المادة وعدد الأيام");

    return;

  }

  const result =
    document.getElementById("plannerResult");

  result.innerHTML =
    `
      <h3>🧭 خطة ${subject}</h3>
      <p>قسم مذاكرتك على ${days} أيام.</p>
      <p>اليوم 1: شرح ومراجعة 📖</p>
      <p>اليوم 2: حل أسئلة ✏️</p>
      <p>اليوم 3: مراجعة 🧠</p>
      <p>كرر الخطة حتى نهاية المدة 🚀</p>
    `;

}


/* =========================
   EXAMS
========================= */

function addExam() {

  const name =
    document.getElementById("examName")
      .value.trim();

  const date =
    document.getElementById("examDate")
      .value;

  if (!name || !date) return;

  const accounts =
    getAccounts();

  accounts[currentAccount].exams =
    accounts[currentAccount].exams || [];

  accounts[currentAccount].exams.push({
    name: name,
    date: date
  });

  saveAccounts(accounts);

  renderExams();

}


function renderExams() {

  const box =
    document.getElementById("examList");

  if (!box) return;

  const accounts =
    getAccounts();

  const exams =
    accounts[currentAccount]?.exams || [];

  box.innerHTML = "";

  exams.forEach(function(exam) {

    const days =
      Math.ceil(
        (
          new Date(exam.date) -
          new Date()
        ) /
        (1000*60*60*24)
      );

    const div =
      document.createElement("div");

    div.className =
      "result-box";

    div.innerHTML =
      `
        <h3>📚 ${exam.name}</h3>
        <strong>
          ⏳ باقي ${Math.max(days,0)} يوم
        </strong>
      `;

    box.appendChild(div);

  });

}


/* =========================
   QUESTION BANK
========================= */

const questionBank = [

  "ما هو ناتج 7 × 8 ؟",

  "ما عاصمة مصر؟",

  "ما هو أكبر كوكب في المجموعة الشمسية؟",

  "ما معنى كلمة Environment؟",

  "ما هو ناتج 100 ÷ 4 ؟"

];


function randomQuestion() {

  const random =
    Math.floor(
      Math.random() *
      questionBank.length
    );

  document.getElementById(
    "randomQuestionText"
  ).textContent =
    questionBank[random];

}


/* =========================
   DICTIONARY
========================= */

const dictionary = {

  hello: "مرحبًا",

  book: "كتاب",

  school: "مدرسة",

  teacher: "معلّم",

  student: "طالب",

  environment: "البيئة",

  computer: "حاسوب",

  beautiful: "جميل"

};


function searchWord() {

  const word =
    document.getElementById("wordInput")
      .value
      .trim()
      .toLowerCase();

  const result =
    dictionary[word];

  document.getElementById("wordResult")
    .textContent =
    result
      ? word + " = " + result
      : "مش موجودة في القاموس الحالي 📖";

}


/* =========================
   DAILY REWARD
========================= */

function claimReward() {

  const accounts =
    getAccounts();

  const account =
    accounts[currentAccount];

  const today =
    new Date()
      .toISOString()
      .slice(0,10);

  if (
    account.lastReward === today
  ) {

    document.getElementById("rewardText")
      .textContent =
      "🎁 استلمت جائزتك النهارده بالفعل!";

    return;

  }

  account.lastReward =
    today;

  saveAccounts(accounts);

  addXP(25);

  document.getElementById("rewardText")
    .textContent =
    "🎉 مبروك! حصلت على +25 XP";

}


/* =========================
   WEEKLY REPORT
========================= */

function updateWeekly() {

  const completed =
    tasks.filter(
      t => t.completed
    ).length;

  document.getElementById(
    "weeklyReport"
  ).innerHTML =

    `
      <h2>📊 تقريرك</h2>
      <p>✅ المهام المكتملة: ${completed}</p>
      <p>⏱️ جلسات المذاكرة: ${sessions}</p>
      <p>⭐ XP: ${xp}</p>
      <p>🔥 Streak: ${streak}</p>
    `;

}


/* =========================
   SEARCH
========================= */

function globalSearch() {

  const query =
    document.getElementById("searchInput")
      .value
      .trim()
      .toLowerCase();

  const results = [];

  const subjects = [
    "القرآن",
    "الفقه",
    "أصول الدين",
    "العربي",
    "Math",
    "Science",
    "Social Studies",
    "English",
    "French",
    "Computer"
  ];

  subjects.forEach(function(subject) {

    if (
      subject.toLowerCase()
        .includes(query)
    ) {

      results.push(
        "📚 " + subject
      );

    }

  });

  tasks.forEach(function(task) {

    if (
      task.text
        .toLowerCase()
        .includes(query)
    ) {

      results.push(
        "✅ " + task.text
      );

    }

  });

  document.getElementById(
    "searchResults"
  ).innerHTML =
    results.length
      ? results.join("<br><br>")
      : "مفيش نتائج 🔎";

}


/* =========================
   QUICK NOTES
========================= */

function saveQuickNote() {

  const input =
    document.getElementById(
      "quickNoteInput"
    );

  const text =
    input.value.trim();

  if (!text) return;

  const accounts =
    getAccounts();

  accounts[currentAccount]
    .quickNotes =
    accounts[currentAccount]
      .quickNotes || [];

  accounts[currentAccount]
    .quickNotes
    .push(text);

  saveAccounts(accounts);

  input.value = "";

  renderQuickNotes();

}


function renderQuickNotes() {

  const box =
    document.getElementById(
      "quickNotesList"
    );

  if (!box) return;

  const accounts =
    getAccounts();

  const notes =
    accounts[currentAccount]
      ?.quickNotes || [];

  box.innerHTML = "";

  notes.forEach(function(note) {

    const div =
      document.createElement("div");

    div.className =
      "result-box";

    div.textContent =
      "📌 " + note;

    box.appendChild(div);

  });

}


/* =========================
   THEMES
========================= */

function setTheme(theme) {

  const accounts =
    getAccounts();

  accounts[currentAccount].theme =
    theme;

  saveAccounts(accounts);

  applyTheme(theme);

}


function applyTheme(theme) {

  document.body.classList.remove(
    "theme-pink",
    "theme-blue",
    "theme-green",
    "theme-purple"
  );

  if (theme !== "default") {

    document.body.classList.add(
      "theme-" + theme
    );

  }

}


/* =========================
   DARK MODE
========================= */

function toggleTheme() {

  document.body.classList.toggle("dark");

  const dark =
    document.body.classList.contains("dark");

  const accounts =
    getAccounts();

  accounts[currentAccount].dark =
    dark;

  saveAccounts(accounts);

  document.getElementById(
    "themeButton"
  ).textContent =
    dark
      ? "☀️ White Mode"
      : "🌙 Dark Mode";

}


/* =========================
   STUDY SOUND
========================= */

function playStudySound() {

  if (sound) return;

  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContext) {

    alert(
      "المتصفح لا يدعم الصوت."
    );

    return;

  }

  const ctx =
    new AudioContext();

  const oscillator =
    ctx.createOscillator();

  const gain =
    ctx.createGain();

  oscillator.frequency.value =
    220;

  gain.gain.value =
    0.02;

  oscillator.connect(gain);

  gain.connect(ctx.destination);

  oscillator.start();

  sound = {
    ctx: ctx,
    oscillator: oscillator
  };

}


function stopStudySound() {

  if (!sound) return;

  sound.oscillator.stop();

  sound.ctx.close();

  sound = null;

}


/* =========================
   BREAK
========================= */

function startBreak() {

  if (breakTimer) return;

  breakTime = 5 * 60;

  updateBreakTimer();

  breakTimer =
    setInterval(function() {

      if (breakTime > 0) {

        breakTime--;

        updateBreakTimer();

      } else {

        clearInterval(breakTimer);

        breakTimer = null;

        alert(
          "☕ خلص وقت الراحة! جاهز ترجع؟ 🚀"
        );

      }

    },1000);

}


function updateBreakTimer() {

  const min =
    Math.floor(
      breakTime / 60
    );

  const sec =
    breakTime % 60;

  document.getElementById(
    "breakTimer"
  ).textContent =
    String(min).padStart(2,"0") +
    ":" +
    String(sec).padStart(2,"0");

}


/* =========================
   TIPS
========================= */

const tips = [

  "قسم المذاكرة لأجزاء صغيرة 📚",

  "ابدأ بالمهمة الأصعب وأنت مركز 💪",

  "خد فواصل قصيرة بين جلسات المذاكرة ☕",

  "حل أسئلة بعد ما تخلص الشرح ✏️",

  "راجع القديم قبل ما تبدأ الجديد 🧠"

];


function newTip() {

  const random =
    Math.floor(
      Math.random() *
      tips.length
    );

  document.getElementById(
    "dailyTip"
  ).textContent =
    tips[random];

}


/* =========================
   FOCUS MODE
========================= */

function startFocusMode() {

  const task =
    document.getElementById(
      "focusTask"
    ).value.trim();

  if (!task) return;

  document.getElementById(
    "focusDisplay"
  ).innerHTML =

    `
      <h2>🎯 Focus Mode</h2>
      <h3>${task}</h3>
      <p>مفيش تشتيت. ركز في المهمة دي بس 💪</p>
      <button onclick="addXP(10)">
        ⭐ خلصت المهمة
      </button>
    `;

}


/* =========================
   CONTENT
========================= */

function showContent(type) {

  document.getElementById(
    "contentResult"
  ).innerHTML =

    `
      <h3>🗂️ ${type}</h3>
      <p>هنا تقدر تنظم ${type} الخاصة بك.</p>
      <p>الميزة دي جاهزة للتوسع وإضافة ملفاتك ودروسك.</p>
    `;

}


/* =========================
   ASSISTANT
========================= */

function assistantHelp(type) {

  let answer = "";

  if (type === "start") {

    answer =
      "🚀 ابدأ بـ20 دقيقة في أسهل مادة عندك، وبعدها كمل خطوة خطوة.";

  }

  if (type === "tired") {

    answer =
      "😴 خد راحة قصيرة، اشرب مية، وبعدها ارجع بجلسة قصيرة.";

  }

  if (type === "plan") {

    answer =
      "🗓️ اقسم وقتك إلى: شرح → حل أسئلة → مراجعة → راحة.";

  }

  document.getElementById(
    "assistantResult"
  ).innerHTML =
    "<p>" + answer + "</p>";

}


/* =========================
   RESET
========================= */

function resetData() {

  const confirmDelete =
    confirm(
      "متأكد إنك عايز تحذف بيانات الحساب؟"
    );

  if (!confirmDelete) return;

  const accounts =
    getAccounts();

  delete accounts[currentAccount];

  saveAccounts(accounts);

  currentAccount = null;

  localStorage.removeItem(
    "currentAccount"
  );

  showAccounts();

}


/* =========================
   STOP TIMERS
========================= */

function stopAllTimers() {

  clearInterval(timer);
  timer = null;

  clearInterval(breakTimer);
  breakTimer = null;

  stopStudySound();

}


/* =========================
   START
========================= */

const savedAccount =
  localStorage.getItem(
    "currentAccount"
  );

const accounts =
  getAccounts();

if (
  savedAccount &&
  accounts[savedAccount]
) {

  currentAccount =
    savedAccount;

  loadAccount();

} else if (
  Object.keys(accounts).length
) {

  showAccounts();

} else {

  showSetup();

}

loadQuestion();

updateTimer();

updateBreakTimer();