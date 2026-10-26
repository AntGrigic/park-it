import { createPlayerDraft, type DiscPoints, type PlayerDraft } from '../domain/player';

type Division = 'MPO' | 'FPO' | 'RPA' | 'RAD';

/** Registered players for the event: division, name, PDGA number. */
export const EVENT_PLAYERS: readonly (readonly [Division, string, string])[] = [
  ['MPO', 'Ari Penttala', '8366'],
  ['MPO', 'Jouni Leskinen', '8790'],
  ['MPO', 'Haukur Arnar Árnason', '8800'],
  ['MPO', 'Tinu Schär', '14947'],
  ['MPO', 'Philo Brathwaite', '26416'],
  ['MPO', 'Peter Pichler', '35231'],
  ['MPO', 'Erkka Leivo', '55187'],
  ['MPO', 'Rainer Lipand', '57090'],
  ['MPO', 'Aleksandar Aki Vuckovic', '62431'],
  ['MPO', 'Eric Osterwinter', '63413'],
  ['MPO', 'Nino Durak', '66496'],
  ['MPO', 'Tomislav Goricki', '69640'],
  ['MPO', 'Bjarni Þór Breiðfjörð Bjarnason', '77422'],
  ['MPO', 'Sauli Sumen', '80765'],
  ['MPO', 'Aleksandar Bato Sudžukovic', '81081'],
  ['MPO', 'Michael Waidhofer', '82011'],
  ['MPO', 'Jani Ketonen', '84774'],
  ['MPO', 'Stanislaus Amann', '87790'],
  ['MPO', 'Gerald Wölbl', '93699'],
  ['MPO', 'Frank Kelz', '94082'],
  ['MPO', 'Japi Pistokoski', '95059'],
  ['MPO', 'Andreas Trondl', '146148'],
  ['MPO', 'Blaz Petrovic', '163272'],
  ['MPO', 'Adrian Liber', '169962'],
  ['MPO', 'Anđelko Zrinski', '180284'],
  ['MPO', 'Tomislav Kačavenda', '180388'],
  ['MPO', 'Andrej Kozic', '214901'],
  ['MPO', 'Andreas Karner', '222139'],
  ['MPO', 'Primož "Belča" Belčič', '234773'],
  ['MPO', 'Dino Harambasic', '238507'],
  ['MPO', 'Antonio Grigić', '242179'],
  ['MPO', 'Zoran Krečar', '247323'],
  ['MPO', 'Antonio Šalov', '272955'],
  ['MPO', 'Ivan Klanjčić', '274810'],
  ['MPO', 'Miloš Gavrilović', '279462'],
  ['MPO', 'Marko Skok', '289652'],
  ['MPO', 'Ivo Tišljar', '291979'],
  ['MPO', 'Gašper Arzenšek', '314907'],
  ['FPO', 'Danica Pajtak', '62432'],
  ['FPO', 'Katerina Zbytovska', '70961'],
  ['FPO', 'Cornelia Hackl', '146142'],
  ['FPO', 'Lisa Ulbing', '147122'],
  ['FPO', 'Maja Gregorn', '281930'],
  ['RPA', 'Marko Pavlović', '271875'],
  ['RAD', 'Radule Raško Mikic', '62426'],
  ['RAD', 'Ira Molnar Goricki', '69639'],
  ['RAD', 'Wolfgang Steinmetz', '145097'],
  ['RAD', 'Doris Wiesbauer', '145121'],
  ['RAD', 'Peter Schwartz', '170891'],
  ['RAD', 'Adis Isanovic', '194068'],
  ['RAD', 'Ronald Geider', '268094'],
  ['RAD', 'Tomo Belčič', '290319'],
  ['RAD', 'Branimir Mihalinec', '316233'],
  ['RAD', 'Sanja Mihalinec', '318293'],
];

/**
 * Made-up throws (cm per disc) to try the board before the event, keyed by PDGA number.
 * Five players have finished all three attempts; two are still playing.
 */
const SAMPLE_THROWS: Readonly<Record<string, readonly (readonly DiscPoints[])[]>> = {
  // Danica Pajtak — total 275
  '62432': [
    [18, 33, 26],
    [47, 12, 39],
    [25, 61, 14],
  ],
  // Ari Penttala — total 287
  '8366': [
    [34, 12, 58],
    [21, 40, 17],
    [66, 9, 30],
  ],
  // Antonio Grigić — total 347
  '242179': [
    [27, 48, 44],
    [38, 22, 61],
    [52, 19, 36],
  ],
  // Tinu Schär — total 397
  '14947': [
    [45, 28, 72],
    [19, 55, 33],
    [80, 24, 41],
  ],
  // Nino Durak — total 957
  '66496': [
    [120, 300, 64],
    [88, 47, 95],
    [33, 140, 70],
  ],
  // Cornelia Hackl — 2 of 3 attempts
  '146142': [
    [60, 42, 300],
    [35, 28, 50],
  ],
  // Radule Raško Mikic — 1 of 3 attempts
  '62426': [[75, 31, 49]],
};

export const SAMPLE_THROWS_PLAYER_COUNT = Object.keys(SAMPLE_THROWS).length;

/** The event roster as players to import, optionally with the sample throws filled in. */
export function eventRoster(includeSampleThrows: boolean): PlayerDraft[] {
  return EVENT_PLAYERS.map(([division, name, pdgaNumber]) => {
    const sampleThrows = includeSampleThrows ? SAMPLE_THROWS[pdgaNumber] : undefined;
    return createPlayerDraft({
      name,
      division,
      pdgaNumber,
      attempts: sampleThrows?.map((discs) => ({ discs })),
    });
  });
}
