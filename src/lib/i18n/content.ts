// Localized overrides for the content registry (gameContent.ts).
// English lives in gameContent.ts and is the fallback. Each language here
// provides as much or as little as is translated; any missing field falls
// back to English automatically via localizeEntry(). This lets the
// encyclopedia, info panels, pickers and pre-match summary be translated
// field-by-field, language-by-language, with zero refactors.

import { CATEGORIES, type InfoEntry } from "../gameContent";
import { COUPLE_CHALLENGES } from "../couple";
import type { LangCode } from "./locales";

type Override = Partial<Omit<InfoEntry, "id" | "emoji">>;
type LangContent = Record<string, Override>;

// ─────────────────────────────────────────────────────────── Ukrainian
const uk: LangContent = {
  // modes
  classic: {
    name: "Класичний",
    short: "Стандартна гра «вище / нижче».",
    detailed:
      "Після кожного здогаду тобі кажуть, чи секретне число ВИЩЕ чи НИЖЧЕ за твоє. Звужуй діапазон, доки не влучиш точно.",
    example:
      "Секрет 4544. Здогад 3000 → ВИЩЕ. Здогад 6000 → НИЖЧЕ. Здогад 4544 → ПРАВИЛЬНО.",
    advantages: ["Простий та інтуїтивний", "Винагороджує логічне звуження"],
    disadvantages: ["Менш несподіваний, коли знаєш стратегію"],
    bestFor: "Новачків",
    length: "2–5 хвилин",
  },
  hotcold: {
    name: "Тепло-холодно",
    short: "Підказки за відстанню, а не вище/нижче.",
    detailed:
      "Замість ВИЩЕ/НИЖЧЕ тобі кажуть, наскільки ти близько: 🔥 дуже гаряче, 🌡 гаряче, 🙂 близько, 🥶 холодно, ❄ дуже холодно. Ти намацуєш число.",
    example:
      "Секрет 4544. Здогад 5000 → 🌡 гаряче. Здогад 4600 → 🔥 дуже гаряче. Здогад 4544 → ПРАВИЛЬНО.",
    advantages: ["Свіже, інтуїтивне відчуття", "Менш механічне за бінарний пошук"],
    disadvantages: ["Важче грати ідеально", "Немає точного трекера діапазону"],
    bestFor: "Тих, хто любить теплішу, інтуїтивну гру",
    length: "3–6 хвилин",
  },
  hardcore: {
    name: "Хардкор",
    short: "Без трекера, підказок та історії.",
    detailed:
      "Чиста пам'ять. Ти отримуєш ВИЩЕ/НИЖЧЕ, але без трекера діапазону, без підказок, і минулі здогади не показуються — тримай їх у голові.",
    example: "Здогад 500 → ВИЩЕ, потім 750 → НИЖЧЕ… і все доводиться пам'ятати самому.",
    advantages: ["Максимальний виклик", "Чудове тренування пам'яті"],
    disadvantages: ["Легко загубити лік", "Складно для новачків"],
    bestFor: "Ветеранів, що шукають виклик",
    length: "3–7 хвилин",
  },
  blind: {
    name: "Наосліп",
    short: "Не видно попередніх здогадів.",
    detailed:
      "Ти все ще отримуєш ВИЩЕ/НИЖЧЕ після кожного здогаду, але історія прихована. Показано лише останній результат.",
    example: "Здогад 500 → ВИЩЕ (показано). Здогад 800 → НИЖЧЕ (показано). Попередні не показані.",
    advantages: ["Перевіряє концентрацію й пам'ять", "Швидко й напружено"],
    disadvantages: ["Немає історії для перегляду", "Помилки коштують дорожче"],
    bestFor: "Зосереджених гравців",
    length: "3–6 хвилин",
  },
  suddendeath: {
    name: "Раптова смерть",
    short: "Обмежена кількість спроб — закінчились, і ти програв.",
    detailed:
      "Ти отримуєш жорсткий бюджет спроб (трохи більше за оптимум). Використовуй мудро: не вгадав до кінця — програв.",
    example: "Гра на 4 цифри, дозволено 16 спроб. Промах на 16-й — кінець гри.",
    advantages: ["Висока напруга", "Кожна спроба важлива"],
    disadvantages: ["Карає за помилки", "Менш прощає"],
    bestFor: "Шукачів гострих відчуттів",
    length: "2–4 хвилини",
  },
  speedrun: {
    name: "Швидкісний забіг",
    short: "Переможи за мінімум спроб (тренування).",
    detailed:
      "Соло-виклик: розгадай число за якомога меншу кількість спроб і спробуй зіграти оптимально. Твій рахунок — кількість спроб і час.",
    example: "Число з 3 цифр — чи зможеш перемогти за 10 спроб або менше?",
    advantages: ["Чудово для прогресу", "Чітка особиста ціль"],
    disadvantages: ["Немає суперника", "Чиста оптимізація"],
    bestFor: "Тих, хто полює на рекорди",
    length: "1–3 хвилини",
  },
  duel: {
    name: "Дуель (мультиплеєр)",
    short: "Обидва гадають одночасно — без ходів по черзі.",
    detailed:
      "Мультиплеєрний режим, де ніхто не чекає своєї черги. Надсилай здогади якомога швидше; хто першим розгадає число суперника — перемагає. (З'явиться у мультиплеєрній хвилі.)",
    example: "Обидва гравці шалено надсилають здогади — чиста швидкість.",
    advantages: ["Динамічно", "Захопливо"],
    disadvantages: ["Менш стратегічно", "Лише мультиплеєр"],
    bestFor: "Змагальних гравців",
    length: "1–3 хвилини",
  },
  // difficulties
  easy: { name: "Легкий", short: "Доступні трекер діапазону й підказки." },
  normal: { name: "Нормальний", short: "Трекер увімкнено, без підказок." },
  hard: { name: "Складний", short: "Без трекера, без підказок." },
  nightmare: { name: "Жах", short: "Без допомоги, статистика прихована до перемоги." },
  // ai
  rookie: { name: "Новачок", short: "Грає недбало й марнує ходи." },
  human: { name: "Людина", short: "Грає розумно, але неідеально, як людина." },
  monster: { name: "Майстер бінарного пошуку", short: "Завжди вгадує оптимальну середину." },
  impossible: { name: "Неможливий", short: "Ідеальна гра — і ходить першим." },
  // abilities
  "reveal-range": { name: "Показати діапазон", short: "Раз показує точний залишковий діапазон." },
  "reveal-digit": { name: "Показати цифру", short: "Розкриває одну правильну цифру секрету." },
  freeze: { name: "Заморозити суперника", short: "Суперник пропускає наступний хід." },
  "double-turn": { name: "Подвійний хід", short: "Дві спроби поспіль." },
  mirror: { name: "Дзеркальний хід", short: "Копіює останній здогад суперника (мультиплеєр)." },
  // settings
  "number-length": { name: "Довжина числа", short: "Скільки цифр у секреті (3–6)." },
  "turn-timer": { name: "Таймер ходу", short: "Секунд на хід (∞/15/30/60)." },
  "random-secret": { name: "Випадкове число", short: "Система обирає число (і показує тобі)." },
  "hidden-random": { name: "Приховане випадкове", short: "Захищай число, якого навіть ти не знаєш." },
  hints: { name: "Підказки", short: "Розкриває половину, парність або цифру." },
  "range-tracker": { name: "Трекер діапазону", short: "Показує залишок можливих чисел." },
  abilities: { name: "Особливі здібності", short: "Одноразові сили: показати, заморозити тощо." },
  "couple-mode": { name: "Режим для пари", short: "Веселе реальне завдання після перемоги." },
  "alternate-first-move": { name: "Чергування першого ходу", short: "Змінює, хто починає (мультиплеєр)." },
  themes: { name: "Теми", short: "7 візуальних стилів на вибір." },
};

