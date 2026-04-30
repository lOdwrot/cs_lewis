import type { Core } from '@strapi/strapi'

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await setPublicPermissions(strapi)
    await seedIfEmpty(strapi)
  },
}

async function setPublicPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } })

  if (!publicRole) return

  const contentTypes = ['api::gate.gate', 'api::journey.journey', 'api::step.step', 'api::book.book']
  const actions = ['find', 'findOne']

  for (const contentType of contentTypes) {
    for (const action of actions) {
      const uid = `${contentType}.${action}`
      const existing = await strapi
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action: uid, role: publicRole.id } })

      if (!existing) {
        await strapi.query('plugin::users-permissions.permission').create({
          data: { action: uid, role: publicRole.id, enabled: true },
        })
      } else if (!existing.enabled) {
        await strapi.query('plugin::users-permissions.permission').update({
          where: { id: existing.id },
          data: { enabled: true },
        })
      }
    }
  }
  strapi.log.info('✅ Public permissions set for all content types.')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function publishDoc(strapi: Core.Strapi, uid: string, documentId: string) {
  await (strapi.documents(uid as never) as unknown as any).publish({ documentId })
}

async function seedIfEmpty(strapi: Core.Strapi) {
  // Use db.query so we count both drafts and published — avoids re-seeding on every restart
  const count = await strapi.db.query('api::gate.gate').count({})
  if (count > 0) return

  strapi.log.info('🌱 Sianie przykładowych danych C.S. Lewisa…')

  // ── Books ────────────────────────────────────────────────────────────────
  const books = [
    {
      title: 'Kroniki Narnii',
      description:
        'Fundamentalna seria siedmiu powieści fantasy, przenosząca czytelników do krainy rozmawiających zwierząt i epickich zmagań dobra ze złem.',
      redirectUrl: 'https://www.amazon.com/s?k=chronicles+of+narnia+cs+lewis',
    },
    {
      title: 'Chrześcijaństwo po prostu',
      description:
        'Wywodzące się z audycji radiowych BBC, to klasyczne dzieło bada wspólny grunt, na którym stoi każdy wyznający wiarę chrześcijańską.',
      redirectUrl: 'https://www.amazon.com/s?k=mere+christianity+cs+lewis',
    },
    {
      title: 'Listy Starszego Diabła',
      description:
        'Satyryczne arcydzieło opowiedziane przez listy starszego demona do swojego bratanka, stanowiące przenikliwe spojrzenie na ludzką naturę.',
      redirectUrl: 'https://www.amazon.com/s?k=screwtape+letters+cs+lewis',
    },
    {
      title: 'Wielki Rozwód',
      description:
        'Teologiczna wizja senna o podróży autobusem z Piekła do Nieba, badająca wybory prowadzące do ostatecznego oddzielenia lub zbawienia.',
      redirectUrl: 'https://www.amazon.com/s?k=great+divorce+cs+lewis',
    },
    {
      title: 'Cuda',
      description:
        'Filozoficzna obrona możliwości Bożej interwencji, argumentująca, że świat przyrody nie jest zamkniętym systemem.',
      redirectUrl: 'https://www.amazon.com/s?k=miracles+cs+lewis',
    },
  ]

  for (const book of books) {
    const doc = await strapi.documents('api::book.book').create({ data: book as never })
    await publishDoc(strapi, 'api::book.book', doc.documentId)
  }

  // ── Steps ─────────────────────────────────────────────────────────────────
  const stepsData = [
    // Brama Wyobraźnia
    {
      title: 'Narodziny Mitu',
      description: 'Odkrycie przez Lewisa siły mitologii jako drogi do prawdy.',
      type: 'text' as const,
      tags: ['mitologia', 'wyobraźnia'],
      content: [
        {
          __component: 'step.text-content',
          markdown: `## Wizja Mitopoetyczna

Dla C.S. Lewisa mit nie był zwykłą fikcją — był *prawdziwym, choć rozproszonym blaskiem Bożej prawdy*, jak opisał to w słynnym liście do Arthura Greevesa.

> „Mit to góra, z której wypływają wszystkie różne strumienie, które po wielu wędrówkach stają się ostatecznie rzeką Prawdy."

Młody Lewis po raz pierwszy poczuł fascynację tym, co nazywał **Północnością** — przeszywającą, bolesną tęsknotą rozbudzoną przez mitologię nordycką i wagneriańskie tematy. Ta *Sehnsucht* (tęsknota) miała stać się kamieniem węgielnym jego apologetyki.

### Inklingowie i Pod-Tworzenie

W Oxfordzie Lewis dołączył do Tolkiena i Barfielda, wierząc, że człowiek — stworzony na obraz Boży — sam jest **pod-twórcą** i że pisanie mitów jest aktem Bożym, uczestnictwem w trwającym dziele stworzenia.

Ten wgląd przemienił ateizm Lewisa. Jeśli mit wskazuje ku prawdzie, a Ewangelia sama w sobie brzmi jak największy ze wszystkich mitów — z tą różnicą, że *naprawdę się wydarzyła* — to być może mitologia przygotowywała go przez cały czas.`,
          videoUrl: 'https://www.youtube.com/watch?v=I0e4AiXMmMw',
        },
      ],
    },
    {
      title: 'Sehnsucht: Ból Radości',
      description: 'Esej dźwiękowy o przeszywającej tęsknocie, którą Lewis uznał za wskazówkę ku boskości.',
      type: 'podcast' as const,
      tags: ['tęsknota', 'radość'],
      content: [
        {
          __component: 'step.podcast-content',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          transcript: `W „Zaskoczony radością" Lewis opisuje doświadczenie, które ukształtuje całe jego intelektualne i duchowe życie — to, co nazywał *Radością*, z wielkiej litery.

Nie było to szczęście ani przyjemność. Była to nagła, przeszywająca tęsknota — jak słyszenie melodii z odległego kraju, którego nigdy nie odwiedziłeś. Przychodziła niespodziewanie, wywoływana wierszem, krajobrazem, zapachem jesiennych liści.

> „Trudno znaleźć słowa dość mocne na to odczucie, które mnie ogarnęło… Było to pragnienie czegoś, co nigdy nie pojawiło się w naszym doświadczeniu."

Lewis przez dziesięciolecia próbował zidentyfikować przedmiot tej tęsknoty. Szukał go w naturze, miłości, książkach. Za każdym razem, gdy tęsknota pojawiała się i go ogarniała — a potem mijała — pozostawiało go pragnącym nie samej rzeczy, lecz czegoś *poza* tą rzeczą.

Rozwiązanie przyszło dopiero wtedy, gdy uświadomił sobie, że to pragnienie nie jest defektem wymagającym leczenia, lecz *drogowskazem* — wskazującym ku ojczyźnie, której jego rozum nie śmiał jeszcze nazwać.`,
        },
      ],
    },
    {
      title: 'Quiz: Kroniki Narnii',
      description: 'Sprawdź swoją wiedzę o Narnii i wyobraźni C.S. Lewisa.',
      type: 'quiz' as const,
      tags: ['narnia', 'quiz'],
      content: [
        {
          __component: 'step.quiz-content',
          questions: [
            {
              question: 'Jak nazywa się magiczny świat stworzony przez Lewisa w jego słynnej serii?',
              options: ['Śródziemie', 'Narnia', 'Prydain', 'Earthsea'],
              correctIndex: 1,
              explanation: 'Narnia to magiczny świat stworzony przez Lewisa w Kronikach Narnii, który po raz pierwszy pojawia się w „Lwie, Czarownicy i starej szafie" (1950).',
            },
            {
              question: 'Jak Lewis nazywa przeszywającą, gorzko-słodką tęsknotę za czymś poza zwykłym doświadczeniem?',
              options: ['Agape', 'Sehnsucht', 'Logos', 'Mythos'],
              correctIndex: 1,
              explanation: 'Lewis zapożyczył niemieckie słowo *Sehnsucht* (tęsknota/pragnienie), by opisać niewytłumaczalny ból, który uznawał za wskazówkę ku boskości.',
            },
            {
              question: 'Który lew reprezentuje postać Chrystusa w Narnii?',
              options: ['Puzzle', 'Reepicheep', 'Aslan', 'Shift'],
              correctIndex: 2,
              explanation: 'Aslan Lew jest alegoryczną postacią Chrystusa Lewisa — ofiarowaną i zmartwychwstałą w „Lwie, Czarownicy i starej szafie".',
            },
            {
              question: 'Lewis ukuł termin „mitopoeia" — co oznacza?',
              options: ['Nauka o dawnych mitach', 'Tworzenie mitów', 'Krytyka mitologii', 'Tłumaczenie mitów'],
              correctIndex: 1,
              explanation: 'Mitopoeia (tworzenie mitów) opisuje akt tworzenia mitologii. Tolkien użył go w swoim wierszu, argumentując, że ludzie jako pod-twórcy uczestniczą w Bożym dziele stworzenia.',
            },
          ],
        },
      ],
    },
    // Brama Rozum
    {
      title: 'Wielka Wojna Idei',
      description: 'Filozoficzny pojedynek Lewisa z Owenem Barfieldem, który rozbił jego młodzieńczy racjonalizm.',
      type: 'text' as const,
      tags: ['filozofia', 'rozum'],
      content: [
        {
          __component: 'step.text-content',
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
      title: 'Rozmowy Oksfordzkie',
      description: 'Odtworzone rozmowy z wtorkowych porannych spotkań Inklingów w Eagle and Child.',
      type: 'podcast' as const,
      tags: ['inklingowie', 'oxford'],
      content: [
        {
          __component: 'step.podcast-content',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
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
      title: 'Quiz: Chrześcijaństwo po prostu',
      description: 'Pytania o przełomowe dzieło apologetyki chrześcijańskiej Lewisa.',
      type: 'quiz' as const,
      tags: ['apologetyka', 'quiz'],
      content: [
        {
          __component: 'step.quiz-content',
          questions: [
            {
              question: 'W „Wadze chwały" Lewis argumentuje, że nasze pragnienia nie są zbyt silne, lecz zbyt:',
              options: ['Intelektualne', 'Słabe', 'Wyrafinowane', 'Złożone'],
              correctIndex: 1,
              explanation: 'Lewis pisze: „Jesteśmy połowicznymi stworzeniami… Zbyt łatwo nas zadowolić." Problem nie leży w naszych pragnieniach — są zbyt małe, nie za duże.',
            },
            {
              question: 'Jaki „trylemaat" Lewis przedstawia odnośnie Jezusa w Chrześcijaństwie po prostu?',
              options: [
                'Nauczyciel, Prorok lub Mesjasz',
                'Pan, Kłamca lub Szaleniec',
                'Człowiek, Mit lub Bóg',
                'Filozof, Reformator lub Rabin',
              ],
              correctIndex: 1,
              explanation: 'Słynny trylemaat Lewisa: Jezus twierdził, że jest Bogiem. Albo kłamał, albo był szaleńcem, albo mówił prawdę. Nie może być jedynie „dobrym nauczycielem moralności".',
            },
            {
              question: 'Z jakiego medium pochodziły rozmowy, które stały się książką Chrześcijaństwo po prostu?',
              options: ['Telewizji', 'Radia', 'Felietonów prasowych', 'Wykładów uniwersyteckich'],
              correctIndex: 1,
              explanation: 'Lewis wygłaszał te rozmowy w BBC Radio podczas II wojny światowej (1941–1944). Zostały zebrane i opublikowane jako Chrześcijaństwo po prostu w 1952 roku.',
            },
            {
              question: 'Lewis opisuje moralność jako mającą trzy części. Która z poniższych NIE jest jedną z nich?',
              options: [
                'Sprawiedliwość między jednostkami',
                'Harmonizowanie wewnętrznego życia jednostki',
                'Cel życia ludzkiego jako całości',
                'Doktryna polityczna państwa',
              ],
              correctIndex: 3,
              explanation: 'Lewis wymienia trzy części moralności: relacje między jednostkami, wewnętrzne życie jednostki i ogólny cel egzystencji ludzkiej — nie doktrynę polityczną.',
            },
          ],
        },
      ],
    },
    // Brama Wiara
    {
      title: 'Nocne Nawrócenie',
      description: 'Słynny spacer wzdłuż Addison\'s Walk, podczas którego Tolkien i Dyson przekonali Lewisa, że mit może być prawdziwy.',
      type: 'text' as const,
      tags: ['nawrócenie', 'wiara'],
      content: [
        {
          __component: 'step.text-content',
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
      title: 'Problem Bólu',
      description: 'Pastoralne i filozoficzne zaangażowanie Lewisa w temat cierpienia.',
      type: 'podcast' as const,
      tags: ['cierpienie', 'wiara'],
      content: [
        {
          __component: 'step.podcast-content',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
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
      title: 'Quiz: Wiara i Rozum',
      description: 'Sprawdź swoje rozumienie integracji wiary i rozumu przez Lewisa.',
      type: 'quiz' as const,
      tags: ['wiara', 'quiz'],
      content: [
        {
          __component: 'step.quiz-content',
          questions: [
            {
              question: 'Jaką książkę Lewis napisał po śmierci żony Joy, przetwarzając swój smutek?',
              options: ['Problem Bólu', 'Rozważania o żalu', 'Dopóki mamy twarze', 'Zaskoczony radością'],
              correctIndex: 1,
              explanation: 'Lewis napisał *Rozważania o żalu* pod pseudonimem N.W. Clerk po tym, jak jego żona Joy Davidman umarła na raka w 1960 roku. Jest to jego najbardziej osobiste dzieło.',
            },
            {
              question: 'Lewis opisuje Prawo Moralne jako dowód na co?',
              options: ['Ludzką ewolucję', 'Uwarunkowania kulturowe', 'Prawodawczy Umysł stojący za wszechświatem', 'Demokratyczny konsensus'],
              correctIndex: 2,
              explanation: 'W Chrześcijaństwie po prostu Lewis argumentuje, że powszechne Prawo Moralne — poczucie „powinności" wspólne wszystkim ludziom — wskazuje na Umysł, który je ustanowił, podobnie jak przepisy drogowe wskazują na ustawodawcę.',
            },
            {
              question: 'Co Lewis rozumie przez „Wiarę" jako cnotę w Chrześcijaństwie po prostu?',
              options: [
                'Wierzenie bez żadnych dowodów',
                'Trzymanie się tego, co rozum raz przyjął, mimo zmieniających się nastrojów',
                'Emocjonalne poczucie bliskości z Bogiem',
                'Przyjęcie autorytetu Kościoła',
              ],
              correctIndex: 1,
              explanation: 'Lewis definiuje wiarę jako „sztukę trzymania się tego, co rozum raz przyjął, mimo zmieniających się nastrojów". To dyscyplina, nie uczucie.',
            },
          ],
        },
      ],
    },
  ]

  const stepDocs: Record<string, string> = {}

  for (const stepData of stepsData) {
    const { content, ...rest } = stepData
    const doc = await strapi.documents('api::step.step').create({
      data: { ...rest, content } as never,
    })
    await publishDoc(strapi, 'api::step.step', doc.documentId)
    stepDocs[stepData.title] = doc.documentId
  }

  // ── Journeys ──────────────────────────────────────────────────────────────
  const journeysData = [
    {
      title: 'Wizja Mitopoetyczna',
      slug: 'wizja-mitopoetyczna',
      description: 'Podążaj śladami odkrycia przez Lewisa mitu jako naczynia dla prawdy — od nordyckich sag po Narnię.',
      stepTitles: ['Narodziny Mitu', 'Sehnsucht: Ból Radości', 'Quiz: Kroniki Narnii'],
    },
    {
      title: 'Droga Sceptyka',
      slug: 'droga-sceptyka',
      description: 'Głęboka analiza Wielkiej Wojny Idei między Lewisem a Owenem Barfieldem na temat logiki i wyobraźni.',
      stepTitles: ['Wielka Wojna Idei', 'Rozmowy Oksfordzkie', 'Quiz: Chrześcijaństwo po prostu'],
    },
    {
      title: 'Droga do Wiary',
      slug: 'droga-do-wiary',
      description: 'Śledząc ostatnie kroki intelektualnego i duchowego nawrócenia Lewisa — od oksfordzkich ścieżek do wiary chrześcijańskiej.',
      stepTitles: ['Nocne Nawrócenie', 'Problem Bólu', 'Quiz: Wiara i Rozum'],
    },
  ]

  const journeyDocs: Record<string, string> = {}

  for (const jData of journeysData) {
    const stepIds = jData.stepTitles
      .map((t) => stepDocs[t])
      .filter(Boolean)
      .map((documentId) => ({ documentId }))

    const doc = await strapi.documents('api::journey.journey').create({
      data: {
        title: jData.title,
        slug: jData.slug,
        description: jData.description,
        steps: stepIds,
      } as never,
    })
    await publishDoc(strapi, 'api::journey.journey', doc.documentId)
    journeyDocs[jData.slug] = doc.documentId
  }

  // ── Gates ─────────────────────────────────────────────────────────────────
  const gatesData = [
    {
      title: 'Wyobraźnia',
      slug: 'wyobraznia',
      description: 'Podróżuj przez mit i fantazję, odkrywając prawdy, których logika nie jest w stanie dosięgnąć.',
      journeySlugs: ['wizja-mitopoetyczna'],
    },
    {
      title: 'Rozum',
      slug: 'rozum',
      description: 'Angażuj intelekt z klarownością i precyzją poprzez rygorystyczne badanie prawdy.',
      journeySlugs: ['droga-sceptyka'],
    },
    {
      title: 'Wiara',
      slug: 'wiara',
      description: 'Odkryj transcendentne fundamenty i cichą piękność wiecznej perspektywy.',
      journeySlugs: ['droga-do-wiary'],
    },
  ]

  for (const gData of gatesData) {
    const journeyIds = gData.journeySlugs
      .map((s) => journeyDocs[s])
      .filter(Boolean)
      .map((documentId) => ({ documentId }))

    const doc = await strapi.documents('api::gate.gate').create({
      data: {
        title: gData.title,
        slug: gData.slug,
        description: gData.description,
        journeys: journeyIds,
      } as never,
    })
    await publishDoc(strapi, 'api::gate.gate', doc.documentId)
  }

  strapi.log.info('✅ Seedowanie zakończone — 3 bramy, 3 podróże, 9 kroków, 5 książek utworzonych.')
}
