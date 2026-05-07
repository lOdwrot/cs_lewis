import fs from "node:fs";
import path from "node:path";
import type { Core } from "@strapi/strapi";

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await setPublicPermissions(strapi);
    await seedIfEmpty(strapi);
    await seedHomePageIfMissing(strapi);
    await seedTermsIfEmpty(strapi);
    await seedEncyclopediaPageIfMissing(strapi);
  },
};

async function setPublicPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "public" } });

  if (!publicRole) return;

  const collectionTypes = [
    "api::gate.gate",
    "api::journey.journey",
    "api::step.step",
    "api::book.book",
    "api::term.term",
  ];
  const singleTypes = [
    "api::home-page.home-page",
    "api::encyclopedia-page.encyclopedia-page",
  ];
  const contentTypes = [
    ...collectionTypes.flatMap((ct) =>
      ["find", "findOne"].map((a) => `${ct}.${a}`),
    ),
    ...singleTypes.map((st) => `${st}.find`),
  ];

  for (const uid of contentTypes) {
    const existing = await strapi
      .query("plugin::users-permissions.permission")
      .findOne({ where: { action: uid, role: publicRole.id } });

    if (!existing) {
      await strapi.query("plugin::users-permissions.permission").create({
        data: { action: uid, role: publicRole.id, enabled: true },
      });
    } else if (!existing.enabled) {
      await strapi.query("plugin::users-permissions.permission").update({
        where: { id: existing.id },
        data: { enabled: true },
      });
    }
  }
  strapi.log.info("✅ Public permissions set for all content types.");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function publishDoc(
  strapi: Core.Strapi,
  uid: string,
  documentId: string,
) {
  await (strapi.documents(uid as never) as unknown as any).publish({
    documentId,
  });
}