// ─────────────────────────────────────────────────────────── Russian
const ru: LangContent = {
  classic: {
    name: "Классический",
    short: "Стандартная игра «больше / меньше».",
    detailed:
      "После каждой догадки тебе говорят, секретное число БОЛЬШЕ или МЕНЬШЕ твоего. Сужай диапазон, пока не попадёшь точно.",
    example:
      "Секрет 4544. Догадка 3000 → БОЛЬШЕ. Догадка 6000 → МЕНЬШЕ. Догадка 4544 → ВЕРНО.",
    advantages: ["Просто и понятно", "Награждает логическое сужение"],
    disadvantages: ["Менее неожиданно, когда знаешь стратегию"],
    bestFor: "Новичков",
    length: "2–5 минут",
  },
  hotcold: {
    name: "Горячо-холодно",
    short: "Подсказки по расстоянию, а не больше/меньше.",
    detailed:
      "Вместо БОЛЬШЕ/МЕНЬШЕ тебе говорят, насколько ты близко: 🔥 очень горячо, 🌡 горячо, 🙂 близко, 🥶 холодно, ❄ очень холодно.",
    example:
      "Секрет 4544. Догадка 5000 → 🌡 горячо. Догадка 4600 → 🔥 очень горячо. Догадка 4544 → ВЕРНО.",
    advantages: ["Свежее, интуитивное ощущение", "Менее механично, чем бинарный поиск"],
    disadvantages: ["Сложнее играть идеально", "Нет точного трекера диапазона"],
    bestFor: "Тех, кто любит тёплую, интуитивную игру",
    length: "3–6 минут",
  },
  hardcore: {
    name: "Хардкор",
    short: "Без трекера, подсказок и истории.",
    detailed:
      "Чистая память. Ты получаешь БОЛЬШЕ/МЕНЬШЕ, но без трекера, без подсказок, и прошлые догадки не показываются — держи их в голове.",
    example: "Догадка 500 → БОЛЬШЕ, затем 750 → МЕНЬШЕ… и всё нужно помнить самому.",
    advantages: ["Максимальный вызов", "Отличная тренировка памяти"],
    disadvantages: ["Легко сбиться", "Сложно новичкам"],
    bestFor: "Ветеранов в поиске вызова",
    length: "3–7 минут",
  },
  blind: {
    name: "Вслепую",
    short: "Не видно прошлых догадок.",
    detailed:
      "Ты по-прежнему получаешь БОЛЬШЕ/МЕНЬШЕ после каждой догадки, но история скрыта. Виден только последний результат.",
    example: "Догадка 500 → БОЛЬШЕ (показано). Догадка 800 → МЕНЬШЕ (показано). Прошлые не видны.",
    advantages: ["Проверяет концентрацию и память", "Быстро и напряжённо"],
    disadvantages: ["Нет истории для просмотра", "Ошибки дороже"],
    bestFor: "Сосредоточенных игроков",
    length: "3–6 минут",
  },
  suddendeath: {
    name: "Внезапная смерть",
    short: "Ограниченное число попыток — кончились, и ты проиграл.",
    detailed:
      "Жёсткий бюджет попыток (чуть больше оптимума). Используй с умом: не угадал до конца — проиграл.",
    example: "Игра на 4 цифры, 16 попыток. Промах на 16-й — конец игры.",
    advantages: ["Высокое напряжение", "Каждая попытка важна"],
    disadvantages: ["Наказывает за ошибки", "Менее прощает"],
    bestFor: "Любителей острых ощущений",
    length: "2–4 минуты",
  },
  speedrun: {
    name: "Спидран",
    short: "Победи за минимум попыток (тренировка).",
    detailed:
      "Соло-вызов: разгадай число за минимум попыток и сыграй оптимально. Счёт — число попыток и время.",
    example: "Число из 3 цифр — сможешь победить за 10 попыток или меньше?",
    advantages: ["Отлично для прогресса", "Чёткая личная цель"],
    disadvantages: ["Нет соперника", "Чистая оптимизация"],
    bestFor: "Охотников за рекордами",
    length: "1–3 минуты",
  },
  duel: {
    name: "Дуэль (мультиплеер)",
    short: "Оба угадывают одновременно — без ходов по очереди.",
    detailed:
      "Мультиплеерный режим без ожидания хода. Отправляй догадки как можно быстрее; кто первым разгадает число соперника — победил. (Появится в мультиплеерной волне.)",
    example: "Оба игрока яростно отправляют догадки — чистая скорость.",
    advantages: ["Динамично", "Увлекательно"],
    disadvantages: ["Менее стратегично", "Только мультиплеер"],
    bestFor: "Соревновательных игроков",
    length: "1–3 минуты",
  },
  easy: { name: "Лёгкий", short: "Доступны трекер диапазона и подсказки." },
  normal: { name: "Обычный", short: "Трекер включён, без подсказок." },
  hard: { name: "Сложный", short: "Без трекера, без подсказок." },
  nightmare: { name: "Кошмар", short: "Без помощи, статистика скрыта до победы." },
  rookie: { name: "Новичок", short: "Играет небрежно и тратит ходы." },
  human: { name: "Человек", short: "Играет умно, но не идеально, как человек." },
  monster: { name: "Мастер бинарного поиска", short: "Всегда угадывает оптимальную середину." },
  impossible: { name: "Невозможный", short: "Идеальная игра — и ходит первым." },
  "reveal-range": { name: "Показать диапазон", short: "Раз показывает точный остаток диапазона." },
  "reveal-digit": { name: "Показать цифру", short: "Раскрывает одну верную цифру секрета." },
  freeze: { name: "Заморозить соперника", short: "Соперник пропускает следующий ход." },
  "double-turn": { name: "Двойной ход", short: "Две попытки подряд." },
  mirror: { name: "Зеркальный ход", short: "Копирует последнюю догадку соперника (мультиплеер)." },
  "number-length": { name: "Длина числа", short: "Сколько цифр в секрете (3–6)." },
  "turn-timer": { name: "Таймер хода", short: "Секунд на ход (∞/15/30/60)." },
  "random-secret": { name: "Случайное число", short: "Система выбирает число (и показывает тебе)." },
  "hidden-random": { name: "Скрытое случайное", short: "Защищай число, которого даже ты не знаешь." },
  hints: { name: "Подсказки", short: "Раскрывает половину, чётность или цифру." },
  "range-tracker": { name: "Трекер диапазона", short: "Показывает остаток возможных чисел." },
  abilities: { name: "Особые способности", short: "Одноразовые силы: показать, заморозить и т. д." },
  "couple-mode": { name: "Режим для пары", short: "Весёлое реальное задание после победы." },
  "alternate-first-move": { name: "Чередование первого хода", short: "Меняет, кто начинает (мультиплеер)." },
  themes: { name: "Темы", short: "7 визуальных стилей на выбор." },
};

