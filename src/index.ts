import {
  asyncScheduler,
  concatMap,
  delay,
  filter,
  Observable,
  observeOn,
  of,
  map
} from 'rxjs'

import { DateTime } from 'luxon'

import * as DataAnime from '../data/data.json'

interface NewEpisode {
  new_date: string
  name: string
  categories: string[]
}

interface Anime {
  name: string
  categories: string[]
}

//lista de categorias
const categories = [
  'Ação',
  'Aventura',
  'Comédia',
  'Drama',
  'Mistério',
  'Romance',
  'Sci-Fi',
  'Terror'
]

function subscribeFunction(value: unknown) {
  console.log(value)
}

function serialize(data: Anime[]): NewEpisode[] {
  const animes: NewEpisode[] = data.map(value => {
    return {
      name: value.name,
      categories: value.categories
    } as NewEpisode
  })

  return animes
}

function getAnimeNames(): Anime[] {
  const data = DataAnime
  //gerar categorias aleatórias pros animes
  const animes = data.anime.map(anime => ({
    name: String(anime.anime),
    categories: [
      categories[Math.floor(Math.random() * categories.length)],
      categories[Math.floor(Math.random() * categories.length)],
      categories[Math.floor(Math.random() * categories.length)]
    ]
  }))

  return serialize(animes)
}

function filtraAnimes(option: number, animes: Anime[]) {
  const category = categories[option - 1]

  let newAnimeList = []

  for (var prop in animes.map(cat => cat.categories)) {
    if (
      animes.map(cat => cat.categories)[prop][0] == category ||
      animes.map(cat => cat.categories)[prop][1] == category ||
      animes.map(cat => cat.categories)[prop][2] == category
    ) {
      //console.log(animes.map(cat => cat.categories)[prop])
      //console.log(animes.map(cat => cat.name)[prop])
      newAnimeList = newAnimeList.concat(animes[prop])
    }
  }
  return newAnimeList
}

function createObservable2(option: number, animes: Anime[]): Observable<Anime> {
  const category = categories[option - 1]

  const release$ = new Observable<Anime>(sub => {
    animes.map(label => {
      sub.next(label)
    })
  }).pipe(
    observeOn(asyncScheduler),
    filter(
      cat =>
        cat.categories[0] == category ||
        cat.categories[1] == category ||
        cat.categories[3] == category
    ),
    // map(
    //   animes =>
    //     `Saiu epsódio novo de ${animes}(${DateTime.now().toFormat(
    //       'dd LLL yyyy'
    //     )})`
    // ),
    concatMap(item => of(item).pipe(delay(10)))
  )
  return release$
}

function createObservable(option: number, animes: Anime[]): Observable<string> {
  const category = categories[option - 1]

  const release$ = new Observable<Anime>(sub => {
    animes.map(label => {
      sub.next(label)
    })
  }).pipe(
    observeOn(asyncScheduler),
    filter(
      cat =>
        cat.categories[0] == category ||
        cat.categories[1] == category ||
        cat.categories[3] == category
    ),
    map(
      animes =>
        `Saiu epsódio novo de ${animes.name}(${DateTime.now().toFormat(
          'dd LLL yyyy'
        )})`
    ),
    concatMap(item => of(item).pipe(delay(1000)))
  )
  return release$
}

async function getOption() {
  console.log('Escolha opção: ')
  categories.map((data, index) => {
    console.log(`${index + 1} - ${data}`)
  })

  const prompt = await require('prompt-sync')({ sigint: true })
  const opt = prompt('? ')

  return Number(opt)
}

async function main(): Promise<void> {
  const option = await getOption()

  const animes = getAnimeNames()

  //const newAnimeList = filtraAnimes(option, animes)

  const obs$ = createObservable(option, animes)

  const sub = obs$.subscribe({ next: subscribeFunction })

  if (sub.closed) {
    sub.unsubscribe()
  }
}

main()