async function seedIfEmpty(strapi: Core.Strapi) {
  // Use db.query so we count both drafts and published — avoids re-seeding on every restart
  const count = await strapi.db.query("api::gate.gate").count({});
  if (count > 0) return;

  strapi.log.info("🌱 Sianie przykładowych danych C.S. Lewisa…");

  // ── Books ────────────────────────────────────────────────────────────────
  const books = [
    {
      title: "Kroniki Narnii",
      description:
        "Fundamentalna seria siedmiu powieści fantasy, przenosząca czytelników do krainy rozmawiających zwierząt i epickich zmagań dobra ze złem.",
      redirectUrl: "https://www.amazon.com/s?k=chronicles+of+narnia+cs+lewis",
    },
    {
      title: "Chrześcijaństwo po prostu",
      description:
        "Wywodzące się z audycji radiowych BBC, to klasyczne dzieło bada wspólny grunt, na którym stoi każdy wyznający wiarę chrześcijańską.",
      redirectUrl: "https://www.amazon.com/s?k=mere+christianity+cs+lewis",
    },
    {
      title: "Listy Starszego Diabła",
      description:
        "Satyryczne arcydzieło opowiedziane przez listy starszego demona do swojego bratanka, stanowiące przenikliwe spojrzenie na ludzką naturę.",
      redirectUrl: "https://www.amazon.com/s?k=screwtape+letters+cs+lewis",
    },
    {
      title: "Wielki Rozwód",
      description:
        "Teologiczna wizja senna o podróży autobusem z Piekła do Nieba, badająca wybory prowadzące do ostatecznego oddzielenia lub zbawienia.",
      redirectUrl: "https://www.amazon.com/s?k=great+divorce+cs+lewis",
    },
    {
      title: "Cuda",
      description:
        "Filozoficzna obrona możliwości Bożej interwencji, argumentująca, że świat przyrody nie jest zamkniętym systemem.",
      redirectUrl: "https://www.amazon.com/s?k=miracles+cs+lewis",
    },
  ];

  for (const book of books) {
    const doc = await strapi
      .documents("api::book.book")
      .create({ data: book as never });
    await publishDoc(strapi, "api::book.book", doc.documentId);
  }

  // ── Steps ─────────────────────────────────────────────────────────────────
  const stepsData = [
    // Brama Wyobraźnia
    {
      title: "Narodziny Mitu",
      description: "Odkrycie przez Lewisa siły mitologii jako drogi do prawdy.",
      type: "text" as const,
      estimatedTime: 15,
      tags: ["mitologia", "wyobraźnia"],
      content: [
        {
          __component: "step.text-content",
          markdown: `## Wizja Mitopoetyczna

Dla C.S. Lewisa mit nie był zwykłą fikcją — był *prawdziwym, choć rozproszonym blaskiem Bożej prawdy*, jak opisał to w słynnym liście do Arthura Greevesa.

> „Mit to góra, z której wypływają wszystkie różne strumienie, które po wielu wędrówkach stają się ostatecznie rzeką Prawdy."

Młody Lewis po raz pierwszy poczuł fascynację tym, co nazywał **Północnością** — przeszywającą, bolesną tęsknotą rozbudzoną przez mitologię nordycką i wagneriańskie tematy. Ta *Sehnsucht* (tęsknota) miała stać się kamieniem węgielnym jego apologetyki.

### Inklingowie i Pod-Tworzenie

W Oxfordzie Lewis dołączył do Tolkiena i Barfielda, wierząc, że człowiek — stworzony na obraz Boży — sam jest **pod-twórcą** i że pisanie mitów jest aktem Bożym, uczestnictwem w trwającym dziele stworzenia.

Ten wgląd przemienił ateizm Lewisa. Jeśli mit wskazuje ku prawdzie, a Ewangelia sama w sobie brzmi jak największy ze wszystkich mitów — z tą różnicą, że *naprawdę się wydarzyła* — to być może mitologia przygotowywała go przez cały czas.`,
          videoUrl: "https://www.youtube.com/watch?v=I0e4AiXMmMw",
        },
      ],
    },
    {
      title: "Sehnsucht: Ból Radości",
      description:
        "Esej dźwiękowy o przeszywającej tęsknocie, którą Lewis uznał za wskazówkę ku boskości.",
      type: "podcast" as const,
      estimatedTime: 20,
      tags: ["tęsknota", "radość"],
      content: [
        {
          __component: "step.podcast-content",
          audioUrl:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          transcript: `W „Zaskoczony radością" Lewis opisuje doświadczenie, które ukształtuje całe jego intelektualne i duchowe życie — to, co nazywał *Radością*, z wielkiej litery.

Nie było to szczęście ani przyjemność. Była to nagła, przeszywająca tęsknota — jak słyszenie melodii z odległego kraju, którego nigdy nie odwiedziłeś. Przychodziła niespodziewanie, wywoływana wierszem, krajobrazem, zapachem jesiennych liści.

> „Trudno znaleźć słowa dość mocne na to odczucie, które mnie ogarnęło… Było to pragnienie czegoś, co nigdy nie pojawiło się w naszym doświadczeniu."

Lewis przez dziesięciolecia próbował zidentyfikować przedmiot tej tęsknoty. Szukał go w naturze, miłości, książkach. Za każdym razem, gdy tęsknota pojawiała się i go ogarniała — a potem mijała — pozostawiało go pragnącym nie samej rzeczy, lecz czegoś *poza* tą rzeczą.

Rozwiązanie przyszło dopiero wtedy, gdy uświadomił sobie, że to pragnienie nie jest defektem wymagającym leczenia, lecz *drogowskazem* — wskazującym ku ojczyźnie, której jego rozum nie śmiał jeszcze nazwać.`,
        },
      ],
    },
    {
      title: "Quiz: Kroniki Narnii",
      description: "Sprawdź swoją wiedzę o Narnii i wyobraźni C.S. Lewisa.",
      type: "quiz" as const,
      estimatedTime: 10,
      tags: ["narnia", "quiz"],
      content: [
        {
          __component: "step.quiz-content",
          questions: [
            {
              question:
                "Jak nazywa się magiczny świat stworzony przez Lewisa w jego słynnej serii?",
              options: ["Śródziemie", "Narnia", "Prydain", "Earthsea"],
              correctIndex: 1,
              explanation:
                'Narnia to magiczny świat stworzony przez Lewisa w Kronikach Narnii, który po raz pierwszy pojawia się w „Lwie, Czarownicy i starej szafie" (1950).',
            },
            {
              question:
                "Jak Lewis nazywa przeszywającą, gorzko-słodką tęsknotę za czymś poza zwykłym doświadczeniem?",
              options: ["Agape", "Sehnsucht", "Logos", "Mythos"],
              correctIndex: 1,
              explanation:
                "Lewis zapożyczył niemieckie słowo *Sehnsucht* (tęsknota/pragnienie), by opisać niewytłumaczalny ból, który uznawał za wskazówkę ku boskości.",
            },
            {
              question: "Który lew reprezentuje postać Chrystusa w Narnii?",
              options: ["Puzzle", "Reepicheep", "Aslan", "Shift"],
              correctIndex: 2,
              explanation:
                'Aslan Lew jest alegoryczną postacią Chrystusa Lewisa — ofiarowaną i zmartwychwstałą w „Lwie, Czarownicy i starej szafie".',
            },
            {
              question: 'Lewis ukuł termin „mitopoeia" — co oznacza?',
              options: [
                "Nauka o dawnych mitach",
                "Tworzenie mitów",
                "Krytyka mitologii",
                "Tłumaczenie mitów",
              ],
              correctIndex: 1,
              explanation:
                "Mitopoeia (tworzenie mitów) opisuje akt tworzenia mitologii. Tolkien użył go w swoim wierszu, argumentując, że ludzie jako pod-twórcy uczestniczą w Bożym dziele stworzenia.",
            },
          ],
        },
      ],
    },
    // Brama Rozum
    {
      title: "Wielka Wojna Idei",
      description:
        "Filozoficzny pojedynek Lewisa z Owenem Barfieldem, który rozbił jego młodzieńczy racjonalizm.",
      type: "text" as const,
      estimatedTime: 12,
      tags: ["filozofia", "rozum"],
      content: [
        {
          __component: "step.text-content",
          markdown: `## Absolutny Racjonalista

Gdy Lewis przybył do Oxfordu, był zagorzałym materialistą. Umysł był przypadkiem materii. Piękno — subiektywne. Logika — narzędziem, nie przewodnikiem ku prawdzie ostatecznej.

Potem poznał **Owena Barfielda**.

> „Posiada geniusz do debat… Jego argumenty nie były tylko dobre — były nieodparte."
> — C.S. Lewis o Barfieldzie

### Chronologiczny Snob

Barfield zapoznał Lewisa z tym, co Lewis nazwie później *Chronologicznym Snobem* — bezkrytycznym założeniem, że co nowsze, to zawsze lepsze; że poprzednie epoki po prostu się myliły.

Lewis zaczął dostrzegać, że traktował starożytną mądrość z pogardą, na którą nie zasługiwała. Tradycja platońska, średniowieczna synteza, wielki łańcuch bytów — to nie były naiwne poprzedniczki współczesnej nauki; były to głębokie próby ujrzenia rzeczywistości w całości.

### Argument z Rozumu

Najbardziej druzgocące było wyzwanie Barfielda: jeśli umysł jest jedynie produktem nieracjonalnych procesów naturalnych, dlaczego mu ufać? Jeśli moje przekonania wynikają z atomów skaczących w przestrzeni, a nie z racjonalnego wnioskowania, to konkluzja „Boga nie ma" nie ma większej wartości niż beknięcie.

Lewis rozwinął to później we własny **Argument z Rozumu** w *Cudach* — być może najbardziej druzgocącą krytyką ścisłego naturalizmu, jaka kiedykolwiek została sformułowana.`,
          videoUrl: null,
        },
      ],
    },
    {
      title: "Rozmowy Oksfordzkie",
      description:
        "Odtworzone rozmowy z wtorkowych porannych spotkań Inklingów w Eagle and Child.",
      type: "podcast" as const,
      estimatedTime: 25,
      tags: ["inklingowie", "oxford"],
      content: [
        {
          __component: "step.podcast-content",
          audioUrl:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          transcript: `Pub Eagle and Child przy St Giles' Street, Oxford. Wtorkowe poranki, lata 30.–50. XX wieku.

Tutaj, przy kuflu gorzkiego piwa i fajce tytoniu, gromadziły się niektóre z najbardziej twórczych umysłów dwudziestego wieku — by czytać głośno niedokończone dzieła i debatować o wszystkim, od mitologii nordyckiej po naturę świadomości.

**C.S. Lewis** przychodził ze stronami pokrytymi drobnym, starannym pismem — rozdziałami tego, co miało stać się Kronikami Narnii, lub kolejnym odcinkiem jego trylogii kosmicznej.

**J.R.R. Tolkien** mógł przynosić strony z *Władcy Pierścieni*, słuchając uważnie reakcji grupy i od czasu do czasu broniąc z uczoną zaciętością wyboru słowa.

**Charles Williams** — poeta, powieściopisarz, teolog mistyczny — rzucał obserwacje tak zaskakujące, że w pokoju zapadała cisza.

Lewis powiedział później, że przyjaźń z Tolkienem była „najbardziej zgodna z moim gustem spośród wszystkich". To właśnie Tolkien — podczas długiego spaceru wzdłuż Addison's Walk — przekonał w końcu Lewisa, że mit może być *prawdziwym mitem* — że Ewangelia jest tym jedynym mitem, który wszedł w historię jako fakt.`,
        },
      ],
    },
    {
      title: "Quiz: Chrześcijaństwo po prostu",
      description:
        "Pytania o przełomowe dzieło apologetyki chrześcijańskiej Lewisa.",
      type: "quiz" as const,
      estimatedTime: 8,
      tags: ["apologetyka", "quiz"],
      content: [
        {
          __component: "step.quiz-content",
          questions: [
            {
              question:
                'W „Wadze chwały" Lewis argumentuje, że nasze pragnienia nie są zbyt silne, lecz zbyt:',
              options: ["Intelektualne", "Słabe", "Wyrafinowane", "Złożone"],
              correctIndex: 1,
              explanation:
                'Lewis pisze: „Jesteśmy połowicznymi stworzeniami… Zbyt łatwo nas zadowolić." Problem nie leży w naszych pragnieniach — są zbyt małe, nie za duże.',
            },
            {
              question:
                'Jaki „trylemaat" Lewis przedstawia odnośnie Jezusa w Chrześcijaństwie po prostu?',
              options: [
                "Nauczyciel, Prorok lub Mesjasz",
                "Pan, Kłamca lub Szaleniec",
                "Człowiek, Mit lub Bóg",
                "Filozof, Reformator lub Rabin",
              ],
              correctIndex: 1,
              explanation:
                'Słynny trylemaat Lewisa: Jezus twierdził, że jest Bogiem. Albo kłamał, albo był szaleńcem, albo mówił prawdę. Nie może być jedynie „dobrym nauczycielem moralności".',
            },
            {
              question:
                "Z jakiego medium pochodziły rozmowy, które stały się książką Chrześcijaństwo po prostu?",
              options: [
                "Telewizji",
                "Radia",
                "Felietonów prasowych",
                "Wykładów uniwersyteckich",
              ],
              correctIndex: 1,
              explanation:
                "Lewis wygłaszał te rozmowy w BBC Radio podczas II wojny światowej (1941–1944). Zostały zebrane i opublikowane jako Chrześcijaństwo po prostu w 1952 roku.",
            },
            {
              question:
                "Lewis opisuje moralność jako mającą trzy części. Która z poniższych NIE jest jedną z nich?",
              options: [
                "Sprawiedliwość między jednostkami",
                "Harmonizowanie wewnętrznego życia jednostki",
                "Cel życia ludzkiego jako całości",
                "Doktryna polityczna państwa",
              ],
              correctIndex: 3,
              explanation:
                "Lewis wymienia trzy części moralności: relacje między jednostkami, wewnętrzne życie jednostki i ogólny cel egzystencji ludzkiej — nie doktrynę polityczną.",
            },
          ],
        },
      ],
    },
    // Brama Wiara
    {
      title: "Nocne Nawrócenie",
      description:
        "Słynny spacer wzdłuż Addison's Walk, podczas którego Tolkien i Dyson przekonali Lewisa, że mit może być prawdziwy.",
      type: "text" as const,
      estimatedTime: 15,
      tags: ["nawrócenie", "wiara"],
      content: [
        {
          __component: "step.text-content",
          markdown: `## Addison's Walk, wrzesień 1931

Była już po północy. Lewis spacerował z J.R.R. Tolkienem i Hugo Dysonem od kilku godzin, gdy argumenty zalewały go niczym fala.

Pytanie brzmiało: dlaczego Lewis mógł przyjąć motyw umierającego i zmartwychwstającego Boga jako *prawdziwy* w mitologii nordyckiej lub greckiej, ale nie w Ewangeliach?

> „Historia Chrystusa jest po prostu prawdziwym mitem: mitem działającym na nas w ten sam sposób co inne, lecz z tą ogromną różnicą, że naprawdę się wydarzyła."

### Logika Mitu Stającego się Faktem

Argument Tolkiena był precyzyjny. Kiedy ludzie opowiadają mity o bogach, którzy umierają i zmartwychwstają, wyrażają głęboką prawdę wpisaną w nich jako obraz-nosicieli Boga. Ta tęsknota za odkupieniem, za pokonaniem śmierci, za nowym życiem — wskazuje ku czemuś realnemu.

Ewangelie są wypełnieniem tego, ku czemu wskazywały wszystkie mity. Bóg, autor mitu, wszedł we własną historię.

Dwanaście dni później Lewis napisał do swojego przyjaciela Arthura Greevesa:

> „Właśnie przeszedłem od wiary w Boga do definitywnego wierzenia w Chrystusa — w chrześcijaństwo… Moje długie nocne czuwania i przebudzenia dobiegły końca."`,
          videoUrl: null,
        },
      ],
    },
    {
      title: "Problem Bólu",
      description:
        "Pastoralne i filozoficzne zaangażowanie Lewisa w temat cierpienia.",
      type: "podcast" as const,
      estimatedTime: 20,
      tags: ["cierpienie", "wiara"],
      content: [
        {
          __component: "step.podcast-content",
          audioUrl:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
          transcript: `W 1940 roku Lewis opublikował *Problem Bólu* — klarowne, niemal kliniczne badanie tego, dlaczego Bóg dopuszcza cierpienie.

Jego kluczowy argument: ból jest Bożym *megafonem*.

> „Bóg szepcze do nas w naszych przyjemnościach, mówi w naszym sumieniu, ale krzyczy przez nasze bóle: jest to jego megafon, by obudzić głuchy świat."

Lewis argumentuje, że świat bez cierpienia byłby światem bez moralnego wzrostu, bez odwagi, bez współczucia. Bóg, który po prostu chronił nas przed wszelkim dyskomfortem, traktowałby nas jak zwierzęta domowe, nie jak dzieci.

Lewis nie był jednak wyłącznie akademicki. W 1960 roku jego żona Joy umarła na raka. Jego odpowiedzią były *Rozważania o żalu* — które rozbiły starannie ułożone argumenty *Problemu Bólu*.

> „Nikt nigdy nie mówił mi, że żal tak bardzo przypomina strach."

Późniejszy Lewis rozumiał coś, co wcześniejszy Lewis mógł jedynie uzasadniać: że wiary nie utrzymuje się samą logiką, lecz codziennym wyborem zaufania Bogu, który wydaje się milczeć — nawet gdy megafon zamilkł.`,
        },
      ],
    },
    {
      title: "Quiz: Wiara i Rozum",
      description:
        "Sprawdź swoje rozumienie integracji wiary i rozumu przez Lewisa.",
      type: "quiz" as const,
      estimatedTime: 7,
      tags: ["wiara", "quiz"],
      content: [
        {
          __component: "step.quiz-content",
          questions: [
            {
              question:
                "Jaką książkę Lewis napisał po śmierci żony Joy, przetwarzając swój smutek?",
              options: [
                "Problem Bólu",
                "Rozważania o żalu",
                "Dopóki mamy twarze",
                "Zaskoczony radością",
              ],
              correctIndex: 1,
              explanation:
                "Lewis napisał *Rozważania o żalu* pod pseudonimem N.W. Clerk po tym, jak jego żona Joy Davidman umarła na raka w 1960 roku. Jest to jego najbardziej osobiste dzieło.",
            },
            {
              question: "Lewis opisuje Prawo Moralne jako dowód na co?",
              options: [
                "Ludzką ewolucję",
                "Uwarunkowania kulturowe",
                "Prawodawczy Umysł stojący za wszechświatem",
                "Demokratyczny konsensus",
              ],
              correctIndex: 2,
              explanation:
                'W Chrześcijaństwie po prostu Lewis argumentuje, że powszechne Prawo Moralne — poczucie „powinności" wspólne wszystkim ludziom — wskazuje na Umysł, który je ustanowił, podobnie jak przepisy drogowe wskazują na ustawodawcę.',
            },
            {
              question:
                'Co Lewis rozumie przez „Wiarę" jako cnotę w Chrześcijaństwie po prostu?',
              options: [
                "Wierzenie bez żadnych dowodów",
                "Trzymanie się tego, co rozum raz przyjął, mimo zmieniających się nastrojów",
                "Emocjonalne poczucie bliskości z Bogiem",
                "Przyjęcie autorytetu Kościoła",
              ],
              correctIndex: 1,
              explanation:
                'Lewis definiuje wiarę jako „sztukę trzymania się tego, co rozum raz przyjął, mimo zmieniających się nastrojów". To dyscyplina, nie uczucie.',
            },
          ],
        },
      ],
    },
  ];

  const stepDocs: Record<string, string> = {};

  for (const stepData of stepsData) {
    const { content, ...rest } = stepData;
    const doc = await strapi.documents("api::step.step").create({
      data: { ...rest, content } as never,
    });
    await publishDoc(strapi, "api::step.step", doc.documentId);
    stepDocs[stepData.title] = doc.documentId;
  }

  // ── Journeys ──────────────────────────────────────────────────────────────
  const journeysData = [
    {
      title: "Wizja Mitopoetyczna",
      slug: "wizja-mitopoetyczna",
      description:
        "Podążaj śladami odkrycia przez Lewisa mitu jako naczynia dla prawdy — od nordyckich sag po Narnię.",
      difficulty: "easy" as const,
      tags: ["mitologia", "wyobraźnia", "Narnia"],
      stepTitles: [
        "Narodziny Mitu",
        "Sehnsucht: Ból Radości",
        "Quiz: Kroniki Narnii",
      ],
    },
    {
      title: "Droga Sceptyka",
      slug: "droga-sceptyka",
      description:
        "Głęboka analiza Wielkiej Wojny Idei między Lewisem a Owenem Barfieldem na temat logiki i wyobraźni.",
      difficulty: "medium" as const,
      tags: ["filozofia", "apologetyka", "Inklingowie"],
      stepTitles: [
        "Wielka Wojna Idei",
        "Rozmowy Oksfordzkie",
        "Quiz: Chrześcijaństwo po prostu",
      ],
    },
    {
      title: "Droga do Wiary",
      slug: "droga-do-wiary",
      description:
        "Śledząc ostatnie kroki intelektualnego i duchowego nawrócenia Lewisa — od oksfordzkich ścieżek do wiary chrześcijańskiej.",
      difficulty: "hard" as const,
      tags: ["nawrócenie", "wiara", "cierpienie"],
      stepTitles: ["Nocne Nawrócenie", "Problem Bólu", "Quiz: Wiara i Rozum"],
    },
  ];

  const journeyDocs: Record<string, string> = {};

  for (const jData of journeysData) {
    const stepIds = jData.stepTitles
      .map((t) => stepDocs[t])
      .filter(Boolean)
      .map((documentId) => ({ documentId }));

    const doc = await strapi.documents("api::journey.journey").create({
      data: {
        title: jData.title,
        slug: jData.slug,
        description: jData.description,
        difficulty: jData.difficulty,
        tags: jData.tags,
        steps: stepIds,
      } as never,
    });
    await publishDoc(strapi, "api::journey.journey", doc.documentId);
    journeyDocs[jData.slug] = doc.documentId;
  }

  // ── Gates ─────────────────────────────────────────────────────────────────
  const gatesData = [
    {
      title: "Wyobraźnia",
      slug: "wyobraznia",
      description:
        "Podróżuj przez mit i fantazję, odkrywając prawdy, których logika nie jest w stanie dosięgnąć.",
      enterButtonLabel: "Wejdź przez szafę",
      iconCharacter: "🦁",
      order: 1,
      journeySlugs: ["wizja-mitopoetyczna"],
    },
    {
      title: "Rozum",
      slug: "rozum",
      description:
        "Angażuj intelekt z klarownością i precyzją poprzez rygorystyczne badanie prawdy.",
      enterButtonLabel: "Zbadaj przez argument",
      iconCharacter: "🧠",
      order: 2,
      journeySlugs: ["droga-sceptyka"],
    },
    {
      title: "Wiara",
      slug: "wiara",
      description:
        "Odkryj transcendentne fundamenty i cichą piękność wiecznej perspektywy.",
      enterButtonLabel: "Odkryj przez doświadczenie",
      iconCharacter: "❤️",
      order: 3,
      journeySlugs: ["droga-do-wiary"],
    },
  ];

  for (const gData of gatesData) {
    const journeyIds = gData.journeySlugs
      .map((s) => journeyDocs[s])
      .filter(Boolean)
      .map((documentId) => ({ documentId }));

    const doc = await strapi.documents("api::gate.gate").create({
      data: {
        title: gData.title,
        slug: gData.slug,
        description: gData.description,
        enterButtonLabel: gData.enterButtonLabel,
        iconCharacter: gData.iconCharacter,
        order: gData.order,
        journeys: journeyIds,
      } as never,
    });
    await publishDoc(strapi, "api::gate.gate", doc.documentId);
  }

  strapi.log.info(
    "✅ Seedowanie zakończone — 3 bramy, 3 podróże, 9 kroków, 5 książek utworzonych.",
  );
}