// ─────────────────────────────────────────────────────────── Spanish
const es: LangContent = {
  classic: {
    name: "Clásico",
    short: "El clásico mayor / menor.",
    detailed:
      "Tras cada intento te dicen si el secreto es MAYOR o MENOR que tu número. Ve acotando hasta acertar.",
    example:
      "Secreto 4544. Intento 3000 → MAYOR. Intento 6000 → MENOR. Intento 4544 → CORRECTO.",
    advantages: ["Simple e intuitivo", "Premia el acotado lógico"],
    disadvantages: ["Menos sorprendente cuando sabes la estrategia"],
    bestFor: "Jugadores nuevos",
    length: "2–5 minutos",
  },
  hotcold: {
    name: "Frío o caliente",
    short: "Pistas por cercanía, no mayor/menor.",
    detailed:
      "En vez de MAYOR/MENOR te dicen cuánto te acercas: 🔥 muy caliente, 🌡 caliente, 🙂 cerca, 🥶 frío, ❄ muy frío.",
    example:
      "Secreto 4544. Intento 5000 → 🌡 caliente. Intento 4600 → 🔥 muy caliente. Intento 4544 → CORRECTO.",
    advantages: ["Sensación fresca e intuitiva", "Menos mecánico que la búsqueda binaria"],
    disadvantages: ["Más difícil jugar perfecto", "Sin rastreador de rango exacto"],
    bestFor: "Quien prefiere un juego intuitivo",
    length: "3–6 minutos",
  },
  hardcore: {
    name: "Hardcore",
    short: "Sin rastreador, pistas ni historial.",
    detailed:
      "Memoria pura. Recibes MAYOR/MENOR pero sin rastreador, sin pistas y sin lista de intentos: recuérdalos tú.",
    example: "Intento 500 → MAYOR, luego 750 → MENOR… y debes llevar la cuenta de memoria.",
    advantages: ["Máximo desafío", "Gran ejercicio de memoria"],
    disadvantages: ["Fácil perder la cuenta", "Frustrante para novatos"],
    bestFor: "Veteranos que buscan reto",
    length: "3–7 minutos",
  },
  blind: {
    name: "A ciegas",
    short: "Sin ver los intentos anteriores.",
    detailed:
      "Sigues recibiendo MAYOR/MENOR tras cada intento, pero el historial está oculto. Solo se ve el último resultado.",
    example: "Intento 500 → MAYOR (visible). Intento 800 → MENOR (visible). Los anteriores no se ven.",
    advantages: ["Pone a prueba foco y memoria", "Rápido y tenso"],
    disadvantages: ["Sin historial que revisar", "Los errores cuestan más"],
    bestFor: "Jugadores concentrados",
    length: "3–6 minutos",
  },
  suddendeath: {
    name: "Muerte súbita",
    short: "Intentos limitados — si se acaban, pierdes.",
    detailed:
      "Tienes un presupuesto justo de intentos (algo más que el óptimo). Úsalo bien: si te quedas sin ellos, pierdes.",
    example: "Partida de 4 dígitos, 16 intentos. Fallar el 16º es fin de la partida.",
    advantages: ["Mucha tensión", "Cada intento cuenta"],
    disadvantages: ["Castiga los errores", "Poco indulgente"],
    bestFor: "Amantes de la emoción",
    length: "2–4 minutos",
  },
  speedrun: {
    name: "Contrarreloj",
    short: "Gana en los mínimos intentos (práctica).",
    detailed:
      "Reto en solitario: descifra el número en los mínimos intentos posibles e iguala el juego óptimo. Tu puntuación es intentos y tiempo.",
    example: "Número de 3 dígitos: ¿puedes ganar en 10 intentos o menos?",
    advantages: ["Ideal para mejorar", "Meta personal clara"],
    disadvantages: ["Sin rival", "Pura optimización"],
    bestFor: "Quien busca récords",
    length: "1–3 minutos",
  },
  duel: {
    name: "Duelo (multijugador)",
    short: "Ambos adivinan a la vez — sin turnos.",
    detailed:
      "Modo multijugador en el que nadie espera turno. Envía intentos cuanto antes; el primero en descifrar el número rival gana. (Llega en la fase multijugador.)",
    example: "Ambos disparan intentos a la vez — pura velocidad.",
    advantages: ["Trepidante", "Emocionante"],
    disadvantages: ["Menos estratégico", "Solo multijugador"],
    bestFor: "Jugadores competitivos",
    length: "1–3 minutos",
  },
  easy: { name: "Fácil", short: "Rastreador de rango y pistas disponibles." },
  normal: { name: "Normal", short: "Rastreador activo, sin pistas." },
  hard: { name: "Difícil", short: "Sin rastreador, sin pistas." },
  nightmare: { name: "Pesadilla", short: "Sin ayudas; las stats se ocultan hasta ganar." },
  rookie: { name: "Novato", short: "Juega flojo y desperdicia jugadas." },
  human: { name: "Humano", short: "Juega bien pero no perfecto, como una persona." },
  monster: { name: "Monstruo de búsqueda binaria", short: "Siempre acierta el punto medio óptimo." },
  impossible: { name: "Imposible", short: "Juego perfecto — y mueve primero." },
  "reveal-range": { name: "Revelar rango", short: "Muestra una vez el rango restante exacto." },
  "reveal-digit": { name: "Revelar dígito", short: "Revela un dígito correcto del secreto." },
  freeze: { name: "Congelar rival", short: "El rival pierde su próximo turno." },
  "double-turn": { name: "Turno doble", short: "Dos intentos seguidos." },
  mirror: { name: "Movimiento espejo", short: "Copia el último intento del rival (multijugador)." },
  "number-length": { name: "Longitud del número", short: "Cuántos dígitos tiene el secreto (3–6)." },
  "turn-timer": { name: "Temporizador de turno", short: "Segundos por turno (∞/15/30/60)." },
  "random-secret": { name: "Número aleatorio", short: "El sistema elige el número (y te lo muestra)." },
  "hidden-random": { name: "Aleatorio oculto", short: "Defiende un número que ni tú conoces." },
  hints: { name: "Pistas", short: "Revela mitad, par/impar o un dígito." },
  "range-tracker": { name: "Rastreador de rango", short: "Muestra los números aún posibles." },
  abilities: { name: "Habilidades especiales", short: "Poderes de un uso: revelar, congelar…" },
  "couple-mode": { name: "Modo pareja", short: "Un reto divertido tras ganar." },
  "alternate-first-move": { name: "Alternar primer turno", short: "Cambia quién empieza (multijugador)." },
  themes: { name: "Temas", short: "7 estilos visuales a elegir." },
};

