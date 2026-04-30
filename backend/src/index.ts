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

  strapi.log.info('🌱 Seeding sample C.S. Lewis data…')

  // ── Books ────────────────────────────────────────────────────────────────
  const books = [
    {
      title: 'The Chronicles of Narnia',
      description:
        'A foundational series of seven high fantasy novels that transport readers to a land of talking beasts and epic battles between good and evil.',
      redirectUrl: 'https://www.amazon.com/s?k=chronicles+of+narnia+cs+lewis',
    },
    {
      title: 'Mere Christianity',
      description:
        'Adapted from a series of BBC radio talks, this classic work explores the common ground upon which all those of Christian faith stand.',
      redirectUrl: 'https://www.amazon.com/s?k=mere+christianity+cs+lewis',
    },
    {
      title: 'The Screwtape Letters',
      description:
        'A satirical masterpiece told through letters from a senior demon to his nephew, providing a sharp look at human nature.',
      redirectUrl: 'https://www.amazon.com/s?k=screwtape+letters+cs+lewis',
    },
    {
      title: 'The Great Divorce',
      description:
        'A theological dream vision about a bus ride from Hell to Heaven, examining the choices that lead to ultimate separation or salvation.',
      redirectUrl: 'https://www.amazon.com/s?k=great+divorce+cs+lewis',
    },
    {
      title: 'Miracles',
      description:
        'A philosophical defense of the possibility of divine intervention, arguing that the natural world is not a closed system.',
      redirectUrl: 'https://www.amazon.com/s?k=miracles+cs+lewis',
    },
  ]

  for (const book of books) {
    const doc = await strapi.documents('api::book.book').create({ data: book as never })
    await publishDoc(strapi, 'api::book.book', doc.documentId)
  }

  // ── Steps ─────────────────────────────────────────────────────────────────
  const stepsData = [
    // Imagination gate steps
    {
      title: 'The Birth of Myth',
      description: 'Exploring how Lewis discovered the power of mythology as a conduit for truth.',
      type: 'text' as const,
      tags: ['mythology', 'imagination'],
      content: [
        {
          __component: 'step.text-content',
          markdown: `## The Mythopoeic Vision

For C.S. Lewis, myth was not mere fiction — it was a *real though unfocused gleam of divine truth*, as he described it in his famous letter to Arthur Greeves.

> "Myth is the mountain whence all the different streams arise which become at last, after many wanderings, the river of Truth."

The young Lewis was first captivated by what he called **Northernness** — a stabbing, aching longing awakened by Norse mythology and Wagnerian themes. This *Sehnsucht* (longing) would become the cornerstone of his apologetic.

### The Inklings and Sub-Creation

At Oxford, Lewis joined with Tolkien and Barfield in believing that humanity, made in God's image, is itself a **sub-creator** — that writing myth is a divine act, a participation in God's ongoing creative work.

This insight transformed Lewis's atheism. If myth points toward truth, and if the Gospel itself reads like the greatest myth of all — except that it *actually happened* — then perhaps mythology had been preparing him all along.`,
          videoUrl: 'https://www.youtube.com/watch?v=I0e4AiXMmMw',
        },
      ],
    },
    {
      title: 'Sehnsucht: The Ache of Joy',
      description: 'An audio essay on the piercing longing that Lewis identified as a pointer toward the divine.',
      type: 'podcast' as const,
      tags: ['longing', 'joy'],
      content: [
        {
          __component: 'step.podcast-content',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          transcript: `In "Surprised by Joy," Lewis describes an experience that would shape his entire intellectual and spiritual life — what he called *Joy*, with a capital J.

It was not happiness, not pleasure. It was a sudden, sharp longing — like hearing a tune from a distant country you have never visited. It came unexpectedly, triggered by a line of poetry, a landscape, the smell of autumn leaves.

> "It is difficult to find words strong enough for the sensation which came over me… it was a desire for something that has never actually appeared in our experience."

Lewis spent decades trying to identify the object of this longing. He tried nature, romance, books. Each time the longing appeared, seized him — and then passed, leaving him wanting not the thing but something *beyond* the thing.

The resolution came only when he recognized that this ache was not a defect to be cured, but a *signpost* — pointing toward a homeland his rational mind had not yet dared to name.`,
        },
      ],
    },
    {
      title: 'The Chronicles Quiz',
      description: 'Test your knowledge of Narnia and the imagination of C.S. Lewis.',
      type: 'quiz' as const,
      tags: ['narnia', 'quiz'],
      content: [
        {
          __component: 'step.quiz-content',
          questions: [
            {
              question: 'What is the name of the wardrobe world Lewis created in his famous series?',
              options: ['Middle-earth', 'Narnia', 'Prydain', 'Earthsea'],
              correctIndex: 1,
              explanation: 'Narnia is the magical world Lewis created in The Chronicles of Narnia, first appearing in The Lion, the Witch and the Wardrobe (1950).',
            },
            {
              question: 'What does Lewis call the stabbing, bittersweet longing for something beyond ordinary experience?',
              options: ['Agape', 'Sehnsucht', 'Logos', 'Mythos'],
              correctIndex: 1,
              explanation: 'Lewis borrowed the German word *Sehnsucht* (yearning/longing) to describe the inexplicable ache he saw as a pointer toward the divine.',
            },
            {
              question: 'Which lion represents the Christ figure in Narnia?',
              options: ['Puzzle', 'Reepicheep', 'Aslan', 'Shift'],
              correctIndex: 2,
              explanation: 'Aslan the Lion is Lewis\'s allegorical Christ figure — sacrificed and resurrected in The Lion, the Witch and the Wardrobe.',
            },
            {
              question: 'Lewis coined the term "mythopoeia" — what does it mean?',
              options: ['The study of ancient myths', 'The making of myths', 'The critique of mythology', 'The translation of myths'],
              correctIndex: 1,
              explanation: 'Mythopoeia (myth-making) describes the act of creating mythology. Tolkien used it in his poem arguing that humans, as sub-creators, participate in divine creation.',
            },
          ],
        },
      ],
    },
    // Reason gate steps
    {
      title: 'The Great War of Ideas',
      description: 'Lewis\'s philosophical duel with Owen Barfield that shattered his youthful rationalism.',
      type: 'text' as const,
      tags: ['philosophy', 'reason'],
      content: [
        {
          __component: 'step.text-content',
          markdown: `## The Absolute Rationalist

When Lewis arrived at Oxford, he was a thoroughgoing materialist. Mind was an accident of matter. Beauty was subjective. Logic was a tool, not a guide to ultimate truth.

Then he met **Owen Barfield**.

> "He has a genius for debate… His arguments were not just good — they were irresistible."
> — C.S. Lewis on Barfield

### The Chronological Snob

Barfield introduced Lewis to what Lewis would later call the *Chronological Snob* — the uncritical assumption that what is newer is always better, that previous ages were simply mistaken.

Lewis began to notice he'd been treating ancient wisdom with contempt it didn't deserve. The Platonic tradition, the Medieval synthesis, the great chain of being — these were not naive precursors to modern science; they were profound attempts to see reality whole.

### The Argument from Reason

Most devastating was Barfield's challenge: if the mind is merely a product of non-rational natural processes, why trust it? If my beliefs are the result of atoms bouncing around rather than rational inference, the conclusion "there is no God" carries no more authority than a belch.

Lewis would later develop this into his own **Argument from Reason** in *Miracles* — perhaps the most devastating critique of strict naturalism ever formulated.`,
          videoUrl: null,
        },
      ],
    },
    {
      title: 'The Oxford Conversations',
      description: 'Recreated discussions from the Inklings\' Tuesday morning meetings at the Eagle and Child.',
      type: 'podcast' as const,
      tags: ['inklings', 'oxford'],
      content: [
        {
          __component: 'step.podcast-content',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          transcript: `The Eagle and Child pub on St Giles\' Street, Oxford. Tuesday mornings, 1930s–1950s.

Here, over pints of bitter and pipes of tobacco, some of the twentieth century\'s most imaginative minds gathered to read unfinished work aloud and debate everything from Norse mythology to the nature of consciousness.

**C.S. Lewis** would arrive with pages covered in his small, neat handwriting — chapters of what would become the Narnia Chronicles, or the latest instalment of his space trilogy.

**J.R.R. Tolkien** might bring pages from *The Lord of the Rings*, listening carefully to the group\'s reactions, occasionally defending a word-choice with scholarly ferocity.

**Charles Williams** — poet, novelist, mystical theologian — would offer observations so startling that the room would fall silent.

Lewis later said that Tolkien's friendship was "the most to my taste of all." It was Tolkien who, on a long walk along Addison\'s Walk, finally convinced Lewis that myth could be *true myth* — that the Gospel was the one myth that had entered history as fact.`,
        },
      ],
    },
    {
      title: 'Mere Christianity Quiz',
      description: 'Questions on Lewis\'s landmark work of Christian apologetics.',
      type: 'quiz' as const,
      tags: ['apologetics', 'quiz'],
      content: [
        {
          __component: 'step.quiz-content',
          questions: [
            {
              question: 'In "The Weight of Glory," Lewis argues that our desires are not too strong, but too:',
              options: ['Intellectual', 'Weak', 'Sophisticated', 'Complex'],
              correctIndex: 1,
              explanation: 'Lewis writes: "We are half-hearted creatures... We are far too easily pleased." Our desires are not the problem — they are too small, not too large.',
            },
            {
              question: 'What is the "Trilemma" Lewis presents regarding Jesus in Mere Christianity?',
              options: [
                'Teacher, Prophet, or Messiah',
                'Lord, Liar, or Lunatic',
                'Man, Myth, or God',
                'Philosopher, Reformer, or Rabbi'
              ],
              correctIndex: 1,
              explanation: 'Lewis\'s famous trilemma: Jesus claimed to be God. Either he was lying, deluded, or telling the truth. He cannot be merely "a good moral teacher."',
            },
            {
              question: 'From which medium were the talks that became Mere Christianity originally broadcast?',
              options: ['Television', 'Radio', 'Newspaper columns', 'University lectures'],
              correctIndex: 1,
              explanation: 'Lewis delivered the talks on BBC Radio during World War II (1941–1944). They were collected and published as Mere Christianity in 1952.',
            },
            {
              question: 'Lewis describes morality as having three parts. Which of these is NOT one of them?',
              options: [
                'Fairness between individuals',
                'Harmonizing an individual\'s inner life',
                'The purpose of human life as a whole',
                'Political doctrine of the state'
              ],
              correctIndex: 3,
              explanation: 'Lewis identifies three parts of morality: relations between individuals, the individual\'s inner life, and the general purpose of human existence — not political doctrine.',
            },
          ],
        },
      ],
    },
    // Faith gate steps
    {
      title: 'The Midnight Conversion',
      description: 'The famous walk along Addison\'s Walk where Tolkien and Dyson convinced Lewis that myth could be true.',
      type: 'text' as const,
      tags: ['conversion', 'faith'],
      content: [
        {
          __component: 'step.text-content',
          markdown: `## Addison's Walk, September 1931

It was past midnight. Lewis had been walking with J.R.R. Tolkien and Hugo Dyson for hours, the arguments washing over him like a tide.

The question: why could Lewis accept the dying-and-rising God motif as *true* in Norse or Greek myth, but not in the Gospels?

> "The story of Christ is simply a true myth: a myth working on us in the same way as the others, but with this tremendous difference that it really happened."

### The Logic of Myth Made Fact

Tolkien's argument was precise. When humans tell myths about gods who die and rise, they are expressing a deep truth embedded in them as image-bearers of God. This longing for redemption, death overcome, new life — it points toward something real.

The Gospels are the fulfillment of what all the myths were pointing toward. God, the author of myth, entered his own story.

Twelve days later, Lewis wrote to his friend Arthur Greeves:

> "I have just passed on from believing in God to definitely believing in Christ — in Christianity... My long night watches and wakings are over."`,
          videoUrl: null,
        },
      ],
    },
    {
      title: 'The Problem of Pain',
      description: 'Lewis\'s pastoral and philosophical engagement with suffering.',
      type: 'podcast' as const,
      tags: ['suffering', 'faith'],
      content: [
        {
          __component: 'step.podcast-content',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
          transcript: `In 1940, Lewis published *The Problem of Pain* — a lucid, almost clinical examination of why God permits suffering.

His core argument: pain is God's *megaphone*.

> "God whispers to us in our pleasures, speaks in our conscience, but shouts in our pains: it is his megaphone to rouse a deaf world."

Lewis argues that a world without suffering would be a world without moral growth, without courage, without compassion. A God who simply shielded us from all discomfort would be treating us like pets, not children.

But Lewis was not merely academic. In 1960, his wife Joy died of cancer. His response — *A Grief Observed* — shattered the tidy arguments of *The Problem of Pain*.

> "No one ever told me that grief felt so like fear."

The later Lewis understood something the earlier Lewis could only argue: that faith is not maintained by logic alone, but by the daily choice to trust a God who seems silent, even when the megaphone has gone quiet.`,
        },
      ],
    },
    {
      title: 'Faith and Reason Quiz',
      description: 'Test your understanding of Lewis\'s integration of faith and reason.',
      type: 'quiz' as const,
      tags: ['faith', 'quiz'],
      content: [
        {
          __component: 'step.quiz-content',
          questions: [
            {
              question: 'What book did Lewis write after his wife Joy died, processing his grief?',
              options: ['The Problem of Pain', 'A Grief Observed', 'Till We Have Faces', 'Surprised by Joy'],
              correctIndex: 1,
              explanation: 'Lewis wrote *A Grief Observed* under the pseudonym N.W. Clerk after his wife Joy Davidman died of cancer in 1960. It is his most raw and personal work.',
            },
            {
              question: 'Lewis describes the Moral Law as evidence for what?',
              options: ['Human evolution', 'Cultural conditioning', 'A lawgiving Mind behind the universe', 'Democratic consensus'],
              correctIndex: 2,
              explanation: 'In Mere Christianity, Lewis argues the universal Moral Law — the sense of "ought" all humans share — points to a Mind that made it, just as traffic laws point to a legislator.',
            },
            {
              question: 'What does Lewis mean by "Faith" as a virtue in Mere Christianity?',
              options: [
                'Believing without any evidence',
                'Holding on to what reason has accepted, despite changing moods',
                'Emotional feeling of closeness to God',
                'Accepting the authority of the Church'
              ],
              correctIndex: 1,
              explanation: 'Lewis defines faith as "the art of holding on to things your reason has once accepted, in spite of your changing moods." It is a discipline, not a feeling.',
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
      title: 'The Mythopoeic Vision',
      slug: 'the-mythopoeic-vision',
      description: 'Journey through Lewis\'s discovery of myth as a vessel for truth, from Norse sagas to Narnia.',
      stepTitles: ['The Birth of Myth', 'Sehnsucht: The Ache of Joy', 'The Chronicles Quiz'],
    },
    {
      title: 'The Sceptic\'s Journey',
      slug: 'the-sceptics-journey',
      description: 'A deep dive into the Great War of ideas between Lewis and Owen Barfield regarding logic and imagination.',
      stepTitles: ['The Great War of Ideas', 'The Oxford Conversations', 'Mere Christianity Quiz'],
    },
    {
      title: 'The Road to Faith',
      slug: 'the-road-to-faith',
      description: 'Tracing the final steps of Lewis\'s intellectual and spiritual conversion, from Oxford paths to Christian faith.',
      stepTitles: ['The Midnight Conversion', 'The Problem of Pain', 'Faith and Reason Quiz'],
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
      title: 'Imagination',
      slug: 'imagination',
      description: 'Journey through the mythic and the fantastic to uncover truths that logic cannot reach.',
      journeySlugs: ['the-mythopoeic-vision'],
    },
    {
      title: 'Reason',
      slug: 'reason',
      description: 'Engage the intellect with clarity and precision through the rigorous examination of truth.',
      journeySlugs: ['the-sceptics-journey'],
    },
    {
      title: 'Faith',
      slug: 'faith',
      description: 'Explore the transcendent foundations and the quiet beauty of the eternal perspective.',
      journeySlugs: ['the-road-to-faith'],
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

  strapi.log.info('✅ Seed complete — 3 gates, 3 journeys, 9 steps, 5 books created.')
}