async function seedHomePageIfMissing(strapi: Core.Strapi) {
  const existing = await strapi.db
    .query("api::home-page.home-page")
    .findOne({});
  if (existing) return;

  // Pick up all gates (ordered) so the home page starts with the same lineup
  // as /portal. Editors can prune or reorder them in the admin afterwards.
  const gates = await strapi.db
    .query("api::gate.gate")
    .findMany({ orderBy: { order: "asc" } });
  const gateRelations = gates.map((g: { documentId: string }) => ({
    documentId: g.documentId,
  }));

  const file = await uploadImageOnce(strapi, {
    filename: "levis.png",
    alternativeText: "C.S. Lewis",
  });

  const data: Record<string, unknown> = {
    title: "C.S. Lewis: Trzy Drogi do Prawdy",
    subtitle:
      "Eseje, analizy i komentarze ukazujące myśl C.S. Lewisa jako spójną całość, w której wyobraźnia, rozum i wiara wzajemnie się przenikają",
    content:
      "Lewis nie oddzielał opowieści od argumentu ani argumentu od wiary. Uważał, że wyobraźnia przygotowuje grunt dla rozumu, rozum domaga się prawdy, a wiara nie niszczy żadnego z nich. Ta strona proponuje lekturę Lewisa właśnie w tym duchu — poprzez teksty, które prowadzą różnymi drogami ku tym samym pytaniom.",
    ctaLabel: "Wybierz bramę",
    gatesSectionTitle: "Trzy Bramy",
    gates: gateRelations,
  };
  if (file?.id) {
    data.backgroundImage = file.id;
  }

  const doc = await strapi.documents("api::home-page.home-page").create({
    data: data as never,
  });
  await publishDoc(strapi, "api::home-page.home-page", doc.documentId);

  strapi.log.info("✅ Seedowanie strony głównej zakończone.");
}