// ─────────────────────────────────────────────────────────── Italian
const it: LangContent = {
  classic: {
    name: "Classico",
    short: "Il classico più alto / più basso.",
    detailed:
      "Dopo ogni tentativo ti viene detto se il segreto è PIÙ ALTO o PIÙ BASSO del tuo numero. Restringi finché non lo centri.",
    example:
      "Segreto 4544. Tentativo 3000 → PIÙ ALTO. Tentativo 6000 → PIÙ BASSO. Tentativo 4544 → CORRETTO.",
    advantages: ["Semplice e intuitivo", "Premia il restringimento logico"],
    disadvantages: ["Meno sorprendente quando conosci la strategia"],
    bestFor: "Nuovi giocatori",
    length: "2–5 minuti",
  },
  hotcold: {
    name: "Caldo e freddo",
    short: "Indizi in base alla distanza, non più alto/basso.",
    detailed:
      "Invece di PIÙ ALTO/BASSO ti viene detto quanto sei vicino: 🔥 caldissimo, 🌡 caldo, 🙂 vicino, 🥶 freddo, ❄ freddissimo.",
    example:
      "Segreto 4544. Tentativo 5000 → 🌡 caldo. Tentativo 4600 → 🔥 caldissimo. Tentativo 4544 → CORRETTO.",
    advantages: ["Sensazione fresca e intuitiva", "Meno meccanico della ricerca binaria"],
    disadvantages: ["Più difficile giocare perfetto", "Nessun tracker di intervallo esatto"],
    bestFor: "Chi ama un gioco intuitivo",
    length: "3–6 minuti",
  },
  hardcore: {
    name: "Hardcore",
    short: "Senza tracker, aiuti né cronologia.",
    detailed:
      "Memoria pura. Ricevi PIÙ ALTO/BASSO ma niente tracker, niente aiuti e nessun elenco dei tentativi: ricordali tu.",
    example: "Tentativo 500 → PIÙ ALTO, poi 750 → PIÙ BASSO… e devi tenere il conto a mente.",
    advantages: ["Sfida massima", "Ottimo allenamento di memoria"],
    disadvantages: ["Facile perdere il conto", "Frustrante per i principianti"],
    bestFor: "Veterani in cerca di sfida",
    length: "3–7 minuti",
  },
  blind: {
    name: "Alla cieca",
    short: "Senza vedere i tentativi precedenti.",
    detailed:
      "Ricevi ancora PIÙ ALTO/BASSO dopo ogni tentativo, ma la cronologia è nascosta. Si vede solo l'ultimo risultato.",
    example: "Tentativo 500 → PIÙ ALTO (visibile). Tentativo 800 → PIÙ BASSO (visibile). I precedenti no.",
    advantages: ["Mette alla prova focus e memoria", "Veloce e teso"],
    disadvantages: ["Nessuna cronologia da rivedere", "Gli errori costano di più"],
    bestFor: "Giocatori concentrati",
    length: "3–6 minuti",
  },
  suddendeath: {
    name: "Morte improvvisa",
    short: "Tentativi limitati — se finiscono, perdi.",
    detailed:
      "Hai un budget stretto di tentativi (poco più dell'ottimale). Usalo bene: se finiscono, perdi.",
    example: "Partita a 4 cifre, 16 tentativi. Sbagliare il 16° è game over.",
    advantages: ["Tensione alta", "Ogni tentativo conta"],
    disadvantages: ["Punisce gli errori", "Poco indulgente"],
    bestFor: "Amanti del brivido",
    length: "2–4 minuti",
  },
  speedrun: {
    name: "Speed Run",
    short: "Vinci nel minor numero di tentativi (allenamento).",
    detailed:
      "Sfida in solitaria: risolvi il numero nel minor numero di tentativi e avvicinati al gioco ottimale. Il punteggio è tentativi e tempo.",
    example: "Numero a 3 cifre: riesci a vincere in 10 tentativi o meno?",
    advantages: ["Ottimo per migliorare", "Obiettivo personale chiaro"],
    disadvantages: ["Nessun avversario", "Pura ottimizzazione"],
    bestFor: "Chi insegue i record",
    length: "1–3 minuti",
  },
  duel: {
    name: "Duello (multigiocatore)",
    short: "Entrambi indovinano insieme — senza turni.",
    detailed:
      "Modalità multigiocatore senza attesa del turno. Invia tentativi il più in fretta possibile; il primo che risolve il numero avversario vince. (Arriva con la fase multigiocatore.)",
    example: "Entrambi sparano tentativi insieme — pura velocità.",
    advantages: ["Ritmo serrato", "Emozionante"],
    disadvantages: ["Meno strategico", "Solo multigiocatore"],
    bestFor: "Giocatori competitivi",
    length: "1–3 minuti",
  },
  easy: { name: "Facile", short: "Tracker dell'intervallo e aiuti disponibili." },
  normal: { name: "Normale", short: "Tracker attivo, senza aiuti." },
  hard: { name: "Difficile", short: "Senza tracker, senza aiuti." },
  nightmare: { name: "Incubo", short: "Nessun aiuto; statistiche nascoste fino alla vittoria." },
  rookie: { name: "Principiante", short: "Gioca male e spreca mosse." },
  human: { name: "Umano", short: "Gioca bene ma non perfetto, come una persona." },
  monster: { name: "Mostro della ricerca binaria", short: "Indovina sempre il punto medio ottimale." },
  impossible: { name: "Impossibile", short: "Gioco perfetto — e muove per primo." },
  "reveal-range": { name: "Rivela intervallo", short: "Mostra una volta l'intervallo rimasto esatto." },
  "reveal-digit": { name: "Rivela cifra", short: "Rivela una cifra corretta del segreto." },
  freeze: { name: "Congela avversario", short: "L'avversario salta il prossimo turno." },
  "double-turn": { name: "Turno doppio", short: "Due tentativi di fila." },
  mirror: { name: "Mossa specchio", short: "Copia l'ultimo tentativo avversario (multigiocatore)." },
  "number-length": { name: "Lunghezza numero", short: "Quante cifre ha il segreto (3–6)." },
  "turn-timer": { name: "Timer del turno", short: "Secondi per turno (∞/15/30/60)." },
  "random-secret": { name: "Numero casuale", short: "Il sistema sceglie il numero (e te lo mostra)." },
  "hidden-random": { name: "Casuale nascosto", short: "Difendi un numero che nemmeno tu conosci." },
  hints: { name: "Aiuti", short: "Rivela metà, pari/dispari o una cifra." },
  "range-tracker": { name: "Tracker intervallo", short: "Mostra i numeri ancora possibili." },
  abilities: { name: "Abilità speciali", short: "Poteri monouso: rivela, congela…" },
  "couple-mode": { name: "Modalità coppia", short: "Una sfida divertente dopo la vittoria." },
  "alternate-first-move": { name: "Alterna prima mossa", short: "Cambia chi inizia (multigiocatore)." },
  themes: { name: "Temi", short: "7 stili visivi a scelta." },
};

// ─────────────────────────────────────────────────────────── French
const fr: LangContent = {
  classic: {
    name: "Classique",
    short: "Le classique plus / moins.",
    detailed:
      "Après chaque essai, on te dit si le secret est PLUS GRAND ou PLUS PETIT que ton nombre. Resserre jusqu'à tomber juste.",
    example:
      "Secret 4544. Essai 3000 → PLUS GRAND. Essai 6000 → PLUS PETIT. Essai 4544 → CORRECT.",
    advantages: ["Simple et intuitif", "Récompense le resserrement logique"],
    disadvantages: ["Moins surprenant une fois la stratégie connue"],
    bestFor: "Nouveaux joueurs",
    length: "2–5 minutes",
  },
  hotcold: {
    name: "Chaud-froid",
    short: "Indices selon la distance, pas plus/moins.",
    detailed:
      "Au lieu de PLUS GRAND/PETIT, on te dit à quel point tu es proche : 🔥 brûlant, 🌡 chaud, 🙂 proche, 🥶 froid, ❄ glacial.",
    example:
      "Secret 4544. Essai 5000 → 🌡 chaud. Essai 4600 → 🔥 brûlant. Essai 4544 → CORRECT.",
    advantages: ["Sensation fraîche et intuitive", "Moins mécanique que la recherche binaire"],
    disadvantages: ["Plus dur de jouer parfait", "Pas de traqueur de plage exact"],
    bestFor: "Ceux qui aiment un jeu intuitif",
    length: "3–6 minutes",
  },
  hardcore: {
    name: "Hardcore",
    short: "Sans traqueur, indices ni historique.",
    detailed:
      "Mémoire pure. Tu reçois PLUS GRAND/PETIT mais sans traqueur, sans indices et sans liste d'essais : retiens-les toi-même.",
    example: "Essai 500 → PLUS GRAND, puis 750 → PLUS PETIT… et tu dois tout retenir de tête.",
    advantages: ["Défi maximal", "Excellent exercice de mémoire"],
    disadvantages: ["Facile de perdre le fil", "Frustrant pour les débutants"],
    bestFor: "Vétérans en quête de défi",
    length: "3–7 minutes",
  },
  blind: {
    name: "À l'aveugle",
    short: "Sans voir tes essais précédents.",
    detailed:
      "Tu reçois toujours PLUS GRAND/PETIT après chaque essai, mais l'historique est masqué. Seul le dernier résultat s'affiche.",
    example: "Essai 500 → PLUS GRAND (affiché). Essai 800 → PLUS PETIT (affiché). Les précédents non.",
    advantages: ["Teste concentration et mémoire", "Rapide et tendu"],
    disadvantages: ["Pas d'historique à revoir", "Les erreurs coûtent plus cher"],
    bestFor: "Joueurs concentrés",
    length: "3–6 minutes",
  },
  suddendeath: {
    name: "Mort subite",
    short: "Essais limités — à court, tu perds.",
    detailed:
      "Tu as un budget d'essais serré (un peu plus que l'optimal). Utilise-le bien : à court d'essais, tu perds.",
    example: "Partie à 4 chiffres, 16 essais. Rater le 16e, c'est la fin.",
    advantages: ["Forte tension", "Chaque essai compte"],
    disadvantages: ["Punit les erreurs", "Peu indulgent"],
    bestFor: "Amateurs de sensations",
    length: "2–4 minutes",
  },
  speedrun: {
    name: "Speedrun",
    short: "Gagne en un minimum d'essais (entraînement).",
    detailed:
      "Défi solo : perce le nombre en le moins d'essais possible et approche le jeu optimal. Ton score : essais et temps.",
    example: "Nombre à 3 chiffres : peux-tu gagner en 10 essais ou moins ?",
    advantages: ["Idéal pour progresser", "Objectif personnel clair"],
    disadvantages: ["Pas d'adversaire", "Pure optimisation"],
    bestFor: "Chasseurs de records",
    length: "1–3 minutes",
  },
  duel: {
    name: "Duel (multijoueur)",
    short: "Les deux devinent en même temps — sans tours.",
    detailed:
      "Mode multijoueur sans attente de tour. Envoie tes essais au plus vite ; le premier à percer le nombre adverse gagne. (Arrive avec la vague multijoueur.)",
    example: "Les deux enchaînent les essais en même temps — pure vitesse.",
    advantages: ["Rythme effréné", "Palpitant"],
    disadvantages: ["Moins stratégique", "Multijoueur uniquement"],
    bestFor: "Joueurs compétitifs",
    length: "1–3 minutes",
  },
  easy: { name: "Facile", short: "Traqueur de plage et indices disponibles." },
  normal: { name: "Normal", short: "Traqueur activé, sans indices." },
  hard: { name: "Difficile", short: "Sans traqueur, sans indices." },
  nightmare: { name: "Cauchemar", short: "Aucune aide ; stats cachées jusqu'à la victoire." },
  rookie: { name: "Débutant", short: "Joue mal et gaspille des coups." },
  human: { name: "Humain", short: "Joue bien mais pas parfait, comme une personne." },
  monster: { name: "Monstre de recherche binaire", short: "Trouve toujours le point médian optimal." },
  impossible: { name: "Impossible", short: "Jeu parfait — et il joue en premier." },
  "reveal-range": { name: "Révéler la plage", short: "Montre une fois la plage restante exacte." },
  "reveal-digit": { name: "Révéler un chiffre", short: "Révèle un chiffre correct du secret." },
  freeze: { name: "Geler l'adversaire", short: "L'adversaire saute son prochain tour." },
  "double-turn": { name: "Double tour", short: "Deux essais d'affilée." },
  mirror: { name: "Coup miroir", short: "Copie le dernier essai adverse (multijoueur)." },
  "number-length": { name: "Longueur du nombre", short: "Nombre de chiffres du secret (3–6)." },
  "turn-timer": { name: "Minuteur de tour", short: "Secondes par tour (∞/15/30/60)." },
  "random-secret": { name: "Nombre aléatoire", short: "Le système choisit le nombre (et te le montre)." },
  "hidden-random": { name: "Aléatoire caché", short: "Défends un nombre que toi-même ignores." },
  hints: { name: "Indices", short: "Révèle moitié, pair/impair ou un chiffre." },
  "range-tracker": { name: "Traqueur de plage", short: "Montre les nombres encore possibles." },
  abilities: { name: "Capacités spéciales", short: "Pouvoirs à usage unique : révéler, geler…" },
  "couple-mode": { name: "Mode couple", short: "Un petit défi amusant après une victoire." },
  "alternate-first-move": { name: "Alterner le 1er coup", short: "Change qui commence (multijoueur)." },
  themes: { name: "Thèmes", short: "7 styles visuels au choix." },
};

