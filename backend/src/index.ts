import fs from "node:fs";
import path from "node:path";
import type { Core } from "@strapi/strapi";

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await setPublicPermissions(strapi);
    await seedIfEmpty(strapi);
    await seedNewsIfEmpty(strapi);
    await seedHomePageIfMissing(strapi);
    await seedTermsIfEmpty(strapi);
    await seedEncyclopediaPageIfMissing(strapi);
    await seedGatePageIfMissing(strapi);
    await seedJourneysPageIfMissing(strapi);
    await seedBooksPageIfMissing(strapi);
    await seedArticlesIfEmpty(strapi);
    await seedLibraryPageIfMissing(strapi);
    await seedBiographyPageIfMissing(strapi);
    await seedNewsPageIfMissing(strapi);
    await seedTopMenuIfMissing(strapi);
    await uploadSharedImagesOnce(strapi);
    await seedFooterIfMissing(strapi);
    await seedPublicationsPageIfMissing(strapi);
    await seedPublicationsIfEmpty(strapi);
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
    "api::news.news",
    "api::article.article",
    "api::publication.publication",
  ];
  const singleTypes = [
    "api::home-page.home-page",
    "api::encyclopedia-page.encyclopedia-page",
    "api::gate-page.gate-page",
    "api::journeys-page.journeys-page",
    "api::books-page.books-page",
    "api::library-page.library-page",
    "api::biography-page.biography-page",
    "api::news-page.news-page",
    "api::top-menu.top-menu",
    "api::footer.footer",
    "api::publications-page.publications-page",
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

  const pikaArt = await uploadImageOnce(strapi, {
    filename: "pika-art.webp",
    alternativeText: "Pika art",
  });
  const pokeSign = await uploadImageOnce(strapi, {
    filename: "poke-sign.webp",
    alternativeText: "Drogowskaz",
  });

  const stepImageByTitle: Record<string, number | undefined> = {
    "Sehnsucht: Ból Radości": pokeSign?.id,
  };
  const journeyImageBySlug: Record<string, number | undefined> = {
    "wizja-mitopoetyczna": pikaArt?.id,
  };

  const gateBg1 = await uploadImageOnce(strapi, {
    filename: "poke-1-bg.jpg",
    alternativeText: "Tło bramy Wyobraźni",
  });
  const gateBg2 = await uploadImageOnce(strapi, {
    filename: "poke-2-bg.jpg",
    alternativeText: "Tło bramy Rozumu",
  });
  const gateBackgroundBySlug: Record<string, number | undefined> = {
    wyobraznia: gateBg1?.id,
    rozum: gateBg2?.id,
  };

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
    const data: Record<string, unknown> = { ...rest, content };
    const imageId = stepImageByTitle[stepData.title];
    if (imageId) data.image = imageId;
    const doc = await strapi.documents("api::step.step").create({
      data: data as never,
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

    const data: Record<string, unknown> = {
      title: jData.title,
      slug: jData.slug,
      description: jData.description,
      difficulty: jData.difficulty,
      tags: jData.tags,
      steps: stepIds,
    };
    const imageId = journeyImageBySlug[jData.slug];
    if (imageId) data.image = imageId;

    const doc = await strapi.documents("api::journey.journey").create({
      data: data as never,
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

    const data: Record<string, unknown> = {
      title: gData.title,
      slug: gData.slug,
      description: gData.description,
      enterButtonLabel: gData.enterButtonLabel,
      iconCharacter: gData.iconCharacter,
      order: gData.order,
      journeys: journeyIds,
    };
    const backgroundId = gateBackgroundBySlug[gData.slug];
    if (backgroundId) data.backgroundImage = backgroundId;

    const doc = await strapi.documents("api::gate.gate").create({
      data: data as never,
    });
    await publishDoc(strapi, "api::gate.gate", doc.documentId);
  }

  strapi.log.info(
    "✅ Seedowanie zakończone — 3 bramy, 3 podróże, 9 kroków, 5 książek utworzonych.",
  );
}

const DEFAULT_NAV_LINKS = [
  { label: "Wybierz bramę", target: "gates-section" },
  { label: "Nowości", target: "news-section" },
  { label: "Życiorys", target: "biography" },
];

async function seedHomePageIfMissing(strapi: Core.Strapi) {
  const existing = await strapi.db
    .query("api::home-page.home-page")
    .findOne({ populate: ["navLinks"] });
  if (existing) {
    if (!existing.navLinks || existing.navLinks.length === 0) {
      await strapi.documents("api::home-page.home-page").update({
        documentId: existing.documentId,
        data: { navLinks: DEFAULT_NAV_LINKS } as never,
      });
      await publishDoc(strapi, "api::home-page.home-page", existing.documentId);
      strapi.log.info("✅ Backfilled navLinks on existing home page.");
    }
    return;
  }

  // Pick up all gates (ordered) so the home page starts with the same lineup
  // as /portal. Editors can prune or reorder them in the admin afterwards.
  const gates = await strapi.db
    .query("api::gate.gate")
    .findMany({ orderBy: { order: "asc" } });
  const gateRelations = gates.map((g: { documentId: string }) => ({
    documentId: g.documentId,
  }));

  const newsItems = await strapi.db
    .query("api::news.news")
    .findMany({ orderBy: { createdAt: "asc" } });
  const newsRelations = newsItems.map((n: { documentId: string }) => ({
    documentId: n.documentId,
  }));

  const file = await uploadImageOnce(strapi, {
    filename: "levis.webp",
    alternativeText: "C.S. Lewis",
  });

  const data: Record<string, unknown> = {
    title: "C.S. Lewis: Trzy Drogi do Prawdy",
    subtitle:
      "Eseje, analizy i komentarze ukazujące myśl C.S. Lewisa jako spójną całość, w której wyobraźnia, rozum i wiara wzajemnie się przenikają",
    content:
      "Lewis nie oddzielał opowieści od argumentu ani argumentu od wiary. Uważał, że wyobraźnia przygotowuje grunt dla rozumu, rozum domaga się prawdy, a wiara nie niszczy żadnego z nich. Ta strona proponuje lekturę Lewisa właśnie w tym duchu — poprzez teksty, które prowadzą różnymi drogami ku tym samym pytaniom.",
    gatesSectionTitle: "Trzy Bramy",
    newsSectionTitle: "Nowości",
    gates: gateRelations,
    news: newsRelations,
    navLinks: DEFAULT_NAV_LINKS,
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
  {
    name: `Addison's Walk`,
    description: `Ścieżka w ogrodzie Magdalen College w Oksfordzie, miejsce nocnej rozmowy Lewisa z Tolkienem i Dysonem (19 września 1931), która doprowadziła go do uznania chrześcijaństwa za prawdziwy mit.`,
  },
  {
    name: `Apologetyka`,
    description: `Racjonalna obrona wiary chrześcijańskiej. Lewis był jednym z najbardziej wpływowych apologetów XX wieku — jego radiowe pogadanki z czasów wojny stały się podstawą Chrześcijaństwa po prostu.`,
  },
  {
    name: `Argument z Rozumu`,
    description: `Krytyka naturalizmu rozwinięta przez Lewisa w Cudach: jeśli umysł jest jedynie produktem irracjonalnych procesów, nie może być wiarygodnym narzędziem poznania prawdy.`,
  },
  {
    name: `Aslan`,
    description: `Wielki Lew, władca Narnii, jawnie alegoryczna postać Chrystusa. Pojawia się we wszystkich siedmiu tomach Kronik Narnii — stwarza świat, oddaje życie za Edmunda i powraca w nowej Narnii.`,
  },
  {
    name: `Boecjusz`,
    description: `Rzymski filozof z VI wieku, autor Pociechy filozofii. Jego myśl, łącząca platonizm z chrześcijaństwem, mocno wpłynęła na średniowieczną kosmologię, którą Lewis analizował w Odrzuconym obrazie.`,
  },
  {
    name: `Cair Paravel`,
    description: `Zamek królów i królowych Narnii nad Wschodnim Morzem. Symbolizuje przywróconą i odkupioną władzę — w przeciwieństwie do uzurpacji Białej Czarownicy.`,
  },
  {
    name: `Charles Williams`,
    description: `Pisarz, poeta i teolog mistyczny, członek Inklingów. Wywarł znaczący wpływ na Lewisa, zwłaszcza w Wielkim rozwodzie i koncepcji „współ-cierpienia”.`,
  },
  {
    name: `Chronologiczny snobizm`,
    description: `Termin ukuty przez Owena Barfielda i przejęty przez Lewisa: bezkrytyczne założenie, że to, co nowe, jest z konieczności lepsze od tego, co stare. Lewis uważał go za jedną z największych pułapek nowoczesności.`,
  },
  {
    name: `Chrześcijaństwo po prostu`,
    description: `Klasyczne dzieło apologetyczne Lewisa (1952), oparte na audycjach radiowych BBC z lat 1941–1944. Broni „trzonu” wiary chrześcijańskiej wspólnego wszystkim wyznaniom.`,
  },
  {
    name: `Cuda`,
    description: `Książka Lewisa z 1947 roku — filozoficzna obrona możliwości Bożej interwencji. Zawiera słynny Argument z Rozumu przeciw konsekwentnemu naturalizmowi.`,
  },
  {
    name: `Digory Kirke`,
    description: `Postać z Kronik Narnii — chłopiec, który jest świadkiem stworzenia Narnii w Siostrzeńcu Czarodzieja, a w Lwie, Czarownicy i starej szafie pojawia się jako stary profesor.`,
  },
  {
    name: `Dymna Góra`,
    description: `Mityczne miejsce z trylogii kosmicznej Lewisa, kojarzone z duchowym uciskiem i atakiem ciemnych mocy w Tej ohydnej sile.`,
  },
  {
    name: `Edmund Pevensie`,
    description: `Drugi z braci Pevensie. Jego zdrada wobec rodzeństwa i odkupienie przez ofiarę Aslana są centralną osią Lwa, Czarownicy i starej szafy.`,
  },
  {
    name: `Eldil`,
    description: `Anielska istota w trylogii kosmicznej Lewisa — pośrednicy między Maleldilem (Bogiem) a światami planet. Przypominają tradycyjne chrześcijańskie aniołów-władców.`,
  },
  {
    name: `Eustachy Klarencjusz Scrubb`,
    description: `Postać z Podróży „Wędrowca do Świtu” i kolejnych tomów. Jego przemiana ze zarozumiałego dziecka w lojalnego przyjaciela jest jednym z najbardziej alegorycznych wątków Kronik.`,
  },
  {
    name: `Fantazja`,
    description: `Lewisowska kategoria literacka — gatunek odwołujący się do prawdy poprzez nie-realistyczne obrazy. Lewis bronił fantazji przed zarzutem ucieczki od rzeczywistości w eseju O trzech drogach pisania dla dzieci.`,
  },
  {
    name: `Hugo Dyson`,
    description: `Anglista z Oksfordu, członek Inklingów. Wraz z Tolkienem uczestniczył w słynnej rozmowie na Addison's Walk, która przyczyniła się do nawrócenia Lewisa.`,
  },
  {
    name: `Inklingowie`,
    description: `Nieformalna grupa literacka spotykająca się w Oksfordzie w latach 30.–60. XX wieku, zwłaszcza w pubie Eagle and Child. Należeli do niej Lewis, Tolkien, Williams, Barfield i Dyson.`,
  },
  {
    name: `Joy Davidman`,
    description: `Amerykańska poetka i pisarka, żona C.S. Lewisa od 1956 roku. Jej śmierć na raka w 1960 roku skłoniła Lewisa do napisania Rozważań o żalu.`,
  },
  {
    name: `J.R.R. Tolkien`,
    description: `Filolog, autor Władcy Pierścieni i bliski przyjaciel Lewisa. To rozmowa z nim na Addison's Walk przekonała Lewisa, że Ewangelia jest „prawdziwym mitem”.`,
  },
  {
    name: `Kroniki Narnii`,
    description: `Siedmiotomowy cykl powieści fantasy (1950–1956): Siostrzeniec Czarodzieja, Lew Czarownica i stara szafa, Koń i jego chłopiec, Książę Kaspian, Podróż „Wędrowca do Świtu”, Srebrne krzesło, Ostatnia bitwa.`,
  },
  {
    name: `Lew, Czarownica i stara szafa`,
    description: `Pierwsza opublikowana powieść Kronik Narnii (1950). Czworo dzieci Pevensie wchodzi przez magiczną szafę do Narnii i pomaga Aslanowi pokonać Białą Czarownicę.`,
  },
  {
    name: `Listy Starszego Diabła`,
    description: `Satyryczna powieść Lewisa z 1942 roku, napisana jako seria listów starszego diabła Krętacza do młodszego siostrzeńca Piołuna. Przenikliwe studium pokus dnia codziennego.`,
  },
  {
    name: `Magdalen College`,
    description: `Kolegium Uniwersytetu Oksfordzkiego, w którym Lewis był wykładowcą literatury angielskiej w latach 1925–1954.`,
  },
  {
    name: `Maleldil`,
    description: `Imię Boga-Stwórcy w trylogii kosmicznej Lewisa. Maleldil-Młody odpowiada Chrystusowi; cała kosmologia trylogii jest przekładem chrześcijańskiej teologii na język mitu.`,
  },
  {
    name: `Malacandra`,
    description: `Mars w trylogii kosmicznej Lewisa — planeta, która nie zaznała upadku. Po raz pierwszy odwiedza ją Ransom w powieści Z milczącej planety.`,
  },
  {
    name: `Mit`,
    description: `Centralna kategoria w myśli Lewisa. Mit nie jest dla niego kłamstwem, lecz „prawdziwym, choć rozproszonym blaskiem Bożej prawdy”. W Ewangelii mit i fakt zbiegają się raz na zawsze.`,
  },
  {
    name: `Mitopoeia`,
    description: `Termin Tolkiena oznaczający „tworzenie mitów” — akt, w którym człowiek-pod-twórca uczestniczy w Bożym dziele stworzenia. Lewis przyjął tę kategorię jako klucz do rozumienia literatury.`,
  },
  {
    name: `Narnia`,
    description: `Wymyślona kraina rozmawiających zwierząt, stworzona przez Aslana w Siostrzeńcu Czarodzieja. Stanowi tło wszystkich siedmiu tomów Kronik Narnii.`,
  },
  {
    name: `Northernness`,
    description: `Lewisowskie określenie przeszywającej tęsknoty wzbudzonej mitologią nordycką i muzyką Wagnera, której doświadczył jako młodzieniec. Jeden z pierwszych przejawów Sehnsucht.`,
  },
  {
    name: `Owen Barfield`,
    description: `Filozof, prawnik, jeden z najbliższych przyjaciół Lewisa. Jego argumenty rozbiły młodzieńczy materializm Lewisa — Lewis nazywał ich spór „Wielką Wojną Idei”.`,
  },
  {
    name: `Perelandra`,
    description: `Drugi tom trylogii kosmicznej Lewisa (1943). Ransom udaje się na Wenus, by zapobiec drugiemu upadkowi w nowo stworzonym Edenie planetarnym.`,
  },
  {
    name: `Pielgrzymi powrót`,
    description: `Pierwsza powieść Lewisa po nawróceniu (1933). Alegoryczna narracja w stylu Bunyana, opisująca drogę Lewisa od ateizmu do chrześcijaństwa.`,
  },
  {
    name: `Problem Bólu`,
    description: `Książka Lewisa z 1940 roku, próba teologicznego ujęcia zła i cierpienia. Słynne zdanie: „Bóg krzyczy do nas przez nasze bóle: jest to jego megafon”.`,
  },
  {
    name: `Ransom`,
    description: `Bohater trylogii kosmicznej Lewisa, filolog z Cambridge — postać częściowo wzorowana na Tolkienie. W Tej ohydnej sile staje się przywódcą oporu wobec demonicznego N.I.C.E.`,
  },
  {
    name: `Rozważania o żalu`,
    description: `Surowa, autobiograficzna książka Lewisa z 1961 roku, napisana po śmierci Joy. Pierwotnie wydana pod pseudonimem N.W. Clerk. Rozbija starannie zbudowane argumenty Problemu Bólu.`,
  },
  {
    name: `Sehnsucht`,
    description: `Niemieckie słowo oznaczające tęsknotę, używane przez Lewisa do opisania przeszywającego pragnienia, które nie znajduje zaspokojenia w żadnym ziemskim przedmiocie. Według Lewisa to drogowskaz ku Bogu.`,
  },
  {
    name: `Trylemat Lewisa`,
    description: `Argument apologetyczny z Chrześcijaństwa po prostu: Jezus twierdził, że jest Bogiem, więc albo był Panem, albo Kłamcą, albo Szaleńcem. Nie można Go uznać za „dobrego nauczyciela moralności”.`,
  },
  {
    name: `Trylogia kosmiczna`,
    description: `Trzy powieści science-fiction Lewisa: Z milczącej planety (1938), Perelandra (1943), Ta ohydna siła (1945). Łączą gatunek z teologią i krytyką współczesnego scjentyzmu.`,
  },
  {
    name: `Waga chwały`,
    description: `Słynne kazanie Lewisa wygłoszone w Oksfordzie w 1941 roku. Zawiera tezę, że nasze pragnienia nie są zbyt silne, lecz zbyt słabe — „zbyt łatwo nas zadowolić”.`,
  },
  {
    name: `Zaskoczony radością`,
    description: `Autobiografia duchowa Lewisa z 1955 roku. Opisuje drogę od ateizmu do wiary chrześcijańskiej, a „radość” jest niemieckim Sehnsucht — przeszywającą tęsknotą, która okazała się drogowskazem ku Bogu.`,
  },
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
  const ext = path.extname(filename).toLowerCase();
  const mimetype =
    ext === ".jpg" || ext === ".jpeg"
      ? "image/jpeg"
      : ext === ".webp"
        ? "image/webp"
        : ext === ".gif"
          ? "image/gif"
          : "image/png";

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
        mimetype,
        size: stats.size,
      },
    });

  const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;
  strapi.log.info(`✅ ${filename} załadowany do biblioteki mediów.`);
  return file;
}

async function seedGatePageIfMissing(strapi: Core.Strapi) {
  const existing = await strapi.db
    .query("api::gate-page.gate-page")
    .findOne({});
  if (existing) return;

  const gates = await strapi.db
    .query("api::gate.gate")
    .findMany({ orderBy: { order: "asc" } });
  const gateRelations = gates.map((g: { documentId: string }) => ({
    documentId: g.documentId,
  }));

  const file = await uploadImageOnce(strapi, {
    filename: "open_book.webp",
    alternativeText: "Otwarta księga",
  });

  const data: Record<string, unknown> = {
    title: "Wielki Portal",
    description:
      "Odkryj myśl C.S. Lewisa przez interaktywne podróże przez Wyobraźnię, Rozum i Wiarę. Eseje, podcasty i quizy.",
    dividerText: "Wybierz Swoją Drogę",
    gates: gateRelations,
  };
  if (file?.id) {
    data.backgroundImage = file.id;
  }

  const doc = await strapi.documents("api::gate-page.gate-page").create({
    data: data as never,
  });
  await publishDoc(strapi, "api::gate-page.gate-page", doc.documentId);

  strapi.log.info("✅ Seedowanie strony bram zakończone.");
}

async function seedJourneysPageIfMissing(strapi: Core.Strapi) {
  const existing = await strapi.db
    .query("api::journeys-page.journeys-page")
    .findOne({});
  if (existing) return;

  const file = await uploadImageOnce(strapi, {
    filename: "poke-sign.webp",
    alternativeText: "Drogowskaz",
  });

  const data: Record<string, unknown> = {
    title: "Wszystkie Przygody",
    seoDescription:
      "Przeglądaj wszystkie podróże z myślą C.S. Lewisa — filtruj według poziomu trudności i znajdź swoją drogę.",
    heroLabel: "Odkryj",
    heroDescription:
      "Przeglądaj wszystkie podróże przez świat myśli C.S. Lewisa",
    searchPlaceholder: "Szukaj przygody…",
    filterLabel: "Filtruj po poziomie trudności przygody",
    easyLabel: "Łatwa",
    mediumLabel: "Średnia",
    hardLabel: "Trudna",
    clearFiltersLabel: "Wyczyść",
    emptyMessage: "Nie znaleziono przygód dla podanych kryteriów.",
    endMessage: "Wszystkie przygody załadowane",
  };
  if (file?.id) {
    data.backgroundImage = file.id;
  }

  const doc = await strapi
    .documents("api::journeys-page.journeys-page")
    .create({ data: data as never });
  await publishDoc(strapi, "api::journeys-page.journeys-page", doc.documentId);

  strapi.log.info("✅ Seedowanie strony przygód zakończone.");
}

async function seedBooksPageIfMissing(strapi: Core.Strapi) {
  const existing = await strapi.db
    .query("api::books-page.books-page")
    .findOne({});
  if (existing) return;

  const data: Record<string, unknown> = {
    title: "Półka Uczonego",
    seoDescription:
      "Odkryj najważniejsze książki C.S. Lewisa — od Narni po apologetykę i filozofię chrześcijańską.",
    heroLabel: "Starannie Dobrana Kolekcja",
    heroDescription:
      "„Czytamy, by wiedzieć, że nie jesteśmy sami.” Odkryj najważniejsze dzieła C.S. Lewisa, gdzie rozum spotyka wyobraźnię w dążeniu do wiecznych prawd.",
    buyLabel: "Kup lub Wypożycz",
    motto: "Sapientia et Veritas",
  };

  const doc = await strapi
    .documents("api::books-page.books-page")
    .create({ data: data as never });
  await publishDoc(strapi, "api::books-page.books-page", doc.documentId);

  strapi.log.info("✅ Seedowanie strony książek zakończone.");
}

async function seedEncyclopediaPageIfMissing(strapi: Core.Strapi) {
  const existing = await strapi.db
    .query("api::encyclopedia-page.encyclopedia-page")
    .findOne({});
  if (existing) return;

  const file = await uploadImageOnce(strapi, {
    filename: "open_book.webp",
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

const NEWS_SEED: { title: string; content: string }[] = [
  {
    title: "Konferencja „C. S. Lewis. Wyobraźnia, rozum i wiara”",
    content: `![Plakat konferencji „C. S. Lewis. Wyobraźnia, rozum i wiara”](/conference_image.webp)

Fundacja Prodoteo wraz z Instytutem Filozofii Uniwersytetu Ignatianum w Krakowie i Instytutem Filozofii Uniwersytetu Zielonogórskiego zapraszają na konferencję naukową poświęconą myśli C. S. Lewisa.

Łącząc wyobraźnię literacką, refleksję filozoficzną oraz głębię teologiczną, Clive Staples Lewis wypracował styl myślenia i pisania, który przekracza granice dyscyplin i trafia zarówno do środowiska akademickiego, jak i szerokiego kręgu odbiorców. Konferencja ma na celu prezentację szerokiego pola badań obejmującego analizę jego dzieł literackich oraz refleksję filozoficzną i teologiczną — a także ich wzajemne powiązania.

W centrum dyskusji znajdą się m.in. rola wyobraźni w poznaniu i komunikowaniu prawdy, relacja między mitem a rzeczywistością, teizmem a nauką oraz idee natury i nadnatury.

**Organizatorzy:** Fundacja Prodoteo, Instytut Filozofii Uniwersytetu Ignatianum w Krakowie, Instytut Filozofii Uniwersytetu Zielonogórskiego.

[Strona konferencji →](https://lewis.prodoteo.pl/)`,
  },
  {
    title: "Nowe polskie wydanie „Listów Starszego Diabła”",
    content: `Wydawnictwo Esprit zapowiada wznowienie *Listów Starszego Diabła* w nowym przekładzie, opatrzone wstępem polskiego tłumacza i przypisami osadzającymi tekst w realiach wojennej Anglii.

Tom zawiera również *Toast Starszego Diabła* — późniejszy esej Lewisa, w którym Krętacz powraca, by zabrać głos podczas dorocznej kolacji absolwentów Piekielnej Akademii. Razem dają one pełny obraz tego, jak Lewis postrzegał subtelne mechanizmy pokus dnia codziennego.

Premiera planowana jest na jesień bieżącego roku.`,
  },
  {
    title: "Spacer śladami Inklingów w Oksfordzie",
    content: `Magdalen College ogłosił letni cykl oprowadzań tematycznych „In the Footsteps of the Inklings” — spacerów prowadzących uczestników szlakiem ulubionych miejsc Lewisa, Tolkiena, Williamsa i Barfielda.

Trasa obejmuje **Addison's Walk**, gdzie nocą 19 września 1931 roku padły argumenty, które przekonały Lewisa, że Ewangelia jest „prawdziwym mitem”, a także pub **Eagle and Child** — wtorkowe miejsce spotkań grupy w latach 30. i 40. XX wieku.

Oprowadzania prowadzone są w języku angielskim przez badaczy literatury związanych z uniwersytetem.`,
  },
];

async function seedNewsIfEmpty(strapi: Core.Strapi) {
  const count = await strapi.db.query("api::news.news").count({});
  if (count > 0) return;

  strapi.log.info("🌱 Sianie nowości…");

  for (const item of NEWS_SEED) {
    const doc = await strapi
      .documents("api::news.news")
      .create({ data: item as never });
    await publishDoc(strapi, "api::news.news", doc.documentId);
  }

  strapi.log.info(`✅ Nowości: zasiano ${NEWS_SEED.length} wpisów.`);
}

const ARTICLES_SEED: {
  title: string;
  slug: string;
  description: string;
  content: string;
}[] = [
  {
    title: "Argument z Rozumu w „Cudach”",
    slug: "argument-z-rozumu-w-cudach",
    description:
      "Analiza krytyki naturalizmu, którą Lewis rozwinął w trzecim rozdziale Cudów — być może najmocniejsza linia jego apologetyki.",
    content: `## Co właściwie dowodzi Lewis?

W trzecim rozdziale *Cudów* Lewis stawia tezę pozornie skromną: jeśli **naturalizm** jest prawdą, to żadne nasze przekonanie — łącznie z samym przekonaniem o naturalizmie — nie jest racjonalnie uzasadnione.

Argument można streścić w trzech krokach:

1. Naturalizm głosi, że każdy proces w świecie — łącznie z procesami umysłowymi — jest produktem ślepych, nieracjonalnych przyczyn fizycznych.
2. Gdyby moje przekonania były wyłącznie produktem takich przyczyn, byłyby *spowodowane*, ale nie *wnioskowane*.
3. Poznanie wymaga relacji wnioskowania — przekonanie musi być wytworem racji, a nie tylko przyczyn.

> „Wnioskowanie nie jest zdarzeniem. Nawet w największym pośpiechu nigdy nie *zdarza się*, by ktoś wyciągnął wniosek."

### Krytyka Anscombe i druga wersja

W lutym 1948 roku Elizabeth Anscombe na posiedzeniu Socratic Club przedstawiła ostrą krytykę pierwszej wersji argumentu. Lewis przyjął zarzuty i — wbrew popularnemu mitowi — nie zarzucił apologetyki, lecz **przepisał cały rozdział**, wprowadzając rozróżnienie między *przyczyną* a *podstawą*.

Druga wersja jest subtelniejsza. Lewis nie twierdzi, że naturalizm logicznie się sam obala, lecz że nie potrafi wyjaśnić, *jak w ogóle możliwe jest poznanie*.

### Dlaczego to wciąż się liczy

Współcześni filozofowie — Alvin Plantinga w *Where the Conflict Really Lies*, Thomas Nagel w *Mind and Cosmos* — kontynuują linię argumentacji Lewisa pod nazwą **Evolutionary Argument Against Naturalism**. To, co Lewis postawił w 1947 roku, dziś jest jednym z najbardziej żywych sporów w filozofii umysłu.`,
  },
  {
    title: "Czym jest „Sehnsucht”?",
    slug: "czym-jest-sehnsucht",
    description:
      "Drogowskaz, nie cel — Lewisowska tęsknota jako klucz do jego biografii i apologetyki.",
    content: `## Słowo, którego nie ma w polskim

Niemieckie *Sehnsucht* tłumaczy się zwykle jako „tęsknotę" lub „pragnienie", ale żadne polskie słowo nie oddaje pełnego ładunku tego pojęcia. Lewis używa go w *Zaskoczony radością*, aby opisać przeszywające, gorzko-słodkie poczucie braku, które od dzieciństwa nawiedzało go w niespodziewanych momentach.

> „Pragnienie czegoś, co nigdy nie pojawiło się w naszym doświadczeniu."

### Trzy doświadczenia z dzieciństwa

W autobiografii Lewis wskazuje trzy konkretne momenty, w których po raz pierwszy poczuł Sehnsucht:

1. Wspomnienie zabawkowego ogrodu zbudowanego przez brata na pokrywce blaszanego pudełka.
2. Wiersz Beatrix Potter „Squirrel Nutkin" — i nagłe, niewytłumaczalne wzruszenie obrazem Jesieni.
3. Słowa „Balder the beautiful is dead, is dead" w Longfellowie — i nagła wizja **Północności**, mitologii nordyckiej.

### Dlaczego to nie jest po prostu nostalgia

Lewis odróżnia Sehnsucht od trzech podobnych stanów:
- **Nostalgia** odnosi się do realnej przeszłości.
- **Pożądanie** ma realny przedmiot, który można zdobyć.
- **Sentyment** wzrusza się tym, co już doświadczone.

Sehnsucht — twierdzi Lewis — jest pragnieniem, dla którego *świat nie ma odpowiedzi*. Każda próba zaspokojenia go (przez sztukę, miłość, naturę) kończy się odkryciem, że nie tego się szukało.

### Wniosek apologetyczny

W eseju *Waga chwały* Lewis stawia argument: skoro każdemu naturalnemu pragnieniu odpowiada naturalny przedmiot (głodowi — pokarm, pragnieniu — woda), to być może istnieje pragnienie, które nie znajduje zaspokojenia w żadnym ziemskim przedmiocie, *ponieważ* jego przedmiot leży poza tym światem.

> „Jeśli odkrywam w sobie pragnienie, którego żadne doświadczenie tego świata nie może zaspokoić, najbardziej prawdopodobnym wyjaśnieniem jest to, że zostałem stworzony dla innego świata."`,
  },
  {
    title: "Inklingowie — krąg, który zmienił literaturę",
    slug: "inklingowie-krag-ktory-zmienil-literature",
    description:
      "Wtorkowe poranki w Eagle and Child — jak nieformalne spotkania kilku oksfordzkich akademików dały światu Narnię i Śródziemie.",
    content: `## Pochodzenie nazwy

Słowo *Inkling* pierwotnie oznaczało członka studenckiego klubu literackiego prowadzonego w latach 30. przez Edwarda Tangye Leana w University College. Po jego rozwiązaniu Lewis przejął nazwę dla swojej własnej grupy — kalambur na *ink* (atrament) i *inkling* (przeczucie).

### Kim byli

Kanonicznie wymienia się pięciu głównych członków:

- **C. S. Lewis** — gospodarz, prowadzący spotkania w swoim pokoju w Magdalen College.
- **J. R. R. Tolkien** — czytał kolejne rozdziały *Władcy Pierścieni* na głos przed grupą.
- **Charles Williams** — poeta i teolog mistyczny, dołączył w 1939 po przeprowadzce Oxford University Press do Oksfordu.
- **Owen Barfield** — filozof i prawnik, autor *Poetic Diction*; przyjaciel Lewisa od czasów studenckich.
- **Warren „Warnie" Lewis** — starszy brat C. S., historyk amatorskiego siedemnastowiecznego dworu francuskiego.

W spotkaniach uczestniczyli też okazjonalnie Hugo Dyson, Christopher Tolkien, Lord David Cecil i inni.

### Jak wyglądały spotkania

Były dwa stałe formaty:

- **Czwartkowe wieczory** w pokoju Lewisa w Magdalen — czytanie na głos i krytyka rękopisów.
- **Wtorkowe poranki** w pubie Eagle and Child (zwanym przez członków „The Bird and Baby") — luźniejsza rozmowa przy piwie.

> „Kto byłby uczestnikiem Inklingów? Trzeba było być bardzo dobrym pisarzem, dobrym przyjacielem i — co najtrudniejsze — gotowym do bycia surowo skrytykowanym."

### Co zawdzięczamy spotkaniom

Bez Inklingów prawdopodobnie nie byłoby:
- *Władcy Pierścieni* — Tolkien wielokrotnie groził rzuceniem pisania; tylko nacisk Lewisa go powstrzymał.
- *Listów Starszego Diabła* — początkowy szkic został odczytany na czwartkowym spotkaniu.
- Konwersji Lewisa na chrześcijaństwo — kluczowa rozmowa z Tolkienem i Dysonem na Addison's Walk we wrześniu 1931.

Krąg zaczął się rozluźniać po śmierci Williamsa w 1945 i całkowicie rozpadł się około 1949 — ale jego owoce ukształtowały dwudziestowieczną literaturę fantastyczną.`,
  },
  {
    title: "Lewis a Tolkien — przyjaźń i spór",
    slug: "lewis-a-tolkien-przyjazn-i-spor",
    description:
      "Trzydzieści lat zażyłości, wzajemnego wpływu i powolnego oddalenia — co naprawdę dzieliło dwóch największych Inklingów.",
    content: `## Pierwsze spotkanie

11 maja 1926 roku Lewis i Tolkien spotkali się po raz pierwszy na herbatce w Merton College. Lewis zapisał później w dzienniku: „Mały, gładki, blady człowieczek, który mówi, że istnieją dobre i złe książki, ale w głębi serca jest faszystą językowym."

Wzajemna fascynacja przyszła powoli, przez wspólną miłość do mitologii nordyckiej.

### Wpływ Tolkiena na nawrócenie Lewisa

19 września 1931 roku, podczas nocnego spaceru po Addison's Walk w Magdalen College, Tolkien i Hugo Dyson rozmawiali z Lewisem do trzeciej w nocy. Argument Tolkiena — że mit jest „prawdziwym kłamstwem", drogą prawdy a nie ucieczką od niej — przekroczył ostatnią barierę rozumową Lewisa.

Dwanaście dni później Lewis napisał do Arthura Greevesa: „Właśnie przeszedłem od wiary w Boga do definitywnego wierzenia w Chrystusa."

### Wpływ Lewisa na Tolkiena

Bez nacisków Lewisa *Władca Pierścieni* prawdopodobnie nigdy nie ukazałby się drukiem. Tolkien wielokrotnie chciał porzucić pracę nad książką; Lewis konsekwentnie nakłaniał go do dalszego pisania i czytał kolejne rozdziały w trakcie ich powstawania.

> „Tylko zachęta C. S. L. mogła doprowadzić mnie do końca." — Tolkien

### Powolne oddalenie

Trzy źródła napięcia:

1. **Charles Williams** — Tolkien nigdy nie zaakceptował w pełni dołączenia Williamsa do Inklingów. Uważał jego mistyczne pisarstwo za „mętne i ekstrawaganckie".
2. **Narnia** — Tolkien szczerze nie lubił *Lwa, Czarownicy i starej szafy*. Mieszanie mitologii (centaury, Bachus, Świętym Mikołaj) uważał za niespójne i niepoważne.
3. **Małżeństwo z Joy** — Lewis poślubił rozwiedzioną Amerykankę w 1956. Tolkien jako rygorystyczny katolik nie aprobował tego małżeństwa i czuł się odsunięty.

### Ostatnie lata

Mimo wszystko, gdy Lewis zmarł 22 listopada 1963 (w dniu zabójstwa Kennedy'ego), Tolkien napisał do córki: „Dotąd czułem normalne uczucia człowieka w moim wieku — jak stare drzewo, które po kolei traci liście. To czuję teraz jak cios siekiery, który ścina korzenie."`,
  },
  {
    title: "Trylemat: Pan, Kłamca czy Szaleniec?",
    slug: "trylemat-pan-klamca-czy-szaleniec",
    description:
      "Najbardziej znany — i najbardziej krytykowany — argument apologetyczny Lewisa, w pełnej formie i z odpowiedziami na zarzuty.",
    content: `## Sformułowanie z „Chrześcijaństwa po prostu"

W rozdziale 3 księgi II Lewis przedstawia argument w słynnej, wyciętej później z transmisji radiowych formie:

> „Próbuję tu zapobiec głupiemu twierdzeniu, które ludzie często wypowiadają o Nim: 'Jestem gotów przyjąć Jezusa jako wielkiego nauczyciela moralności, ale nie przyjmuję Jego twierdzenia, że jest Bogiem.' To jest jedna rzecz, której nie wolno powiedzieć. Człowiek, który był jedynie człowiekiem i mówił to, co mówił Jezus, nie byłby wielkim nauczycielem moralności. Byłby albo szaleńcem — na poziomie człowieka, który mówi, że jest jajkiem na miękko — albo byłby diabłem z piekła."

### Struktura logiczna

Argument ma postać disjunktywnego sylogizmu:

1. Jezus twierdził o sobie, że jest Bogiem.
2. Albo: (a) miał rację — wtedy jest **Panem**, (b) wiedział, że nie ma racji — wtedy jest **Kłamcą**, (c) nie miał racji, ale w to wierzył — wtedy jest **Szaleńcem**.
3. Hipotezy (b) i (c) są niezgodne ze świadectwami o Jego nauczaniu i charakterze.
4. Pozostaje (a): Jezus jest Panem.

### Trzy główne zarzuty

**Zarzut 1: Czwarta opcja — Legenda.**
Najczęściej formułowany dziś. Może Jezus nigdy nie twierdził, że jest Bogiem — to późniejsi uczniowie włożyli te słowa w Jego usta. Lewis odpowiada w *Cudach* i innych pismach: krytyczna analiza tekstu Ewangelii wskazuje, że twierdzenia o boskości są wczesne i wielokrotnie poświadczone.

**Zarzut 2: Mistyczne, nie literalne twierdzenia.**
Może Jezus mówił o sobie jako Bogu w sensie mistycznym, jak nauczyciele wschodni — „każdy z nas jest Bogiem". Lewis: kontekst żydowskiego monoteizmu wyklucza tę interpretację. Stwierdzenie „Ja jestem" z Ewangelii Jana było rozumiane jednoznacznie jako bluźnierstwo.

**Zarzut 3: Fałszywa dychotomia psychologiczna.**
Współcześni psycholodzy zauważają, że człowiek może być w jakimś obszarze zaburzony i w innych zdrowy. Lewis uznałby ten zarzut, ale wskazałby, że nauczanie etyczne Jezusa — uznawane za doskonałe nawet przez krytyków — jest niezgodne z głęboką patologią konieczną do takiego mesjanistycznego urojenia.

### Dlaczego argument wciąż żyje

Mimo krytyki, trylemat pozostaje jednym z najczęściej cytowanych argumentów apologetycznych XX wieku. Filozofowie tacy jak William Lane Craig i Stephen Davis bronią go w zaktualizowanych formach, podczas gdy historycy biblijni jak N. T. Wright dostarczają mu współczesnego oparcia w badaniach nad świadomością mesjańską Jezusa.`,
  },
  {
    title: "Wpływ Boecjusza na średniowieczną kosmologię Lewisa",
    slug: "wplyw-boecjusza-na-sredniowieczna-kosmologie-lewisa",
    description:
      'Jak rzymski filozof z VI wieku ukształtował obraz uporządkowanego kosmosu, który Lewis odtworzył w „Odrzuconym obrazie".',
    content: `## „Odrzucony obraz" — niedoceniona książka Lewisa

Wydana pośmiertnie w 1964 roku *The Discarded Image: An Introduction to Medieval and Renaissance Literature* jest być może najgłębszym dziełem Lewisa-akademika. To wykład o świecie umysłowym, w którym tworzyli Dante, Chaucer i Spenser — świecie z bardzo określoną kosmologią.

### Pociecha filozofii — strukturalna mapa średniowiecza

Boecjusz napisał *Pociechę filozofii* (524 n.e.) w więzieniu, oczekując egzekucji. Książka — dialog między Boecjuszem a alegoryczną Filozofią — stała się jednym z najczęściej kopiowanych tekstów średniowiecza.

Kluczowe elementy boecjańskiej kosmologii:

1. **Hierarchia bytu** — od czystej materii u dołu po Boga jako *Esse Ipsum* (Byt Sam w Sobie) u góry.
2. **Koncentryczne sfery niebieskie** — Ziemia w centrum, otoczona sferami Księżyca, Merkurego, Wenus, Słońca, Marsa, Jowisza, Saturna i sfery gwiazd stałych.
3. **Muzyka sfer** — każda obracająca się sfera wydaje ton niesłyszalny dla ludzkiego ucha.
4. **Inteligencje poruszające** — każda sfera ma swojego anioła-rządcę.

### Co Lewis z tego wyciąga

Lewis nie głosi, że średniowieczna kosmologia jest naukowo prawdziwa. Twierdzi co innego: była **estetycznie i moralnie kompletna** w sposób, w jaki nasz wszechświat-pustynia z punktów świetlnych nie jest.

> „Powinniśmy zrozumieć, że średniowieczny obraz kosmosu nie był po prostu kosmologią. Był poematem — i to być może największym z kiedykolwiek napisanych poematów."

### Wcielenie obrazu w trylogię kosmiczną

W *Z milczącej planety*, *Perelandrze* i *Tej ohydnej sile* Lewis świadomie odbudowuje boecjański kosmos w fikcji literackiej:

- **Maleldil** = pierwszy poruszyciel, Bóg.
- **Eldile** = anielskie inteligencje sfer, gdzie Marsem rządzi *Oyarsa* Malacandry, Wenus *Oyarsa* Perelandry.
- **Hierarchia** zachowana — światy nie-upadłe są wyższe od Ziemi (zwanej *Cichą Planetą*, ponieważ utraciła kontakt z resztą kosmosu po upadku).

Lewis nie zaprzecza nauce nowożytnej. Twierdzi jedynie, że średniowieczny obraz świata jest *jednocześnie* odrzucony i niezastąpiony — odpowiadał na pytania, których współczesna kosmologia nie próbuje już zadawać.`,
  },
  {
    title: "Z czego śmieje się „Listy Starszego Diabła”",
    slug: "z-czego-smieje-sie-listy-starszego-diabla",
    description:
      "Satyra teologiczna z 1942 roku — jak Lewis wykorzystał formę listów piekielnego biurokraty do zdiagnozowania duchowych chorób nowoczesności.",
    content: `## Geneza pomysłu

Listy powstały podczas niedzielnej Mszy w lipcu 1940 roku w kościele Holy Trinity w Headington. Lewis pisał później do brata: „Pomyślałem nagle, jakie efektowne byłyby listy nie ze świętych, lecz **z piekła** — listy starego diabła do nowicjusza."

Pierwszy list ukazał się 2 maja 1941 w *The Guardian* (anglikańskim tygodniku, nie współczesnej brytyjskiej gazecie). Sukces był natychmiastowy — w 1942 zebrane listy ukazały się jako książka, która stała się największym bestsellerem Lewisa za jego życia.

### Inwersja perspektywy

Cały żart literacki polega na **odwróconej moralności**. Słowa „nasz Ojciec poniżej" oznaczają Szatana; „Wróg" — Boga. „Pacjent" — to dusza ludzka, którą diabeł próbuje zaprowadzić do piekła.

Konsekwencja ta jest ścisła. Krętacz (Screwtape) gani siostrzeńca Piołuna (Wormwood) za każdą *moralną* porażkę z naszego punktu widzenia — i chwali za każdy *zły* sukces.

### Diagnozy szczególnie celne

**O modlitwie (List IV):**
> „Kiedy zamierza modlić się za matkę, niech jego myśli zwrócą się ku jej duchowemu życiu — co oznacza myślenie o jej własnych grzechach, zwłaszcza tych, których ona nie dostrzega. Niech krytyka zastąpi modlitwę."

**O Kościele (List II):**
> „Jedna z naszych wielkich sojuszników w obecnej chwili jest Kościół sam w sobie. Nie myśl o wiecznym Kościele rozłożonym przez wieki i straszliwym jak armia ze sztandarami. Ten widok napełniłby naszego pacjenta przerażeniem. Każ mu raczej myśleć o lokalnej parafii."

**O „epoce zmian" (List XXV):**
> „Nasi filozofowie zauważyli niedawno, jak bardzo ludzie pragną nowości… To jest nasze największe narzędzie. Prawdziwa wartość Skrzydlatej Słówki jest w tym, że pacjent przestaje pytać 'czy jest prawdziwe?' i zaczyna pytać 'czy jest aktualne?'"

### „Toast Starszego Diabła" — czytanie po latach

W 1959 Lewis dopisał *Screwtape Proposes a Toast* — przemówienie Krętacza na corocznym bankiecie absolwentów Piekielnej Akademii. Tekst jest bardziej polityczny niż oryginał, atakuje uniformizację oświaty i kult egalitaryzmu („nikt nie powinien czuć się gorszy, więc nikt nie może być lepszy").

Niektórzy krytycy uważają toast za zbyt bezpośrednio polemiczny. Inni — że jest najlepszą prozą Lewisa, ostatnim ostrym pióropuszem starego apologety przed śmiercią cztery lata później.`,
  },
];

async function seedArticlesIfEmpty(strapi: Core.Strapi) {
  const count = await strapi.db.query("api::article.article").count({});
  if (count > 0) return;

  strapi.log.info("🌱 Sianie artykułów biblioteki…");

  for (const article of ARTICLES_SEED) {
    const doc = await strapi
      .documents("api::article.article")
      .create({ data: article as never });
    await publishDoc(strapi, "api::article.article", doc.documentId);
  }

  strapi.log.info(`✅ Biblioteka: zasiano ${ARTICLES_SEED.length} artykułów.`);
}

async function seedLibraryPageIfMissing(strapi: Core.Strapi) {
  const existing = await strapi.db
    .query("api::library-page.library-page")
    .findOne({});
  if (existing) return;

  const file = await uploadImageOnce(strapi, {
    filename: "old_book.webp",
    alternativeText: "Stara księga",
  });

  const data: Record<string, unknown> = {
    title: "Biblioteka",
    description:
      "Zbiór esejów, analiz i komentarzy poświęconych życiu i myśli C.S. Lewisa. Przeszukuj według tytułu lub przeglądaj listę alfabetycznie — każdy artykuł stanowi samodzielną lekturę.",
  };
  if (file?.id) {
    data.backgroundImage = file.id;
  }

  const doc = await strapi.documents("api::library-page.library-page").create({
    data: data as never,
  });
  await publishDoc(strapi, "api::library-page.library-page", doc.documentId);

  strapi.log.info("✅ Seedowanie strony biblioteki zakończone.");
}

async function seedBiographyPageIfMissing(strapi: Core.Strapi) {
  const existing = await strapi.db
    .query("api::biography-page.biography-page" as never)
    .findOne({});
  if (existing) return;

  const backgroundFile = await uploadImageOnce(strapi, {
    filename: "old_book.webp",
    alternativeText: "Stara księga",
  });

  const eventImage = await uploadImageOnce(strapi, {
    filename: "levis.webp",
    alternativeText: "C.S. Lewis",
  });
  const sharedImage = eventImage?.id ? { image: eventImage.id } : {};

  const events: Record<string, unknown>[] = [
    {
      year: "1898",
      title: "Narodziny w Belfaście",
      description: `Clive Staples Lewis przyszedł na świat 29 listopada 1898 roku w Belfaście. Dzieciństwo spędzone w rodzinnym „Little Lea” wśród mglistych krajobrazów hrabstwa Down ukształtowało jego wczesną wyobraźnię i tęsknotę zwaną później „Joy”.`,
      ...sharedImage,
    },
    {
      year: "1917–1918",
      title: "Oksford i Wielka Wojna",
      description: `Lewis rozpoczął studia w University College w Oksfordzie, lecz został wkrótce powołany do Somerset Light Infantry. Ranny w bitwie pod Arras — doświadczenie wojny pogłębiło jego wczesny ateizm.`,
      ...sharedImage,
    },
    {
      year: "1925",
      title: "Stypendysta Magdalen College",
      description: `Wybrany na Fellowa i Tutora Literatury Angielskiej w Magdalen College w Oksfordzie. Przez niemal trzydzieści lat jego pokoje były miejscem dyskusji literackich i słynnych spotkań Inklingów.`,
      ...sharedImage,
    },
    {
      year: "1931",
      title: "Nocne nawrócenie",
      description: `Po nocnej rozmowie z J.R.R. Tolkienem i Hugo Dysonem na Addison's Walk Lewis nawrócił się na chrześcijaństwo. Sam określił siebie jako „najbardziej przygnębionego i niechętnego konwertytę w całej Anglii”.`,
      ...sharedImage,
    },
    {
      year: "1950",
      title: "Narodziny Narnii",
      description: `Publikacja „Lwa, Czarownicy i starej szafy” otworzyła światu drzwi Narnii. Cykl połączył miłość Lewisa do średniowiecznej alegorii z dziecięcą wrażliwością na cud, definiując jego literackie dziedzictwo. Pierwsze ziarno opowieści zakiełkowało już w młodości, gdy w głowie Lewisa pojawił się obraz fauna z parasolką idącego przez ośnieżony las — wizja, która dojrzewała przez dekady, zanim znalazła swoje miejsce na kartach powieści. Na siedem tomów Kronik Narnii, ukończonych w ciągu zaledwie kilku lat, złożyły się nie tylko echa mitologii nordyckiej, greckiej i celtyckiej, ale także głęboka chrześcijańska symbolika, którą sam autor wolał nazywać „suppositions” niż alegorią. Postać Aslana — lwa, który składa siebie w ofierze i powraca — stała się jedną z najbardziej rozpoznawalnych figur literatury XX wieku, czytaną zarówno przez dzieci szukających przygody, jak i teologów analizujących jej duchowe warstwy. Cykl, początkowo przyjęty z mieszanymi reakcjami krytyki, w kolejnych dekadach rozszedł się w ponad stu milionach egzemplarzy w niemal pięćdziesięciu językach, inspirując pokolenia czytelników, filmowców i pisarzy fantasy.`,
      ...sharedImage,
    },
    {
      year: "1963",
      title: "Śmierć w Oxfordzie",
      description: `Lewis zmarł 22 listopada 1963 roku w swoim domu „The Kilns” w Headington pod Oksfordem — tego samego dnia co prezydent Kennedy. Pozostawił po sobie korpus dzieł, który nadal kształtuje współczesną literaturę i apologetykę.`,
      ...sharedImage,
    },
  ];

  const data: Record<string, unknown> = {
    title: "Życiorys",
    description:
      "Linia czasu życia C.S. Lewisa — od dzieciństwa w Belfaście, przez doświadczenie wojny i lata w Oksfordzie, po nawrócenie i dzieła, które zdefiniowały jego epokę.",
    events,
  };
  if (backgroundFile?.id) {
    data.backgroundImage = backgroundFile.id;
  }

  const doc = (await strapi
    .documents("api::biography-page.biography-page" as never)
    .create({ data: data as never })) as { documentId: string };
  await publishDoc(
    strapi,
    "api::biography-page.biography-page",
    doc.documentId,
  );

  strapi.log.info("✅ Seedowanie strony życiorysu zakończone.");
}

async function seedNewsPageIfMissing(strapi: Core.Strapi) {
  const existing = await strapi.db
    .query("api::news-page.news-page" as never)
    .findOne({});
  if (existing) return;

  const backgroundFile = await uploadImageOnce(strapi, {
    filename: "levis.webp",
    alternativeText: "C.S. Lewis",
  });

  // Link all existing news items in their current order
  const newsItems = await strapi.db.query("api::news.news").findMany({
    orderBy: { id: "asc" },
  });
  const newsConnect = newsItems.map((n: { id: number }) => ({ id: n.id }));

  const data: Record<string, unknown> = {
    title: "Aktualności",
    description:
      "Bieżące wiadomości ze świata C.S. Lewisa — nowe wydania, konferencje i wydarzenia poświęcone autorowi Kronik Narnii.",
    news: newsConnect,
  };
  if (backgroundFile?.id) {
    data.backgroundImage = backgroundFile.id;
  }

  const doc = (await strapi
    .documents("api::news-page.news-page" as never)
    .create({ data: data as never })) as { documentId: string };
  await publishDoc(strapi, "api::news-page.news-page", doc.documentId);

  strapi.log.info("✅ Seedowanie strony aktualności zakończone.");
}

async function uploadSharedImagesOnce(strapi: Core.Strapi) {
  await uploadImageOnce(strapi, {
    filename: "Rozum_Wiara.png",
    alternativeText: "Rozum i Wiara",
  });
  await uploadImageOnce(strapi, {
    filename: "fundacja-prodoteo.png",
    alternativeText: "Fundacja Prodoteo",
  });
  await uploadImageOnce(strapi, {
    filename: "fb-logo.png",
    alternativeText: "Facebook",
  });
}

async function seedFooterIfMissing(strapi: Core.Strapi) {
  const existing = await strapi.db.query("api::footer.footer").findOne({});
  if (existing) return;

  const fbLogo = await uploadImageOnce(strapi, {
    filename: "fb-logo.png",
    alternativeText: "Facebook",
  });

  const prodoteoLogo = await uploadImageOnce(strapi, {
    filename: "fundacja-prodoteo.png",
    alternativeText: "Fundacja Prodoteo",
  });

  const socialLinks: Record<string, unknown>[] = [
    {
      image: fbLogo?.id ?? null,
      redirectUrl: "https://www.facebook.com/fundacjaprodoteo/",
    },
    {
      image: fbLogo?.id ?? null,
      redirectUrl: "https://www.youtube.com/c/Prodoteo/featured",
    },
    {
      image: fbLogo?.id ?? null,
      redirectUrl: "https://www.instagram.com/contra_gentiles/",
    },
  ];

  const data: Record<string, unknown> = {
    description:
      "Fundacja Prodoteo\n\nKontakt: [kontakt@prodoteo.pl](mailto:kontakt@prodoteo.pl)\n\nCopyright © 2026 Prodoteo",
    socialLinks,
    image: prodoteoLogo?.id ?? null,
    imageLink: "https://www.prodoteo.pl/",
  };

  const doc = await strapi
    .documents("api::footer.footer")
    .create({ data: data as never });
  await publishDoc(strapi, "api::footer.footer", doc.documentId);

  strapi.log.info("✅ Seedowanie stopki zakończone.");
}

async function seedTopMenuIfMissing(strapi: Core.Strapi) {
  const existing = await strapi.db.query("api::top-menu.top-menu").findOne({});
  if (existing) return;

  const data: Record<string, unknown> = {
    homeText: "C.S. Lewis",
    navItems: [
      {
        label: "Wielki Portal",
        hoverText: "Trzy bramy do prawdy – Wyobraźnia, Rozum, Wiara",
        redirect: "portal",
      },
      {
        label: "Przygody",
        hoverText: "Podróże przez myśl i dzieła C.S. Lewisa",
        redirect: "journeys",
      },
      {
        label: "Biblioteka",
        hoverText: "Eseje i artykuły o Lewisie",
        redirect: "library",
      },
      {
        label: "Życiorys",
        hoverText: "Historia życia – od Belfastu po Oxford",
        redirect: "biography",
      },
      {
        label: "Encyklopedia",
        hoverText: "Słownik pojęć i postaci z dzieł Lewisa",
        redirect: "encyclopedia",
      },
      {
        label: "Książki",
        hoverText: "Pełna bibliografia C.S. Lewisa",
        redirect: "books",
      },
      {
        label: "Aktualności",
        hoverText: "Najnowsze wiadomości ze świata lewisologii",
        redirect: "news",
      },
      {
        label: "Publikacje",
        hoverText: "Chronologiczny wykaz dzieł C.S. Lewisa",
        redirect: "publikacje",
      },
    ],
  };

  const doc = await strapi
    .documents("api::top-menu.top-menu")
    .create({ data: data as never });
  await publishDoc(strapi, "api::top-menu.top-menu", doc.documentId);

  strapi.log.info("✅ Seedowanie górnego menu zakończone.");
}

async function seedPublicationsPageIfMissing(strapi: Core.Strapi) {
  const existing = await strapi.db
    .query("api::publications-page.publications-page")
    .findOne({});
  if (existing) return;

  const data: Record<string, unknown> = {
    title: "Publikacje",
    description:
      "Pełna lista dzieł C.S. Lewisa — od poezji i powieści po apologetykę i filozofię. Przeglądaj chronologicznie lub wyszukaj interesującą Cię pozycję.",
  };

  const doc = await strapi
    .documents("api::publications-page.publications-page")
    .create({ data: data as never });
  await publishDoc(
    strapi,
    "api::publications-page.publications-page",
    doc.documentId,
  );

  strapi.log.info("✅ Seedowanie strony publikacji zakończone.");
}

const PUBLICATIONS_SEED: {
  title: string;
  publicationYear: number;
  description: string;
}[] = [
  {
    title: "Spirits in Bondage",
    publicationYear: 1919,
    description: `## Spirits in Bondage: A Cycle of Lyrics

Pierwszy opublikowany zbiór wierszy Lewisa, wydany pod pseudonimem **Clive Hamilton**. Cykl liryczny podzielony na trzy części: *The Prison House*, *Hesitation* i *Hope*. Wiersze odzwierciedlają dualizm wczesnego okresu — głęboka miłość do natury i piękna kontrastuje z wrogością wobec Boga i wszechświata.

Lewis napisał te wiersze podczas służby w I wojnie światowej i krótko po niej. Widać w nich zarówno wpływ nordyckiej mitologii, jak i ból doświadczeń frontowych z Francji.`,
  },
  {
    title: "Dymer",
    publicationYear: 1926,
    description: `## Dymer

Długi poemat narracyjny opublikowany pod tym samym pseudonimem co debiut — *Clive Hamilton*. Tytułowy bohater ucieka z totalitarnego państwa i wkracza w świat snu i fantazji, gdzie rodzi potwora, który ostatecznie go pożera.

Poemat odzwierciedla ówczesny ateizm Lewisa oraz jego zainteresowanie mitem i psychologią głębi. Sam autor później ocenił dzieło ambiwalentnie, lecz dostrzegał w nim elementy przepowiadające jego późniejsze nawrócenie.`,
  },
  {
    title: "The Pilgrim's Regress",
    publicationYear: 1933,
    description: `## Powrót Pielgrzyma

Pierwsza prozatorska książka Lewisa po nawróceniu — alegoryczna opowieść wzorowana na *Pielgrzymce Johna Bunyana*. Bohater John podróżuje przez krainy symbolizujące filozoficzne i kulturowe pułapki nowoczesności (liberalizm, marksizm, estetyzm, spirytyzm), szukając źródła wyspy widzianej w dzieciństwie.

Dzieło jest zarazem intelektualną autobiografią nawrócenia Lewisa i satyrą na współczesne ideologie. Autor sam przyznał w późniejszych latach, że allegoria jest zbyt szczelna i trudna w odbiorze dla czytelnika nieznającego kontekstu.`,
  },
  {
    title: "The Allegory of Love",
    publicationYear: 1936,
    description: `## Alegoria Miłości

Przełomowe studium akademickie o miłości dworskiej i alegorii w literaturze średniowiecznej, za które Lewis otrzymał Nagrodę Hawthorndena. Praca analizuje tradycję od Owidiusza po Spensera, ukazując, jak motyw miłości dworskiej kształtował europejską wyobraźnię literacką przez ponad tysiąc lat.

Dzieło było kamieniem węgielnym kariery Lewisa jako mediewisty i po dziś dzień pozostaje kanoniczną lekturą w anglojęzycznych studiach humanistycznych.`,
  },
  {
    title: "Out of the Silent Planet",
    publicationYear: 1938,
    description: `## Poza Milczącą Planetą

Pierwsza część **Trylogii Kosmicznej** (zwanej też Trylogią Ransom). Filolog Elwin Ransom zostaje porwany na Malacandę (Marsa) i odkrywa żywy, wielorasowy świat zamieszkały przez sorny, hrossy i pfifltriggi, pozostający w harmonii ze swym *eldil* — anielskim opiekunem.

Powieść jest odpowiedzią na ówczesne przestrzenne science-fiction, lecz fundamentalnie różni się od niego: kosmosem rządzą inteligentne duchy, a Ziemia jest „milczącą planetą" — odciętą od reszty Stworzenia wskutek buntu swojego eldila.`,
  },
  {
    title: "Rehabilitations and Other Essays",
    publicationYear: 1939,
    description: `## Rehabilitations and Other Essays

Zbiór esejów akademickich i krytycznych, w których Lewis broni pisarzy i gatunków niesłusznie pogardzanych przez współczesną krytykę — m.in. Shelleya, Williama Morrisa, poezji romantycznej i samego gatunku fantastyki.

Tytuł wskazuje na nadrzędny projekt: *rehabilitację* dzieł i autorów, których odrzucił modernistyczny snobizm. Eseje są manifestem tego, co Lewis nazwie później walką z „chronologicznym snobizmem".`,
  },
  {
    title: "The Problem of Pain",
    publicationYear: 1940,
    description: `## Problem Bólu

Pierwsza w pełni apologetyczna proza Lewisa, napisana na prośbę Ashleya Sampsona z serii *Christian Challenge*. Lewis analizuje pytanie: jeśli Bóg jest dobry i wszechmocny, skąd pochodzi cierpienie?

Argumentuje, że ból jest „megafonem Boga do ogłuszonego świata" — narzędziem przełamującym samowystarczalność człowieka. Choć niektóre odpowiedzi Lewis potem zakwestionuje w *A Grief Observed*, książka pozostaje klasykiem apologetyki.`,
  },
  {
    title: "The Screwtape Letters",
    publicationYear: 1942,
    description: `## Listy Starszego Diabła

Arcydzieło satyry teologicznej. Trzydzieści jeden listów starszego demona Screwtape'a do swojego bratanka Wormwooda, instruujących go, jak skutecznie prowadzić ku potępieniu przeciętnego angielskiego chrześcijanina.

Odwrócona perspektywa — demony rozmawiają o ludzkich słabościach z cynizmem zrozumiałym dopiero gdy się go przełoży na pozytyw — uczyniła z tej książki jedno z najostrzejszych narzędzi introspekcji moralnej XX wieku. Lewis przyznał, że pisanie jej było bolesne duchowo.`,
  },
  {
    title: "A Preface to Paradise Lost",
    publicationYear: 1942,
    description: `## Przedmowa do Raju Utraconego

Zapis wykładów Lewisa o epopei Miltona wygłoszonych w Oxfordzie, poszerzony o rozważania teoretyczne. Lewis broni Miltona przed krytyką T.S. Eliota i F.R. Leavisa, analizuje strukturę epiki jako gatunku oraz omawia teologiczne tło *Raju Utraconego*.

Dzieło jest jednocześnie kluczem do zrozumienia własnej wyobraźni Lewisa — jego koncepcji hierarchii, posłuszeństwa i Upadku w późniejszej twórczości.`,
  },
  {
    title: "Perelandra",
    publicationYear: 1943,
    description: `## Perelandra

Druga część Trylogii Kosmicznej. Ransom zostaje przetransportowany na Wenus — Perelandra — planetę pokrytą unoszącymi się wyspami z roślinnością. Musi powstrzymać demonicznie opętanego Westa przed skłonieniem Zielonej Damy do ponowienia Upadku człowieka.

Powieść jest teologiczną medytacją o naturze kuszenia, posłuszeństwa i niewinności. Sceny dysput między Ransomem a Westem należą do najgęstszych intelektualnie w całym dorobku Lewisa.`,
  },
  {
    title: "The Abolition of Man",
    publicationYear: 1943,
    description: `## Zniesienie Człowieczeństwa

Jedno z najważniejszych dzieł filozoficznych Lewisa — trzy wykłady o edukacji, wartościach i naturze człowieczeństwa. Lewis analizuje podręcznik szkolny, w którym autorzy nieświadomie propagują subiektywizm etyczny, i wyciąga konsekwencje: jeśli wartości są tylko uczuciami, eliminujemy *Tao* — wspólne wszystkim kulturom prawo moralne — i kończymy z „ludźmi bez piersi", niezdolnymi do cnoty.

Finałowy esej o możliwości stworzenia „Człowieka Warunkowanego" jest proroczy w świetle XX-wiecznego totalitaryzmu.`,
  },
  {
    title: "That Hideous Strength",
    publicationYear: 1945,
    description: `## Ta Wstrętna Moc

Trzecia i ostatnia część Trylogii Kosmicznej — najbardziej rozbudowana i kontrowersyjna. Akcja rozgrywa się w Anglii: technokratyczna organizacja N.I.C.E. usiłuje przeprowadzić totalną transformację cywilizacji, manipulując rządem i opinią publiczną. Ransom przewodzi małej grupie oporu.

Powieść łączy elementy dystopii, arthuriańskiej legendy (Merlin zostaje wskrzeszony) i chrześcijańskiej kosmologii. Jest jednocześnie krytyką scientyzmu, biurokracji i nowoczesnej koncepcji postępu.`,
  },
  {
    title: "The Great Divorce",
    publicationYear: 1945,
    description: `## Wielki Rozwód

Teologiczna wizja senna: narrator wsiada do autobusu, który wyjeżdża z Piekła i przybywa na obrzeża Nieba. Duchy z autobusu spotykają „Jasne Osoby" z Nieba, które próbują je nakłonić do pozostania. Niemal wszystkie odmawiają.

Lewis pokazuje, że Piekło jest stanem wybieranym — duchem zamkniętym w sobie. Każda z rozmów jest studium innego rodzaju samooszukiwania i pychy. Książka jest odpowiedzią na Blake'owskie „Małżeństwo Nieba i Piekła".`,
  },
  {
    title: "Miracles",
    publicationYear: 1947,
    description: `## Cuda

Filozoficzna obrona możliwości cudów. Lewis argumentuje, że naturalizm — pogląd, że rzeczywistość wyczerpuje się w procesach naturalnych — jest samoobalający: jeśli umysł jest jedynie produktem ślepych sił, nie może być wiarygodnym narzędziem poznania.

Główna część książki analizuje Wcielenie jako „wielki cud", z którego wszystkie pozostałe wynikają logicznie. Po słynnej dyskusji z Elizabeth Anscombe Lewis zrewidował rozdział o naturalistycznym argumencie, wzmacniając go.`,
  },
  {
    title: "The Lion, the Witch and the Wardrobe",
    publicationYear: 1950,
    description: `## Lew, Czarownica i Stara Szafa

Pierwsza opublikowana (choć nie pierwsza chronologicznie w narracji wewnętrznej) część **Kronik Narnii**. Czworo rodzeństwa Pevensie — Peter, Susan, Edmund i Lucy — odkrywa przez szafę magiczny świat Narnii, rządzonej przez Białą Czarownicę utrzymującą wieczną zimę bez Bożego Narodzenia.

Aslan — wielki Lew, stwórca Narnii — oddaje życie za Edmunda i powraca z martwych. Alegoria Ofiary i Zmartwychwstania jest tu najbardziej przejrzysta z całego cyklu. Książka inauguruje jeden z najpoczytniejszych cyklów fantastycznych w historii literatury anglojęzycznej.`,
  },
  {
    title: "Prince Caspian",
    publicationYear: 1951,
    description: `## Książę Kaspian

Druga część Kronik Narnii. Rodzeństwo Pevensie zostaje wezwane z powrotem do Narnii — tym razem tysiąc trzysta lat po swojej pierwszej wizycie. Dawna Narnia jest podbita przez Telmarinów, a tytułowy książę Kaspian walczy o przywrócenie starych praw.

Historia analizuje temat wierności temu, co prawdziwe, nawet gdy tradycja ulega zatarciu i deformacji. Lewis polemizuje z tendencją do rozmywania dziedzictwa w imię pragmatyki.`,
  },
  {
    title: "Mere Christianity",
    publicationYear: 1952,
    description: `## Chrześcijaństwo po Prostu

Uznawana za jedno z najważniejszych dzieł apologetycznych XX wieku, rozbudowana wersja wykładów radiowych BBC z lat 1942–1944. Lewis argumentuje za istnieniem Prawa Moralnego, jego Dawcy, bóstwa Chrystusa i praktyki chrześcijaństwa.

Tytuł (za Richardem Baxter'em) wskazuje na cel: przedstawić tylko ten rdzeń wiary, który łączy wszystkich chrześcijan, bez angażowania się w denominacyjne spory. Książka przyczyniła się do nawrócenia wielu znanych intelektualistów, m.in. Charlesa Colsona i Francisa Collinsa.`,
  },
  {
    title: "The Voyage of the Dawn Treader",
    publicationYear: 1952,
    description: `## Podróż Wędrowca do Świtu

Trzecia część Kronik Narnii. Edmund i Lucy (wraz z kuznem Eustacym Scrubb'em) dołączają do króla Kaspiana na statku *Wędrowiec do Świtu*, płynącym ku wschodniemu kraniecowi świata. Każda wyspa przynosi nową próbę i przemianę.

Opowieść jest medytacją o *metanoi* — przemianie serca. Szczególnie wymowna jest historia Eustacego, zamienionego w smoka własną chciwością i uwolnionego przez Aslana z łusek jednym wielkim szarpnięciem pazurów.`,
  },
  {
    title: "The Silver Chair",
    publicationYear: 1953,
    description: `## Srebrne Krzesło

Czwarta część Kronik Narnii. Eustacy Scrubb i Jill Pole zostają posłani przez Aslana z misją odnalezienia zaginionego księcia Rilianka. Prowadzeni przez cztery Znaki, trafiają do podziemnego królestwa Czarownicy z Zielonej Krainy.

Kluczowa scena filozoficzna: Czarownica usiłuje przekonać bohaterów, że Narnia i Aslan są tylko projekcją podziemnego świata. Puddleglum i Eustacy odmówią — nawet gdyby tak było, świat przez nich wyobrażony jest lepszy niż realny. Jest to jeden z najbardziej zwartych argumentów za wartością wiary u Lewisa.`,
  },
  {
    title: "The Horse and His Boy",
    publicationYear: 1954,
    description: `## Koń i Jego Chłopiec

Piąta część Kronik Narnii (rozgrywająca się w czasie wydarzeń *Lwa, Czarownicy i Starej Szafy*). Shasta — chłopiec z południowego Calormen — ucieka na Północ razem z koniem Bree, który jest Mówiącym Koniem z Narnii.

Powieść eksploruje tematy tożsamości, przeznaczenia i Bożej Opatrzności — wyjawiając stopniowo, że Aslan od początku prowadził bohaterów przez każdą pozornie przypadkową przeszkodę.`,
  },
  {
    title: "English Literature in the Sixteenth Century",
    publicationYear: 1954,
    description: `## English Literature in the Sixteenth Century, Excluding Drama

Tom III *Oxford History of English Literature* — monumentalne opracowanie literatury angielskiej od ok. 1485 do 1603, wyłączając dramat. Lewis omawia poezję i prozę od wczesnych humanistów po Spensera i Sydneya, prezentując własną periodyzację odmienną od powszechnie przyjętej.

Dzieło jest jednocześnie syntezą naukową i wyrazem osobistego gustu: Lewis broni wartości poezji „złotej" i złożonego humanizmu contra protestantyzmu, podkreślając ciągłość ze średniowieczem tam, gdzie inni widzą zerwanie.`,
  },
  {
    title: "The Magician's Nephew",
    publicationYear: 1955,
    description: `## Siostrzeniec Czarodzieja

Szósta część Kronik Narnii (pierwsza chronologicznie w narracji wewnętrznej). Digory i Polly trafiają magicznymi pierścieniami do świata Charn — martwego świata pochłoniętego przez jego ostatnią królową Jadis — a potem do pierwotnej ciemności, w której Aslan śpiewem stwarza Narnię.

Stworzenie świata przez Pieśń Aslana należy do najpiękniejszych scen w całym dorobku Lewisa. Obecność Jadis i jabłka ogrodu wyraźnie nawiązuje do biblijnych narracji o Raju.`,
  },
  {
    title: "Surprised by Joy",
    publicationYear: 1955,
    description: `## Zaskoczony Radością

Autobiografia duchowa — opis drogi Lewisa od dziecięcego ateizmu przez różne etapy poszukiwań do nawrócenia na chrześcijaństwo w 1931 roku. Centralnym pojęciem jest *Radość* (Joy) — przeszywająca tęsknota za czymś transcendentnym, którą Lewis odczuwał przez całe życie.

Lewis opisuje kolejno: pierwszą Radość z nordyckiej mitologii, podróż przez Anglię wyobraźni, Wielką Wojnę Idei z Barfieldem, nocny przejazd taksówką do Whipsnade Zoo w momencie nawrócenia. Jest to jeden z najbardziej intelektualnie uczciwy zapis konwersji w literaturze angielskiej.`,
  },
  {
    title: "The Last Battle",
    publicationYear: 1956,
    description: `## Ostatnia Bitwa

Siódma i ostatnia część Kronik Narnii, za którą Lewis otrzymał Nagrodę Carnegie. Fałszywy Aslan — małpa Shift używa osła Puzzle'a — prowadzi Narnię ku zniszczeniu. Tirian, ostatni król Narnii, musi walczyć o prawdę w świecie, gdzie manipulacja i kłamstwo triumfują.

Końcowe rozdziały — Sąd nad Narnią, odrzucenie starego świata i wejście do Prawdziwej Narnii — są jednym z najbardziej poruszających opisów Nieba w literaturze chrześcijańskiej. „Dalej w górę i dalej w głąb!" — wołanie, które streszcza platońską metafizykę Lewisa.`,
  },
  {
    title: "Till We Have Faces",
    publicationYear: 1956,
    description: `## Aż Mamy Twarze

Jedyna powieść Lewisa dla dorosłych, uważana przez wielu za jego arcydzieło prozatorskie. Retelling mitu o Psyche i Erosie przez pryzmat narracji jej siostry Orual — królowej Glome, która oskarża bogów o niesprawiedliwość.

Dzieło jest wielowarstwowe: analizuje naturę zazdrości, różne formy miłości (Orual kocha Psyche miłością duszącą), mechanizm oskarżenia Boga i ostateczne odkrycie własnej twarzy. Lewis sam uważał tę książkę za swoje najdojrzalsze dzieło.`,
  },
  {
    title: "Reflections on the Psalms",
    publicationYear: 1958,
    description: `## Refleksje nad Psalmami

Medytacje laika nad Psałterzem — Lewis podkreśla, że nie jest biblistą i pisze jako czytelnik dzielący się własnymi trudnościami. Omawia m.in. problematykę psalmów przeklęcia, pochwałę prawa Bożego i poetykę paralelizmu.

Szczególnie ważny jest rozdział o *drugim znaczeniu* — Lewis stara się pokazać, jak żydowskie teksty mogły być prorocze bez świadomości ich autorów, co rzuca światło na jego ogólną filozofię hermeneutyczną.`,
  },
  {
    title: "The Four Loves",
    publicationYear: 1960,
    description: `## Cztery Miłości

Analiza czterech form miłości znanych Grekom: *storge* (przywiązanie), *philia* (przyjaźń), *eros* (miłość romantyczna) i *agape* (miłość Boża). Lewis bada każdą z nich, ukazując ich piękno i niebezpieczeństwa, gdy stają się samowystarczalne.

Szczególnie ceniona jest część o przyjaźni — Lewis opisuje ją jako miłość, która nie widzi siebie jako miłości, bo nie jest oślepiona instynktem. Esej o *eros* jest apologetyką romantyczną i teologią małżeństwa.`,
  },
  {
    title: "An Experiment in Criticism",
    publicationYear: 1961,
    description: `## Eksperyment w Krytyce

Wywrotowa propozycja metodologiczna: zamiast oceniać dzieło i dzielić je na „dobre" i „złe", Lewis proponuje oceniać *czytelników* i ich sposób lektury. „Dobra literatura" to ta, która umożliwia odbiór „dobrego czytelnika".

Lewis opisuje dwa typy lektury: *utilizerzy* (czytają dla fabuły, porzucają po przeczytaniu) i *prawdziwi czytelnicy* (wielokrotnie wracają, dają się pochłonąć, otrzymują nowe życie). Esej jest zarazem obroną fantastyki i literatury popularnej przed snobizmem krytycznym.`,
  },
  {
    title: "A Grief Observed",
    publicationYear: 1961,
    description: `## Smutek

Dziennik żałoby prowadzony przez Lewisa po śmierci żony Joy Davidman w 1960 roku. Początkowo opublikowany pod pseudonimem N.W. Clerk. Lewis notuje niemal z brutalną szczerością: gniew na Boga, uczucie odciętych drzwi, doświadczenie pamięci jako żywego bólu.

Stopniowo jednak dziennik przesuwa się — nie ku pogodzonemu spokojowi, lecz ku oczyszczonemu, twardszemu rozumieniu Boga i miłości. Jest to jedno z najważniejszych świadectw wiary pośród cierpienia w literaturze XX wieku, tworząc ironiczny dialog z *Problemem Bólu*.`,
  },
  {
    title: "Letters to Malcolm",
    publicationYear: 1964,
    description: `## Listy do Malcolma, głównie o modlitwie

Ostatnia ukończona przez Lewisa książka, opublikowana pośmiertnie dwa miesiące po jego śmierci. Fikcyjna korespondencja z przyjacielem Malcolmem, będąca pretekstem do rozważań o modlitwie prywatnej, liturgii i obecności Boga.

Lewis broni modlitwy jako realnego kontaktu, analizuje kłopoty z liturgiczną nowością, omawia problemy wstawiennictwa i przebóstwienia. Książka jest ostatnim jego teologicznym testamentem — cieplejszym i bardziej pokornym niż wcześniejsze apologetyczne prace.`,
  },
  {
    title: "The Discarded Image",
    publicationYear: 1964,
    description: `## Odrzucony Obraz

Zapis wykładów Lewisa o średniowiecznym i renesansowym modelu Wszechświata — wielkiego hierarchicznego kosmosu z nieruchomą Ziemią w centrum, otoczoną coraz to wyższymi sferami planet, zamkniętą sferą gwiazd stałych i Empireum.

Lewis argumentuje, że model ten nie był pomyłką naukową, lecz spójnym estetyczno-metafizycznym obrazem rzeczywistości, który przez ponad tysiąc lat kształtował europejską wyobraźnię. Zrozumienie go jest kluczem do czytania Dantego, Chaucera, Spensera i Miltona.`,
  },
];

async function seedPublicationsIfEmpty(strapi: Core.Strapi) {
  const count = await strapi.db.query("api::publication.publication").count({});
  if (count > 0) return;

  strapi.log.info("🌱 Sianie danych publikacji C.S. Lewisa…");

  for (const pub of PUBLICATIONS_SEED) {
    const doc = await strapi
      .documents("api::publication.publication")
      .create({ data: pub as never });
    await publishDoc(strapi, "api::publication.publication", doc.documentId);
  }

  strapi.log.info("✅ Seedowanie publikacji zakończone.");
}