const TERMS_SEED: { name: string; description: string }[] = [
  { name: `Addison's Walk`, description: `Ścieżka w ogrodzie Magdalen College w Oksfordzie, miejsce nocnej rozmowy Lewisa z Tolkienem i Dysonem (19 września 1931), która doprowadziła go do uznania chrześcijaństwa za prawdziwy mit.` },
  { name: `Apologetyka`, description: `Racjonalna obrona wiary chrześcijańskiej. Lewis był jednym z najbardziej wpływowych apologetów XX wieku — jego radiowe pogadanki z czasów wojny stały się podstawą Chrześcijaństwa po prostu.` },
  { name: `Argument z Rozumu`, description: `Krytyka naturalizmu rozwinięta przez Lewisa w Cudach: jeśli umysł jest jedynie produktem irracjonalnych procesów, nie może być wiarygodnym narzędziem poznania prawdy.` },
  { name: `Aslan`, description: `Wielki Lew, władca Narnii, jawnie alegoryczna postać Chrystusa. Pojawia się we wszystkich siedmiu tomach Kronik Narnii — stwarza świat, oddaje życie za Edmunda i powraca w nowej Narnii.` },
  { name: `Boecjusz`, description: `Rzymski filozof z VI wieku, autor Pociechy filozofii. Jego myśl, łącząca platonizm z chrześcijaństwem, mocno wpłynęła na średniowieczną kosmologię, którą Lewis analizował w Odrzuconym obrazie.` },
  { name: `Cair Paravel`, description: `Zamek królów i królowych Narnii nad Wschodnim Morzem. Symbolizuje przywróconą i odkupioną władzę — w przeciwieństwie do uzurpacji Białej Czarownicy.` },
  { name: `Charles Williams`, description: `Pisarz, poeta i teolog mistyczny, członek Inklingów. Wywarł znaczący wpływ na Lewisa, zwłaszcza w Wielkim rozwodzie i koncepcji „współ-cierpienia”.` },
  { name: `Chronologiczny snobizm`, description: `Termin ukuty przez Owena Barfielda i przejęty przez Lewisa: bezkrytyczne założenie, że to, co nowe, jest z konieczności lepsze od tego, co stare. Lewis uważał go za jedną z największych pułapek nowoczesności.` },
  { name: `Chrześcijaństwo po prostu`, description: `Klasyczne dzieło apologetyczne Lewisa (1952), oparte na audycjach radiowych BBC z lat 1941–1944. Broni „trzonu” wiary chrześcijańskiej wspólnego wszystkim wyznaniom.` },
  { name: `Cuda`, description: `Książka Lewisa z 1947 roku — filozoficzna obrona możliwości Bożej interwencji. Zawiera słynny Argument z Rozumu przeciw konsekwentnemu naturalizmowi.` },
  { name: `Digory Kirke`, description: `Postać z Kronik Narnii — chłopiec, który jest świadkiem stworzenia Narnii w Siostrzeńcu Czarodzieja, a w Lwie, Czarownicy i starej szafie pojawia się jako stary profesor.` },
  { name: `Dymna Góra`, description: `Mityczne miejsce z trylogii kosmicznej Lewisa, kojarzone z duchowym uciskiem i atakiem ciemnych mocy w Tej ohydnej sile.` },
  { name: `Edmund Pevensie`, description: `Drugi z braci Pevensie. Jego zdrada wobec rodzeństwa i odkupienie przez ofiarę Aslana są centralną osią Lwa, Czarownicy i starej szafy.` },
  { name: `Eldil`, description: `Anielska istota w trylogii kosmicznej Lewisa — pośrednicy między Maleldilem (Bogiem) a światami planet. Przypominają tradycyjne chrześcijańskie aniołów-władców.` },
  { name: `Eustachy Klarencjusz Scrubb`, description: `Postać z Podróży „Wędrowca do Świtu” i kolejnych tomów. Jego przemiana ze zarozumiałego dziecka w lojalnego przyjaciela jest jednym z najbardziej alegorycznych wątków Kronik.` },
  { name: `Fantazja`, description: `Lewisowska kategoria literacka — gatunek odwołujący się do prawdy poprzez nie-realistyczne obrazy. Lewis bronił fantazji przed zarzutem ucieczki od rzeczywistości w eseju O trzech drogach pisania dla dzieci.` },
  { name: `Hugo Dyson`, description: `Anglista z Oksfordu, członek Inklingów. Wraz z Tolkienem uczestniczył w słynnej rozmowie na Addison's Walk, która przyczyniła się do nawrócenia Lewisa.` },
  { name: `Inklingowie`, description: `Nieformalna grupa literacka spotykająca się w Oksfordzie w latach 30.–60. XX wieku, zwłaszcza w pubie Eagle and Child. Należeli do niej Lewis, Tolkien, Williams, Barfield i Dyson.` },
  { name: `Joy Davidman`, description: `Amerykańska poetka i pisarka, żona C.S. Lewisa od 1956 roku. Jej śmierć na raka w 1960 roku skłoniła Lewisa do napisania Rozważań o żalu.` },
  { name: `J.R.R. Tolkien`, description: `Filolog, autor Władcy Pierścieni i bliski przyjaciel Lewisa. To rozmowa z nim na Addison's Walk przekonała Lewisa, że Ewangelia jest „prawdziwym mitem”.` },
  { name: `Kroniki Narnii`, description: `Siedmiotomowy cykl powieści fantasy (1950–1956): Siostrzeniec Czarodzieja, Lew Czarownica i stara szafa, Koń i jego chłopiec, Książę Kaspian, Podróż „Wędrowca do Świtu”, Srebrne krzesło, Ostatnia bitwa.` },
  { name: `Lew, Czarownica i stara szafa`, description: `Pierwsza opublikowana powieść Kronik Narnii (1950). Czworo dzieci Pevensie wchodzi przez magiczną szafę do Narnii i pomaga Aslanowi pokonać Białą Czarownicę.` },
  { name: `Listy Starszego Diabła`, description: `Satyryczna powieść Lewisa z 1942 roku, napisana jako seria listów starszego diabła Krętacza do młodszego siostrzeńca Piołuna. Przenikliwe studium pokus dnia codziennego.` },
  { name: `Magdalen College`, description: `Kolegium Uniwersytetu Oksfordzkiego, w którym Lewis był wykładowcą literatury angielskiej w latach 1925–1954.` },
  { name: `Maleldil`, description: `Imię Boga-Stwórcy w trylogii kosmicznej Lewisa. Maleldil-Młody odpowiada Chrystusowi; cała kosmologia trylogii jest przekładem chrześcijańskiej teologii na język mitu.` },
  { name: `Malacandra`, description: `Mars w trylogii kosmicznej Lewisa — planeta, która nie zaznała upadku. Po raz pierwszy odwiedza ją Ransom w powieści Z milczącej planety.` },
  { name: `Mit`, description: `Centralna kategoria w myśli Lewisa. Mit nie jest dla niego kłamstwem, lecz „prawdziwym, choć rozproszonym blaskiem Bożej prawdy”. W Ewangelii mit i fakt zbiegają się raz na zawsze.` },
  { name: `Mitopoeia`, description: `Termin Tolkiena oznaczający „tworzenie mitów” — akt, w którym człowiek-pod-twórca uczestniczy w Bożym dziele stworzenia. Lewis przyjął tę kategorię jako klucz do rozumienia literatury.` },
  { name: `Narnia`, description: `Wymyślona kraina rozmawiających zwierząt, stworzona przez Aslana w Siostrzeńcu Czarodzieja. Stanowi tło wszystkich siedmiu tomów Kronik Narnii.` },
  { name: `Northernness`, description: `Lewisowskie określenie przeszywającej tęsknoty wzbudzonej mitologią nordycką i muzyką Wagnera, której doświadczył jako młodzieniec. Jeden z pierwszych przejawów Sehnsucht.` },
  { name: `Owen Barfield`, description: `Filozof, prawnik, jeden z najbliższych przyjaciół Lewisa. Jego argumenty rozbiły młodzieńczy materializm Lewisa — Lewis nazywał ich spór „Wielką Wojną Idei”.` },
  { name: `Perelandra`, description: `Drugi tom trylogii kosmicznej Lewisa (1943). Ransom udaje się na Wenus, by zapobiec drugiemu upadkowi w nowo stworzonym Edenie planetarnym.` },
  { name: `Pielgrzymi powrót`, description: `Pierwsza powieść Lewisa po nawróceniu (1933). Alegoryczna narracja w stylu Bunyana, opisująca drogę Lewisa od ateizmu do chrześcijaństwa.` },
  { name: `Problem Bólu`, description: `Książka Lewisa z 1940 roku, próba teologicznego ujęcia zła i cierpienia. Słynne zdanie: „Bóg krzyczy do nas przez nasze bóle: jest to jego megafon”.` },
  { name: `Ransom`, description: `Bohater trylogii kosmicznej Lewisa, filolog z Cambridge — postać częściowo wzorowana na Tolkienie. W Tej ohydnej sile staje się przywódcą oporu wobec demonicznego N.I.C.E.` },
  { name: `Rozważania o żalu`, description: `Surowa, autobiograficzna książka Lewisa z 1961 roku, napisana po śmierci Joy. Pierwotnie wydana pod pseudonimem N.W. Clerk. Rozbija starannie zbudowane argumenty Problemu Bólu.` },
  { name: `Sehnsucht`, description: `Niemieckie słowo oznaczające tęsknotę, używane przez Lewisa do opisania przeszywającego pragnienia, które nie znajduje zaspokojenia w żadnym ziemskim przedmiocie. Według Lewisa to drogowskaz ku Bogu.` },
  { name: `Trylemat Lewisa`, description: `Argument apologetyczny z Chrześcijaństwa po prostu: Jezus twierdził, że jest Bogiem, więc albo był Panem, albo Kłamcą, albo Szaleńcem. Nie można Go uznać za „dobrego nauczyciela moralności”.` },
  { name: `Trylogia kosmiczna`, description: `Trzy powieści science-fiction Lewisa: Z milczącej planety (1938), Perelandra (1943), Ta ohydna siła (1945). Łączą gatunek z teologią i krytyką współczesnego scjentyzmu.` },
  { name: `Waga chwały`, description: `Słynne kazanie Lewisa wygłoszone w Oksfordzie w 1941 roku. Zawiera tezę, że nasze pragnienia nie są zbyt silne, lecz zbyt słabe — „zbyt łatwo nas zadowolić”.` },
  { name: `Zaskoczony radością`, description: `Autobiografia duchowa Lewisa z 1955 roku. Opisuje drogę od ateizmu do wiary chrześcijańskiej, a „radość” jest niemieckim Sehnsucht — przeszywającą tęsknotą, która okazała się drogowskazem ku Bogu.` },
];