// ─────────────────────────────────────────────────────────── German
const de: LangContent = {
  classic: {
    name: "Klassisch",
    short: "Das klassische Höher / Niedriger.",
    detailed:
      "Nach jedem Tipp erfährst du, ob die geheime Zahl HÖHER oder NIEDRIGER als dein Tipp ist. Grenze ein, bis du sie genau triffst.",
    example:
      "Geheim 4544. Tipp 3000 → HÖHER. Tipp 6000 → NIEDRIGER. Tipp 4544 → RICHTIG.",
    advantages: ["Einfach und intuitiv", "Belohnt logisches Eingrenzen"],
    disadvantages: ["Weniger überraschend, wenn man die Strategie kennt"],
    bestFor: "Neue Spieler",
    length: "2–5 Minuten",
  },
  hotcold: {
    name: "Heiß & Kalt",
    short: "Hinweise nach Nähe statt höher/niedriger.",
    detailed:
      "Statt HÖHER/NIEDRIGER erfährst du, wie nah du bist: 🔥 sehr heiß, 🌡 heiß, 🙂 nah, 🥶 kalt, ❄ sehr kalt.",
    example:
      "Geheim 4544. Tipp 5000 → 🌡 heiß. Tipp 4600 → 🔥 sehr heiß. Tipp 4544 → RICHTIG.",
    advantages: ["Frisches, intuitives Gefühl", "Weniger mechanisch als Binärsuche"],
    disadvantages: ["Schwerer perfekt zu spielen", "Kein exakter Bereichs-Tracker"],
    bestFor: "Wer ein intuitives Spiel mag",
    length: "3–6 Minuten",
  },
  hardcore: {
    name: "Hardcore",
    short: "Ohne Tracker, Hinweise und Verlauf.",
    detailed:
      "Reines Gedächtnis. Du bekommst HÖHER/NIEDRIGER, aber keinen Tracker, keine Hinweise und keine Tippliste — merke sie dir selbst.",
    example: "Tipp 500 → HÖHER, dann 750 → NIEDRIGER… und du musst alles im Kopf behalten.",
    advantages: ["Maximale Herausforderung", "Tolles Gedächtnistraining"],
    disadvantages: ["Leicht den Überblick zu verlieren", "Frustrierend für Anfänger"],
    bestFor: "Veteranen, die Herausforderung suchen",
    length: "3–7 Minuten",
  },
  blind: {
    name: "Blind",
    short: "Frühere Tipps sind unsichtbar.",
    detailed:
      "Du bekommst nach jedem Tipp weiterhin HÖHER/NIEDRIGER, aber der Verlauf ist verborgen. Nur das letzte Ergebnis ist sichtbar.",
    example: "Tipp 500 → HÖHER (sichtbar). Tipp 800 → NIEDRIGER (sichtbar). Frühere nicht.",
    advantages: ["Testet Fokus und Gedächtnis", "Schnell und spannend"],
    disadvantages: ["Kein Verlauf zum Nachsehen", "Fehler kosten mehr"],
    bestFor: "Konzentrierte Spieler",
    length: "3–6 Minuten",
  },
  suddendeath: {
    name: "Sudden Death",
    short: "Begrenzte Versuche — aufgebraucht, verloren.",
    detailed:
      "Du hast ein knappes Versuchsbudget (etwas mehr als optimal). Nutze es klug: sind sie weg, hast du verloren.",
    example: "4-stelliges Spiel, 16 Versuche. Beim 16. daneben heißt Game Over.",
    advantages: ["Hohe Spannung", "Jeder Versuch zählt"],
    disadvantages: ["Bestraft Fehler", "Wenig nachsichtig"],
    bestFor: "Nervenkitzel-Fans",
    length: "2–4 Minuten",
  },
  speedrun: {
    name: "Speedrun",
    short: "Gewinne in möglichst wenigen Versuchen (Übung).",
    detailed:
      "Solo-Challenge: knacke die Zahl in möglichst wenigen Versuchen und komm dem optimalen Spiel nahe. Deine Wertung: Versuche und Zeit.",
    example: "3-stellige Zahl — schaffst du es in 10 Versuchen oder weniger?",
    advantages: ["Top zum Verbessern", "Klares persönliches Ziel"],
    disadvantages: ["Kein Gegner", "Reine Optimierung"],
    bestFor: "Rekordjäger",
    length: "1–3 Minuten",
  },
  duel: {
    name: "Duell (Mehrspieler)",
    short: "Beide raten gleichzeitig — keine Züge.",
    detailed:
      "Mehrspielermodus ohne Warten auf den Zug. Gib Tipps so schnell wie möglich ab; wer die gegnerische Zahl zuerst knackt, gewinnt. (Kommt mit der Mehrspieler-Welle.)",
    example: "Beide hämmern gleichzeitig Tipps rein — pures Tempo.",
    advantages: ["Rasant", "Aufregend"],
    disadvantages: ["Weniger strategisch", "Nur Mehrspieler"],
    bestFor: "Wettkampforientierte Spieler",
    length: "1–3 Minuten",
  },
  easy: { name: "Einfach", short: "Bereichs-Tracker und Hinweise verfügbar." },
  normal: { name: "Normal", short: "Tracker an, keine Hinweise." },
  hard: { name: "Schwer", short: "Ohne Tracker, ohne Hinweise." },
  nightmare: { name: "Albtraum", short: "Keine Hilfen; Statistik bis zum Sieg verborgen." },
  rookie: { name: "Anfänger", short: "Spielt nachlässig und verschwendet Züge." },
  human: { name: "Mensch", short: "Spielt klug, aber nicht perfekt, wie ein Mensch." },
  monster: { name: "Binärsuch-Monster", short: "Trifft immer die optimale Mitte." },
  impossible: { name: "Unmöglich", short: "Perfektes Spiel — und zieht zuerst." },
  "reveal-range": { name: "Bereich zeigen", short: "Zeigt einmal den exakten Restbereich." },
  "reveal-digit": { name: "Ziffer zeigen", short: "Verrät eine richtige Ziffer der Geheimzahl." },
  freeze: { name: "Gegner einfrieren", short: "Der Gegner setzt seinen nächsten Zug aus." },
  "double-turn": { name: "Doppelzug", short: "Zwei Tipps hintereinander." },
  mirror: { name: "Spiegel-Zug", short: "Kopiert den letzten Gegnertipp (Mehrspieler)." },
  "number-length": { name: "Stellenzahl", short: "Wie viele Stellen die Geheimzahl hat (3–6)." },
  "turn-timer": { name: "Zug-Timer", short: "Sekunden pro Zug (∞/15/30/60)." },
  "random-secret": { name: "Zufallszahl", short: "Das System wählt die Zahl (und zeigt sie dir)." },
  "hidden-random": { name: "Verdeckt zufällig", short: "Verteidige eine Zahl, die selbst du nicht kennst." },
  hints: { name: "Hinweise", short: "Verrät Hälfte, gerade/ungerade oder eine Ziffer." },
  "range-tracker": { name: "Bereichs-Tracker", short: "Zeigt die noch möglichen Zahlen." },
  abilities: { name: "Spezialfähigkeiten", short: "Einmal-Kräfte: zeigen, einfrieren…" },
  "couple-mode": { name: "Pärchen-Modus", short: "Eine lustige Aufgabe nach dem Sieg." },
  "alternate-first-move": { name: "Erster Zug wechselt", short: "Wechselt, wer beginnt (Mehrspieler)." },
  themes: { name: "Designs", short: "7 visuelle Stile zur Auswahl." },
};

