// Uch tildagi matnlar. Matnni o'zgartirish uchun shu yerni tahrirlang.
const texts = {
  uz: {
    fName: "Ismingiz", fContact: "Telefon yoki Telegram", fMessage: "Xabaringiz", fSend: "Yuborish", fOk: "Xabar yuborildi!", fError: "Xabar yuborilmadi.",
    navHome: "Kirish", navEdu: "Ta'lim", navWorks: "Ishlarim", navContact: "Bog'lanish",
    hello: "Salom, men", job: "Matematika o'qituvchisi",
    about: "Amaliy matematika yo'nalishida 3-kurs talabasiman va maktabda matematikadan dars beraman. Prompt muhandisligini o'rganyapman.",
    short: "Ilmiy maqolalar · Repetitorlik · Kurash · Oltin medal",
    btn: "Bog'lanish", years: "2024 — hozirgacha",
    school: "Termiz davlat pedagogika instituti", major: "Amaliy matematika, 3-kurs",
    w1: "Ilmiy maqolalar", w1text: "Xalqaro jurnallarda chop etilgan maqolalar.",
    w2: "O'qituvchilik", w2text: "Maktabda matematika o'qituvchisi va repetitor.",
    w3: "Kurash", w3text: "Kurash bo'yicha mahalliy birinchilik.",
    w4: "Oltin medal", w4text: "Maktabni oltin medal bilan tugatganman.",
    phone: "Telefon"
  },
  ru: {
    fName: "Ваше имя", fContact: "Телефон или Telegram", fMessage: "Ваше сообщение", fSend: "Отправить", fOk: "Сообщение отправлено!", fError: "Сообщение не отправлено.",
    navHome: "Главная", navEdu: "Образование", navWorks: "Мои работы", navContact: "Контакты",
    hello: "Здравствуйте, я", job: "Учитель математики",
    about: "Студент 3 курса по направлению «Прикладная математика», преподаю математику в школе. Изучаю промпт-инжиниринг.",
    short: "Научные статьи · Репетиторство · Кураш · Золотая медаль",
    btn: "Связаться", years: "2024 — настоящее время",
    school: "Термезский государственный педагогический институт", major: "Прикладная математика, 3 курс",
    w1: "Научные статьи", w1text: "Статьи, опубликованные в международных журналах.",
    w2: "Преподавание", w2text: "Учитель математики в школе и репетитор.",
    w3: "Кураш", w3text: "Местное первенство по курашу.",
    w4: "Золотая медаль", w4text: "Школа окончена с золотой медалью.",
    phone: "Телефон"
  },
  en: {
    fName: "Your name", fContact: "Phone or Telegram", fMessage: "Your message", fSend: "Send", fOk: "Message sent!", fError: "Message was not sent.",
    navHome: "Home", navEdu: "Education", navWorks: "My Work", navContact: "Contact",
    hello: "Hello, I am", job: "Mathematics Teacher",
    about: "I am a third-year Applied Mathematics student and I teach mathematics at a school. I am learning prompt engineering.",
    short: "Research articles · Tutoring · Kurash · Gold medal",
    btn: "Contact me", years: "2024 — present",
    school: "Termez State Pedagogical Institute", major: "Applied Mathematics, 3rd year",
    w1: "Research Articles", w1text: "Articles published in international journals.",
    w2: "Teaching", w2text: "School mathematics teacher and private tutor.",
    w3: "Kurash", w3text: "Local kurash championship.",
    w4: "Gold Medal", w4text: "Graduated from school with a gold medal.",
    phone: "Phone"
  }
};

function setLanguage(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = texts[lang][el.dataset.i18n];
  });
  document.querySelectorAll("[data-ph]").forEach(el => {
    el.placeholder = texts[lang][el.dataset.ph];
  });
  document.querySelectorAll("[data-lang]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

document.querySelectorAll("[data-lang]").forEach(btn => {
  btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
});
setLanguage("uz");

// Bo'limlar ekranda ko'ringanda animatsiya bilan chiqadi
document.documentElement.classList.add("js");
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
}, { threshold: 0.1 });
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

// Formadagi xabarni server.py ga yuboramiz, u esa Telegramga jo'natadi
const form = document.getElementById("form");
form.addEventListener("submit", async event => {
  event.preventDefault();
  const button = form.querySelector("button");
  const status = document.getElementById("status");
  button.disabled = true;
  status.textContent = "...";
  let ok = false;
  try {
    const response = await fetch("/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    ok = response.ok;
  } catch (error) {}
  status.textContent = texts[document.documentElement.lang][ok ? "fOk" : "fError"];
  if (ok) form.reset();
  button.disabled = false;
});
