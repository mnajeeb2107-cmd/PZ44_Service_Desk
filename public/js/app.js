const form = document.querySelector("#ticket-form");
const list = document.querySelector("#ticket-list");
const status = document.querySelector("#status");
const summary = document.querySelector("#summary");
const refreshButton = document.querySelector("#refresh-button");
const sendButton = document.querySelector("#send-button");

function setStatus(text, kind = "info") {
  status.textContent = text;
  status.dataset.kind = kind;
}

function renderTickets(items = []) {
  // TODO 1: очистите list и создайте карточку каждого обращения через createElement/textContent.
  list.innerHTML = "";

  if (!items || items.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Обращений пока нет.";
    list.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "ticket-card";

    const header = document.createElement("h3");
    header.textContent = `#${item.id} — ${item.customer} (${item.status || "новое"})`;

    const body = document.createElement("p");
    body.textContent = item.problem;

    card.appendChild(header);
    card.appendChild(body);
    list.appendChild(card);
  });
}

async function loadTickets() {
  // TODO 2: GET /api/tickets -> проверка response.ok -> response.json() -> renderTickets(data.items).
  setStatus("Загрузка обращений...", "info");
  try {
    const response = await fetch("/api/tickets");
    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`);
    }
    const data = await response.json();
    renderTickets(data.items);
    summary.textContent = `Всего обращений: ${data.total ?? data.items.length}`;
    setStatus("Список обновлен", "success");
  } catch (error) {
    setStatus(error.message || "Не удалось загрузить данные", "error");
  }
}

async function createTicket(payload) {
  // TODO 3: POST /api/tickets с заголовком Content-Type: application/json.
  const response = await fetch("/api/tickets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Ошибка сервера: ${response.status}`);
  }

  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // TODO 4: проверьте данные, отключите sendButton на период запроса,
  // вызовите createTicket(), очистите поля после успеха и обновите список через GET.
  const formData = new FormData(form);
  const customer = String(formData.get("customer") || "").trim();
  const problem = String(formData.get("problem") || "").trim();

  if (customer.length < 2) {
    setStatus("Введите корректное имя (минимум 2 символа)", "error");
    return;
  }

  if (problem.length < 5) {
    setStatus("Описание проблемы должно содержать минимум 5 символов", "error");
    return;
  }

  sendButton.disabled = true;
  setStatus("Отправка обращения...", "info");

  try {
    await createTicket({ customer, problem });
    form.reset();
    await loadTickets();
    setStatus("Обращение успешно создано!", "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    sendButton.disabled = false;
  }
});

refreshButton.addEventListener("click", loadTickets);

// TODO 5: вызовите loadTickets() при загрузке страницы.
loadTickets();