// ─────────────────────────────────────────────────────────── Polish
const pl: LangContent = {
  classic: {
    name: "Klasyczny",
    short: "Klasyczne więcej / mniej.",
    detailed:
      "Po każdej próbie dowiadujesz się, czy sekret jest WIĘKSZY czy MNIEJSZY od twojej liczby. Zawężaj, aż trafisz dokładnie.",
    example:
      "Sekret 4544. Próba 3000 → WIĘCEJ. Próba 6000 → MNIEJ. Próba 4544 → POPRAWNIE.",
    advantages: ["Proste i intuicyjne", "Nagradza logiczne zawężanie"],
    disadvantages: ["Mniej zaskakujące, gdy znasz strategię"],
    bestFor: "Nowych graczy",
    length: "2–5 minut",
  },
  hotcold: {
    name: "Ciepło-zimno",
    short: "Podpowiedzi wg odległości, nie więcej/mniej.",
    detailed:
      "Zamiast WIĘCEJ/MNIEJ dowiadujesz się, jak blisko jesteś: 🔥 bardzo gorąco, 🌡 gorąco, 🙂 blisko, 🥶 zimno, ❄ bardzo zimno.",
    example:
      "Sekret 4544. Próba 5000 → 🌡 gorąco. Próba 4600 → 🔥 bardzo gorąco. Próba 4544 → POPRAWNIE.",
    advantages: ["Świeże, intuicyjne odczucie", "Mniej mechaniczne niż wyszukiwanie binarne"],
    disadvantages: ["Trudniej grać idealnie", "Brak dokładnego trackera zakresu"],
    bestFor: "Lubiących intuicyjną grę",
    length: "3–6 minut",
  },
  hardcore: {
    name: "Hardcore",
    short: "Bez trackera, podpowiedzi i historii.",
    detailed:
      "Czysta pamięć. Dostajesz WIĘCEJ/MNIEJ, ale bez trackera, bez podpowiedzi i bez listy prób — pamiętaj je sam.",
    example: "Próba 500 → WIĘCEJ, potem 750 → MNIEJ… i wszystko musisz pamiętać w głowie.",
    advantages: ["Maksymalne wyzwanie", "Świetny trening pamięci"],
    disadvantages: ["Łatwo się pogubić", "Frustrujące dla początkujących"],
    bestFor: "Weteranów szukających wyzwania",
    length: "3–7 minut",
  },
  blind: {
    name: "Na ślepo",
    short: "Bez widoku poprzednich prób.",
    detailed:
      "Nadal dostajesz WIĘCEJ/MNIEJ po każdej próbie, ale historia jest ukryta. Widać tylko ostatni wynik.",
    example: "Próba 500 → WIĘCEJ (widoczne). Próba 800 → MNIEJ (widoczne). Wcześniejsze nie.",
    advantages: ["Testuje skupienie i pamięć", "Szybko i nerwowo"],
    disadvantages: ["Brak historii do wglądu", "Błędy kosztują więcej"],
    bestFor: "Skupionych graczy",
    length: "3–6 minut",
  },
  suddendeath: {
    name: "Nagła śmierć",
    short: "Ograniczone próby — skończą się, przegrywasz.",
    detailed:
      "Masz ciasny budżet prób (nieco ponad optimum). Używaj mądrze: gdy się skończą, przegrywasz.",
    example: "Gra na 4 cyfry, 16 prób. Pudło przy 16. to koniec gry.",
    advantages: ["Duże napięcie", "Każda próba się liczy"],
    disadvantages: ["Karze za błędy", "Mało wybacza"],
    bestFor: "Łowców emocji",
    length: "2–4 minuty",
  },
  speedrun: {
    name: "Speedrun",
    short: "Wygraj w jak najmniejszej liczbie prób (trening).",
    detailed:
      "Wyzwanie solo: rozwiąż liczbę w jak najmniejszej liczbie prób i zbliż się do gry optymalnej. Wynik to próby i czas.",
    example: "Liczba 3-cyfrowa — wygrasz w 10 próbach lub mniej?",
    advantages: ["Świetne do poprawy", "Jasny cel osobisty"],
    disadvantages: ["Brak przeciwnika", "Czysta optymalizacja"],
    bestFor: "Goniących za rekordami",
    length: "1–3 minuty",
  },
  duel: {
    name: "Pojedynek (wieloosobowy)",
    short: "Oboje zgadują jednocześnie — bez tur.",
    detailed:
      "Tryb wieloosobowy bez czekania na turę. Wysyłaj próby jak najszybciej; kto pierwszy rozwiąże liczbę przeciwnika, wygrywa. (Pojawi się w fali wieloosobowej.)",
    example: "Oboje wbijają próby naraz — czysta szybkość.",
    advantages: ["Dynamicznie", "Emocjonująco"],
    disadvantages: ["Mniej strategicznie", "Tylko wieloosobowy"],
    bestFor: "Graczy rywalizujących",
    length: "1–3 minuty",
  },
  easy: { name: "Łatwy", short: "Dostępny tracker zakresu i podpowiedzi." },
  normal: { name: "Normalny", short: "Tracker włączony, bez podpowiedzi." },
  hard: { name: "Trudny", short: "Bez trackera, bez podpowiedzi." },
  nightmare: { name: "Koszmar", short: "Bez pomocy; statystyki ukryte do wygranej." },
  rookie: { name: "Nowicjusz", short: "Gra niechlujnie i marnuje ruchy." },
  human: { name: "Człowiek", short: "Gra mądrze, ale nie idealnie, jak człowiek." },
  monster: { name: "Mistrz wyszukiwania binarnego", short: "Zawsze trafia optymalny środek." },
  impossible: { name: "Niemożliwy", short: "Perfekcyjna gra — i rusza pierwszy." },
  "reveal-range": { name: "Pokaż zakres", short: "Raz pokazuje dokładny pozostały zakres." },
  "reveal-digit": { name: "Pokaż cyfrę", short: "Odkrywa jedną poprawną cyfrę sekretu." },
  freeze: { name: "Zamroź przeciwnika", short: "Przeciwnik traci następną turę." },
  "double-turn": { name: "Podwójna tura", short: "Dwie próby z rzędu." },
  mirror: { name: "Lustrzany ruch", short: "Kopiuje ostatnią próbę przeciwnika (wieloosobowy)." },
  "number-length": { name: "Długość liczby", short: "Ile cyfr ma sekret (3–6)." },
  "turn-timer": { name: "Licznik tury", short: "Sekund na turę (∞/15/30/60)." },
  "random-secret": { name: "Losowa liczba", short: "System wybiera liczbę (i pokazuje ci ją)." },
  "hidden-random": { name: "Ukryta losowa", short: "Broń liczby, której nawet ty nie znasz." },
  hints: { name: "Podpowiedzi", short: "Odkrywa połowę, parzystość lub cyfrę." },
  "range-tracker": { name: "Tracker zakresu", short: "Pokazuje wciąż możliwe liczby." },
  abilities: { name: "Specjalne zdolności", short: "Moce jednorazowe: odkryj, zamroź…" },
  "couple-mode": { name: "Tryb dla pary", short: "Zabawne wyzwanie po wygranej." },
  "alternate-first-move": { name: "Naprzemienny pierwszy ruch", short: "Zmienia, kto zaczyna (wieloosobowy)." },
  themes: { name: "Motywy", short: "7 stylów wizualnych do wyboru." },
};