async function seedTermsIfEmpty(strapi: Core.Strapi) {
  const count = await strapi.db.query("api::term.term").count({});
  if (count > 0) return;

  strapi.log.info("🌱 Sianie haseł encyklopedii…");

  for (const term of TERMS_SEED) {
    const doc = await strapi
      .documents("api::term.term")
      .create({ data: term as never });
    await publishDoc(strapi, "api::term.term", doc.documentId);
  }

  strapi.log.info(`✅ Encyklopedia: zasiano ${TERMS_SEED.length} haseł.`);
}

async function uploadImageOnce(
  strapi: Core.Strapi,
  { filename, alternativeText }: { filename: string; alternativeText: string },
) {
  const existing = await strapi.db
    .query("plugin::upload.file")
    .findOne({ where: { name: filename } });
  if (existing) return existing;

  const filePath = path.join(strapi.dirs.static.public, filename);
  if (!fs.existsSync(filePath)) {
    strapi.log.warn(`⚠️ Pominięto upload — brak pliku ${filePath}.`);
    return null;
  }

  const stats = fs.statSync(filePath);

  const uploaded = await strapi
    .plugin("upload")
    .service("upload")
    .upload({
      data: {
        fileInfo: {
          name: filename,
          alternativeText,
          caption: alternativeText,
        },
      },
      files: {
        filepath: filePath,
        originalFilename: filename,
        mimetype: "image/png",
        size: stats.size,
      },
    });

  const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;
  strapi.log.info(`✅ ${filename} załadowany do biblioteki mediów.`);
  return file;
}

async function seedEncyclopediaPageIfMissing(strapi: Core.Strapi) {
  const existing = await strapi.db
    .query("api::encyclopedia-page.encyclopedia-page")
    .findOne({});
  if (existing) return;

  const file = await uploadImageOnce(strapi, {
    filename: "open_book.png",
    alternativeText: "Otwarta księga",
  });

  const data: Record<string, unknown> = {
    title: "Encyklopedia",
    description:
      "Słownik pojęć, postaci i miejsc kluczowych dla zrozumienia myśli i twórczości C.S. Lewisa. Przeszukuj alfabetycznie lub korzystaj z wyszukiwarki, by szybko znaleźć interesujące hasło.",
  };
  if (file?.id) {
    data.backgroundImage = file.id;
  }

  const doc = await strapi
    .documents("api::encyclopedia-page.encyclopedia-page")
    .create({ data: data as never });
  await publishDoc(
    strapi,
    "api::encyclopedia-page.encyclopedia-page",
    doc.documentId,
  );

  strapi.log.info("✅ Seedowanie strony encyklopedii zakończone.");
}