export const CONTENT: Partial<Record<LangCode, LangContent>> = {
  uk,
  ru,
  es,
  it,
  fr,
  de,
  pl,
};

/** Difficulty rating labels (Easy/Medium/Hard/Very hard) per language. */
export const DIFFICULTY_LABELS: Partial<Record<LangCode, Record<string, string>>> = {
  uk: { Easy: "Легко", Medium: "Середньо", Hard: "Складно", "Very hard": "Дуже складно" },
  ru: { Easy: "Легко", Medium: "Средне", Hard: "Сложно", "Very hard": "Очень сложно" },
  es: { Easy: "Fácil", Medium: "Media", Hard: "Difícil", "Very hard": "Muy difícil" },
  it: { Easy: "Facile", Medium: "Media", Hard: "Difficile", "Very hard": "Molto difficile" },
  fr: { Easy: "Facile", Medium: "Moyenne", Hard: "Difficile", "Very hard": "Très difficile" },
  de: { Easy: "Leicht", Medium: "Mittel", Hard: "Schwer", "Very hard": "Sehr schwer" },
  pl: { Easy: "Łatwo", Medium: "Średnio", Hard: "Trudno", "Very hard": "Bardzo trudno" },
};

/** Category titles for the encyclopedia, per language. Index matches CATEGORIES. */
export const CATEGORY_TITLES: Partial<Record<LangCode, string[]>> = {
  uk: ["Режими гри", "Складність соло", "Комп'ютерні суперники", "Особливі здібності", "Налаштування та функції"],
  ru: ["Режимы игры", "Сложность соло", "Компьютерные соперники", "Особые способности", "Настройки и функции"],
  es: ["Modos de juego", "Dificultad individual", "Rivales de la máquina", "Habilidades especiales", "Ajustes y funciones"],
  it: ["Modalità di gioco", "Difficoltà singolo", "Avversari del computer", "Abilità speciali", "Impostazioni e funzioni"],
  fr: ["Modes de jeu", "Difficulté solo", "Adversaires informatiques", "Capacités spéciales", "Paramètres et fonctions"],
  de: ["Spielmodi", "Solo-Schwierigkeit", "Computer-Gegner", "Spezialfähigkeiten", "Einstellungen & Funktionen"],
  pl: ["Tryby gry", "Trudność solo", "Przeciwnicy komputerowi", "Specjalne zdolności", "Ustawienia i funkcje"],
};

/** Merge English base entry with any localized overrides for the language. */
export function localizeEntry(entry: InfoEntry, lang: LangCode): InfoEntry {
  const o = CONTENT[lang]?.[entry.id];
  return o ? { ...entry, ...o } : entry;
}

/** Localize a whole list of entries. */
export function localizeList(list: InfoEntry[], lang: LangCode): InfoEntry[] {
  return list.map((e) => localizeEntry(e, lang));
}

/** Localized encyclopedia categories for a language. */
export function localizedCategories(lang: LangCode) {
  const titles = CATEGORY_TITLES[lang];
  return CATEGORIES.map((cat, i) => ({
    title: titles?.[i] ?? cat.title,
    items: localizeList(cat.items, lang),
  }));
}

/** Localize a difficulty rating word for display. */
export function localizeDifficulty(value: string | undefined, lang: LangCode): string | undefined {
  if (!value) return value;
  return DIFFICULTY_LABELS[lang]?.[value] ?? value;
}

// ───────────────────────────────────────────── Achievements (name + desc)
type AchText = { name: string; desc: string };
export const ACH_CONTENT: Partial<Record<LangCode, Record<string, AchText>>> = {
  uk: {
    "first-win": { name: "Перша перемога", desc: "Виграй свою першу гру." },
    "lucky-guess": { name: "Щасливий здогад", desc: "Виграй з першого ж здогаду." },
    "perfect-game": { name: "Ідеальна гра", desc: "Виграй за оптимальну кількість спроб або менше." },
    "speed-demon": { name: "Демон швидкості", desc: "Виграй гру менш ніж за 30 секунд." },
    "ten-wins": { name: "10 перемог", desc: "Виграй 10 ігор." },
    "comeback-king": { name: "Король камбеків", desc: "Досягни серії з 5 перемог." },
    terminator: { name: "Термінатор", desc: "Виграй гру на 6 цифр за оптимальну кількість спроб." },
    marathon: { name: "Марафон", desc: "Зіграй загалом 1 годину." },
    "hundred-wins": { name: "Центуріон", desc: "Виграй 100 ігор." },
    "thousand-wins": { name: "Легенда", desc: "Виграй 1000 ігор." },
  },
  ru: {
    "first-win": { name: "Первая победа", desc: "Выиграй свою первую игру." },
    "lucky-guess": { name: "Счастливая догадка", desc: "Выиграй с первой же догадки." },
    "perfect-game": { name: "Идеальная игра", desc: "Выиграй за оптимальное число попыток или меньше." },
    "speed-demon": { name: "Демон скорости", desc: "Выиграй игру меньше чем за 30 секунд." },
    "ten-wins": { name: "10 побед", desc: "Выиграй 10 игр." },
    "comeback-king": { name: "Король камбэков", desc: "Достигни серии из 5 побед." },
    terminator: { name: "Терминатор", desc: "Выиграй игру на 6 цифр за оптимальное число попыток." },
    marathon: { name: "Марафон", desc: "Сыграй в сумме 1 час." },
    "hundred-wins": { name: "Центурион", desc: "Выиграй 100 игр." },
    "thousand-wins": { name: "Легенда", desc: "Выиграй 1000 игр." },
  },
  es: {
    "first-win": { name: "Primera victoria", desc: "Gana tu primera partida." },
    "lucky-guess": { name: "Golpe de suerte", desc: "Gana en tu primer intento." },
    "perfect-game": { name: "Partida perfecta", desc: "Gana en los intentos óptimos o menos." },
    "speed-demon": { name: "Demonio de velocidad", desc: "Gana una partida en menos de 30 segundos." },
    "ten-wins": { name: "10 victorias", desc: "Gana 10 partidas." },
    "comeback-king": { name: "Rey de remontadas", desc: "Alcanza una racha de 5 victorias." },
    terminator: { name: "Terminator", desc: "Gana una partida de 6 dígitos en intentos óptimos." },
    marathon: { name: "Maratón", desc: "Juega un total de 1 hora." },
    "hundred-wins": { name: "Centurión", desc: "Gana 100 partidas." },
    "thousand-wins": { name: "Leyenda", desc: "Gana 1000 partidas." },
  },
  it: {
    "first-win": { name: "Prima vittoria", desc: "Vinci la tua prima partita." },
    "lucky-guess": { name: "Colpo di fortuna", desc: "Vinci al primo tentativo." },
    "perfect-game": { name: "Partita perfetta", desc: "Vinci nei tentativi ottimali o meno." },
    "speed-demon": { name: "Demone della velocità", desc: "Vinci una partita in meno di 30 secondi." },
    "ten-wins": { name: "10 vittorie", desc: "Vinci 10 partite." },
    "comeback-king": { name: "Re delle rimonte", desc: "Raggiungi una serie di 5 vittorie." },
    terminator: { name: "Terminator", desc: "Vinci una partita a 6 cifre nei tentativi ottimali." },
    marathon: { name: "Maratona", desc: "Gioca per un totale di 1 ora." },
    "hundred-wins": { name: "Centurione", desc: "Vinci 100 partite." },
    "thousand-wins": { name: "Leggenda", desc: "Vinci 1000 partite." },
  },
  fr: {
    "first-win": { name: "Première victoire", desc: "Gagne ta première partie." },
    "lucky-guess": { name: "Coup de chance", desc: "Gagne dès ton premier essai." },
    "perfect-game": { name: "Partie parfaite", desc: "Gagne en un nombre d'essais optimal ou moins." },
    "speed-demon": { name: "Démon de vitesse", desc: "Gagne une partie en moins de 30 secondes." },
    "ten-wins": { name: "10 victoires", desc: "Gagne 10 parties." },
    "comeback-king": { name: "Roi de la remontée", desc: "Atteins une série de 5 victoires." },
    terminator: { name: "Terminator", desc: "Gagne une partie à 6 chiffres en essais optimaux." },
    marathon: { name: "Marathon", desc: "Joue un total d'1 heure." },
    "hundred-wins": { name: "Centurion", desc: "Gagne 100 parties." },
    "thousand-wins": { name: "Légende", desc: "Gagne 1000 parties." },
  },
  de: {
    "first-win": { name: "Erster Sieg", desc: "Gewinne dein erstes Spiel." },
    "lucky-guess": { name: "Glückstreffer", desc: "Gewinne mit deinem allerersten Tipp." },
    "perfect-game": { name: "Perfektes Spiel", desc: "Gewinne in optimalen Versuchen oder weniger." },
    "speed-demon": { name: "Geschwindigkeitsdämon", desc: "Gewinne ein Spiel in unter 30 Sekunden." },
    "ten-wins": { name: "10 Siege", desc: "Gewinne 10 Spiele." },
    "comeback-king": { name: "Comeback-König", desc: "Erreiche eine Serie von 5 Siegen." },
    terminator: { name: "Terminator", desc: "Gewinne ein 6-stelliges Spiel in optimalen Versuchen." },
    marathon: { name: "Marathon", desc: "Spiele insgesamt 1 Stunde." },
    "hundred-wins": { name: "Zenturio", desc: "Gewinne 100 Spiele." },
    "thousand-wins": { name: "Legende", desc: "Gewinne 1000 Spiele." },
  },
  pl: {
    "first-win": { name: "Pierwsza wygrana", desc: "Wygraj swoją pierwszą grę." },
    "lucky-guess": { name: "Szczęśliwy traf", desc: "Wygraj przy pierwszej próbie." },
    "perfect-game": { name: "Perfekcyjna gra", desc: "Wygraj w optymalnej liczbie prób lub mniej." },
    "speed-demon": { name: "Demon szybkości", desc: "Wygraj grę w mniej niż 30 sekund." },
    "ten-wins": { name: "10 wygranych", desc: "Wygraj 10 gier." },
    "comeback-king": { name: "Król powrotów", desc: "Osiągnij serię 5 wygranych." },
    terminator: { name: "Terminator", desc: "Wygraj grę na 6 cyfr w optymalnej liczbie prób." },
    marathon: { name: "Maraton", desc: "Zagraj łącznie 1 godzinę." },
    "hundred-wins": { name: "Centurion", desc: "Wygraj 100 gier." },
    "thousand-wins": { name: "Legenda", desc: "Wygraj 1000 gier." },
  },
};

/** Localize an achievement's name + description (falls back to English). */
export function localizeAchievement(
  a: { id: string; name: string; desc: string },
  lang: LangCode
): AchText {
  return ACH_CONTENT[lang]?.[a.id] ?? { name: a.name, desc: a.desc };
}

// ───────────────────────────────────────────── Couple-mode challenges
// Parallel arrays in the same order as COUPLE_CHALLENGES (the English source).
export const COUPLE_I18N: Partial<Record<LangCode, string[]>> = {
  uk: [
    "Зроби щирий комплімент 💬",
    "Купи наступну каву ☕",
    "Обійми на 10 секунд 🤗",
    "Розкрий маленький секрет 🤫",
    "Сплануй наступне побачення 🗓️",
    "Помий посуд сьогодні 🍽️",
    "Надішли милий ранковий меседж завтра 🌅",
    "Обери фільм на сьогодні 🎬",
    "Зроби масаж плечей 💆",
    "Приготуй (або замов) улюблену страву 🍝",
    "Скажи, що тобі в ній/ньому подобається ❤️",
    "Той, хто програв, застеляє ліжко тиждень 🛏️",
  ],
  ru: [
    "Сделай искренний комплимент 💬",
    "Купи следующий кофе ☕",
    "Обними на 10 секунд 🤗",
    "Расскажи маленький секрет 🤫",
    "Спланируй следующее свидание 🗓️",
    "Помой посуду сегодня 🍽️",
    "Отправь милое доброе утро завтра 🌅",
    "Выбери фильм на сегодня 🎬",
    "Сделай массаж плеч 💆",
    "Приготовь (или закажи) любимое блюдо 🍝",
    "Скажи, что тебе в нём/ней нравится ❤️",
    "Проигравший застилает кровать неделю 🛏️",
  ],
  es: [
    "Haz un cumplido sincero 💬",
    "Paga el próximo café ☕",
    "Da un abrazo de 10 segundos 🤗",
    "Cuenta un secretito 🤫",
    "Planea la próxima cita 🗓️",
    "Lava los platos esta noche 🍽️",
    "Manda un dulce buenos días mañana 🌅",
    "Elige la película de esta noche 🎬",
    "Da un masaje de hombros 💆",
    "Cocina (o pide) su plato favorito 🍝",
    "Di algo que te encanta de él/ella ❤️",
    "El perdedor hace la cama una semana 🛏️",
  ],
  it: [
    "Fai un complimento sincero 💬",
    "Offri il prossimo caffè ☕",
    "Fai un abbraccio di 10 secondi 🤗",
    "Racconta un piccolo segreto 🤫",
    "Organizza il prossimo appuntamento 🗓️",
    "Lava i piatti stasera 🍽️",
    "Manda un dolce buongiorno domani 🌅",
    "Scegli il film di stasera 🎬",
    "Fai un massaggio alle spalle 💆",
    "Cucina (o ordina) il suo piatto preferito 🍝",
    "Di' una cosa che ami di lui/lei ❤️",
    "Chi perde rifà il letto per una settimana 🛏️",
  ],
  fr: [
    "Fais un compliment sincère 💬",
    "Paie le prochain café ☕",
    "Fais un câlin de 10 secondes 🤗",
    "Confie un petit secret 🤫",
    "Planifie le prochain rendez-vous 🗓️",
    "Fais la vaisselle ce soir 🍽️",
    "Envoie un doux bonjour demain 🌅",
    "Choisis le film de ce soir 🎬",
    "Offre un massage des épaules 💆",
    "Cuisine (ou commande) son plat préféré 🍝",
    "Dis une chose que tu aimes chez elle/lui ❤️",
    "Le perdant fait le lit pendant une semaine 🛏️",
  ],
  de: [
    "Mach ein ehrliches Kompliment 💬",
    "Zahl den nächsten Kaffee ☕",
    "Umarme 10 Sekunden lang 🤗",
    "Verrate ein kleines Geheimnis 🤫",
    "Plane das nächste Date 🗓️",
    "Spül heute Abend ab 🍽️",
    "Schick morgen einen lieben Guten-Morgen-Gruß 🌅",
    "Wähle den Film für heute Abend 🎬",
    "Gib eine Schultermassage 💆",
    "Koche (oder bestelle) sein/ihr Lieblingsessen 🍝",
    "Sag eine Sache, die du an ihm/ihr liebst ❤️",
    "Der Verlierer macht eine Woche das Bett 🛏️",
  ],
  pl: [
    "Powiedz szczery komplement 💬",
    "Postaw następną kawę ☕",
    "Przytul na 10 sekund 🤗",
    "Zdradź mały sekret 🤫",
    "Zaplanuj następną randkę 🗓️",
    "Pozmywaj dziś naczynia 🍽️",
    "Wyślij jutro miłe powitanie rano 🌅",
    "Wybierz dzisiejszy film 🎬",
    "Zrób masaż ramion 💆",
    "Ugotuj (lub zamów) jego/jej ulubione danie 🍝",
    "Powiedz, co w nim/niej kochasz ❤️",
    "Przegrany ściele łóżko przez tydzień 🛏️",
  ],
};

/** Localize a couple-mode challenge (matched by its English source string). */
export function localizeChallenge(en: string, lang: LangCode): string {
  const i = COUPLE_CHALLENGES.indexOf(en);
  const arr = COUPLE_I18N[lang];
  return i >= 0 && arr && arr[i] ? arr[i] : en;
}
